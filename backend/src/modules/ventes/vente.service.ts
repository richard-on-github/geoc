import { venteRepository } from "./vente.repository.js";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction, TypeImport } from "@prisma/client";
import crypto from "crypto";
import type { VenteQueryParams, ParsedVenteRow } from "./vente.interface.js";
import { getPaginationMeta } from "../../utils/pagination.js";
import { contextStorage } from "../../utils/context.js"; // <-- Import du contexte asynchrone

export const venteService = {
  async getAll(params: VenteQueryParams) {
    // <-- Nettoyé ! Plus de scopeWhere
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

    // Extraction du contexte utilisateur pour la sécurité de l'import
    const ctx = contextStorage.getStore();
    const isScopedAgence = ctx?.dataScope === "AGENCE" && ctx?.agenceId;

    // Récupération du mapping mémoire des agences
    const agences = await prisma.agence.findMany({
      where: { actif: true },
      select: { id: true, nom: true, code: true },
    });

    const agenceMap = new Map<string, string>();
    agences.forEach((a) => {
      agenceMap.set(a.nom.trim().toLowerCase(), a.id);
      agenceMap.set(a.code.trim().toLowerCase(), a.id);
    });

    // SÉCURITÉ : Préparation des données avec forçage de périmètre
    const ventesData = parsedRows.map((row) => {
      let matchedAgenceId: string | null = null;

      if (isScopedAgence) {
        // Si l'utilisateur est restreint, on FORCE absolument son agence, peu importe ce qui est écrit dans le fichier Excel !
        matchedAgenceId = ctx.agenceId!;
      } else {
        // Si l'utilisateur est Admin Global, on match dynamiquement via le fichier
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

    const result = await venteRepository.bulkImport(
      importLogData,
      ventesData as any,
    );

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
};
