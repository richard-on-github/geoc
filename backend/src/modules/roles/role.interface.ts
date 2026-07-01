import type { Role } from "@prisma/client";

export interface CreateRoleInput {
  nom: string;
  code: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  nom?: string;
  code?: string;
  description?: string;
  actif?: boolean;
  permissionIds?: string[];
}

export interface RoleQueryParams {
  page: number;
  limit: number;
  search?: string;
  actif?: boolean;
}

export interface RolePermissionInput {
  permissionIds: string[];
}
