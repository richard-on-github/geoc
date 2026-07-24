import { Router } from "express";
import { dashboardController } from "./dashboard.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { requireDataScope } from "../../middlewares/data-scope.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { dashboardQuerySchema } from "./dashboard.schema.js";
import { ROUTES } from "../../constants/routes.js";

const router = Router();

router.use(authenticate());
router.use(requireDataScope());

router.get(
  ROUTES.DASHBOARD.SUMMARY,
  requirePermissions("dashboard.read"),
  validate({ query: dashboardQuerySchema }),
  asyncHandler(dashboardController.getSummary),
);

export { router as dashboardRouter };
