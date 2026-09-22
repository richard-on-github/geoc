import type { Request, Response, NextFunction } from "express";
import { brouillardExportService } from "./brouillard-export.service.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type { BrouillardQueryParams } from "./brouillard.interface.js";

const CONTENT_TYPES: Record<string, string> = {
  csv: "text/csv; charset=utf-8",
  excel:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

const EXTENSIONS: Record<string, string> = {
  csv: "csv",
  excel: "xlsx",
  pdf: "pdf",
};

export const brouillardExportController = {
  async export(req: Request, res: Response, next: NextFunction) {
    try {
      const format = req.path.split("/").pop(); // 'csv' | 'excel' | 'pdf'

      if (!format || !EXTENSIONS[format]) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Format d'export invalide (utilisez csv, excel ou pdf)",
        });
      }

      const query = req.query as unknown as BrouillardQueryParams;
      const filename = `brouillard_${Date.now()}.${EXTENSIONS[format]}`;

      const brouillard = await brouillardExportService.getExportData(query);
      const metadata = await brouillardExportService.buildExportMetadata(
        req.user!.id,
      );

      res.setHeader("Content-Type", CONTENT_TYPES[format]);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${filename}"`,
      );

      if (format === "csv") {
        const csv = await brouillardExportService.generateCSV(
          brouillard,
          metadata,
        );
        res.send(csv);
      } else if (format === "excel") {
        const excelBuffer = await brouillardExportService.generateExcel(
          brouillard,
          metadata,
        );
        res.send(excelBuffer);
      } else if (format === "pdf") {
        const pdfDocument = await brouillardExportService.generatePDF(
          brouillard,
          metadata,
        );
        pdfDocument.pipe(res);
        pdfDocument.end();
      }
    } catch (error) {
      next(error);
    }
  },
};
