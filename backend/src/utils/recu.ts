/**
 * Génère le numéro de reçu associé à un encaissement, tel qu'il apparaît sur
 * le reçu de versement (vente-recu). C'est ce même numéro qui sert de
 * "numéro de pièce" dans le brouillard, puisque chaque ligne d'encaissement
 * du brouillard correspond exactement au reçu qui a été généré pour ce
 * versement.
 */
export function genererNumeroRecu(encaissementId: string): string {
  return `260${encaissementId.slice(0, 6).toUpperCase()}`;
}
