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
import { emailAutoriseRouter } from "./modules/ventes/email-autorise/email-autorise.router.js";
import { abattementRouter } from "./modules/abattements/abattement.router.js";

const app = express();

app.set("trust proxy", "loopback");

const allowedOrigins = [
  "http://localhost:8000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("Bloqué par la politique CORS"), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    exposedHeaders: ["Content-Disposition"],
  }),
);

app.use(express.json());

app.use(ROUTES.AUTH.BASE, authRouter);
app.use(ROUTES.USERS.BASE, userRouter);
app.use(ROUTES.ROLES.BASE, roleRouter);
app.use(ROUTES.PERMISSIONS.BASE, permissionRouter);
app.use(ROUTES.AUDIT.BASE, auditRouter);
app.use(ROUTES.AGENCE.BASE, agenceRouter);
app.use(ROUTES.DASHBOARD.BASE, dashboardRouter);
app.use(ROUTES.VENTE.BASE, venteRouter);
app.use("/api/emails-autorises", emailAutoriseRouter);
app.use("/api/abattements", abattementRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export { app };
