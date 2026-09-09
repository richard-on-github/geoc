import { Router } from "express";
import { brouillardController } from "./brouillard.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { initRequestContext } from "../../middlewares/context.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  brouillardQuerySchema,
  brouillardIdParamsSchema,
  clotureBrouillardSchema,
  rejeterBrouillardSchema,
} from "./brouillard.schema.js";

const router = Router();

router.use(authenticate());
router.use(initRequestContext());

router.get(
  "/",
  requirePermissions("brouillard.read"),
  validate({ query: brouillardQuerySchema }),
  asyncHandler(brouillardController.findAll),
);

router.post(
  "/:id/cloturer",
  requirePermissions("brouillard.manage"),
  validate({ params: brouillardIdParamsSchema, body: clotureBrouillardSchema }),
  asyncHandler(brouillardController.cloturer),
);

router.post(
  "/:id/valider",
  requirePermissions("brouillard.manage"),
  validate({ params: brouillardIdParamsSchema }),
  asyncHandler(brouillardController.valider),
);

router.post(
  "/:id/rejeter",
  requirePermissions("brouillard.manage"),
  validate({ params: brouillardIdParamsSchema, body: rejeterBrouillardSchema }),
  asyncHandler(brouillardController.rejeter),
);

export { router as brouillardRouter };
