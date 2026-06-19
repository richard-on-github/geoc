import type { User } from "@prisma/client";
import { Role } from "@prisma/client";

export type UserResponse = Omit<User, "passwordHash" | "refreshTokens">;

export interface CreateUserInput {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  role: Role;
  password?: string; // mot de passe initial (optionnel, sinon généré)
}

export interface UpdateUserInput {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string | null;
  role?: Role;
  mustChangePassword?: boolean;
}

export interface UpdateUserStatusInput {
  actif: boolean;
}

export interface UserQueryParams {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  actif?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
