/**
 * Utilitaires de calcul calendaire pour la navigation Jours/Mois/Années des ventes.
 * Le calcul de `computeJourAnnee` reproduit exactement celui du backend
 * (src/utils/date-vente.util.ts) : mêmes composantes UTC, pour que le `jour`
 * envoyé en filtre à GET /ventes corresponde bien au jourAnnee stocké en base.
 *
 * Emplacement suggéré : src/features/ventes/utils/date.ts
 */

export const NOMS_MOIS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

/** Jour de l'année (1-366) pour une date donnée (année, mois 1-12, jour du mois). */
export function computeJourAnnee(annee: number, mois: number, jour: number): number {
  const debutAnnee = Date.UTC(annee, 0, 1)
  const jourCourant = Date.UTC(annee, mois - 1, jour)
  return Math.floor((jourCourant - debutAnnee) / 86_400_000) + 1
}

/** Nombre de jours dans un mois (1-12) d'une année donnée. */
export function joursDansMois(annee: number, mois: number): number {
  return new Date(Date.UTC(annee, mois, 0)).getUTCDate()
}

/** Jour de la semaine (0 = lundi ... 6 = dimanche) du 1er jour d'un mois. */
export function premierJourSemaine(annee: number, mois: number): number {
  const jourJs = new Date(Date.UTC(annee, mois - 1, 1)).getUTCDay() // 0 (dimanche) - 6 (samedi)
  return (jourJs + 6) % 7
}
