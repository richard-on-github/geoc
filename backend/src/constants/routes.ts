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
    BY_ID: "/:id",
    STATUS: "/:id/status",
  },
  ROLES: {
    BASE: "/api/roles",
  },
  AUDIT: {
    BASE: "/api/audit",
    BY_ID: "/:id",
  },
} as const;
