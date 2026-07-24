import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { PageLoader } from '@/shared/components/feedback/PageLoader'
import { ProtectedRoute } from '@/shared/components/navigation/ProtectedRoute'
import { AuthLayout } from '@/app/layouts/auth/AuthLayout'
import { DashboardLayout } from '@/app/layouts/dashboard/DashboardLayout'

/* ---- Pages Auth ---- */
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)

/* ---- Pages Dashboard ---- */
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)

/* ---- Pages Users ---- */
const UsersListPage = lazy(() =>
  import('@/features/users/pages/UsersListPage').then((m) => ({ default: m.UsersListPage })),
)
const UserDetailPage = lazy(() =>
  import('@/features/users/pages/UserDetailPage').then((m) => ({ default: m.UserDetailPage })),
)
const CreateUserPage = lazy(() =>
  import('@/features/users/pages/CreateUserPage').then((m) => ({ default: m.CreateUserPage })),
)

/* ---- Pages Agences ---- */
const AgencesListPage = lazy(() =>
  import('@/features/agences/pages/AgencesListPage').then((m) => ({ default: m.AgencesListPage })),
)
const CreateAgencePage = lazy(() =>
  import('@/features/agences/pages/CreateAgencePage').then((m) => ({
    default: m.CreateAgencePage,
  })),
)
const AgenceDetailPage = lazy(() =>
  import('@/features/agences/pages/AgenceDetailPage').then((m) => ({
    default: m.AgenceDetailPage,
  })),
)

/* ---- Pages Ventes ---- */
const VentesListPage = lazy(() =>
  import('@/features/ventes/pages/VentesListPage').then((m) => ({ default: m.VentesListPage })),
)

/* ---- Pages Security ---- */
const RolesListPage = lazy(() =>
  import('@/features/security/pages/RolesListPage').then((m) => ({ default: m.RolesListPage })),
)
const PermissionsPage = lazy(() =>
  import('@/features/security/pages/PermissionsPage').then((m) => ({ default: m.PermissionsPage })),
)
const CreateRolePage = lazy(() =>
  import('@/features/security/pages/CreateRolePage').then((m) => ({ default: m.CreateRolePage })),
)

/* ---- Pages Audit ---- */
const AuditLogPage = lazy(() =>
  import('@/features/audit/pages/AuditLogPage').then((m) => ({ default: m.AuditLogPage })),
)

const RoleDetailPage = lazy(() =>
  import('@/features/security/pages/RoleDetailPage').then((m) => ({ default: m.RoleDetailPage })),
)

function S(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  /* Routes publiques */
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: S(LoginPage) },
      { path: '/reset-password', element: S(ResetPasswordPage) },
    ],
  },

  /* Routes protégées */
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: S(DashboardPage) },

      // Utilisateurs
      { path: '/users', element: S(UsersListPage) },
      { path: '/users/new', element: S(CreateUserPage) },
      { path: '/users/:id', element: S(UserDetailPage) },

      // === NOUVEAU : Agences ===
      { path: '/agences', element: S(AgencesListPage) },
      { path: '/agences/new', element: S(CreateAgencePage) },
      { path: '/agences/:id', element: S(AgenceDetailPage) },

      // ===  : Ventes ===
      { path: '/ventes', element: S(VentesListPage) },

      // Sécurité
      { path: '/security/roles', element: S(RolesListPage) },
      { path: '/security/roles/new', element: S(CreateRolePage) },
      { path: '/security/permissions', element: S(PermissionsPage) },

      // Audit
      { path: '/audit', element: S(AuditLogPage) },

      { path: '/security/roles/:id', element: S(RoleDetailPage) },
    ],
  },

  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
