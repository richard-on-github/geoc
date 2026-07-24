/**
 * Domaine auth — types métier.
 * Alignés sur le schéma Prisma du backend GEOC.
 */

/* ---- Entités ---- */

export interface AuthUser {
  id: string
  email: string
  prenom: string
  nom: string
  fullName: string
  avatar: string | null
  isActive: boolean
  role: UserRole
  permissions: string[] // codes de permission ex: "user.create"
  agencyId: string | null
  lastLoginAt: string | null
  createdAt: string
}

export interface UserRole {
  id: string
  name: string
  displayName: string
  isSystem: boolean
}

/* ---- Tokens ---- */

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number       // secondes
}


export interface LoginPayload {
  email: string
  password: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordPayload {
  userId: string
  newPassword: string
}

export interface LoginData {
  user: AuthUser
  tokens: AuthTokens
}

export interface RefreshTokenData {
  accessToken: string
  expiresIn: number
}
