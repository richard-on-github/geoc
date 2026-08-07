import * as officeCrypto from "officecrypto-tool";

/**
 * Chiffre un buffer de fichier Office (ici .xlsx) avec un mot de passe,
 * en utilisant le chiffrement natif MS-OFFCRYPTO (agile encryption).
 * Le fichier obtenu demande le mot de passe à l'ouverture dans Excel,
 * LibreOffice Calc, etc.
 *
 * Emplacement suggéré : src/utils/office-encryption.util.ts
 */
export async function encryptOfficeBuffer(buffer: Buffer, password: string): Promise<Buffer> {
  return officeCrypto.encrypt(buffer, { password });
}
