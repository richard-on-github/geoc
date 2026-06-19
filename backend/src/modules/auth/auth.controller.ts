import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import type {
  LoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
  ResetPasswordInput,
} from "./auth.interface.js";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    const input: LoginInput = req.body;
    const tokens = await authService.login(input, req.ip);
    successResponse(res, HTTP_STATUS.OK, MESSAGES.LOGIN_SUCCESS, tokens);
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const input: RefreshTokenInput = req.body;
    const tokens = await authService.refreshToken(input, req.ip);
    successResponse(res, HTTP_STATUS.OK, MESSAGES.TOKEN_REFRESHED, tokens);
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;
    const { refreshToken } = req.body || {};
    await authService.logout(userId, refreshToken, req.ip);
    successResponse(res, HTTP_STATUS.OK, MESSAGES.LOGOUT_SUCCESS, null);
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;
    const input: ChangePasswordInput = req.body;
    await authService.changePassword(userId, input, req.ip);
    successResponse(res, HTTP_STATUS.OK, MESSAGES.PASSWORD_CHANGED, null);
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    const adminId = req.user!.id;
    const input: ResetPasswordInput = req.body;
    await authService.resetPassword(adminId, input, req.ip);
    successResponse(res, HTTP_STATUS.OK, MESSAGES.PASSWORD_RESET, null);
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    const user = await authService.getMe(req.user!.id);
    successResponse(res, HTTP_STATUS.OK, MESSAGES.USER_FETCHED, user);
  },
};
