import { Router } from "express";
import { emailAutoriseController } from "./email-autorise.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../../middlewares/permission.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
  ajouterEmailAutoriseSchema,
  emailAutoriseIdParamsSchema,
} from "./email-autorise.schema.js";

const router = Router();

router.use(authenticate());

router.get(
  "/",
  requirePermissions("vente.email.manage"),
  asyncHandler(emailAutoriseController.findAll),
);

router.post(
  "/",
  requirePermissions("vente.email.manage"),
  validate({ body: ajouterEmailAutoriseSchema }),
  asyncHandler(emailAutoriseController.create),
);

router.delete(
  "/:id",
  requirePermissions("vente.email.manage"),
  validate({ params: emailAutoriseIdParamsSchema }),
  asyncHandler(emailAutoriseController.remove),
);

export { router as emailAutoriseRouter };
