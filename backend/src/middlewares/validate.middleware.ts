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
      // 1. Validation du Body (Propriété standard, réassignable)
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // 2. Validation de la Query (Contournement du Getter en lecture seule)
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        Object.defineProperty(req, "query", {
          value: parsedQuery,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      // 3. Validation des Params (Sécurité identique au cas où c'est aussi un Getter)
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        Object.defineProperty(req, "params", {
          value: parsedParams,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      next();
    } catch (error: any) {
      // Gestion robuste des erreurs Zod
      if (error instanceof ZodError || error.name === "ZodError") {
        const issues = error.issues || error.errors;

        if (!issues || !Array.isArray(issues)) {
          console.error(
            "ZodError détectée mais structure de données invalide :",
            error,
          );
          return next(error);
        }

        const formattedErrors = issues.map((e: any) => ({
          field: e.path.join("."),
          message: e.message,
        }));

        const apiError = new ApiError(
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          MESSAGES.VALIDATION_ERROR,
        );
        (apiError as any).validationErrors = formattedErrors;
        return next(apiError);
      }
      next(error);
    }
  };
}
