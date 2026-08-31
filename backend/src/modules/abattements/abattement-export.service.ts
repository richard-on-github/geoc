import * as xlsx from "xlsx";
import type { Content, TDocumentDefinitions, TableCell } from "pdfmake/interfaces.js";
import { prisma } from "../../config/prisma.js";
import crypto from "crypto";
import type { AbattementQueryParams } from "./abattement.interface.js";
import { abattementRepository } from "./abattement.repository.js";
import type { VenteAvecEncaissements } from "./abattement.repository.js";
import {
  computeAbattement,
  type AbattementCalcule,
  type AbattementParametresValues,
} from "./abattement-calcul.js";
import {
  createPdfPrinter,
  pdfFonts,
  formatCurrency,
  formatDateCourte,
  formatHeureCourte,
  formatDateHeureCourte,
  COULEUR_SECONDAIRE,
  COULEUR_AVERTISSEMENT,
  COULEUR_FOND_TOTAL,
  type PdfEncryptionOptions,
} from "../../utils/pdf-export.js";

export interface ExportMetadataAbattement {
  genererParNom: string;
  genererParEmail: string;
  agenceExportateur: string;
  dateGeneration: Date;
  reference: string;
  filtresAppliques: string[];
  nombreLignes: number;
  parametres: AbattementParametresValues;
}

interface LigneAbattementExport {
  date: string;
  journee: number;
  numeroOP: string;
  ventes: number;
  paiement: number;
  soldeAVerser: number;
  retardHeure: string;
  retardAbattement: number;
  moinsVerseMontant: number;
  moinsVerseAbattement: number;
  moinsVerseRetardMontant: number;
  moinsVerseRetardAbattement: number;
  nonVerseMontant: number;
  nonVerseAbattement: number;
  /** Montant régularisé (moins versé/non versé finalement comblé, sans limite de délai). */
  regMontant: number;
  /** Montant restant non régularisé à ce jour. */
  nonRegMontant: number;
  /** Total du prélèvement = le montant d'abattement retenu, quelle que soit la catégorie. */
  prelevementTotal: number;
}

function decrireFiltres(query: AbattementQueryParams): string[] {
  const filtres: string[] = [];
  if (query.search) filtres.push(`Recherche : "${query.search}"`);
  if (query.agenceId) filtres.push(`Agence (ID) : ${query.agenceId}`);
  if (query.dateDebut)
    filtres.push(`À partir du : ${formatDateCourte(query.dateDebut)}`);
  if (query.dateFin)
    filtres.push(`Jusqu'au : ${formatDateCourte(query.dateFin)}`);
  if (query.jour) filtres.push(`Journée (jour de l'année) : ${query.jour}`);
  if (query.mois) filtres.push(`Mois : ${query.mois}`);
  if (query.annee) filtres.push(`Année : ${query.annee}`);
  if (query.statut) filtres.push(`Statut : ${query.statut}`);
  if (filtres.length === 0)
    filtres.push("Aucun filtre appliqué (ensemble des abattements)");
  return filtres;
}

/** Transforme le résultat brut du calcul en une ligne "à plat", prête pour CSV/Excel/PDF. */
function buildLigneExport(
  vente: VenteAvecEncaissements,
  abattement: AbattementCalcule,
): LigneAbattementExport {
  const ligne: LigneAbattementExport = {
    date: formatDateCourte(vente.dateDebut),
    journee: vente.jourAnnee,
    numeroOP: vente.numeroTS10,
    ventes: Number(vente.totalVente),
    paiement: Number(vente.totalPaye),
    soldeAVerser: Number(vente.totalSolde),
    retardHeure: "-",
    retardAbattement: 0,
    moinsVerseMontant: 0,
    moinsVerseAbattement: 0,
    moinsVerseRetardMontant: 0,
    moinsVerseRetardAbattement: 0,
    nonVerseMontant: 0,
    nonVerseAbattement: 0,
    regMontant: 0,
    nonRegMontant: 0,
    prelevementTotal: abattement.montantAbattement,
  };

  // "Montant" par catégorie = ce qui a été effectivement encaissé jusqu'ici
  // (cumul des encaissements), à titre informatif — l'abattement, lui, est
  // toujours calculé sur le total des ventes, pas sur ce montant.
  switch (abattement.statut) {
    case "RETARD":
      ligne.retardHeure = formatHeureCourte(abattement.dateCompletion);
      ligne.retardAbattement = abattement.montantAbattement;
      break;
    case "MOINS_VERSE":
      ligne.moinsVerseMontant = abattement.montantEncaisseCumule;
      ligne.moinsVerseAbattement = abattement.montantAbattement;
      break;
    case "MOINS_VERSE_AVEC_RETARD":
      ligne.moinsVerseRetardMontant = abattement.montantEncaisseCumule;
      ligne.moinsVerseRetardAbattement = abattement.montantAbattement;
      break;
    case "NON_VERSE":
      ligne.nonVerseMontant = abattement.montantEncaisseCumule;
      ligne.nonVerseAbattement = abattement.montantAbattement;
      break;
    // AUCUN : la ligne reste à ses valeurs par défaut (0 / "-").
  }

  if (abattement.regularisation === "REG") {
    ligne.regMontant = abattement.montantRegularisation;
  } else if (abattement.regularisation === "NON_REG") {
    ligne.nonRegMontant = abattement.montantRegularisation;
  }

  return ligne;
}

