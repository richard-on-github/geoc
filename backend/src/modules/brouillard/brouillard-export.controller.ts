import type { Request, Response, NextFunction } from "express";
import { brouillardExportService } from "./brouillard-export.service.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type { BrouillardQueryParams } from "./brouillard.interface.js";
import { encryptOfficeBuffer } from "../../utils/office-encryption.js";
import crypto from "crypto";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  create7zArchive,
  writePdfDocumentToFile,
  assertPdfIsEncrypted,
  assertExcelIsEncrypted,
} from "../../utils/export-file.js";

export const brouillardExportController = {
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
      const query = req.query as unknown as BrouillardQueryParams;
      const baseFilename = `brouillard_${Date.now()}`;
      const exportPassword = crypto
        .randomBytes(4)
        .toString("hex")
        .match(/.{1,4}/g)!
        .join("-");

      tempDir = await fsPromises.mkdtemp(
        path.join(os.tmpdir(), "export-brouillard-"),
      );

      const targetFileName = `${baseFilename}.${extension}`;
      const targetFilePath = path.join(tempDir, targetFileName);
      const zipFileName = `${baseFilename}.zip`;
      const zipFilePath = path.join(tempDir, zipFileName);

      const brouillard = await brouillardExportService.getExportData(query);
      const metadata = await brouillardExportService.buildExportMetadata(
        req.user!.id,
      );

      if (format === "csv") {
        const csv = await brouillardExportService.generateCSV(
          brouillard,
          metadata,
        );
        await fsPromises.writeFile(targetFilePath, csv);
      } else if (format === "excel") {
        const excelBuffer = await brouillardExportService.generateExcel(
          brouillard,
          metadata,
        );
        const encryptedExcelBuffer = await encryptOfficeBuffer(
          excelBuffer,
          exportPassword,
        );
        await fsPromises.writeFile(targetFilePath, encryptedExcelBuffer);
        await assertExcelIsEncrypted(targetFilePath);
      } else if (format === "pdf") {
        const pdfDocument = await brouillardExportService.generatePDF(
          brouillard,
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

      if (!fs.existsSync(targetFilePath)) {
        throw new Error(
          `Le fichier à compresser n'a pas pu être créé : ${targetFilePath}`,
        );
      }

      await create7zArchive(zipFilePath, targetFilePath, exportPassword);

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `inline; filename="${zipFileName}"`);
      res.setHeader("X-Export-Password", exportPassword);
      res.setHeader("Access-Control-Expose-Headers", "X-Export-Password");

      const zipReadStream = fs.createReadStream(zipFilePath);
      zipReadStream.pipe(res);

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
