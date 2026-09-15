import { Router } from "express";
import { brouillardController } from "./brouillard.controller.js";
import { brouillardExportController } from "./brouillard-export.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { initRequestContext } from "../../middlewares/context.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { brouillardQuerySchema } from "./brouillard.schema.js";

const router = Router();

router.use(authenticate());
router.use(initRequestContext());

router.get(
  "/",
  requirePermissions("brouillard.read"),
  validate({ query: brouillardQuerySchema }),
  asyncHandler(brouillardController.find),
);

router.get(
  "/export/csv",
  requirePermissions("brouillard.export.csv"),
  validate({ query: brouillardQuerySchema }),
  asyncHandler(brouillardExportController.export),
);

router.get(
  "/export/excel",
  requirePermissions("brouillard.export.excel"),
  validate({ query: brouillardQuerySchema }),
  asyncHandler(brouillardExportController.export),
);

router.get(
  "/export/pdf",
  requirePermissions("brouillard.export.pdf"),
  validate({ query: brouillardQuerySchema }),
  asyncHandler(brouillardExportController.export),
);

export { router as brouillardRouter };
