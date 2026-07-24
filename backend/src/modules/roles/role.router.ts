import { Router } from "express";
import { roleController } from "./role.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createRoleSchema,
  updateRoleSchema,
  roleQuerySchema,
  roleIdParamsSchema, roleAllQuerySchema,
} from "./role.schema.js";
import { ROUTES } from "../../constants/routes.js";
import { requireGlobalAdmin } from "../../middlewares/require-global-admin.middleware.js";

const router = Router();

router.use(authenticate());

router.get(
  ROUTES.ROLES.ROOT,
  requirePermissions("role.read"),
  validate({ query: roleQuerySchema }),
  asyncHandler(roleController.findAll),
);

router.get(
    ROUTES.ROLES.ALL,
    requirePermissions("role.read"),
    validate({ query: roleAllQuerySchema }),
    asyncHandler(roleController.findAllWithoutPagination),
);

router.get(
  ROUTES.ROLES.BY_ID,
  requirePermissions("role.read"),
  validate({ params: roleIdParamsSchema }),
  asyncHandler(roleController.findById),
);

router.post(
  ROUTES.ROLES.ROOT,
  requirePermissions("role.create"),
  requireGlobalAdmin(),
  validate({ body: createRoleSchema }),
  asyncHandler(roleController.create),
);

router.patch(
  ROUTES.ROLES.BY_ID,
  requirePermissions("role.update"),
  requireGlobalAdmin(),
  validate({ params: roleIdParamsSchema, body: updateRoleSchema }),
  asyncHandler(roleController.update),
);

router.delete(
  ROUTES.ROLES.BY_ID,
  requirePermissions("role.delete"),
  requireGlobalAdmin(),
  validate({ params: roleIdParamsSchema }),
  asyncHandler(roleController.delete),
);

export { router as roleRouter };
