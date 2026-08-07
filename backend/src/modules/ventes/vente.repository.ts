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
      jour,
      mois,
      annee,
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

    if (nonClotureesOnly) {
      where.clotureId = null;
    }

    if (clotureId) {
      where.clotureId = clotureId;
    }

    if (dateDebut || dateFin) {
      where.dateDebut = {};
      if (dateDebut) where.dateDebut.gte = new Date(dateDebut);
      if (dateFin) where.dateDebut.lte = new Date(dateFin);
    }

    // Filtres indépendants de la plage dateDebut/dateFin : jour de l'année,
    // mois ou année, calculés une fois pour toutes à l'import.
    if (jour) where.jourAnnee = jour;
    if (mois) where.mois = mois;
    if (annee) where.annee = annee;

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

  /**
   * Retourne les couples (mois, année) distincts pour lesquels il existe au moins
   * une vente non clôturée. Sert à vérifier qu'aucun mois antérieur au mois ciblé
   * par un import n'est resté ouvert (règle : on ne peut pas "sauter" un mois).
   */
  async findMoisAnneeNonClotures(): Promise<Array<{ mois: number; annee: number }>> {
    const rows = await prisma.vente.findMany({
      where: { clotureId: null },
      select: { mois: true, annee: true },
      distinct: ["mois", "annee"],
    });
    return rows;
  },

  /** Compte le nombre de ventes déjà existantes (tous statuts confondus) pour un mois/année donné. */
  async countByMoisAnnee(mois: number, annee: number): Promise<number> {
    return prisma.vente.count({ where: { mois, annee } });
  },

  /** Ventes non clôturées d'un mois/année donné, utilisées pour construire une clôture. */
  async findNonClotureesByMoisAnnee(mois: number, annee: number) {
    return prisma.vente.findMany({ where: { mois, annee, clotureId: null } });
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
