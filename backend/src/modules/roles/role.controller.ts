import type { Request, Response, NextFunction } from 'express';
import { roleService } from './role.service.js';
import { successResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/http-status.js';
import { MESSAGES } from '../../constants/messages.js';

export const roleController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    const roles = roleService.getAllRoles();
    successResponse(res, HTTP_STATUS.OK, MESSAGES.ROLES_FETCHED, roles);
  },
};