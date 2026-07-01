import {Prisma} from "@prisma/client";
import {prisma} from "../../config/prisma.js";
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
    users: {
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            actif: true
        }
    },
    permissions: {
        select: {
            permission: {
                select: {
                    id: true,
                    nom: true,
                    code: true,
                }
            }
        }
    },
    createdAt: true,
    updatedAt: true,
};

export const roleRepository = {
    async findAll(params: RoleQueryParams) {
        const {page, limit, search, actif} = params;
        const skip = (page - 1) * limit;

        const where: Prisma.RoleWhereInput = {};

        if (search) {
            where.OR = [
                {nom: {contains: search, mode: "insensitive"}},
                {code: {contains: search, mode: "insensitive"}},
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
                orderBy: {createdAt: "desc"},
            }),
            prisma.role.count({where}),
        ]);

        const formattedRoles = roles.map(role => ({
            ...role,
            permissions: role.permissions.map(rp => rp.permission),
        }));

        return {
            roles: formattedRoles,
            total,
            page,
            limit,
        };
    },

    async findById(id: string) {
        const role = await prisma.role.findUnique({
            where: { id },
            select: roleSelect,
        });

        if(!role) {
            return null;
        }

        return {
            ...role,
            permissions: role?.permissions.map(p => p.permission),
        };
    },

    async findByCode(code: string) {
        return prisma.role.findUnique({
            where: {code},
            select: roleSelect,
        });
    },

    async create(data: CreateRoleInput & { permissionIds?: string[] }) {
        return prisma.role.create({
            data: {
                nom: data.nom,
                code: data.code,
                description: data.description,
                permissions: {
                    create: data.permissionIds?.map((permissionId) => ({
                        permissionId,
                    })) || [],
                },
            },
            select: roleSelect,
        });
    },

    async update(id: string, data: UpdateRoleInput & { permissionIds?: string[] }) {
        return prisma.$transaction(async (tx) => {
            const updatedRole = await tx.role.update({
                where: { id },
                data: {
                    nom: data.nom,
                    code: data.code,
                    description: data.description,
                },
            });

            if (data.permissionIds) {
                await tx.rolePermission.deleteMany({ where: { roleId: id } });
                await tx.rolePermission.createMany({
                    data: data.permissionIds.map(pId => ({ roleId: id, permissionId: pId })),
                });
            }

            return tx.role.findUnique({ where: { id }, select: roleSelect });
        });
    },
    async delete(id: string) {
        return prisma.role.delete({
            where: {id},
            select: roleSelect,
        });
    },
};
