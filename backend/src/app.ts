import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.router.js";
import { userRouter } from "./modules/users/user.router.js";
import { roleRouter } from "./modules/roles/role.router.js";
import { auditRouter } from "./modules/audit/audit.router.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { ROUTES } from "./constants/routes.js";

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Routes
app.use(ROUTES.AUTH.BASE, authRouter);
app.use(ROUTES.USERS.BASE, userRouter);
app.use(ROUTES.ROLES.BASE, roleRouter);
app.use(ROUTES.AUDIT.BASE, auditRouter);

// 404 handler
app.use(notFoundMiddleware);

// Gestion centralisée des erreurs
app.use(errorMiddleware);

export { app };
