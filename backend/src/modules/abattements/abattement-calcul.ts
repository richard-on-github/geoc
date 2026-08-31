/**
 * Logique de calcul des abattements. Le versement (désormais "encaissement")
 * est enregistré côté module Ventes, potentiellement en plusieurs fois. Ce
 * module se contente de LIRE l'historique d'encaissements d'une vente pour
 * en déduire le statut et le montant d'abattement — il n'écrit plus rien.
 *
 * RÈGLES CONFIRMÉES AVEC LE MÉTIER :
 *
 * 1. Le versement est encaissé par rapport au SOLDE À VERSER (Vente.totalSolde),
 *    mais l'ABATTEMENT est toujours calculé par rapport au TOTAL DES VENTES
 *    (Vente.totalVente) : montantAbattement = totalVente × taux%, quelle que
 *    soit la catégorie (retard, moins versé, moins versé avec retard, non
 *    versé). Il n'y a plus de notion de "manquant" dans l'assiette.
 *
 * 2. Deux seuils temporels, comme précédemment :
 *    - heureLimite (souple) : J+1 à `heureLimiteUTC`h UTC. Au-delà, un
 *      encaissement est "en retard" mais encore rattrapable le même jour.
 *    - finFenetre (dure) : minuit UTC du sur-lendemain (J+2). Passé ce seuil,
 *      le statut est DÉFINITIVEMENT figé (basé sur l'état constaté à cet
 *      instant précis) — les encaissements ultérieurs ne changent plus le
 *      statut RETARD/MOINS_VERSE/MOINS_VERSE_AVEC_RETARD/NON_VERSE.
 *
 * 3. RÉGULARISATION (REG/NON REG) : uniquement pertinente pour les statuts
 *    avec un manquant (MOINS_VERSE, MOINS_VERSE_AVEC_RETARD, NON_VERSE). Une
 *    fois le statut figé à la fermeture de fenêtre, si le cumul de TOUS les
 *    encaissements (même ceux arrivés après la fermeture) finit par couvrir
 *    le total à solder, la ligne est "régularisée" (REG) — sans limite de
 *    délai. Le montant de l'abattement, lui, reste dû : la régularisation
 *    n'efface pas la pénalité déjà encourue.
 */

import type { Prisma } from "@prisma/client";

export type StatutAbattement =
  | "AUCUN"
  | "RETARD"
  | "MOINS_VERSE"
  | "MOINS_VERSE_AVEC_RETARD"
  | "NON_VERSE";

export type StatutRegularisation = "NON_APPLICABLE" | "REG" | "NON_REG";

export interface AbattementParametresValues {
  heureLimiteUTC: number;
  tauxRetard: number;
  tauxMoinsVerse: number;
  tauxMoinsVerseAvecRetard: number;
  tauxNonVerse: number;
}

export interface EncaissementValue {
  montant: number | Prisma.Decimal | string;
  dateEncaissement: Date;
}

export interface AbattementCalcule {
  statut: StatutAbattement;
  /** Instant auquel le cumul a atteint le total à solder (null si jamais atteint avant la fermeture de fenêtre). */
  dateCompletion: Date | null;
  /** Toujours égale à totalVente (sauf AUCUN, où l'abattement est nul). */
  assiette: number;
  tauxApplique: number;
  montantAbattement: number;
  /** Récapitulatif de l'encaissement, pour affichage. */
  montantEncaisseCumule: number;
  totalSolde: number;
  regularisation: StatutRegularisation;
  /** Montant régularisé si REG, montant restant dû si NON_REG, 0 sinon. */
  montantRegularisation: number;
}

function arrondi2(valeur: number): number {
  return Math.round(valeur * 100) / 100;
}

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

const TAUX_PAR_STATUT = (
  statut: Exclude<StatutAbattement, "AUCUN">,
  parametres: AbattementParametresValues,
): number => {
  switch (statut) {
    case "RETARD":
      return parametres.tauxRetard;
    case "MOINS_VERSE":
      return parametres.tauxMoinsVerse;
    case "MOINS_VERSE_AVEC_RETARD":
      return parametres.tauxMoinsVerseAvecRetard;
    case "NON_VERSE":
      return parametres.tauxNonVerse;
  }
};

/**
 * Calcule le statut et le montant d'abattement d'une vente, à partir de
 * l'historique complet de ses encaissements.
 *
 * @param now Date de référence (par défaut la date courante), pour les tests.
 */
