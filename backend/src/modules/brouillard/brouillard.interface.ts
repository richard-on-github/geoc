export interface BrouillardQueryParams {
  /** Optionnel : liste tous les registres/agences confondus si absent. */
  agenceId?: string;
  /** "Entre le" — optionnel : pas de report d'ouverture si absent. */
  dateDebut?: string;
  /** "Et le" — optionnel : aucune borne haute si absent. */
  dateFin?: string;
}

export type TypeLigneBrouillard = "A" | "B";

export interface LigneBrouillard {
  /** Vide pour la ligne d'ouverture (type A). */
  numeroPiece: string;
  libelle: string;
  date: Date;
  recettes: number;
  /** Toujours 0 pour l'instant : le système ne gère aucune opération de
   *  décaissement/dépense — uniquement des encaissements. */
  depenses: number;
  solde: number;
  type: TypeLigneBrouillard;
}

export interface BrouillardResult {
  agenceId: string | null;
  agenceNom: string;
  numeroRegistre: string;
  dateDebut: Date | null;
  dateFin: Date | null;
  lignes: LigneBrouillard[];
  totalRecettes: number;
  totalDepenses: number;
  soldeFinal: number;
}
