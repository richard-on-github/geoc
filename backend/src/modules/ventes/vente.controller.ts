import type { Request, Response, NextFunction } from "express";
import { venteService } from "./vente.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type { VenteQueryParams } from "./vente.interface.js";
import { parseExcelToVenteRows } from "../../utils/excel-parser.js";
import { ApiError } from "../../utils/ApiError.js";

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

  async cloturer(req: Request, res: Response, next: NextFunction) {
    const { periode } = req.body;

    const result = await venteService.cloturerMois(
        periode,
        req.user!.id,
        req.ip,
    );

    successResponse(
        res,
        HTTP_STATUS.CREATED,
        `Clôture mensuelle pour la période ${periode} effectuée avec succès.`,
        result,
    );
  },

  async getClotures(req: Request, res: Response, next: NextFunction) {
    const result = await venteService.getClotures();
    successResponse(
        res,
        HTTP_STATUS.OK,
        "Liste des clôtures mensuelles récupérée avec succès.",
        result,
    );
  },
};