export function computeAbattement(
  vente: {
    totalVente: number | Prisma.Decimal | string;
    totalSolde: number | Prisma.Decimal | string;
    dateDebut: Date;
  },
  encaissements: EncaissementValue[],
  parametres: AbattementParametresValues,
  now: Date = new Date(),
): AbattementCalcule {
  const totalVente = Number(vente.totalVente);
  const totalSolde = Number(vente.totalSolde);

  const heureLimite = computeDeadlineVersement(
    vente.dateDebut,
    parametres.heureLimiteUTC,
  );
  const finFenetre = computeFinFenetreVersement(vente.dateDebut);

  // Fenêtre d'évaluation : "maintenant" tant qu'elle est encore ouverte,
  // sinon figée définitivement à l'instant de sa fermeture.
  const evaluationBoundary = now < finFenetre ? now : finFenetre;

  const encaissementsTries = [...encaissements].sort(
    (a, b) => a.dateEncaissement.getTime() - b.dateEncaissement.getTime(),
  );

  const encaissementsAvantBoundary = encaissementsTries.filter(
    (e) => e.dateEncaissement <= evaluationBoundary,
  );

  let cumulAvantBoundary = 0;
  let dateCompletion: Date | null = null;
  for (const e of encaissementsAvantBoundary) {
    cumulAvantBoundary += Number(e.montant);
    if (dateCompletion === null && cumulAvantBoundary >= totalSolde && totalSolde > 0) {
      dateCompletion = e.dateEncaissement;
    }
  }
  // Cas limite : total à solder nul ou négatif -> considéré comme complet d'office.
  if (totalSolde <= 0 && dateCompletion === null && encaissementsAvantBoundary.length === 0) {
    dateCompletion = vente.dateDebut;
  }

  const montantEncaisseCumuleTotal = encaissementsTries.reduce(
    (sum, e) => sum + Number(e.montant),
    0,
  );

  const construireResultat = (
    statut: StatutAbattement,
  ): Omit<AbattementCalcule, "regularisation" | "montantRegularisation"> => {
    if (statut === "AUCUN") {
      return {
        statut,
        dateCompletion,
        assiette: 0,
        tauxApplique: 0,
        montantAbattement: 0,
        montantEncaisseCumule: montantEncaisseCumuleTotal,
        totalSolde,
      };
    }
    const taux = TAUX_PAR_STATUT(statut, parametres);
    return {
      statut,
      dateCompletion,
      assiette: totalVente,
      tauxApplique: taux,
      montantAbattement: arrondi2((totalVente * taux) / 100),
      montantEncaisseCumule: montantEncaisseCumuleTotal,
      totalSolde,
    };
  };

  let base: Omit<AbattementCalcule, "regularisation" | "montantRegularisation">;

  if (dateCompletion !== null) {
    // Totalité encaissée avant (ou pendant) la fenêtre d'évaluation.
    base = construireResultat(dateCompletion <= heureLimite ? "AUCUN" : "RETARD");
  } else if (cumulAvantBoundary <= 0) {
    // Rien d'encaissé avant la fenêtre d'évaluation.
    base = construireResultat(
      evaluationBoundary >= finFenetre ? "NON_VERSE" : "AUCUN",
    );
  } else {
    // Encaissement partiel avant la fenêtre d'évaluation.
    const dernierEncaissement =
      encaissementsAvantBoundary[encaissementsAvantBoundary.length - 1];
    const enRetard = dernierEncaissement.dateEncaissement > heureLimite;

    if (evaluationBoundary >= finFenetre) {
      // Fenêtre fermée, jamais complété avant sa fermeture : non versé.
      base = construireResultat("NON_VERSE");
    } else {
      base = construireResultat(enRetard ? "MOINS_VERSE_AVEC_RETARD" : "MOINS_VERSE");
    }
  }

  // Régularisation : uniquement pour les statuts avec manquant, et
  // uniquement une fois la fenêtre définitivement fermée (avant ça, rien
  // n'est encore "en défaut" à régulariser).
  const statutsAvecManquant: StatutAbattement[] = [
    "MOINS_VERSE",
    "MOINS_VERSE_AVEC_RETARD",
    "NON_VERSE",
  ];

  let regularisation: StatutRegularisation = "NON_APPLICABLE";
  let montantRegularisation = 0;

  if (now >= finFenetre && statutsAvecManquant.includes(base.statut)) {
    const manquant = Math.max(totalSolde - montantEncaisseCumuleTotal, 0);
    if (manquant <= 0) {
      regularisation = "REG";
      montantRegularisation = totalSolde;
    } else {
      regularisation = "NON_REG";
      montantRegularisation = manquant;
    }
  }

  return { ...base, regularisation, montantRegularisation };
}