export const abattementExportService = {
  /** Récupère les lignes calculées (ventes + statut + montants), sans pagination, pour l'export. */
  async getExportData(params: AbattementQueryParams): Promise<{
    lignes: LigneAbattementExport[];
    parametres: AbattementParametresValues;
  }> {
    const parametres = await abattementRepository.getParametres();
    const ventes: VenteAvecEncaissements[] =
      await abattementRepository.findAllVentesAvecEncaissements(params);

    const calculerAbattement = (vente: VenteAvecEncaissements) =>
      computeAbattement(
        vente,
        vente.encaissements.map((e) => ({
          montant: e.montant,
          dateEncaissement: e.dateEncaissement,
        })),
        parametres,
      );

    let lignes = ventes.map((vente) =>
      buildLigneExport(vente, calculerAbattement(vente)),
    );

    // Le filtre "statut" ne peut pas être fait en base (c'est une valeur
    // calculée, pas une colonne) : on l'applique ici, après calcul.
    if (params.statut) {
      const ventesAvecStatut = ventes
        .map((vente) => ({ vente, abattement: calculerAbattement(vente) }))
        .filter((x) => x.abattement.statut === params.statut);
      lignes = ventesAvecStatut.map((x) =>
        buildLigneExport(x.vente, x.abattement),
      );
    }

    return { lignes, parametres };
  },

  async buildExportMetadata(
    query: AbattementQueryParams,
    actorId: string,
    nombreLignes: number,
  ): Promise<ExportMetadataAbattement> {
    const [user, parametres] = await Promise.all([
      prisma.user.findUnique({
        where: { id: actorId },
        select: {
          nom: true,
          prenom: true,
          email: true,
          agence: { select: { nom: true } },
        },
      }),
      abattementRepository.getParametres(),
    ]);

    return {
      genererParNom: user
        ? `${user.prenom} ${user.nom}`.trim()
        : "Utilisateur inconnu",
      genererParEmail: user?.email ?? "N/A",
      agenceExportateur: user?.agence?.nom ?? "Toutes agences (accès global)",
      dateGeneration: new Date(),
      reference: crypto.randomUUID().slice(0, 8).toUpperCase(),
      filtresAppliques: decrireFiltres(query),
      nombreLignes,
      parametres,
    };
  },

  async generateCSV(
    params: AbattementQueryParams,
    metadata: ExportMetadataAbattement,
  ): Promise<string> {
    const { lignes, parametres } = await this.getExportData(params);

    const totaux = lignes.reduce(
      (acc, l) => ({
        ventes: acc.ventes + l.ventes,
        paiement: acc.paiement + l.paiement,
        solde: acc.solde + l.soldeAVerser,
        retard: acc.retard + l.retardAbattement,
        moinsVerse: acc.moinsVerse + l.moinsVerseAbattement,
        moinsVerseRetard: acc.moinsVerseRetard + l.moinsVerseRetardAbattement,
        nonVerse: acc.nonVerse + l.nonVerseAbattement,
        reg: acc.reg + l.regMontant,
        nonReg: acc.nonReg + l.nonRegMontant,
        prelevement: acc.prelevement + l.prelevementTotal,
      }),
      {
        ventes: 0,
        paiement: 0,
        solde: 0,
        retard: 0,
        moinsVerse: 0,
        moinsVerseRetard: 0,
        nonVerse: 0,
        reg: 0,
        nonReg: 0,
        prelevement: 0,
      },
    );

    const headers = [
      "Date",
      "Journée",
      "N° OP",
      "Ventes",
      "Paiement",
      "Solde à verser",
      "Retard - Heure",
      `Retard - Abattement (${parametres.tauxRetard}%)`,
      "Moins versé - Montant",
      `Moins versé - Abattement (${parametres.tauxMoinsVerse}%)`,
      "Moins versé avec retard - Montant",
      `Moins versé avec retard - Abattement (${parametres.tauxMoinsVerseAvecRetard}%)`,
      "Non versé - Montant",
      `Non versé - Abattement (${parametres.tauxNonVerse}%)`,
      "Statut - REG (régularisé)",
      "Statut - NON REG (non régularisé)",
      "Prélèvement total",
    ];

    const rows: string[][] = lignes.map((l) => [
      l.date,
      String(l.journee),
      l.numeroOP,
      l.ventes.toString(),
      l.paiement.toString(),
      l.soldeAVerser.toString(),
      l.retardHeure,
      l.retardAbattement.toString(),
      l.moinsVerseMontant.toString(),
      l.moinsVerseAbattement.toString(),
      l.moinsVerseRetardMontant.toString(),
      l.moinsVerseRetardAbattement.toString(),
      l.nonVerseMontant.toString(),
      l.nonVerseAbattement.toString(),
      l.regMontant.toString(),
      l.nonRegMontant.toString(),
      l.prelevementTotal.toString(),
    ]);

    rows.push([
      "",
      "",
      "TOTAL GÉNÉRAL",
      totaux.ventes.toString(),
      totaux.paiement.toString(),
      totaux.solde.toString(),
      "",
      totaux.retard.toString(),
      "",
      totaux.moinsVerse.toString(),
      "",
      totaux.moinsVerseRetard.toString(),
      "",
      totaux.nonVerse.toString(),
      totaux.reg.toString(),
      totaux.nonReg.toString(),
      totaux.prelevement.toString(),
    ]);

    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

    const infoLines: string[] = [
      [`# Export des abattements - Référence ${metadata.reference}`],
      [
        `# Généré par : ${metadata.genererParNom} (${metadata.genererParEmail})`,
      ],
      [`# Agence exportateur : ${metadata.agenceExportateur}`],
      [
        `# Date de génération : ${formatDateHeureCourte(metadata.dateGeneration)}`,
      ],
      [`# Filtres appliqués : ${metadata.filtresAppliques.join(" | ")}`],
      [
        `# Paramètres appliqués : heure limite ${parametres.heureLimiteUTC}h UTC | ` +
          `Retard ${parametres.tauxRetard}% | Moins versé ${parametres.tauxMoinsVerse}% | ` +
          `Moins versé + retard ${parametres.tauxMoinsVerseAvecRetard}% | Non versé ${parametres.tauxNonVerse}%`,
      ],
      [`# Nombre de lignes : ${metadata.nombreLignes}`],
      [
        `# REG = manquant (moins versé ou non versé) finalement régularisé, sans limite de délai. NON REG = manquant toujours non régularisé à ce jour.`,
      ],
      [`# ATTENTION : ce fichier ne doit pas être modifié.`],
      [""],
    ].map((line: string[]) => line.map(escape).join(","));

    const headerLine = headers.map(escape).join(",");
    const dataLines: string[] = rows.map((r: string[]) =>
      r.map(escape).join(","),
    );

    return [...infoLines, headerLine, ...dataLines].join("\n");
  },

  async generateExcel(
    params: AbattementQueryParams,
    metadata: ExportMetadataAbattement,
  ): Promise<Buffer> {
    const { lignes, parametres } = await this.getExportData(params);

    const totaux = lignes.reduce(
      (acc, l) => ({
        ventes: acc.ventes + l.ventes,
        paiement: acc.paiement + l.paiement,
        solde: acc.solde + l.soldeAVerser,
        retard: acc.retard + l.retardAbattement,
        moinsVerse: acc.moinsVerse + l.moinsVerseAbattement,
        moinsVerseRetard: acc.moinsVerseRetard + l.moinsVerseRetardAbattement,
        nonVerse: acc.nonVerse + l.nonVerseAbattement,
        reg: acc.reg + l.regMontant,
        nonReg: acc.nonReg + l.nonRegMontant,
        prelevement: acc.prelevement + l.prelevementTotal,
      }),
      {
        ventes: 0,
        paiement: 0,
        solde: 0,
        retard: 0,
        moinsVerse: 0,
        moinsVerseRetard: 0,
        nonVerse: 0,
        reg: 0,
        nonReg: 0,
        prelevement: 0,
      },
    );

    const data = lignes.map((l) => ({
      Date: l.date,
      Journée: l.journee,
      "N° OP": l.numeroOP,
      Ventes: l.ventes,
      Paiement: l.paiement,
      "Solde à verser": l.soldeAVerser,
      "Retard - Heure": l.retardHeure,
      [`Retard - Abattement (${parametres.tauxRetard}%)`]: l.retardAbattement,
      "Moins versé - Montant": l.moinsVerseMontant,
      [`Moins versé - Abattement (${parametres.tauxMoinsVerse}%)`]:
        l.moinsVerseAbattement,
      "Moins versé avec retard - Montant": l.moinsVerseRetardMontant,
      [`Moins versé avec retard - Abattement (${parametres.tauxMoinsVerseAvecRetard}%)`]:
        l.moinsVerseRetardAbattement,
      "Non versé - Montant": l.nonVerseMontant,
      [`Non versé - Abattement (${parametres.tauxNonVerse}%)`]:
        l.nonVerseAbattement,
      "Statut - REG": l.regMontant,
      "Statut - NON REG": l.nonRegMontant,
      "Prélèvement total": l.prelevementTotal,
    }));

    data.push({
      Date: "",
      Journée: 0,
      "N° OP": "TOTAL GÉNÉRAL",
      Ventes: totaux.ventes,
      Paiement: totaux.paiement,
      "Solde à verser": totaux.solde,
      "Retard - Heure": "",
      [`Retard - Abattement (${parametres.tauxRetard}%)`]: totaux.retard,
      "Moins versé - Montant": 0,
      [`Moins versé - Abattement (${parametres.tauxMoinsVerse}%)`]:
        totaux.moinsVerse,
      "Moins versé avec retard - Montant": 0,
      [`Moins versé avec retard - Abattement (${parametres.tauxMoinsVerseAvecRetard}%)`]:
        totaux.moinsVerseRetard,
      "Non versé - Montant": 0,
      [`Non versé - Abattement (${parametres.tauxNonVerse}%)`]: totaux.nonVerse,
      "Statut - REG": totaux.reg,
      "Statut - NON REG": totaux.nonReg,
      "Prélèvement total": totaux.prelevement,
    } as (typeof data)[number]);

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Abattements");

    const infoRows: Array<[string, string]> = [
      ["Référence export", metadata.reference],
      ["Généré par", `${metadata.genererParNom} (${metadata.genererParEmail})`],
      ["Agence exportateur", metadata.agenceExportateur],
      ["Date de génération", formatDateHeureCourte(metadata.dateGeneration)],
      ["Filtres appliqués", metadata.filtresAppliques.join(" | ")],
      [
        "Paramètres appliqués",
        `Heure limite ${parametres.heureLimiteUTC}h UTC | Retard ${parametres.tauxRetard}% | ` +
          `Moins versé ${parametres.tauxMoinsVerse}% | Moins versé + retard ${parametres.tauxMoinsVerseAvecRetard}% | ` +
          `Non versé ${parametres.tauxNonVerse}%`,
      ],
      ["Nombre de lignes", String(metadata.nombreLignes)],
      [
        "REG / NON REG",
        "REG = manquant finalement régularisé (sans limite de délai). NON REG = manquant toujours non régularisé à ce jour.",
      ],
      ["", ""],
      [
        "ATTENTION",
        "Ce document ne doit pas être modifié. Toute altération de son contenu engage la responsabilité de son auteur et peut faire l'objet de sanctions disciplinaires et/ou de poursuites judiciaires.",
      ],
    ];
    const infoSheet = xlsx.utils.aoa_to_sheet(infoRows);
    xlsx.utils.book_append_sheet(workbook, infoSheet, "Informations");

    return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  },

  async generatePDF(
    params: AbattementQueryParams,
    metadata: ExportMetadataAbattement,
    encryption: PdfEncryptionOptions,
  ): Promise<PDFKit.PDFDocument> {
    const { lignes, parametres } = await this.getExportData(params);
    const printer = createPdfPrinter(pdfFonts);

    const totaux = lignes.reduce(
      (acc, l) => ({
        ventes: acc.ventes + l.ventes,
        paiement: acc.paiement + l.paiement,
        solde: acc.solde + l.soldeAVerser,
        retard: acc.retard + l.retardAbattement,
        moinsVerse: acc.moinsVerse + l.moinsVerseAbattement,
        moinsVerseRetard: acc.moinsVerseRetard + l.moinsVerseRetardAbattement,
        nonVerse: acc.nonVerse + l.nonVerseAbattement,
        reg: acc.reg + l.regMontant,
        nonReg: acc.nonReg + l.nonRegMontant,
        prelevement: acc.prelevement + l.prelevementTotal,
      }),
      {
        ventes: 0,
        paiement: 0,
        solde: 0,
        retard: 0,
        moinsVerse: 0,
        moinsVerseRetard: 0,
        nonVerse: 0,
        reg: 0,
        nonReg: 0,
        prelevement: 0,
      },
    );

    // Couleurs reprises directement du modèle Excel fourni : jaune (Retards),
    // bleu (Moins versés), vert (Moins versés avec retard), orange (Non versé),
    // gris (Statut MV-NV, "partie grise" du tableau).
    const COULEUR_RETARDS = "#FCE9A4";
    const COULEUR_MOINS_VERSE = "#B7D9EA";
    const COULEUR_MOINS_VERSE_RETARD = "#C6E0B4";
    const COULEUR_NON_VERSE = "#F4C7A1";
    const COULEUR_STATUT_MVNV = "#D9D9D9";
    const COULEUR_ENTETE_SIMPLE = "#F2F2F2";

    // En-tête à deux lignes : 6 colonnes simples + 4 groupes colorés (2
    // sous-colonnes chacun) + 1 groupe gris (REG/NON REG) + 1 colonne simple
    // (Prélèvement total) = 6 + 8 + 2 + 1 = 17 colonnes.
    const headerRow1: TableCell[] = [
      { text: "DATE", style: "simpleHeader", alignment: "center", rowSpan: 2 },
      {
        text: "JOURNEE",
        style: "simpleHeader",
        alignment: "center",
        rowSpan: 2,
      },
      { text: "N° OP", style: "simpleHeader", alignment: "center", rowSpan: 2 },
      {
        text: "VENTES",
        style: "simpleHeader",
        alignment: "center",
        rowSpan: 2,
      },
      {
        text: "PAIEMENT",
        style: "simpleHeader",
        alignment: "center",
        rowSpan: 2,
      },
      {
        text: "SOLDE A VERSER",
        style: "simpleHeader",
        alignment: "center",
        rowSpan: 2,
      },
      {
        text: "Retards",
        style: "groupHeaderRetards",
        alignment: "center",
        colSpan: 2,
      },
      {},
      {
        text: "Moins versés",
        style: "groupHeaderMoinsVerse",
        alignment: "center",
        colSpan: 2,
      },
      {},
      {
        text: "Moins versés avec retard",
        style: "groupHeaderMoinsVerseRetard",
        alignment: "center",
        colSpan: 2,
      },
      {},
      {
        text: "Non versé",
        style: "groupHeaderNonVerse",
        alignment: "center",
        colSpan: 2,
      },
      {},
      {
        text: "Statut (MV-NV)",
        style: "groupHeaderStatutMvNv",
        alignment: "center",
        colSpan: 2,
      },
      {},
      {
        text: "PRELEVEMENT",
        style: "simpleHeader",
        alignment: "center",
        rowSpan: 2,
      },
    ];

    const headerRow2: TableCell[] = [
      {},
      {},
      {},
      {},
      {},
      {},
      { text: "Heure", style: "groupHeaderRetards", alignment: "center" },
      {
        text: `Ab ${parametres.tauxRetard}%`,
        style: "groupHeaderRetards",
        alignment: "center",
      },
      { text: "Montant", style: "groupHeaderMoinsVerse", alignment: "center" },
      {
        text: `Ab ${parametres.tauxMoinsVerse}%`,
        style: "groupHeaderMoinsVerse",
        alignment: "center",
      },
      {
        text: "Montant",
        style: "groupHeaderMoinsVerseRetard",
        alignment: "center",
      },
      {
        text: `Ab ${parametres.tauxMoinsVerseAvecRetard}%`,
        style: "groupHeaderMoinsVerseRetard",
        alignment: "center",
      },
      { text: "Montant", style: "groupHeaderNonVerse", alignment: "center" },
      {
        text: `Ab ${parametres.tauxNonVerse}%`,
        style: "groupHeaderNonVerse",
        alignment: "center",
      },
      { text: "REG", style: "groupHeaderStatutMvNv", alignment: "center" },
      { text: "NON REG", style: "groupHeaderStatutMvNv", alignment: "center" },
      {},
    ];

    const tableBody: TableCell[][] = [headerRow1, headerRow2];

    lignes.forEach((l) => {
      tableBody.push([
        { text: l.date, alignment: "center" },
        { text: String(l.journee), alignment: "center" },
        { text: l.numeroOP, alignment: "center" },
        { text: formatCurrency(l.ventes), alignment: "right" },
        { text: formatCurrency(l.paiement), alignment: "right" },
        { text: formatCurrency(l.soldeAVerser), alignment: "right" },
        {
          text: l.retardHeure === "-" ? "" : l.retardHeure,
          alignment: "center",
        },
        {
          text: l.retardAbattement ? formatCurrency(l.retardAbattement) : "0",
          alignment: "right",
        },
        {
          text: l.moinsVerseMontant ? formatCurrency(l.moinsVerseMontant) : "0",
          alignment: "right",
        },
        {
          text: l.moinsVerseAbattement
            ? formatCurrency(l.moinsVerseAbattement)
            : "0",
          alignment: "right",
        },
        {
          text: l.moinsVerseRetardMontant
            ? formatCurrency(l.moinsVerseRetardMontant)
            : "0",
          alignment: "right",
        },
        {
          text: l.moinsVerseRetardAbattement
            ? formatCurrency(l.moinsVerseRetardAbattement)
            : "0",
          alignment: "right",
        },
        {
          text: l.nonVerseMontant ? formatCurrency(l.nonVerseMontant) : "0",
          alignment: "right",
        },
        {
          text: l.nonVerseAbattement
            ? formatCurrency(l.nonVerseAbattement)
            : "0",
          alignment: "right",
        },
        {
          text: l.regMontant ? formatCurrency(l.regMontant) : "",
          alignment: "right",
        },
        {
          text: l.nonRegMontant ? formatCurrency(l.nonRegMontant) : "",
          alignment: "right",
        },
        {
          text: l.prelevementTotal ? formatCurrency(l.prelevementTotal) : "0",
          alignment: "right",
        },
      ]);
    });

    // Ligne TOTAL : le libellé fusionne les 6 premières colonnes, puis
    // chaque colonne "somme" affiche son total (Heure/Montant restent vides).
    tableBody.push([
      { text: "TOTAL", colSpan: 6, style: "tableTotal", alignment: "center" },
      {},
      {},
      {},
      {},
      {},
      { text: "", style: "tableTotal" },
      {
        text: formatCurrency(totaux.retard),
        style: "tableTotal",
        alignment: "right",
      },
      { text: "", style: "tableTotal" },
      {
        text: formatCurrency(totaux.moinsVerse),
        style: "tableTotal",
        alignment: "right",
      },
      { text: "", style: "tableTotal" },
      {
        text: formatCurrency(totaux.moinsVerseRetard),
        style: "tableTotal",
        alignment: "right",
      },
      { text: "", style: "tableTotal" },
      {
        text: formatCurrency(totaux.nonVerse),
        style: "tableTotal",
        alignment: "right",
      },
      {
        text: formatCurrency(totaux.reg),
        style: "tableTotal",
        alignment: "right",
      },
      {
        text: formatCurrency(totaux.nonReg),
        style: "tableTotal",
        alignment: "right",
      },
      {
        text: formatCurrency(totaux.prelevement),
        style: "tableTotal",
        alignment: "right",
      },
    ]);

    const infoBlock: Content = {
      margin: [0, 0, 0, 10],
      table: {
        widths: ["*", "*"],
        body: [
          [
            { text: `Référence export : ${metadata.reference}`, style: "infoText" },
            { text: `Nombre de lignes : ${metadata.nombreLignes}`, style: "infoText" },
          ],
          [
            { text: `Généré par : ${metadata.genererParNom} (${metadata.genererParEmail})`, style: "infoText" },
            { text: `Agence exportateur : ${metadata.agenceExportateur}`, style: "infoText" },
          ],
          [
            { text: `Date de génération : ${formatDateHeureCourte(metadata.dateGeneration)}`, style: "infoText" },
            { text: `Filtres appliqués : ${metadata.filtresAppliques.join(" | ")}`, style: "infoText" },
          ],
          [
            {
              text:
                `Paramètres : heure limite ${parametres.heureLimiteUTC}h UTC · Retard ${parametres.tauxRetard}% · ` +
                `Moins versé ${parametres.tauxMoinsVerse}% · Moins versé + retard ${parametres.tauxMoinsVerseAvecRetard}% · ` +
                `Non versé ${parametres.tauxNonVerse}%`,
              style: "infoText",
              colSpan: 2,
            },
            {},
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 8,
        paddingTop: () => 2,
        paddingBottom: () => 2,
      },
    };

    // Légende des couleurs, reprise du modèle (bloc NOTICE).
    const legende: Content = {
      margin: [0, 14, 0, 0],
      stack: [
        { text: "NOTICE :", style: "legendeTitre" },
        {
          margin: [0, 4, 0, 2],
          columns: [
            {
              width: 14,
              canvas: [
                {
                  type: "rect",
                  x: 0,
                  y: 0,
                  w: 14,
                  h: 10,
                  color: COULEUR_RETARDS,
                },
              ],
            },
            {
              width: "*",
              text: "En cas de retard de versement (paiement intégral, après l'heure limite), l'abattement correspondant est calculé automatiquement.",
              style: "legendeTexte",
              margin: [6, 0, 0, 0],
            },
          ],
        },
        {
          margin: [0, 2, 0, 2],
          columns: [
            {
              width: 14,
              canvas: [
                {
                  type: "rect",
                  x: 0,
                  y: 0,
                  w: 14,
                  h: 10,
                  color: COULEUR_MOINS_VERSE,
                },
              ],
            },
            {
              width: "*",
              text: "En cas de moins versé, l'abattement correspondant est calculé automatiquement.",
              style: "legendeTexte",
              margin: [6, 0, 0, 0],
            },
          ],
        },
        {
          margin: [0, 2, 0, 2],
          columns: [
            {
              width: 14,
              canvas: [
                {
                  type: "rect",
                  x: 0,
                  y: 0,
                  w: 14,
                  h: 10,
                  color: COULEUR_MOINS_VERSE_RETARD,
                },
              ],
            },
            {
              width: "*",
              text: "En cas de moins versé avec retard, l'abattement correspondant est calculé automatiquement.",
              style: "legendeTexte",
              margin: [6, 0, 0, 0],
            },
          ],
        },
        {
          margin: [0, 2, 0, 2],
          columns: [
            {
              width: 14,
              canvas: [
                {
                  type: "rect",
                  x: 0,
                  y: 0,
                  w: 14,
                  h: 10,
                  color: COULEUR_NON_VERSE,
                },
              ],
            },
            {
              width: "*",
              text: "En cas de non versé, l'abattement est calculé sur le total des ventes de la journée.",
              style: "legendeTexte",
              margin: [6, 0, 0, 0],
            },
          ],
        },
        {
          margin: [0, 6, 0, 0],
          text: "REG = moins versé ou non versé RÉGULARISÉ (le manquant a fini par être comblé, sans limite de délai). NON REG = moins versé ET non versé NON régularisé à ce jour.",
          style: "legendeTexte",
        },
      ],
    };

    const avertissement: Content = {
      margin: [0, 14, 0, 12],
      table: {
        widths: ["*"],
        body: [
          [
            {
              text: "⚠ CE DOCUMENT NE DOIT PAS ÊTRE MODIFIÉ. Toute altération, falsification ou modification non autorisée de son contenu engage la responsabilité de son auteur et peut faire l'objet de sanctions disciplinaires et/ou de poursuites judiciaires conformément à la réglementation en vigueur.",
              style: "avertissement",
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => COULEUR_AVERTISSEMENT,
        vLineColor: () => COULEUR_AVERTISSEMENT,
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
    };

    const docDefinition: TDocumentDefinitions & PdfEncryptionOptions = {
      userPassword: encryption.userPassword,
      ownerPassword: encryption.ownerPassword,
      permissions: encryption.permissions,
      version: encryption.version ?? "1.7ext3",
      pageOrientation: "landscape",
      pageSize: "A4",
      pageMargins: [30, 90, 30, 60],
      header: (currentPage: number, pageCount: number) => ({
        margin: [40, 24, 40, 0],
        columns: [
          {
            width: "*",
            stack: [
              { text: "Loterie Nationale Togolaise", style: "brandName" },
              {
                text: "Tableau Récapitulatif des Abattements",
                style: "brandSubtitle",
              },
            ],
          },
          {
            width: "auto",
            text: `Page ${currentPage} / ${pageCount}`,
            style: "pageIndicator",
          },
        ],
      }),
      footer: (currentPage: number, pageCount: number) => ({
        margin: [40, 8, 40, 20],
        stack: [
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 0,
                x2: 782,
                y2: 0,
                lineWidth: 0.75,
                lineColor: COULEUR_SECONDAIRE,
              },
            ],
          },
          {
            margin: [0, 6, 0, 0],
            columns: [
              {
                width: "*",
                text: `Document confidentiel - Réf. ${metadata.reference} - © ${new Date().getFullYear()} Loterie Nationale Togolaise`,
                style: "footerText",
              },
              {
                width: "auto",
                text: `Page ${currentPage}/${pageCount}`,
                style: "footerText",
              },
            ],
          },
        ],
      }),
      content: [
        {
          text: "TABLEAU RECAPITULATIF DES ABATTEMENTS",
          style: "header",
          alignment: "center",
        },
        {
          text: `Généré le ${formatDateHeureCourte(metadata.dateGeneration)}`,
          style: "subheader",
          alignment: "center",
        },
        infoBlock,
        {
          style: "tableExample",
          table: {
            headerRows: 2,
            dontBreakRows: true,
            widths: [
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
            ],
            body: tableBody,
          },
          // Grille complète noire fine, façon Excel.
          layout: {
            hLineWidth: () => 0.75,
            vLineWidth: () => 0.75,
            hLineColor: () => "#000000",
            vLineColor: () => "#000000",
          },
        },
        legende,
        avertissement,
      ],
      styles: {
        header: { fontSize: 14, bold: true, margin: [0, 0, 0, 2] },
        subheader: {
          fontSize: 8,
          italics: true,
          margin: [0, 0, 0, 10],
          color: "#555555",
        },
        infoText: { fontSize: 8, color: "#333333" },
        avertissement: {
          fontSize: 8,
          bold: true,
          color: COULEUR_AVERTISSEMENT,
        },
        brandName: { fontSize: 11, bold: true, color: "#00843D" },
        brandSubtitle: { fontSize: 9, color: COULEUR_SECONDAIRE },
        pageIndicator: { fontSize: 8, color: "#555555" },
        footerText: { fontSize: 7, color: "#777777" },
        simpleHeader: {
          bold: true,
          fontSize: 6.5,
          color: "#000000",
          fillColor: COULEUR_ENTETE_SIMPLE,
        },
        groupHeaderRetards: {
          bold: true,
          fontSize: 6.5,
          color: "#000000",
          fillColor: COULEUR_RETARDS,
        },
        groupHeaderMoinsVerse: {
          bold: true,
          fontSize: 6.5,
          color: "#000000",
          fillColor: COULEUR_MOINS_VERSE,
        },
        groupHeaderMoinsVerseRetard: {
          bold: true,
          fontSize: 6.5,
          color: "#000000",
          fillColor: COULEUR_MOINS_VERSE_RETARD,
        },
        groupHeaderNonVerse: {
          bold: true,
          fontSize: 6.5,
          color: "#000000",
          fillColor: COULEUR_NON_VERSE,
        },
        groupHeaderStatutMvNv: {
          bold: true,
          fontSize: 6.5,
          color: "#000000",
          fillColor: COULEUR_STATUT_MVNV,
        },
        tableTotal: {
          bold: true,
          fontSize: 6.5,
          fillColor: COULEUR_FOND_TOTAL,
        },
        tableExample: { margin: [0, 5, 0, 0] },
        legendeTitre: { fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
        legendeTexte: { fontSize: 7, color: "#333333" },
      },
      defaultStyle: { fontSize: 6.5 },
    };

    return printer.createPdfKitDocument(docDefinition);
  },
};
