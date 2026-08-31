export interface EncaissementInput {
  venteId: string;
  montant: number;
  /** ISO 8601 */
  dateEncaissement: string;
}
