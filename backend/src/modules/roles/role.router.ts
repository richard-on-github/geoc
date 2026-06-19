import { Router } from "express";
import { roleController } from "./role.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ROUTES } from "../../constants/routes.js";

const router = Router();

router.get("/", authenticate(), asyncHandler(roleController.getAll));

export { router as roleRouter };
