export const ROUTES = {
  AUTH: {
    BASE: "/api/auth",
    LOGIN: "/login",
    REFRESH_TOKEN: "/refresh-token",
    LOGOUT: "/logout",
    CHANGE_PASSWORD: "/change-password",
    RESET_PASSWORD: "/reset-password",
    ME: "/me",
  },

  USERS: {
    BASE: "/api/users",
    ROOT: "/",
    BY_ID: "/:id",
    STATUS: "/:id/status",
    PERMISSIONS: "/:id/permissions",
    PERMISSION_BY_ID: "/:userId/permissions/:permissionId",
  },

  ROLES: {
    BASE: "/api/roles",
    ROOT: "/",
    ALL: "/all",
    BY_ID: "/:id",
    PERMISSIONS: "/:id/permissions",
  },

  PERMISSIONS: {
    BASE: "/api/permissions",
    ROOT: "/",
    ALL: "/all",
    BY_ID: "/:id",
  },

  AUDIT: {
    BASE: "/api/audit",
    ROOT: "/",
    BY_ID: "/:id",
  },

  AGENCE: {
    BASE: "/api/agences",
    ROOT: "/",
    ALL: "/all",
    BY_ID: "/:id",
    STATUS: "/:id/status",
  },

  DASHBOARD: {
    BASE: "/api/dashboard",
    SUMMARY: "/summary",
  },

  VENTE: {
    BASE: "/api/ventes",
    ROOT: "/",
    IMPORT: "/import",
    EXPORT: "/export/:format",
  },
} as const;
