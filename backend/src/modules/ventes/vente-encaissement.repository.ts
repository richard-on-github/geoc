import { prisma } from "../../config/prisma.js";
import { StatutEncaissement } from "@prisma/client";

export const venteEncaissementRepository = {
  async findVenteById(id: string) {
    return prisma.vente.findUnique({ where: { id } });
  },

  async findEncaissementsByVenteId(venteId: string) {
    return prisma.encaissement.findMany({
      where: { venteId },
      orderBy: { dateEncaissement: "asc" },
      include: {
        enregistrePar: { select: { nom: true, prenom: true, email: true } },
      },
    });
  },

  async createEncaissement(
    venteId: string,
    montant: number,
    dateEncaissement: Date,
    actorId: string,
  ) {
    return prisma.encaissement.create({
      data: {
        venteId,
        montant,
        dateEncaissement,
        enregistreParId: actorId,
      },
    });
  },

  /** Somme de tous les encaissements enregistrés pour une vente, tous statuts confondus. */
  async sumEncaissements(venteId: string): Promise<number> {
    const result = await prisma.encaissement.aggregate({
      where: { venteId },
      _sum: { montant: true },
    });
    return Number(result._sum.montant ?? 0);
  },

  async updateStatutEncaissement(venteId: string, statut: StatutEncaissement) {
    return prisma.vente.update({
      where: { id: venteId },
      data: { statutEncaissement: statut },
    });
  },
};
