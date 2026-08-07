import type { Request, Response, NextFunction } from "express";
import { venteExportService } from "./vente-export.service.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type { VenteQueryParams } from "./vente.interface.js";
import { encryptOfficeBuffer } from "../../utils/office-encryption.js";
import crypto from "crypto";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import Seven from "node-7z";
import sevenZipBin from "7zip-bin";

/**
 * Compresse un fichier en utilisant son chemin absolu
 */
function create7zArchive(
  archivePath: string,
  targetFilePath: string,
  password: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // En passant le chemin absolu 'targetFilePath', 7-Zip trouve toujours le fichier
    const stream = Seven.add(archivePath, targetFilePath, {
      password,
      $bin: sevenZipBin.path7za,
    });

    stream.on("end", resolve);
    stream.on("error", reject);
  });
}

/** Écrit un document PDFKit (flux) vers un fichier disque et attend la fin de l'écriture. */
function writePdfDocumentToFile(
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
 * Vérifie qu'un PDF généré est réellement chiffré, en s'assurant que sa
 * table de fin (trailer) référence bien un dictionnaire /Encrypt. Sert de
 * filet de sécurité : si un futur changement (mise à jour de pdfmake, refactor...)
 * casse silencieusement le chiffrement, on le détecte ici plutôt que de livrer
 * un fichier non protégé sans s'en rendre compte.
 */
async function assertPdfIsEncrypted(filePath: string): Promise<void> {
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
 * (OLE/CFB, via officecrypto-js) commence par la signature OLE2
 * (D0 CF 11 E0 A1 B1 1A E1), différente de la signature ZIP (PK\x03\x04) d'un
 * .xlsx non chiffré.
 */
async function assertExcelIsEncrypted(filePath: string): Promise<void> {
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

export const venteExportController = {
  async export(req: Request, res: Response, next: NextFunction) {
    let tempDir: string | null = null;

    try {
      const format = req.path.split("/").pop(); // 'csv' | 'excel' | 'pdf'

      const extensions: Record<string, string> = {
        csv: "csv",
        excel: "xlsx",
        pdf: "pdf",
      };

      if (!format || !extensions[format]) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Format d'export invalide (utilisez csv, excel ou pdf)",
        });
      }

      const extension = extensions[format];
      const query = req.query as unknown as VenteQueryParams;
      const baseFilename = `export_ventes_${Date.now()}`;
      const exportPassword = crypto
        .randomBytes(4)
        .toString("hex")
        .match(/.{1,4}/g)!
        .join("-");

      // 1. Création d'un dossier temporaire
      tempDir = await fsPromises.mkdtemp(
        path.join(os.tmpdir(), "export-ventes-"),
      );

      const targetFileName = `${baseFilename}.${extension}`;
      const targetFilePath = path.join(tempDir, targetFileName);
      const zipFileName = `${baseFilename}.zip`;
      const zipFilePath = path.join(tempDir, zipFileName);

      // 2. Récupération du volume de données concerné, pour construire les métadonnées d'export
      const nombreLignes = (await venteExportService.getExportData(query))
        .length;
      const metadata = await venteExportService.buildExportMetadata(
        query,
        req.user!.id,
        nombreLignes,
      );

      // 3. Génération et écriture du fichier source sur le disque.
      //    Le PDF et l'Excel sont en plus chiffrés individuellement avec le même
      //    mot de passe que celui utilisé pour l'archive zip (le CSV ne peut pas
      //    être chiffré indépendamment de l'archive).
      if (format === "csv") {
        const csv = await venteExportService.generateCSV(query, metadata);
        await fsPromises.writeFile(targetFilePath, csv);
      } else if (format === "excel") {
        const excelBuffer = await venteExportService.generateExcel(
          query,
          metadata,
        );
        const encryptedExcelBuffer = await encryptOfficeBuffer(
          excelBuffer,
          exportPassword,
        );
        await fsPromises.writeFile(targetFilePath, encryptedExcelBuffer);
        await assertExcelIsEncrypted(targetFilePath);
      } else if (format === "pdf") {
        const pdfDocument = await venteExportService.generatePDF(
          query,
          metadata,
          {
            userPassword: exportPassword,
            ownerPassword: exportPassword,
            permissions: {
              printing: "highResolution",
              modifying: false,
              copying: false,
              annotating: false,
              fillingForms: false,
              contentAccessibility: true,
              documentAssembly: false,
            },
          },
        );
        await writePdfDocumentToFile(pdfDocument, targetFilePath);
        await assertPdfIsEncrypted(targetFilePath);
      }

      // 4. Vérification que le fichier physique existe bien avant compression
      if (!fs.existsSync(targetFilePath)) {
        throw new Error(
          `Le fichier à compresser n'a pas pu être créé : ${targetFilePath}`,
        );
      }

      // 5. Compression avec 7-Zip (même mot de passe que le fichier interne pour PDF/Excel)
      await create7zArchive(zipFilePath, targetFilePath, exportPassword);

      // 6. Configuration des en-têtes HTTP
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${zipFileName}"`,
      );
      res.setHeader("X-Export-Password", exportPassword);
      res.setHeader("Access-Control-Expose-Headers", "X-Export-Password");

      // 7. Envoi du fichier ZIP
      const zipReadStream = fs.createReadStream(zipFilePath);
      zipReadStream.pipe(res);

      // 8. Nettoyage du dossier temporaire après la fin de la réponse
      const cleanup = async () => {
        if (tempDir) {
          await fsPromises
            .rm(tempDir, { recursive: true, force: true })
            .catch(() => {});
        }
      };

      res.on("finish", cleanup);
      res.on("close", cleanup);
    } catch (error) {
      if (tempDir) {
        await fsPromises
          .rm(tempDir, { recursive: true, force: true })
          .catch(() => {});
      }
      next(error);
    }
  },
};
