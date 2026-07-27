import type {Request, Response, NextFunction} from "express";
import {venteExportService} from "./vente-export.service.js";
import {HTTP_STATUS} from "../../constants/http-status.js";
import type {VenteQueryParams} from "./vente.interface.js";
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
    password: string
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
            const exportPassword = crypto.randomBytes(4).toString("hex").match(/.{1,4}/g)!.join("-");

            // 1. Création d'un dossier temporaire
            tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "export-ventes-"));

            const targetFileName = `${baseFilename}.${extension}`;
            const targetFilePath = path.join(tempDir, targetFileName);
            const zipFileName = `${baseFilename}.zip`;
            const zipFilePath = path.join(tempDir, zipFileName);

            // 2. Génération et écriture du fichier source sur le disque
            if (format === "csv") {
                const csv = await venteExportService.generateCSV(query);
                await fsPromises.writeFile(targetFilePath, csv);
            } else if (format === "excel") {
                const excelBuffer = await venteExportService.generateExcel(query);
                await fsPromises.writeFile(targetFilePath, excelBuffer);
            } else if (format === "pdf") {
                const pdfResult = await venteExportService.generatePDF(query);

                await new Promise<void>((resolve, reject) => {
                    const writeStream = fs.createWriteStream(targetFilePath);

                    writeStream.on("finish", () => resolve());
                    writeStream.on("error", reject);

                    // Supporte à la fois un Stream (PDFKit) ou un Buffer
                    if (pdfResult && typeof (pdfResult as any).pipe === "function") {
                        (pdfResult as any).on("error", reject);
                        (pdfResult as any).pipe(writeStream);
                        // Si le document PDFKit n'a pas encore été clôturé (.end())
                        if (typeof (pdfResult as any).end === "function" && !(pdfResult as any)._ended) {
                            (pdfResult as any).end();
                        }
                    } else if (Buffer.isBuffer(pdfResult)) {
                        writeStream.write(pdfResult);
                        writeStream.end();
                    } else {
                        reject(new Error("Le service PDF n'a pas retourné un Stream ou un Buffer valide."));
                    }
                });
            }

            // 3. Vérification que le fichier physique existe bien avant compression
            if (!fs.existsSync(targetFilePath)) {
                throw new Error(`Le fichier à compresser n'a pas pu être créé : ${targetFilePath}`);
            }

            // 4. Compression avec 7-Zip
            await create7zArchive(zipFilePath, targetFilePath, exportPassword);

            // 5. Configuration des en-têtes HTTP
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);
            res.setHeader("X-Export-Password", exportPassword);
            res.setHeader("Access-Control-Expose-Headers", "X-Export-Password");

            // 6. Envoi du fichier ZIP
            const zipReadStream = fs.createReadStream(zipFilePath);
            zipReadStream.pipe(res);

            // 7. Nettoyage du dossier temporaire après la fin de la réponse
            const cleanup = async () => {
                if (tempDir) {
                    await fsPromises.rm(tempDir, {recursive: true, force: true}).catch(() => {
                    });
                }
            };

            res.on("finish", cleanup);
            res.on("close", cleanup);

        } catch (error) {
            if (tempDir) {
                await fsPromises.rm(tempDir, {recursive: true, force: true}).catch(() => {
                });
            }
            next(error);
        }
    },
};