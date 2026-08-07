import { venteRepository } from "./vente.repository.js";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction, TypeImport, Vente, type Prisma } from "@prisma/client";
import crypto from "crypto";
import type { VenteQueryParams, ParsedVenteRow } from "./vente.interface.js";
import { getPaginationMeta } from "../../utils/pagination.js";
import { contextStorage } from "../../utils/context.js";
import {
  computeJourAnneeInfo,
  getPeriodePrecedente,
  getPeriodeSuivante,
  periodeToMoisAnnee,
} from "../../utils/date-vente.js";

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
    periode: string,
    actorId: string,
    ip?: string,
  ) {
    if (!parsedRows.length) {
      throw ApiError.badRequest("Le fichier ne contient aucune donnée valide.");
    }

    const { mois: moisCible, annee: anneeCible } = periodeToMoisAnnee(periode);

    // 1. La période ciblée ne doit pas être déjà clôturée : on ne peut plus
    //    ajouter de ventes à un mois clôturé.
    const clotureExistante = await prisma.venteCloture.findUnique({
      where: { periode },
    });
    if (clotureExistante) {
      throw ApiError.badRequest(
        `La période ${periode} est déjà clôturée. Annulez d'abord la clôture pour pouvoir importer de nouvelles ventes sur ce mois.`,
      );
    }

    // 2. Toute ligne du fichier doit appartenir au mois pour lequel on l'importe,
    //    sinon on refuse le chargement dans son intégralité.
    const lignesHorsPeriode = parsedRows.filter((row) => {
      const info = computeJourAnneeInfo(row.dateDebut);
      return info.mois !== moisCible || info.annee !== anneeCible;
    });
    if (lignesHorsPeriode.length > 0) {
      throw ApiError.badRequest(
        `Le fichier contient ${lignesHorsPeriode.length} ligne(s) dont la date de début n'appartient pas à la période ${periode}. Le chargement a été refusé.`,
      );
    }

    // 3. On ne peut passer à un nouveau mois que si le mois précédent a été clôturé
    //    (règle appliquée uniquement lors du tout premier import d'un mois donné ;
    //    les imports suivants sur un mois déjà entamé et toujours ouvert sont libres).
    const ventesExistantesPourPeriode = await venteRepository.countByMoisAnnee(
      moisCible,
      anneeCible,
    );

    if (ventesExistantesPourPeriode === 0) {
      const existeAuMoinsUneVente = (await prisma.vente.count()) > 0;
      if (existeAuMoinsUneVente) {
        const periodePrecedente = getPeriodePrecedente(periode);
        const clotureprecedente = await prisma.venteCloture.findUnique({
          where: { periode: periodePrecedente },
        });
        if (!clotureprecedente) {
          throw ApiError.badRequest(
            `Vous devez d'abord clôturer la période ${periodePrecedente} avant de pouvoir charger la période ${periode}.`,
          );
        }
      }
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
    agences.forEach((a: { id: string; nom: string; code: string }) => {
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
        agences.forEach((a: { id: string; nom: string; code: string }) => {
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

      const { jourAnnee, mois, annee } = computeJourAnneeInfo(row.dateDebut);

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
        jourAnnee,
        mois,
        annee,
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
      message: `Import de ${result.count} ventes via le fichier ${fileName} pour la période ${periode}`,
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

    const { mois, annee } = periodeToMoisAnnee(periode);

    // On ne clôture que les ventes appartenant explicitement au mois ciblé
    // (calculé via jourAnnee/mois/annee), et non plus "toutes les ventes ouvertes".
    const ventesACloturer = await venteRepository.findNonClotureesByMoisAnnee(
      mois,
      annee,
    );

    if (ventesACloturer.length === 0) {
      throw ApiError.badRequest(
        `Aucune vente à clôturer pour la période ${periode}.`,
      );
    }

    const totalVentes = ventesACloturer.reduce(
      (sum: number, v: Vente) => sum + Number(v.totalVente),
      0,
    );
    const totalPayes = ventesACloturer.reduce(
      (sum: number, v: Vente) => sum + Number(v.totalPaye),
      0,
    );
    const totalSoldes = ventesACloturer.reduce(
      (sum: number, v: Vente) => sum + Number(v.totalSolde),
      0,
    );

    const dateDebut = ventesACloturer.reduce(
      (min: Date, v: Vente) => (v.dateDebut < min ? v.dateDebut : min),
      ventesACloturer[0].dateDebut,
    );
    const dateFin = ventesACloturer.reduce(
      (max: Date, v: Vente) => (v.dateFin > max ? v.dateFin : max),
      ventesACloturer[0].dateFin,
    );

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
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
          where: { mois, annee, clotureId: null },
          data: { clotureId: cloture.id },
        });

        return cloture;
      },
    );

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

  /**
   * Annule la clôture d'un mois. N'est autorisé que si aucune vente n'existe
   * encore pour le mois suivant (sinon on romprait la chaîne de clôtures
   * séquentielle mois par mois).
   */
  async annulerCloture(periode: string, actorId: string, ip?: string) {
    const cloture = await prisma.venteCloture.findUnique({
      where: { periode },
    });

    if (!cloture) {
      throw ApiError.notFound(
        `Aucune clôture trouvée pour la période ${periode}.`,
      );
    }

    const periodeSuivante = getPeriodeSuivante(periode);
    const { mois: moisSuivant, annee: anneeSuivant } =
      periodeToMoisAnnee(periodeSuivante);

    const ventesMoisSuivant = await venteRepository.countByMoisAnnee(
      moisSuivant,
      anneeSuivant,
    );

    if (ventesMoisSuivant > 0) {
      throw ApiError.badRequest(
        `Impossible d'annuler la clôture de la période ${periode} : des ventes existent déjà pour la période suivante (${periodeSuivante}). Celles-ci doivent être supprimées au préalable.`,
      );
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.vente.updateMany({
        where: { clotureId: cloture.id },
        data: { clotureId: null },
      });
      await tx.venteCloture.delete({ where: { id: cloture.id } });
    });

    await logAudit({
      action: AuditAction.SUPPRESSION,
      entity: "VenteCloture",
      entityId: cloture.id,
      userId: actorId,
      ip: ip ?? "",
      message: `Annulation de la clôture mensuelle de la période ${periode} (${cloture.nbLignes} ventes rouvertes).`,
    });

    return { periode, annule: true };
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
