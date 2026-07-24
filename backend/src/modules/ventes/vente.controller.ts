import type { Request, Response, NextFunction } from "express";
import { venteService } from "./vente.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type { VenteQueryParams } from "./vente.interface.js";
import { parseExcelToVenteRows } from "../../utils/excel-parser.js";
import { ApiError } from "../../utils/ApiError.js";
import { contextStorage } from "../../utils/context.js";

export const venteController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    const query = req.query as unknown as VenteQueryParams;
    const result = await venteService.getAll(query);
    successResponse(res, HTTP_STATUS.OK, "Liste des ventes récupérée", result);
  },

  async importFile(req: Request, res: Response, next: NextFunction) {
    if (!req.file) {
      throw ApiError.badRequest("Aucun fichier n'a été fourni");
    }

    const fileBuffer = req.file.buffer;
    const parsedRows = await parseExcelToVenteRows(fileBuffer);

    const result = await venteService.importVentes(
      fileBuffer,
      parsedRows,
      req.file.originalname,
      req.user!.id,
      req.ip,
    );

    successResponse(
      res,
      HTTP_STATUS.CREATED,
      `${result.count} lignes ont été importées et réconciliées avec succès.`,
      result,
    );
  },
};
