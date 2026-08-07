/**
 * Utilitaires de calcul de la "journée" (jour de l'année, 1-366), du mois et de
 * l'année d'une vente à partir de sa date de début.
 *
 * Toutes les opérations sont faites en UTC pour éviter tout décalage lié au
 * fuseau horaire du serveur (une vente datée "12/01/2024" doit toujours donner
 * jourAnnee = 12, quel que soit le fuseau du process Node).
 *
 * Emplacement suggéré dans le projet : src/utils/date-vente.util.ts
 */

export interface JourAnneeInfo {
  /** Jour de l'année, de 1 (1er janvier) à 365/366 (31 décembre) */
  jourAnnee: number;
  /** Mois, de 1 (janvier) à 12 (décembre) */
  mois: number;
  /** Année civile, ex: 2024 */
  annee: number;
}

/**
 * Calcule le jour de l'année (1-366), le mois (1-12) et l'année d'une date,
 * en se basant sur les composantes UTC de la date pour éviter tout décalage
 * de fuseau horaire.
 */
export function computeJourAnneeInfo(date: Date): JourAnneeInfo {
  const annee = date.getUTCFullYear();
  const mois = date.getUTCMonth() + 1;

  const debutAnnee = Date.UTC(annee, 0, 1);
  const jourCourant = Date.UTC(annee, date.getUTCMonth(), date.getUTCDate());
  const jourAnnee = Math.floor((jourCourant - debutAnnee) / 86_400_000) + 1;

  return { jourAnnee, mois, annee };
}

/**
 * Découpe une période au format "YYYY-MM" en mois/année numériques.
 * Suppose que la période a déjà été validée par le schéma Zod
 * (cloturerVenteSchema / importVenteBodySchema).
 */
export function periodeToMoisAnnee(periode: string): { mois: number; annee: number } {
  const [anneeStr, moisStr] = periode.split("-");
  const annee = Number(anneeStr);
  const mois = Number(moisStr);
  return { mois, annee };
}

/** Reconstruit une période "YYYY-MM" à partir d'un mois et d'une année. */
export function moisAnneeToPeriode(mois: number, annee: number): string {
  return `${annee}-${String(mois).padStart(2, "0")}`;
}

/** Retourne la période (YYYY-MM) précédant immédiatement celle fournie. */
export function getPeriodePrecedente(periode: string): string {
  const { mois, annee } = periodeToMoisAnnee(periode);
  return mois === 1 ? moisAnneeToPeriode(12, annee - 1) : moisAnneeToPeriode(mois - 1, annee);
}

/** Retourne la période (YYYY-MM) suivant immédiatement celle fournie. */
export function getPeriodeSuivante(periode: string): string {
  const { mois, annee } = periodeToMoisAnnee(periode);
  return mois === 12 ? moisAnneeToPeriode(1, annee + 1) : moisAnneeToPeriode(mois + 1, annee);
}
