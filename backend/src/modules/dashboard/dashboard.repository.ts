import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import type { DashboardQueryParams } from "./dashboard.interface.js";

export const dashboardRepository = {
  /**
   * Construction dynamique du filtre WHERE combinant le Scope de sécurité
   * et les filtres de date/agence de la requête.
   */
  buildWhereClause(
    params: DashboardQueryParams,
    scopeWhere: Prisma.VenteWhereInput = {},
  ): Prisma.VenteWhereInput {
    const where: Prisma.VenteWhereInput = { ...scopeWhere };

    if (params.agenceId) {
      where.agenceId = params.agenceId;
    }

    if (params.dateDebut || params.dateFin) {
      where.dateDebut = {};
      if (params.dateDebut) where.dateDebut.gte = new Date(params.dateDebut);
      if (params.dateFin) where.dateDebut.lte = new Date(params.dateFin);
    }

    return where;
  },

  async getGlobalKPIs(where: Prisma.VenteWhereInput) {
    const result = await prisma.vente.aggregate({
      where,
      _sum: {
        totalVente: true,
        totalPaye: true,
        totalSolde: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalVente: Number(result._sum.totalVente || 0),
      totalPaye: Number(result._sum.totalPaye || 0),
      totalSolde: Number(result._sum.totalSolde || 0),
      count: result._count.id,
    };
  },

  async getTopKiosques(where: Prisma.VenteWhereInput, limit = 5) {
    const result = await prisma.vente.groupBy({
      by: ["kiosque"],
      where,
      _sum: {
        totalVente: true,
        totalSolde: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalVente: "desc",
        },
      },
      take: limit,
    });

    return result.map((item) => ({
      kiosque: item.kiosque,
      totalVente: Number(item._sum.totalVente || 0),
      totalSolde: Number(item._sum.totalSolde || 0),
      nombreVentes: item._count.id,
    }));
  },

  async getTopAgents(where: Prisma.VenteWhereInput, limit = 5) {
    const result = await prisma.vente.groupBy({
      by: ["agent"],
      where,
      _sum: {
        totalVente: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalVente: "desc",
        },
      },
      take: limit,
    });

    return result.map((item) => ({
      agent: item.agent,
      totalVente: Number(item._sum.totalVente || 0),
      nombreVentes: item._count.id,
    }));
  },
};
