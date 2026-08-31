import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import type { AbattementQueryParams } from "./abattement.interface.js";

const PARAMETRES_SINGLETON_ID = "singleton";

export type VenteAvecEncaissements = Prisma.VenteGetPayload<{
  include: {
    encaissements: true;
    agence: { select: { nom: true; code: true } };
  };
}>;

export function buildAbattementWhere(
  params: Pick<
    AbattementQueryParams,
    "search" | "agenceId" | "dateDebut" | "dateFin" | "jour" | "mois" | "annee"
  >,
): Prisma.VenteWhereInput {
  const { search, agenceId, dateDebut, dateFin, jour, mois, annee } = params;
  const where: Prisma.VenteWhereInput = {};

  if (search) {
    where.OR = [
      { numeroTS10: { contains: search, mode: "insensitive" } },
      { agenceNom: { contains: search, mode: "insensitive" } },
    ];
  }

  if (agenceId) where.agenceId = agenceId;
  if (jour) where.jourAnnee = jour;
  if (mois) where.mois = mois;
  if (annee) where.annee = annee;

  if (dateDebut || dateFin) {
    where.dateDebut = {};
    if (dateDebut) where.dateDebut.gte = new Date(dateDebut);
    if (dateFin) where.dateDebut.lte = new Date(dateFin);
  }

  return where;
}

export const abattementRepository = {
  async findVentesAvecEncaissements(
    params: AbattementQueryParams,
  ): Promise<{
    ventes: VenteAvecEncaissements[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 50,
      sortBy = "dateDebut",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;
    const where = buildAbattementWhere(params);

    const [ventes, total] = await Promise.all([
      prisma.vente.findMany({
        where,
        include: {
          encaissements: true,
          agence: { select: { nom: true, code: true } },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.vente.count({ where }),
    ]);

    return { ventes, total, page, limit };
  },

  async findAllVentesAvecEncaissements(
    params: AbattementQueryParams,
  ): Promise<VenteAvecEncaissements[]> {
    const { sortBy = "dateDebut", sortOrder = "desc" } = params;
    const where = buildAbattementWhere(params);

    return prisma.vente.findMany({
      where,
      include: {
        encaissements: true,
        agence: { select: { nom: true, code: true } },
      },
      orderBy: { [sortBy]: sortOrder },
    });
  },

  /** Retourne les paramètres, en créant la ligne singleton (valeurs par défaut) si elle n'existe pas encore. */
  async getParametres() {
    const existing = await prisma.abattementParametres.findUnique({
      where: { id: PARAMETRES_SINGLETON_ID },
    });
    if (existing) return existing;
    return prisma.abattementParametres.create({
      data: { id: PARAMETRES_SINGLETON_ID },
    });
  },

  async updateParametres(
    data: Partial<{
      heureLimiteUTC: number;
      tauxRetard: number;
      tauxMoinsVerse: number;
      tauxMoinsVerseAvecRetard: number;
      tauxNonVerse: number;
    }>,
    actorId: string,
  ) {
    return prisma.abattementParametres.upsert({
      where: { id: PARAMETRES_SINGLETON_ID },
      update: { ...data, updatedParId: actorId },
      create: { id: PARAMETRES_SINGLETON_ID, ...data, updatedParId: actorId },
    });
  },
};
