import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.router.js";
import { userRouter } from "./modules/users/user.router.js";
import { roleRouter } from "./modules/roles/role.router.js";
import { auditRouter } from "./modules/audit/audit.router.js";
import { permissionRouter } from "./modules/permissions/permission.router.js";
import { agenceRouter } from "./modules/agences/agence.router.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.router.js";
import { venteRouter } from "./modules/ventes/vente.router.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { ROUTES } from "./constants/routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(ROUTES.AUTH.BASE, authRouter);
app.use(ROUTES.USERS.BASE, userRouter);
app.use(ROUTES.ROLES.BASE, roleRouter);
app.use(ROUTES.PERMISSIONS.BASE, permissionRouter);
app.use(ROUTES.AUDIT.BASE, auditRouter);
app.use(ROUTES.AGENCE.BASE, agenceRouter);
app.use(ROUTES.DASHBOARD.BASE, dashboardRouter);
app.use(ROUTES.VENTE.BASE, venteRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export { app };
