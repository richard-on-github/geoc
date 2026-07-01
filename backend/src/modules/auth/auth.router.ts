import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js"; // <-- Remplacement
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  resetPasswordSchema,
} from "./auth.schema.js";
import { ROUTES } from "../../constants/routes.js";

const router = Router();

// Routes publiques
router.post(
  ROUTES.AUTH.LOGIN,
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);

router.post(
  ROUTES.AUTH.REFRESH_TOKEN,
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.refreshToken),
);

// Routes protégées
router.post(
  ROUTES.AUTH.LOGOUT,
  authenticate(),
  asyncHandler(authController.logout),
);

router.post(
  ROUTES.AUTH.CHANGE_PASSWORD,
  authenticate(),
  validate({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword),
);

router.post(
  ROUTES.AUTH.RESET_PASSWORD,
  authenticate(),
  requirePermissions("user.update"),
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword),
);

router.get(ROUTES.AUTH.ME, authenticate(), asyncHandler(authController.getMe));

export { router as authRouter };
