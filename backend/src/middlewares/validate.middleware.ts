import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { MESSAGES } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/http-status.js";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        const apiError = new ApiError(
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          MESSAGES.VALIDATION_ERROR,
        );
        // On attache les détails pour le middleware d'erreur
        (apiError as any).validationErrors = formattedErrors;
        return next(apiError);
      }
      next(error);
    }
  };
}
