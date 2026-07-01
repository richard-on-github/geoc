import type { User } from "@prisma/client";

export type UserResponse = Omit<User, "passwordHash" | "refreshTokens">;

export interface CreateUserInput {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  roleId: string;
  password?: string;
  permissionIds?: string[];
}

export interface UpdateUserInput {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string | null;
  roleId?: string;
  mustChangePassword?: boolean;
  permissionIds?: string[];
}

export interface UpdateUserStatusInput {
  actif: boolean;
}

export interface UserQueryParams {
  page: number;
  limit: number;
  search?: string;
  roleId?: string;
  actif?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
