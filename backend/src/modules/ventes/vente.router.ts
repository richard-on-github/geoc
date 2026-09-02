import { Router } from "express";
import multer from "multer";
import { venteController } from "./vente.controller.js";
import { venteExportController } from "./vente-export.controller.js";
import { venteEncaissementController } from "./vente-encaissement.controller.js";
import { venteRecuController } from "./vente-recu.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { initRequestContext } from "../../middlewares/context.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  cloturerVenteSchema,
  importVenteBodySchema,
  periodeParamsSchema,
  venteQuerySchema,
} from "./vente.schema.js";
import {
  encaissementInputSchema,
  venteIdParamsSchema,
} from "./vente-encaissement.schema.js";
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
  validate({ body: importVenteBodySchema }),
  asyncHandler(venteController.importFile),
);

router.post(
  ROUTES.VENTE.CLOTURER,
  requirePermissions("vente.cloture"),
  validate({ body: cloturerVenteSchema }),
  asyncHandler(venteController.cloturer),
);

router.delete(
  "/clotures/:periode",
  requirePermissions("vente.cloture"),
  validate({ params: periodeParamsSchema }),
  asyncHandler(venteController.annulerCloture),
);

router.get(
  ROUTES.VENTE.CLOTURES,
  requirePermissions("vente.read"),
  asyncHandler(venteController.getClotures),
);

router.post(
  "/encaissements",
  requirePermissions("vente.encaissement.manage"),
  validate({ body: encaissementInputSchema }),
  asyncHandler(venteEncaissementController.create),
);

router.get(
  "/:id/encaissements",
  requirePermissions("vente.read"),
  validate({ params: venteIdParamsSchema }),
  asyncHandler(venteEncaissementController.getHistorique),
);

router.get(
  "/encaissements/:id/recu",
  requirePermissions("vente.encaissement.manage"),
  validate({ params: venteIdParamsSchema }),
  asyncHandler(venteRecuController.telecharger),
);

router.get(
  "/export/csv",
  requirePermissions("vente.export.csv"),
  validate({ query: venteQuerySchema }),
  asyncHandler(venteExportController.export),
);

router.get(
  "/export/excel",
  requirePermissions("vente.export.excel"),
  validate({ query: venteQuerySchema }),
  asyncHandler(venteExportController.export),
);

router.get(
  "/export/pdf",
  requirePermissions("vente.export.pdf"),
  validate({ query: venteQuerySchema }),
  asyncHandler(venteExportController.export),
);

export { router as venteRouter };
