import { Router } from "express";
import { agenceController } from "./agence.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  agenceQuerySchema,
  createAgenceSchema,
  updateAgenceSchema,
  updateAgenceStatusSchema,
  agenceIdParamsSchema,
  agenceAllQuerySchema,
} from "./agence.schema.js";
import { ROUTES } from "../../constants/routes.js";
import { initRequestContext } from "../../middlewares/context.middleware.js";

const router = Router();

router.use(authenticate());
router.use(initRequestContext());

router.get(
  ROUTES.AGENCE.ROOT,
  requirePermissions("agence.read"),
  validate({ query: agenceQuerySchema }),
  asyncHandler(agenceController.findAll),
);

router.get(
  ROUTES.AGENCE.ALL,
  requirePermissions("agence.read"),
  validate({ query: agenceAllQuerySchema }),
  asyncHandler(agenceController.findAllWithoutPagination),
);

router.get(
  ROUTES.AGENCE.BY_ID,
  requirePermissions("agence.read"),
  validate({ params: agenceIdParamsSchema }),
  asyncHandler(agenceController.findById),
);

router.post(
  ROUTES.AGENCE.ROOT,
  requirePermissions("agence.create"),
  validate({ body: createAgenceSchema }),
  asyncHandler(agenceController.create),
);

router.patch(
  ROUTES.AGENCE.BY_ID,
  requirePermissions("agence.update"),
  validate({ params: agenceIdParamsSchema, body: updateAgenceSchema }),
  asyncHandler(agenceController.update),
);

router.patch(
  ROUTES.AGENCE.STATUS,
  requirePermissions("agence.update"),
  validate({ params: agenceIdParamsSchema, body: updateAgenceStatusSchema }),
  asyncHandler(agenceController.updateStatus),
);

router.delete(
  ROUTES.AGENCE.BY_ID,
  requirePermissions("agence.delete"),
  validate({ params: agenceIdParamsSchema }),
  asyncHandler(agenceController.delete),
);

export { router as agenceRouter };
