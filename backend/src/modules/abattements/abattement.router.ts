import { Router } from "express";
import { abattementController } from "./abattement.controller.js";
import { abattementExportController } from "./abattement-export.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { initRequestContext } from "../../middlewares/context.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  abattementQuerySchema,
  abattementParametresUpdateSchema,
} from "./abattement.schema.js";

const router = Router();

router.use(authenticate());
router.use(initRequestContext());

router.get(
  "/",
  requirePermissions("abattement.read"),
  validate({ query: abattementQuerySchema }),
  asyncHandler(abattementController.findAll),
);

router.get(
  "/parametres",
  requirePermissions("abattement.read"),
  asyncHandler(abattementController.getParametres),
);

router.put(
  "/parametres",
  requirePermissions("abattement.parametres.manage"),
  validate({ body: abattementParametresUpdateSchema }),
  asyncHandler(abattementController.updateParametres),
);

router.get(
  "/export/csv",
  requirePermissions("abattement.export.csv"),
  validate({ query: abattementQuerySchema }),
  asyncHandler(abattementExportController.export),
);

router.get(
  "/export/excel",
  requirePermissions("abattement.export.excel"),
  validate({ query: abattementQuerySchema }),
  asyncHandler(abattementExportController.export),
);

router.get(
  "/export/pdf",
  requirePermissions("abattement.export.pdf"),
  validate({ query: abattementQuerySchema }),
  asyncHandler(abattementExportController.export),
);

export { router as abattementRouter };
