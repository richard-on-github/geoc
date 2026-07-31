import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import type { VenteQueryParams } from "./vente.interface.js";

export const venteRepository = {
  async findAll(params: VenteQueryParams) {
    const {
      page = 1,
      limit = 50,
      search,
      agenceId,
      agenceNom,
      dateDebut,
      dateFin,
      clotureId,
      nonClotureesOnly,
      sortBy = "dateDebut",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.VenteWhereInput = {};

    if (search) {
      where.OR = [
        { kiosque: { contains: search, mode: "insensitive" } },
        { agent: { contains: search, mode: "insensitive" } },
        { numeroTS10: { contains: search, mode: "insensitive" } },
      ];
    }

    if (agenceId) where.agenceId = agenceId;

    if (agenceNom) where.agenceNom = agenceNom;

    if (params.nonClotureesOnly) {
      where.clotureId = null;
    }

    if (params.clotureId) {
      where.clotureId = params.clotureId;
    }

    if (dateDebut || dateFin) {
      where.dateDebut = {};
      if (dateDebut) where.dateDebut.gte = new Date(dateDebut);
      if (dateFin) where.dateDebut.lte = new Date(dateFin);
    }

    const [ventes, total] = await Promise.all([
      prisma.vente.findMany({
        where,
        include: { agence: { select: { nom: true, code: true } } },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.vente.count({ where }),
    ]);

    return { ventes, total, page, limit };
  },

  async findImportLogByHash(fileHash: string) {
    return prisma.venteImportLog.findUnique({
      where: { fileHash },
    });
  },

  async bulkImport(
    importLogData: Prisma.VenteImportLogCreateInput,
    ventesData: Prisma.VenteCreateManyImportLogInput[],
  ) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const importLog = await tx.venteImportLog.create({
        data: importLogData,
      });

      const ventesToInsert = ventesData.map((v) => ({
        ...v,
        importId: importLog.id,
      }));

      const createdVentes = await tx.vente.createMany({
        data: ventesToInsert,
        skipDuplicates: true,
      });

      await tx.venteImportLog.update({
        where: { id: importLog.id },
        data: { lignes: createdVentes.count },
      });

      return { importLog, count: createdVentes.count };
    });
  },
};
