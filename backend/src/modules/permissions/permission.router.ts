import { Router } from "express";
import { permissionController } from "./permission.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  permissionQuerySchema,
  permissionIdParamsSchema,
} from "./permission.schema.js";

const router = Router();

router.use(authenticate());

router.get(
  "/",
  requirePermissions("permission.read"),
  validate({ query: permissionQuerySchema }),
  asyncHandler(permissionController.findAll),
);

router.get(
  "/:id",
  requirePermissions("permission.read"),
  validate({ params: permissionIdParamsSchema }),
  asyncHandler(permissionController.findById),
);

export { router as permissionRouter };
