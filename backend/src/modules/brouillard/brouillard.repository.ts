import { Prisma, StatutBrouillard, StatutAnomalieBrouillard } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import type { BrouillardQueryParams } from "./brouillard.interface.js";

interface DonneesRecalcul {
  venteId: string;
  journee: Date;
  agenceId: string | null;
  numeroTS10: string;
  ventes: number;
  soldeAttendu: number;
  montantVerse: number;
  ecart: number;
  penalite: number;
  statutAnomalie: StatutAnomalieBrouillard;
}

export const brouillardRepository = {
  async findByVenteId(venteId: string) {
    return prisma.brouillard.findUnique({ where: { venteId } });
  },

  async findById(id: string) {
    return prisma.brouillard.findUnique({ where: { id } });
  },

  /**
   * Crée le brouillard s'il n'existe pas encore pour cette vente, ou met à
   * jour ses valeurs calculées s'il existe déjà. N'est appelé que lorsque
   * le brouillard est encore OUVERT (vérifié en amont par le service) —
   * jamais sur un brouillard déjà figé.
   */
  async upsertPourVente(data: DonneesRecalcul) {
    return prisma.brouillard.upsert({
      where: { venteId: data.venteId },
      create: {
        venteId: data.venteId,
        journee: data.journee,
        agenceId: data.agenceId,
        numeroTS10: data.numeroTS10,
        ventes: data.ventes,
        soldeAttendu: data.soldeAttendu,
        montantVerse: data.montantVerse,
        ecart: data.ecart,
        penalite: data.penalite,
        statutAnomalie: data.statutAnomalie,
      },
      update: {
        ventes: data.ventes,
        soldeAttendu: data.soldeAttendu,
        montantVerse: data.montantVerse,
        ecart: data.ecart,
        penalite: data.penalite,
        statutAnomalie: data.statutAnomalie,
      },
    });
  },

  async findAll(params: BrouillardQueryParams) {
    const {
      page = 1,
      limit = 50,
      agenceId,
      numeroTS10,
      dateDebut,
      dateFin,
      statutAnomalie,
      statut,
      sortBy = "journee",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.BrouillardWhereInput = {};

    if (agenceId) where.agenceId = agenceId;
    if (numeroTS10) {
      where.numeroTS10 = { contains: numeroTS10, mode: "insensitive" };
    }
    if (statutAnomalie) where.statutAnomalie = statutAnomalie;
    if (statut) where.statut = statut;
    if (dateDebut || dateFin) {
      where.journee = {};
      if (dateDebut) where.journee.gte = new Date(dateDebut);
      if (dateFin) where.journee.lte = new Date(dateFin);
    }

    const [items, total] = await Promise.all([
      prisma.brouillard.findMany({
        where,
        include: {
          vente: {
            select: { agenceNom: true, kiosque: true, agent: true },
          },
          clotureParUser: { select: { nom: true, prenom: true } },
          valideParUser: { select: { nom: true, prenom: true } },
          rejeteParUser: { select: { nom: true, prenom: true } },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.brouillard.count({ where }),
    ]);

    return { items, total, page, limit };
  },

  async cloturer(id: string, actorId: string, situation: string | undefined) {
    return prisma.brouillard.update({
      where: { id },
      data: {
        statut: StatutBrouillard.CLOTURE,
        clotureParId: actorId,
        clotureAt: new Date(),
        situation,
      },
    });
  },

  async valider(id: string, actorId: string) {
    return prisma.brouillard.update({
      where: { id },
      data: {
        statut: StatutBrouillard.VALIDE,
        valideParId: actorId,
        valideAt: new Date(),
      },
    });
  },

  async rejeter(id: string, actorId: string, raison: string) {
    return prisma.brouillard.update({
      where: { id },
      data: {
        statut: StatutBrouillard.REJETE,
        rejeteParId: actorId,
        rejeteAt: new Date(),
        rejetRaison: raison,
      },
    });
  },
};
