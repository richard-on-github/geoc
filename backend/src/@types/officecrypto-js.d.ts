/**
 * Déclaration de types minimale pour le paquet "officecrypto-js", qui ne
 * fournit pas de typings officiels. Utilisé pour chiffrer les fichiers Excel
 * (.xlsx) exportés avec un mot de passe (chiffrement OOXML / MS-OFFCRYPTO,
 * compatible avec le mot de passe "Ouverture" demandé par Excel/LibreOffice).
 *
 * Emplacement suggéré : src/types/officecrypto-js.d.ts
 * Dépendance à installer : npm install officecrypto-js
 */
declare module "officecrypto-js" {
  export interface OfficeCryptoOptions {
    password: string;
  }

  export function encrypt(input: Buffer, options: OfficeCryptoOptions): Promise<Buffer>;
  export function decrypt(input: Buffer, options: OfficeCryptoOptions): Promise<Buffer>;
  export function isEncrypted(input: Buffer): boolean;
}
