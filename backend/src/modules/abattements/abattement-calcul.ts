/**
 * Logique de calcul des abattements, isolée du reste du module pour rester
 * facilement testable/ajustable si les règles métier évoluent.
 *
 * RÈGLE (telle que définie par le métier) — DEUX seuils, pas un seul :
 *
 * 1. L'HEURE LIMITE (`heureLimiteUTC`, défaut 13h UTC) le lendemain de la
 *    journée de vente ("J+1 à 13h") : au-delà, un versement est "en retard",
 *    mais reste rattrapable le reste de la journée.
 * 2. LA FIN DE FENÊTRE (minuit UTC du sur-lendemain, soit le début de "J+2") :
 *    seuil dur. Passé ce point, la fenêtre est définitivement fermée — tout
 *    versement reçu après, quel que soit son montant, est classé NON_VERSE.
 *    Un versement en retard n'est donc "rattrapable" en RETARD que s'il
 *    arrive encore le jour J+1 ; s'il arrive à partir de J+2, c'est trop
 *    tard et le statut devient NON_VERSE.
 *
 * Détail des statuts (versement enregistré avant la fin de fenêtre) :
 * - Versement intégral, avant l'heure limite  -> RAS, aucun abattement.
 * - Versement intégral, après l'heure limite  -> RETARD.
 * - Versement partiel,  avant l'heure limite  -> MOINS_VERSE.
 * - Versement partiel,  après l'heure limite  -> MOINS_VERSE_AVEC_RETARD.
 * - Aucun versement, fenêtre pas encore fermée -> AUCUN (on attend encore).
 * - Fenêtre fermée (versement reçu après, ou toujours aucun versement)
 *   -> NON_VERSE, quel que soit le montant éventuellement reçu trop tard.
 *
 * ASSIETTE DU CALCUL (hypothèse posée faute de formule confirmée par le métier,
 * à valider) :
 * - RETARD : le manquant est nul (versement intégral) -> le taux s'applique
 *   au total des ventes de la journée.
 * - MOINS_VERSE / MOINS_VERSE_AVEC_RETARD / NON_VERSE : le taux s'applique au
 *   montant manquant (totalVente - montantVerse). Pour NON_VERSE, le manquant
 *   est toujours égal au total des ventes (peu importe qu'un montant partiel
 *   ait été reçu trop tard : la fenêtre étant fermée, ce montant ne compte
 *   plus pour la classification).
 */

import type { Prisma } from "@prisma/client";

export type StatutAbattement =
  | "AUCUN"
  | "RETARD"
  | "MOINS_VERSE"
  | "MOINS_VERSE_AVEC_RETARD"
  | "NON_VERSE";

export interface AbattementParametresValues {
  heureLimiteUTC: number;
  tauxRetard: number;
  tauxMoinsVerse: number;
  tauxMoinsVerseAvecRetard: number;
  tauxNonVerse: number;
}

export interface VersementValues {
  montantVerse: number;
  dateVersement: Date;
}

export interface AbattementCalcule {
  statut: StatutAbattement;
  heureVersement: Date | null;
  /** Montant sur lequel le taux est appliqué (manquant, ou total des ventes pour un simple retard ou un non-versé). */
  assiette: number;
  tauxApplique: number;
  montantAbattement: number;
}

function arrondi2(valeur: number): number {
  return Math.round(valeur * 100) / 100;
}

/**
 * Heure limite "souple" : le lendemain de la journée de vente, à
 * `heureLimiteUTC`:00:00 UTC. Un versement fait après ce seuil, mais avant
 * la fin de fenêtre, est en retard (rattrapable).
 */
export function computeDeadlineVersement(
  dateDebutJournee: Date,
  heureLimiteUTC: number,
): Date {
  return new Date(
    Date.UTC(
      dateDebutJournee.getUTCFullYear(),
      dateDebutJournee.getUTCMonth(),
      dateDebutJournee.getUTCDate() + 1,
      heureLimiteUTC,
      0,
      0,
      0,
    ),
  );
}

