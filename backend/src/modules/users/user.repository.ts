import { Prisma, Role } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
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
  role: true,
  actif: true,
  mustChangePassword: true,
  createdAt: true,
  updatedAt: true,
};

export const userRepository = {
  async findAll(params: UserQueryParams) {
    const {
      page,
      limit,
      search,
      role,
      actif,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { prenom: { contains: search, mode: "insensitive" } },
        { nom: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
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
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  },

  async findByEmail(email: string, excludeId?: string) {
    return prisma.user.findFirst({
      where: {
        email,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  },

  async create(data: CreateUserInput & { passwordHash: string }) {
    return prisma.user.create({
      data: {
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        role: data.role,
        passwordHash: data.passwordHash,
      },
      select: userSelect,
    });
  },

  async update(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  },

  async updateStatus(id: string, actif: boolean) {
    return prisma.user.update({
      where: { id },
      data: { actif },
      select: userSelect,
    });
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
      select: userSelect,
    });
  },
};
