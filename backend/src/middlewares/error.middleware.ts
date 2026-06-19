import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { Prisma } from "@prisma/client";
import { HTTP_STATUS } from "../constants/http-status.js";
import { MESSAGES } from "../constants/messages.js";
import { errorResponse } from "../utils/response.js";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Erreurs opérationnelles ApiError
  if (err instanceof ApiError) {
    const data = (err as any).validationErrors
      ? { errors: (err as any).validationErrors }
      : null;
    return errorResponse(res, err.statusCode, err.message, data);
  }

  // Erreurs Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return errorResponse(
        res,
        HTTP_STATUS.CONFLICT,
        "Cette ressource existe déjà",
      );
    }
    if (err.code === "P2025") {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        MESSAGES.RESOURCE_NOT_FOUND,
      );
    }
  }

  // Erreurs JWT non capturées
  if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError" ||
    err.name === "NotBeforeError"
  ) {
    return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.INVALID_TOKEN);
  }

  // Erreur inconnue
  console.error("Unhandled error:", err);
  return errorResponse(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    MESSAGES.INTERNAL_SERVER_ERROR,
  );
}
