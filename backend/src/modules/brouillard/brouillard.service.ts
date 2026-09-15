import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type {
  BrouillardQueryParams,
  BrouillardResult,
  LigneBrouillard,
} from "./brouillard.interface.js";

type EncaissementAvecVente = Prisma.EncaissementGetPayload<{
  include: { vente: true };
}>;

function formatNumeroPiece(numeroSequence: number): string {
  return String(numeroSequence).padStart(10, "0");
}

export const brouillardService = {
  async getBrouillard(
    params: BrouillardQueryParams,
  ): Promise<BrouillardResult> {
    const { agenceId, dateDebut, dateFin } = params;

    let agenceNom = "Toutes agences";
    if (agenceId) {
      const agence = await prisma.agence.findUnique({
        where: { id: agenceId },
      });
      if (!agence) {
        throw ApiError.notFound("Agence introuvable.");
      }
      agenceNom = agence.nom;
    }

    // Sans agence précisée, on liste les encaissements de toutes les
    // agences confondues (un seul registre global).
    const where: Prisma.EncaissementWhereInput = agenceId
      ? { vente: { agenceId } }
      : {};

    const encaissements = await prisma.encaissement.findMany({
      where,
      include: { vente: true },
      orderBy: { dateEncaissement: "asc" },
    });

    if (encaissements.length === 0) {
      throw ApiError.notFound(
        agenceId
          ? `Aucun encaissement trouvé pour l'agence ${agenceNom}.`
          : "Aucun encaissement trouvé.",
      );
    }

    let soldeCumule = 0;
    const toutesLesLignes: LigneBrouillard[] = encaissements.map(
      (e: EncaissementAvecVente) => {
        soldeCumule += Number(e.montant);
        const anneeCourte = String(e.vente.annee).slice(2);

        return {
          numeroPiece: formatNumeroPiece(e.numeroSequence),
          libelle: `VERS. L5/90 J${String(e.vente.jourAnnee)}/${anneeCourte} ${e.vente.agent}`,
          date: e.dateEncaissement,
          recettes: Number(e.montant),
          depenses: 0,
          solde: soldeCumule,
          type: "B" as const,
        };
      },
    );

    const seuilDebut = dateDebut ? new Date(dateDebut) : null;
    const seuilFin = dateFin ? new Date(dateFin) : null;

    let ligneOuverture: LigneBrouillard | null = null;
    let lignesPeriode = toutesLesLignes;

    // La ligne de report n'a de sens QUE si une date de début est précisée
    // (sinon on affiche tout depuis le premier encaissement, sans rien à reporter).
    if (seuilDebut) {
      const operationsAvant = toutesLesLignes.filter(
        (l) => l.date < seuilDebut,
      );
      const soldeOuverture =
        operationsAvant.length > 0
          ? operationsAvant[operationsAvant.length - 1].solde
          : 0;

      ligneOuverture = {
        numeroPiece: "",
        libelle: `Solde au ${new Date(seuilDebut.getTime() - 86_400_000).toLocaleDateString("fr-FR")}`,
        date: seuilDebut,
        recettes: soldeOuverture,
        depenses: 0,
        solde: soldeOuverture,
        type: "A",
      };

      lignesPeriode = toutesLesLignes.filter((l) => l.date >= seuilDebut);
    }

    if (seuilFin) {
      lignesPeriode = lignesPeriode.filter((l) => l.date <= seuilFin);
    }

    const lignes: LigneBrouillard[] = ligneOuverture
      ? [ligneOuverture, ...lignesPeriode]
      : lignesPeriode;

    const totalRecettes = lignesPeriode.reduce((sum, l) => sum + l.recettes, 0);
    const totalDepenses = 0;
    const soldeFinal = lignes.length > 0 ? lignes[lignes.length - 1].solde : 0;

    return {
      agenceId: agenceId ?? null,
      agenceNom,
      numeroRegistre: agenceId
        ? `Caisse LNT - ${agenceNom}`
        : "Caisse LNT - Toutes agences",
      dateDebut: seuilDebut,
      dateFin: seuilFin,
      lignes,
      totalRecettes,
      totalDepenses,
      soldeFinal,
    };
  },
};
