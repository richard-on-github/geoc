import type { Request, Response, NextFunction } from "express";
import { userService } from "./user.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserStatusInput,
  UserQueryParams,
} from "./user.interface.js";

export const userController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    const query = req.query as unknown as UserQueryParams;
    const result = await userService.getAll(query);
    successResponse(res, HTTP_STATUS.OK, MESSAGES.USERS_FETCHED, result);
  },

  async findById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const user = await userService.getById(id);
    successResponse(res, HTTP_STATUS.OK, MESSAGES.USER_FETCHED, user);
  },

  async create(req: Request, res: Response, next: NextFunction) {
    const input: CreateUserInput = req.body;
    const user = await userService.create(input, req.user!.id, req.ip);
    successResponse(res, HTTP_STATUS.CREATED, MESSAGES.USER_CREATED, user);
  },

  async update(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const input: UpdateUserInput = req.body;
    const user = await userService.update(id, input, req.user!.id, req.ip);
    successResponse(res, HTTP_STATUS.OK, MESSAGES.USER_UPDATED, user);
  },

  async updateStatus(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const input: UpdateUserStatusInput = req.body;
    const user = await userService.updateStatus(
      id,
      input,
      req.user!.id,
      req.ip,
    );
    successResponse(res, HTTP_STATUS.OK, MESSAGES.USER_UPDATED, user);
  },

  async delete(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    await userService.delete(id, req.user!.id, req.ip);
    successResponse(res, HTTP_STATUS.OK, MESSAGES.USER_DELETED, null);
  },
};
