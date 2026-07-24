import type { Request, Response, NextFunction } from "express";
import { venteExportService } from "./vente-export.service.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type { VenteQueryParams } from "./vente.interface.js";

export const venteExportController = {
  async export(req: Request, res: Response, next: NextFunction) {
    try {
      const format = req.params.format; // 'csv' | 'excel' | 'pdf'
      const query = req.query as unknown as VenteQueryParams;
      const filename = `export_ventes_${new Date().getTime()}`;

      if (format === "csv") {
        const csv = await venteExportService.generateCSV(query);
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.csv"`,
        );
        res.status(HTTP_STATUS.OK).end(csv);
        return;
      }

      if (format === "excel") {
        const excelBuffer = await venteExportService.generateExcel(query);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.xlsx"`,
        );
        res.setHeader("Content-Length", excelBuffer.length.toString());
        res.status(HTTP_STATUS.OK).end(excelBuffer);
        return;
      }

      if (format === "pdf") {
        const pdfDoc = await venteExportService.generatePDF(query);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.pdf"`,
        );

        pdfDoc.on("error", (err) => {
          console.error("[PDF Stream Error]:", err);
          if (!res.headersSent) {
            res
              .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
              .json({
                success: false,
                message: "Erreur lors de la génération du PDF.",
              });
          } else {
            res.end();
          }
        });

        pdfDoc.pipe(res);
        pdfDoc.end();
        return;
      }

      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Format d'export invalide (utilisez csv, excel ou pdf)",
      });
    } catch (error) {
      next(error);
    }
  },
};
