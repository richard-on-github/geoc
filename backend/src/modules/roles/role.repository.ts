import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import type {
  CreateRoleInput,
  UpdateRoleInput,
  RoleQueryParams,
} from "./role.interface.js";

const roleSelect = {
  id: true,
  nom: true,
  code: true,
  description: true,
  isSystem: true,
  actif: true,
  createdAt: true,
  updatedAt: true,
};

export const roleRepository = {
  async findAll(params: RoleQueryParams) {
    const { page, limit, search, actif } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.RoleWhereInput = {};

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (actif !== undefined) {
      where.actif = actif;
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        select: roleSelect,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.role.count({ where }),
    ]);

    return { roles, total, page, limit };
  },

  async findById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      select: roleSelect,
    });
  },

  async findByCode(code: string) {
    return prisma.role.findUnique({
      where: { code },
      select: roleSelect,
    });
  },

  async create(data: CreateRoleInput) {
    return prisma.role.create({
      data: {
        nom: data.nom,
        code: data.code,
        description: data.description,
        isSystem: false,
        actif: true,
      },
      select: roleSelect,
    });
  },

  async update(id: string, data: UpdateRoleInput) {
    return prisma.role.update({
      where: { id },
      data,
      select: roleSelect,
    });
  },

  async delete(id: string) {
    return prisma.role.delete({
      where: { id },
      select: roleSelect,
    });
  },

  async findPermissions(roleId: string) {
    return prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });
  },

  async addPermissions(roleId: string, permissionIds: string[]) {
    const data = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));
    return prisma.rolePermission.createMany({
      data,
      skipDuplicates: true,
    });
  },

  async deletePermission(roleId: string, permissionId: string) {
    return prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  },
};
