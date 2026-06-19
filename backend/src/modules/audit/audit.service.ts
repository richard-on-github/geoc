import { auditRepository } from "./audit.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { MESSAGES } from "../../constants/messages.js";
import type { AuditQueryParams } from "./audit.interface.js";
import { getPaginationMeta } from "../../utils/pagination.js";

export const auditService = {
  async getAll(params: AuditQueryParams) {
    const { logs, total, page, limit } = await auditRepository.findAll(params);
    const pagination = getPaginationMeta(total, page, limit);
    return { logs, pagination };
  },

  async getById(id: string) {
    const log = await auditRepository.findById(id);
    if (!log) {
      throw ApiError.notFound(MESSAGES.RESOURCE_NOT_FOUND);
    }
    return log;
  },
};
