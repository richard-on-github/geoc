import { Router } from "express";
import { auditController } from "./audit.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { auditQuerySchema, auditIdParamsSchema } from "./audit.schema.js";
import { ROUTES } from "../../constants/routes.js";
import { Role } from "../../constants/roles.js";

const router = Router();

router.get(
  "/",
  authenticate(),
  authorize(Role.ADMIN, Role.DIRECTION, Role.AUDITEUR),
  validate({ query: auditQuerySchema }),
  asyncHandler(auditController.findAll),
);

router.get(
  ROUTES.AUDIT.BY_ID,
  authenticate(),
  authorize(Role.ADMIN, Role.DIRECTION, Role.AUDITEUR),
  validate({ params: auditIdParamsSchema }),
  asyncHandler(auditController.findById),
);

export { router as auditRouter };
