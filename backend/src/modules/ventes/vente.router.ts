import { Router } from "express";
import multer from "multer";
import { venteController } from "./vente.controller.js";
import { venteExportController } from "./vente-export.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { initRequestContext } from "../../middlewares/context.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { venteQuerySchema } from "./vente.schema.js";
import { ROUTES } from "../../constants/routes.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate());
router.use(initRequestContext());

router.get(
  ROUTES.VENTE.ROOT,
  requirePermissions("vente.read"),
  validate({ query: venteQuerySchema }),
  asyncHandler(venteController.findAll),
);

router.post(
  ROUTES.VENTE.IMPORT,
  requirePermissions("vente.import"),
  upload.single("file"),
  asyncHandler(venteController.importFile),
);

router.get(
  ROUTES.VENTE.EXPORT,
  requirePermissions("vente.export"),
  validate({ query: venteQuerySchema }),
  asyncHandler(venteExportController.export),
);

export { router as venteRouter };
