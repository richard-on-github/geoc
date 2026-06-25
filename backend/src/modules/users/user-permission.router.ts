import { Router } from "express";
import { userPermissionController } from "./user-permission.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  userPermissionsParamsSchema,
  deleteUserPermissionParamsSchema,
  addUserPermissionsBodySchema,
} from "./user-permission.schema.js";

const router = Router();

router.use(authenticate());

router.get(
  "/:userId/permissions",
  requirePermissions("user.read", "permission.read"),
  validate({ params: userPermissionsParamsSchema }),
  asyncHandler(userPermissionController.findUserPermissions),
);

router.post(
  "/:userId/permissions",
  requirePermissions("user.update"),
  validate({ params: userPermissionsParamsSchema, body: addUserPermissionsBodySchema }),
  asyncHandler(userPermissionController.addUserPermissions),
);

router.delete(
  "/:userId/permissions/:permissionId",
  requirePermissions("user.update"),
  validate({ params: deleteUserPermissionParamsSchema }),
  asyncHandler(userPermissionController.deleteUserPermission),
);

export { router as userPermissionRouter };