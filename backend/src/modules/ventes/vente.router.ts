import { Router } from "express";
import multer from "multer";
import { venteController } from "./vente.controller.js";
import { venteExportController } from "./vente-export.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { initRequestContext } from "../../middlewares/context.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {cloturerVenteSchema, venteQuerySchema} from "./vente.schema.js";
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

router.post(
    ROUTES.VENTE.CLOTURER,
    requirePermissions("vente.cloture"),
    validate({ body: cloturerVenteSchema }),
    asyncHandler(venteController.cloturer)
);

router.get(
    ROUTES.VENTE.CLOTURES,
    requirePermissions("vente.read"),
    asyncHandler(venteController.getClotures)
);

router.get(
    "/export/csv",
    requirePermissions("vente.export.csv"),
    validate({ query: venteQuerySchema }),
    asyncHandler(venteExportController.export)
);

router.get(
    "/export/excel",
    requirePermissions("vente.export.excel"),
    validate({ query: venteQuerySchema }),
    asyncHandler(venteExportController.export)
);

router.get(
    "/export/pdf",
    requirePermissions("vente.export.pdf"),
    validate({ query: venteQuerySchema }),
    asyncHandler(venteExportController.export)
);

export { router as venteRouter };
