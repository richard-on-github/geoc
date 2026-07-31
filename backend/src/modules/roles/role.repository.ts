import { Prisma, Role } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import type {
  CreateRoleInput,
  UpdateRoleInput,
  RoleQueryParams,
  RoleAllQueryParams,
} from "./role.interface.js";

const roleMinimalSelect = {
  id: true,
  nom: true,
  code: true,
  niveau: true,
  dataScope: true,
};

const roleSelect = {
  id: true,
  nom: true,
  code: true,
  description: true,
  dataScope: true,
  niveau: true,
  isSystem: true,
  actif: true,
  users: {
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      telephone: true,
      actif: true,
      agence: {
        select: {
          id: true,
          nom: true,
        },
      },
    },
  },
  permissions: {
    select: {
      permission: {
        select: {
          id: true,
          nom: true,
          code: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
};

type RoleWithRelations = Prisma.RoleGetPayload<{
  select: typeof roleSelect;
}>;

type RoleMinimal = Prisma.RoleGetPayload<{
  select: typeof roleMinimalSelect;
}>;

export const roleRepository = {
  async findAll(params: RoleQueryParams) {
    const { page, limit, search, actif, dataScope } = params as any;
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

    if (dataScope !== undefined) {
      where.dataScope = dataScope;
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        select: roleSelect,
        skip,
        take: limit,
        orderBy: { niveau: "desc" },
      }),
      prisma.role.count({ where }),
    ]);

    const formattedRoles = roles.map((role: RoleWithRelations) => ({
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
    }));

    return {
      roles: formattedRoles,
      total,
      page,
      limit,
    };
  },

  async findAllWithoutPagination(params: RoleAllQueryParams = {}) {
    const { search, actif, dataScope } = params;

    const where: Prisma.RoleWhereInput = {
      code: {
        not: "SYSTEM",
      },
    };

    if (search) {
      where.OR = [
        {
          nom: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          code: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (actif !== undefined) {
      where.actif = actif;
    }

    if (dataScope !== undefined) {
      where.dataScope = dataScope;
    }

    const roles = await prisma.role.findMany({
      where,
      select: roleMinimalSelect,
      orderBy: {
        niveau: "desc",
      },
    });

    return { roles };
  },

  async findById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      select: roleSelect,
    });

    if (!role) {
      return null;
    }

    return {
      ...role,
      permissions: role?.permissions.map(
        (p: { permission: { id: string; nom: string; code: string } }) =>
          p.permission,
      ),
    };
  },

  async findByCode(code: string) {
    return prisma.role.findUnique({
      where: { code },
      select: roleSelect,
    });
  },

  async create(data: CreateRoleInput & { permissionIds?: string[] }) {
    return prisma.role.create({
      data: {
        nom: data.nom,
        code: data.code,
        description: data.description,
        dataScope: (data as any).dataScope || (data as any).scope, // <-- Remplacé par dataScope
        niveau: data.niveau,
        permissions: {
          create:
            data.permissionIds?.map((permissionId) => ({
              permissionId,
            })) || [],
        },
      },
      select: roleSelect,
    });
  },

  async update(
    id: string,
    data: UpdateRoleInput & { permissionIds?: string[] },
  ) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedRole = await tx.role.update({
        where: { id },
        data: {
          nom: data.nom,
          code: data.code,
          description: data.description,
          dataScope: (data as any).dataScope || (data as any).scope,
          niveau: data.niveau,
          actif: data.actif,
        },
      });

      if (data.permissionIds) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        await tx.rolePermission.createMany({
          data: data.permissionIds.map((pId) => ({
            roleId: id,
            permissionId: pId,
          })),
        });
      }

      return tx.role.findUnique({ where: { id }, select: roleSelect });
    });
  },

  async delete(id: string) {
    return prisma.role.delete({
      where: { id },
      select: roleSelect,
    });
  },
};
