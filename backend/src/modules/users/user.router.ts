import { Router } from "express";
import { userController } from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
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
import { Role } from "../../constants/roles.js";

const router = Router();

// Toutes les routes users nécessitent authentification + rôle admin/direction
router.use(authenticate(), authorize(Role.ADMIN, Role.DIRECTION));

router.get(
  "/",
  validate({ query: userQuerySchema }),
  asyncHandler(userController.findAll),
);

router.get(
  ROUTES.USERS.BY_ID,
  validate({ params: userIdParamsSchema }),
  asyncHandler(userController.findById),
);

router.post(
  "/",
  validate({ body: createUserSchema }),
  asyncHandler(userController.create),
);

router.patch(
  ROUTES.USERS.BY_ID,
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  asyncHandler(userController.update),
);

router.patch(
  ROUTES.USERS.STATUS,
  validate({ params: userIdParamsSchema, body: updateUserStatusSchema }),
  asyncHandler(userController.updateStatus),
);

router.delete(
  ROUTES.USERS.BY_ID,
  validate({ params: userIdParamsSchema }),
  asyncHandler(userController.delete),
);

export { router as userRouter };
