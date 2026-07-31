import { venteRepository } from "./vente.repository.js";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction, TypeImport, type Prisma } from "@prisma/client";
import crypto from "crypto";
import type { VenteQueryParams, ParsedVenteRow } from "./vente.interface.js";
import { getPaginationMeta } from "../../utils/pagination.js";
import { contextStorage } from "../../utils/context.js";

export const venteService = {
  async getAll(params: VenteQueryParams) {
    const { ventes, total, page, limit } =
      await venteRepository.findAll(params);
    const pagination = getPaginationMeta(total, page, limit);
    return { ventes, pagination };
  },

  async importVentes(
    fileBuffer: Buffer,
    parsedRows: ParsedVenteRow[],
    fileName: string,
    actorId: string,
    ip?: string,
  ) {
    if (!parsedRows.length) {
      throw ApiError.badRequest("Le fichier ne contient aucune donnée valide.");
    }

    const fileHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    const existingImport = await venteRepository.findImportLogByHash(fileHash);
    if (existingImport) {
      throw ApiError.conflict(
        `Ce fichier a déjà été importé le ${existingImport.createdAt.toLocaleDateString()}`,
      );
    }

    const ctx = contextStorage.getStore();
    const isScopedAgence = ctx?.dataScope === "AGENCE" && ctx?.agenceId;

    let agences = await prisma.agence.findMany({
      where: { actif: true },
      select: { id: true, nom: true, code: true },
    });

    const agenceMap = new Map<string, string>();
    agences.forEach((a) => {
      agenceMap.set(a.nom.trim().toLowerCase(), a.id);
      agenceMap.set(a.code.trim().toLowerCase(), a.id);
    });

    if (!isScopedAgence) {
      const missingAgences = new Set<string>();

      parsedRows.forEach((row) => {
        const searchKey = row.agenceNomBrut.trim().toLowerCase();
        if (!agenceMap.has(searchKey)) {
          missingAgences.add(row.agenceNomBrut.trim());
        }
      });

      if (missingAgences.size > 0) {
        const newAgencesData = Array.from(missingAgences).map((nom) => {
          const randomSuffix = crypto
            .randomBytes(3)
            .toString("hex")
            .toUpperCase();
          return {
            nom,
            code: `AG-AUTO-${randomSuffix}`,
            actif: true,
          };
        });

        await prisma.agence.createMany({
          data: newAgencesData,
          skipDuplicates: true,
        });

        agences = await prisma.agence.findMany({
          where: { actif: true },
          select: { id: true, nom: true, code: true },
        });

        agenceMap.clear();
        agences.forEach((a) => {
          agenceMap.set(a.nom.trim().toLowerCase(), a.id);
          agenceMap.set(a.code.trim().toLowerCase(), a.id);
        });
      }
    }

    // SÉCURITÉ : Préparation des données avec typage strict Prisma
    const ventesData: Prisma.VenteCreateManyInput[] = parsedRows.map((row) => {
      let matchedAgenceId: string | null = null;

      if (isScopedAgence) {
        matchedAgenceId = ctx.agenceId!;
      } else {
        const searchKey = row.agenceNomBrut.trim().toLowerCase();
        matchedAgenceId = agenceMap.get(searchKey) || null;
      }

      return {
        agenceId: matchedAgenceId,
        agenceNom: row.agenceNomBrut,
        kiosque: row.kiosque,
        agent: row.agent,
        banque: row.banque,
        numeroTS10: row.numeroTS10,
        totalVente: row.totalVente,
        totalPaye: row.totalPaye,
        totalSolde: row.totalSolde,
        dateDebut: row.dateDebut,
        dateFin: row.dateFin,
      };
    });

    const importLogData = {
      fileHash,
      nomFichier: fileName,
      typeImport: TypeImport.MANUEL,
      userId: actorId,
      lignes: 0,
    };

    const result = await venteRepository.bulkImport(importLogData, ventesData);

    await logAudit({
      action: AuditAction.IMPORT,
      entity: "Vente",
      entityId: result.importLog.id,
      userId: actorId,
      ip: ip ?? "",
      message: `Import de ${result.count} ventes via le fichier ${fileName}`,
    });

    return result;
  },

  async cloturerMois(periode: string, actorId: string, ip?: string) {
    const existingCloture = await prisma.venteCloture.findUnique({
      where: { periode },
    });

    if (existingCloture) {
      throw ApiError.badRequest(`La période ${periode} a déjà été clôturée.`);
    }

    const ventesACloturer = await prisma.vente.findMany({
      where: { clotureId: null },
    });

    if (ventesACloturer.length === 0) {
      throw ApiError.badRequest("Aucune vente à clôturer pour cette période.");
    }

    const totalVentes = ventesACloturer.reduce(
      (sum, v) => sum + Number(v.totalVente),
      0,
    );
    const totalPayes = ventesACloturer.reduce(
      (sum, v) => sum + Number(v.totalPaye),
      0,
    );
    const totalSoldes = ventesACloturer.reduce(
      (sum, v) => sum + Number(v.totalSolde),
      0,
    );

    const dateDebut = ventesACloturer.reduce(
      (min, v) => (v.dateDebut < min ? v.dateDebut : min),
      ventesACloturer[0].dateDebut,
    );
    const dateFin = ventesACloturer.reduce(
      (max, v) => (v.dateFin > max ? v.dateFin : max),
      ventesACloturer[0].dateFin,
    );

    const result = await prisma.$transaction(async (tx) => {
      const cloture = await tx.venteCloture.create({
        data: {
          periode,
          dateDebut,
          dateFin,
          totalVentes,
          totalPayes,
          totalSoldes,
          nbLignes: ventesACloturer.length,
          clotureParId: actorId,
        },
      });

      await tx.vente.updateMany({
        where: { clotureId: null },
        data: { clotureId: cloture.id },
      });

      return cloture;
    });

    await logAudit({
      action: AuditAction.CREATION,
      entity: "VenteCloture",
      entityId: result.id,
      userId: actorId,
      ip: ip ?? "",
      message: `Clôture mensuelle effectuée pour la période ${periode} (${result.nbLignes} ventes).`,
    });

    return result;
  },

  async getClotures() {
    return prisma.venteCloture.findMany({
      include: {
        cloturePar: { select: { nom: true, prenom: true, email: true } },
      },
      orderBy: { dateCloture: "desc" },
    });
  },
};
