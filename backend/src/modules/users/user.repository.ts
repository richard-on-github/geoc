import {Prisma} from "@prisma/client";
import {prisma} from "../../config/prisma.js";
import type {
    CreateUserInput,
    UpdateUserInput,
    UserQueryParams,
} from "./user.interface.js";

const userSelect = {
    id: true,
    prenom: true,
    nom: true,
    email: true,
    telephone: true,
    roleId: true,
    role: {
        select: {
            id: true,
            nom: true,
            code: true,
        },
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
    actif: true,
    mustChangePassword: true,
    lastLoginAt:true,
    createdAt: true,
    updatedAt: true,
};

export const userRepository = {
    async findAll(params: UserQueryParams) {
        const {
            page,
            limit,
            search,
            roleId,
            actif,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {};

        if (search) {
            where.OR = [
                {prenom: {contains: search, mode: "insensitive"}},
                {nom: {contains: search, mode: "insensitive"}},
                {email: {contains: search, mode: "insensitive"}},
            ];
        }

        if (roleId) {
            where.roleId = roleId;
        }

        if (actif !== undefined) {
            where.actif = actif;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: userSelect,
                skip,
                take: limit,
                orderBy: {[sortBy]: sortOrder},
            }),
            prisma.user.count({where}),
        ]);

        const formattedUsers = users.map(user => ({
            ...user,
            permissions: user.permissions.map(rp => rp.permission),
        }));

        return {
            users: formattedUsers,
            total,
            page,
            limit,
        };
    },

    async findById(id: string) {
        const user = await prisma.user.findUnique({
            where: {id},
            select: userSelect,
        });

        if (!user) return null;

        return {
            ...user,
            permissions: user?.permissions.map(u => u.permission),
        };
    },

    async findByEmail(email: string, excludeId?: string) {
        return prisma.user.findFirst({
            where: {
                email,
                ...(excludeId ? {id: {not: excludeId}} : {}),
            },
        });
    },

    async create(data: CreateUserInput & { passwordHash: string }) {
        return prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    prenom: data.prenom,
                    nom: data.nom,
                    email: data.email,
                    telephone: data.telephone,
                    roleId: data.roleId,
                    passwordHash: data.passwordHash,
                    permissions: {
                        create: data.permissionIds?.map(pId => ({ permissionId: pId })) || [],
                    },
                },
                select: userSelect,
            });
            return { ...user, permissions: user.permissions.map(p => p.permission) };
        });
    },

    async update(id: string, data: UpdateUserInput) {
        return prisma.$transaction(async (tx) => {
            // 1. Mise à jour utilisateur
            const updatedUser = await tx.user.update({
                where: { id },
                data: {
                    prenom: data.prenom,
                    nom: data.nom,
                    email: data.email,
                    telephone: data.telephone,
                    roleId: data.roleId,
                    mustChangePassword: data.mustChangePassword,
                },
                select: userSelect,
            });

            // 2. Sync des permissions si le champ est fourni
            if (data.permissionIds) {
                await tx.userPermission.deleteMany({ where: { userId: id } });
                await tx.userPermission.createMany({
                    data: data.permissionIds.map(pId => ({ userId: id, permissionId: pId })),
                });
            }

            return this.findById(id);
        });
    },

    async updateStatus(id: string, actif: boolean) {
        return prisma.user.update({
            where: {id},
            data: {actif},
            select: userSelect,
        });
    },

    async delete(id: string) {
        return prisma.user.delete({
            where: {id},
            select: userSelect,
        });
    },

    async updateLastLogin(id: string) {
        return prisma.user.update({
            where: { id },
            data: { lastLoginAt: new Date() },
        });
    }
};
