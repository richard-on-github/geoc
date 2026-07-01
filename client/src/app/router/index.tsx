// import { lazy, Suspense } from 'react'
// import { createBrowserRouter, Navigate } from 'react-router'
// import { PageLoader } from '@/shared/components/feedback/PageLoader'
// import { ProtectedRoute } from '@/shared/components/navigation/ProtectedRoute'
// import { AuthLayout } from '@/app/layouts/auth/AuthLayout'
// import { DashboardLayout } from '@/app/layouts/dashboard/DashboardLayout'

// /* ---- Pages Auth ---- */
// const LoginPage = lazy(() =>
//   import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
// )
// const ResetPasswordPage = lazy(() =>
//   import('@/features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
// )

// /* ---- Pages Dashboard ---- */
// const DashboardPage = lazy(() =>
//   import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
// )

// /* ---- Pages Users ---- */
// const UsersListPage = lazy(() =>
//   import('@/features/users/pages/UsersListPage').then((m) => ({ default: m.UsersListPage })),
// )
// const UserDetailPage = lazy(() =>
//   import('@/features/users/pages/UserDetailPage').then((m) => ({ default: m.UserDetailPage })),
// )

// /* ---- Pages Security ---- */
// const RolesListPage = lazy(() =>
//   import('@/features/security/pages/RolesListPage').then((m) => ({ default: m.RolesListPage })),
// )
// const PermissionsPage = lazy(() =>
//   import('@/features/security/pages/PermissionsPage').then((m) => ({ default: m.PermissionsPage })),
// )

// /* ---- Pages Audit ---- */
// const AuditLogPage = lazy(() =>
//   import('@/features/audit/pages/AuditLogPage').then((m) => ({ default: m.AuditLogPage })),
// )

// function S(Component: React.ComponentType) {
//   return (
//     <Suspense fallback={<PageLoader />}>
//       <Component />
//     </Suspense>
//   )
// }

// export const router = createBrowserRouter([
//   /* Routes publiques */
//   {
//     element: <AuthLayout />,
//     children: [
//       { path: '/login', element: S(LoginPage) },
//       { path: '/reset-password', element: S(ResetPasswordPage) },
//     ],
//   },

//   /* Routes protégées */
//   {
//     element: (
//       <ProtectedRoute>
//         <DashboardLayout />
//       </ProtectedRoute>
//     ),
//     children: [
//       { index: true, element: <Navigate to="/dashboard" replace /> },
//       { path: '/dashboard', element: S(DashboardPage) },
//       { path: '/users', element: S(UsersListPage) },
//       { path: '/users/:id', element: S(UserDetailPage) },
//       { path: '/security/roles', element: S(RolesListPage) },
//       { path: '/security/permissions', element: S(PermissionsPage) },
//       { path: '/audit', element: S(AuditLogPage) },
//     ],
//   },

//   { path: '*', element: <Navigate to="/dashboard" replace /> },
// ])

// src/app/router/index.tsx

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
// Ajout de la page de création d'utilisateur
const CreateUserPage = lazy(() =>
  import('@/features/users/pages/CreateUserPage').then((m) => ({ default: m.CreateUserPage })),
)

/* ---- Pages Security ---- */
const RolesListPage = lazy(() =>
  import('@/features/security/pages/RolesListPage').then((m) => ({ default: m.RolesListPage })),
)
const PermissionsPage = lazy(() =>
  import('@/features/security/pages/PermissionsPage').then((m) => ({ default: m.PermissionsPage })),
)
// Ajout de la page de création de rôle
const CreateRolePage = lazy(() =>
  import('@/features/security/pages/CreateRolePage').then((m) => ({ default: m.CreateRolePage })),
)

/* ---- Pages Audit ---- */
const AuditLogPage = lazy(() =>
  import('@/features/audit/pages/AuditLogPage').then((m) => ({ default: m.AuditLogPage })),
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
      { path: '/users', element: S(UsersListPage) },
      { path: '/users/new', element: S(CreateUserPage) }, // ← ajout
      { path: '/users/:id', element: S(UserDetailPage) },
      { path: '/security/roles', element: S(RolesListPage) },
      { path: '/security/roles/new', element: S(CreateRolePage) }, // ← ajout
      { path: '/security/permissions', element: S(PermissionsPage) },
      { path: '/audit', element: S(AuditLogPage) },
    ],
  },

  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
