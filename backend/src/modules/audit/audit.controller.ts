import type { Request, Response, NextFunction } from "express";
import { auditService } from "./audit.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import type { AuditQueryParams } from "./audit.interface.js";

export const auditController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    const query = req.query as unknown as AuditQueryParams;
    const result = await auditService.getAll(query);
    successResponse(res, HTTP_STATUS.OK, MESSAGES.AUDITS_FETCHED, result);
  },

  async findById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const log = await auditService.getById(id);
    successResponse(res, HTTP_STATUS.OK, MESSAGES.AUDIT_FETCHED, log);
  },
};
