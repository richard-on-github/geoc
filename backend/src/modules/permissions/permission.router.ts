import {Router} from "express";
import {permissionController} from "./permission.controller.js";
import {authenticate} from "../../middlewares/auth.middleware.js";
import {requirePermissions} from "../../middlewares/permission.middleware.js";
import {validate} from "../../middlewares/validate.middleware.js";
import {asyncHandler} from "../../utils/asyncHandler.js";
import {
    permissionQuerySchema,
    permissionIdParamsSchema, permissionAllQuerySchema,
} from "./permission.schema.js";
import {ROUTES} from "../../constants/routes.js";

const router = Router();

router.use(authenticate());

router.get(
    ROUTES.PERMISSIONS.ROOT,
    requirePermissions("permission.read"),
    validate({query: permissionQuerySchema}),
    asyncHandler(permissionController.findAll),
);

router.get(
    ROUTES.PERMISSIONS.ALL,
    requirePermissions("permission.read"),
    validate({query: permissionAllQuerySchema}),
    asyncHandler(permissionController.findAllWithoutPagination),
);

router.get(
    ROUTES.PERMISSIONS.BY_ID,
    requirePermissions("permission.read"),
    validate({params: permissionIdParamsSchema}),
    asyncHandler(permissionController.findById),
);

export {router as permissionRouter};
