import { Router } from "express";
import { auditController } from "./audit.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { auditQuerySchema, auditIdParamsSchema } from "./audit.schema.js";
import { ROUTES } from "../../constants/routes.js";

const router = Router();

// Factorisation de l'authentification
router.use(authenticate());

router.get(
  "/",
  requirePermissions("audit.read"),
  validate({ query: auditQuerySchema }),
  asyncHandler(auditController.findAll),
);

router.get(
  ROUTES.AUDIT.BY_ID,
  requirePermissions("audit.read"),
  validate({ params: auditIdParamsSchema }),
  asyncHandler(auditController.findById),
);

export { router as auditRouter };
