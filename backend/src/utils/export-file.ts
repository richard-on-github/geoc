import fs from "node:fs";
import fsPromises from "node:fs/promises";
import Seven from "node-7z";
import sevenZipBin from "7zip-bin";

/** Compresse un fichier en utilisant son chemin absolu. */
export function create7zArchive(
  archivePath: string,
  targetFilePath: string,
  password: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = Seven.add(archivePath, targetFilePath, {
      password,
      $bin: sevenZipBin.path7za,
    });

    stream.on("end", resolve);
    stream.on("error", reject);
  });
}

/** Écrit un document PDFKit (flux) vers un fichier disque et attend la fin de l'écriture. */
export function writePdfDocumentToFile(
  pdfDocument: PDFKit.PDFDocument,
  targetFilePath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(targetFilePath);

    writeStream.on("finish", () => resolve());
    writeStream.on("error", reject);
    pdfDocument.on("error", reject);

    pdfDocument.pipe(writeStream);
    pdfDocument.end();
  });
}

/**
 * Vérifie qu'un PDF généré est réellement chiffré (présence d'un dictionnaire
 * /Encrypt dans le trailer). Filet de sécurité contre une régression silencieuse
 * du chiffrement.
 */
export async function assertPdfIsEncrypted(filePath: string): Promise<void> {
  const buffer = await fsPromises.readFile(filePath);
  const isEncrypted = buffer.includes("/Encrypt");
  if (!isEncrypted) {
    throw new Error(
      "Le PDF généré ne semble pas chiffré (aucun dictionnaire /Encrypt trouvé). " +
        "Le chiffrement a été refusé pour éviter de livrer un fichier non protégé.",
    );
  }
}

/**
 * Vérifie qu'un fichier Excel généré est réellement chiffré : un .xlsx chiffré
 * (OLE/CFB) commence par la signature OLE2, différente de la signature ZIP
 * d'un .xlsx non chiffré.
 */
export async function assertExcelIsEncrypted(filePath: string): Promise<void> {
  const handle = await fsPromises.open(filePath, "r");
  try {
    const header = Buffer.alloc(8);
    await handle.read(header, 0, 8, 0);
    const oleSignature = Buffer.from([
      0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
    ]);
    if (!header.equals(oleSignature)) {
      throw new Error(
        "Le fichier Excel généré ne semble pas chiffré (signature OLE/CFB absente). " +
          "Le chiffrement a été refusé pour éviter de livrer un fichier non protégé.",
      );
    }
  } finally {
    await handle.close();
  }
}
