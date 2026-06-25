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
  roleIdParamsSchema,
  addRolePermissionsSchema,
  deleteRolePermissionParamsSchema,
} from "./role.schema.js";

const router = Router();

router.use(authenticate());

router.get(
  "/",
  requirePermissions("role.read"),
  validate({ query: roleQuerySchema }),
  asyncHandler(roleController.findAll),
);

router.get(
  "/:id",
  requirePermissions("role.read"),
  validate({ params: roleIdParamsSchema }),
  asyncHandler(roleController.findById),
);

router.post(
  "/",
  requirePermissions("role.create"),
  validate({ body: createRoleSchema }),
  asyncHandler(roleController.create),
);

router.patch(
  "/:id",
  requirePermissions("role.update"),
  validate({ params: roleIdParamsSchema, body: updateRoleSchema }),
  asyncHandler(roleController.update),
);

router.delete(
  "/:id",
  requirePermissions("role.delete"),
  validate({ params: roleIdParamsSchema }),
  asyncHandler(roleController.delete),
);

// Sous-routes Relations Role-Permissions
router.get(
  "/:id/permissions",
  requirePermissions("role.read", "permission.read"),
  validate({ params: roleIdParamsSchema }),
  asyncHandler(roleController.findRolePermissions),
);

router.post(
  "/:id/permissions",
  requirePermissions("role.update"),
  validate({ params: roleIdParamsSchema, body: addRolePermissionsSchema }),
  asyncHandler(roleController.addRolePermissions),
);

router.delete(
  "/:roleId/permissions/:permissionId",
  requirePermissions("role.update"),
  validate({ params: deleteRolePermissionParamsSchema }),
  asyncHandler(roleController.deleteRolePermission),
);

export { router as roleRouter };