/**
 * Fin de fenêtre "dure" : minuit UTC du sur-lendemain (début de J+2). Passé
 * ce seuil, plus aucun versement ne peut "rattraper" la journée : c'est
 * NON_VERSE quel que soit le montant reçu après.
 */
export function computeFinFenetreVersement(dateDebutJournee: Date): Date {
  return new Date(
    Date.UTC(
      dateDebutJournee.getUTCFullYear(),
      dateDebutJournee.getUTCMonth(),
      dateDebutJournee.getUTCDate() + 2,
      0,
      0,
      0,
      0,
    ),
  );
}

/**
 * Calcule le statut et le montant d'abattement d'une vente, à partir de son
 * (éventuel) versement enregistré et des paramètres actuellement en vigueur.
 *
 * @param now Permet d'injecter une date de référence en test ; par défaut la date courante.
 */
export function computeAbattement(
  vente: { totalVente: number | Prisma.Decimal | string; dateDebut: Date },
  versement: VersementValues | null,
  parametres: AbattementParametresValues,
  now: Date = new Date(),
): AbattementCalcule {
  const heureLimite = computeDeadlineVersement(
    vente.dateDebut,
    parametres.heureLimiteUTC,
  );
  const finFenetre = computeFinFenetreVersement(vente.dateDebut);
  const totalVente = Number(vente.totalVente);

  const nonVerse = (): AbattementCalcule => ({
    statut: "NON_VERSE",
    heureVersement: versement?.dateVersement ?? null,
    assiette: totalVente,
    tauxApplique: parametres.tauxNonVerse,
    montantAbattement: arrondi2((totalVente * parametres.tauxNonVerse) / 100),
  });

  // Aucun versement enregistré pour l'instant.
  if (!versement) {
    // La fenêtre n'est pas encore fermée : on attend toujours, rien à
    // classer définitivement (même si l'heure limite est déjà dépassée,
    // un versement en retard reste encore possible le reste de la journée).
    if (now < finFenetre) {
      return {
        statut: "AUCUN",
        heureVersement: null,
        assiette: 0,
        tauxApplique: 0,
        montantAbattement: 0,
      };
    }
    // Fenêtre définitivement fermée sans le moindre versement.
    return nonVerse();
  }

  // Un versement a été enregistré, mais est arrivé après la fermeture de la
  // fenêtre : trop tard pour être rattrapé, quel que soit le montant.
  if (versement.dateVersement >= finFenetre) {
    return nonVerse();
  }

  const montantVerse = Number(versement.montantVerse);
  const manquant = Math.max(totalVente - montantVerse, 0);
  const enRetard = versement.dateVersement > heureLimite;

  if (manquant === 0 && !enRetard) {
    return {
      statut: "AUCUN",
      heureVersement: versement.dateVersement,
      assiette: 0,
      tauxApplique: 0,
      montantAbattement: 0,
    };
  }

  if (manquant === 0 && enRetard) {
    return {
      statut: "RETARD",
      heureVersement: versement.dateVersement,
      assiette: totalVente,
      tauxApplique: parametres.tauxRetard,
      montantAbattement: arrondi2((totalVente * parametres.tauxRetard) / 100),
    };
  }

  if (manquant > 0 && !enRetard) {
    return {
      statut: "MOINS_VERSE",
      heureVersement: versement.dateVersement,
      assiette: manquant,
      tauxApplique: parametres.tauxMoinsVerse,
      montantAbattement: arrondi2(
        (manquant * parametres.tauxMoinsVerse) / 100,
      ),
    };
  }

  return {
    statut: "MOINS_VERSE_AVEC_RETARD",
    heureVersement: versement.dateVersement,
    assiette: manquant,
    tauxApplique: parametres.tauxMoinsVerseAvecRetard,
    montantAbattement: arrondi2(
      (manquant * parametres.tauxMoinsVerseAvecRetard) / 100,
    ),
  };
}