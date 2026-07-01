import {Prisma} from "@prisma/client";
import {prisma} from "../../config/prisma.js";
import type {PermissionQueryParams} from "./permission.interface.js";

const permissionSelect = {
    id: true,
    nom: true,
    code: true,
    description: true,

    users: {
        select: {
            user: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                    telephone: true,
                    actif: true,
                },
            },
        },
    },

    roles: {
        select: {
            role: {
                select: {
                    id: true,
                    nom: true,
                    code: true,
                    description: true,
                    actif: true,
                },
            },
        },
    },

    createdAt: true,
};

const formatPermission = (permission: any) => ({
    ...permission,
    users: permission.users.map(up => up.user),
    roles: permission.roles.map(rp => rp.role),
});

export const permissionRepository = {
    async findAll(params: PermissionQueryParams) {
        const {page, limit, search} = params;
        const skip = (page - 1) * limit;

        const where: Prisma.PermissionWhereInput = {};

        if (search) {
            where.OR = [
                {nom: {contains: search, mode: "insensitive"}},
                {code: {contains: search, mode: "insensitive"}},
            ];
        }

        const [permissions, total] = await Promise.all([
            prisma.permission.findMany({
                where,
                select: permissionSelect,
                skip,
                take: limit,
                orderBy: {code: "asc"},
            }),
            prisma.permission.count({where}),
        ]);

        return {
            permissions: permissions.map(formatPermission),
            total,
            page,
            limit,
        };
    },

    async findById(id: string) {
        const permission = await prisma.permission.findUnique({
            where: {id},
            select: permissionSelect,
        });

        return permission ? formatPermission(permission) : null;
    },

    async findByCode(code: string) {
        return prisma.permission.findUnique({
            where: {code},
            select: permissionSelect,
        });
    },
};
