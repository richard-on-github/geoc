import { Router } from "express";
import { userController } from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userQuerySchema,
  userIdParamsSchema,
} from "./user.schema.js";
import { ROUTES } from "../../constants/routes.js";
import { initRequestContext } from "../../middlewares/context.middleware.js";

const router = Router();

router.use(authenticate());
router.use(initRequestContext());

router.get(
  ROUTES.USERS.ROOT,
  requirePermissions("user.read"),
  validate({ query: userQuerySchema }),
  asyncHandler(userController.findAll),
);

router.get(
  ROUTES.USERS.BY_ID,
  requirePermissions("user.read"),
  validate({ params: userIdParamsSchema }),
  asyncHandler(userController.findById),
);

router.post(
  ROUTES.USERS.ROOT,
  requirePermissions("user.create"),
  validate({ body: createUserSchema }),
  asyncHandler(userController.create),
);

router.patch(
  ROUTES.USERS.BY_ID,
  requirePermissions("user.update"),
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  asyncHandler(userController.update),
);

router.patch(
  ROUTES.USERS.STATUS,
  requirePermissions("user.update"),
  validate({ params: userIdParamsSchema, body: updateUserStatusSchema }),
  asyncHandler(userController.updateStatus),
);

router.delete(
  ROUTES.USERS.BY_ID,
  requirePermissions("user.delete"),
  validate({ params: userIdParamsSchema }),
  asyncHandler(userController.delete),
);

export { router as userRouter };
