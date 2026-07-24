import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import type {
  AgenceQueryParams,
  CreateAgenceInput,
  UpdateAgenceInput,
} from "./agence.interface.js";

const agenceMinimalSelect = {
  id: true,
  nom: true,
  code: true,
  actif: true,
};

const agenceSelect = {
  id: true,
  nom: true,
  code: true,
  adresse: true,
  telephone: true,
  email: true,
  actif: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      users: true,
      ventes: true,
    },
  },
};

export const agenceRepository = {
  async findAll(params: AgenceQueryParams) {
    const {
      page,
      limit,
      search,
      actif,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AgenceWhereInput = {};

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (actif !== undefined) {
      where.actif = actif;
    }

    const [agences, total] = await Promise.all([
      prisma.agence.findMany({
        where,
        select: agenceSelect,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.agence.count({ where }),
    ]);

    return { agences, total, page, limit };
  },

  async findAllWithoutPagination(params: AgenceAllQueryParams = {}) {
    const { search, actif } = params;
    const where: Prisma.AgenceWhereInput = {};

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (actif !== undefined) {
      where.actif = actif;
    }

    return prisma.agence.findMany({
      where,
      select: agenceMinimalSelect,
      orderBy: { nom: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.agence.findUnique({
      where: { id },
      select: agenceSelect,
    });
  },

  async findByCode(code: string, excludeId?: string) {
    return prisma.agence.findFirst({
      where: {
        code,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  },

  async create(data: CreateAgenceInput) {
    return prisma.agence.create({
      data,
      select: agenceSelect,
    });
  },

  async update(id: string, data: UpdateAgenceInput) {
    return prisma.agence.update({
      where: { id },
      data,
      select: agenceSelect,
    });
  },

  async updateStatus(id: string, actif: boolean) {
    return prisma.agence.update({
      where: { id },
      data: { actif },
      select: agenceSelect,
    });
  },

  async delete(id: string) {
    return prisma.agence.delete({
      where: { id },
      select: agenceSelect,
    });
  },
};
