import * as xlsx from "xlsx";
import type { TDocumentDefinitions } from "pdfmake/interfaces.js";
import { prisma } from "../../config/prisma.js";
import type { Prisma } from "@prisma/client";
import type { VenteQueryParams } from "./vente.interface.js";

import { createRequire } from "node:module";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);

/**
 * Extrait la vraie classe/fonction en dépilant les couches `.default` de l'import ESM/CJS
 */
function unwrap<T = any>(moduleImport: any): T {
  if (
    moduleImport &&
    typeof moduleImport === "object" &&
    moduleImport.default
  ) {
    return unwrap(moduleImport.default);
  }
  return moduleImport;
}

// Chargement sécurisé des modules internes de pdfmake
const PdfPrinterClass = unwrap(require("pdfmake/src/printer"));

let VirtualFSClass: any = null;
try {
  VirtualFSClass = unwrap(require("pdfmake/src/virtual-fs"));
} catch {
  VirtualFSClass = null;
}

let URLResolverClass: any = null;
try {
  URLResolverClass = unwrap(require("pdfmake/src/urlResolver"));
} catch {
  URLResolverClass = null;
}

/**
 * Instancie proprement PdfPrinter avec vfs et urlResolver résolus
 */
function createPdfPrinter(fonts: any): any {
  const vfs =
    typeof VirtualFSClass === "function" ? new VirtualFSClass() : null;

  let urlResolver: any = null;
  if (typeof URLResolverClass === "function") {
    urlResolver = new URLResolverClass(vfs);
  } else {
    urlResolver = {
      resolve: async (url: string) => url,
    };
  }

  const printer = new PdfPrinterClass(fonts, vfs, urlResolver);

  if (
    !printer.urlResolver ||
    typeof printer.urlResolver.resolve !== "function"
  ) {
    printer.urlResolver = urlResolver;
  }

  return printer;
}

// Résolution absolue des chemins ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recherche des fichiers de polices .ttf
 */
function resolveFontPath(fontFilename: string): string {
  const candidates = [
    path.resolve(__dirname, "../../assets/fonts", fontFilename),
    path.resolve(process.cwd(), "src/assets/fonts", fontFilename),
    path.resolve(
      process.cwd(),
      "node_modules/roboto-font/fonts/Roboto",
      fontFilename,
    ),
  ];

  for (const fontPath of candidates) {
    if (fs.existsSync(fontPath)) {
      return fontPath;
    }
  }
  return candidates[0];
}

const pdfFonts = {
  Roboto: {
    normal: resolveFontPath("Roboto-Regular.ttf"),
    bold: resolveFontPath("Roboto-Bold.ttf"),
    italics: resolveFontPath("Roboto-Italic.ttf"),
  },
};

/**
 * Nettoie les espaces insécables (\u00A0 et \u202F) pour éviter les petits rectangles carrés dans le PDF
 */
function formatCurrency(amount: number | Prisma.Decimal | string): string {
  const num = Number(amount) || 0;
  return num.toLocaleString("fr-FR").replace(/[\u00A0\u202F]/g, " ") + " FCFA";
}

/**
 * Formate une date ISO en date courte française (ex: 21/03/2024)
 */
function formatDateCourte(dateInput?: Date | string): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("fr-FR");
}

export const venteExportService = {
  /**
   * Interroge la base de données Prisma avec filtres.
   */
  async getExportData(params: VenteQueryParams) {
    const {
      search,
      agenceId,
      dateDebut,
      dateFin,
      sortBy = "dateDebut",
      sortOrder = "desc",
    } = params;

    const where: Prisma.VenteWhereInput = {};

    if (search) {
      where.OR = [
        { kiosque: { contains: search, mode: "insensitive" } },
        { agent: { contains: search, mode: "insensitive" } },
        { numeroTS10: { contains: search, mode: "insensitive" } },
      ];
    }

    if (agenceId) where.agenceId = agenceId;
    if (dateDebut || dateFin) {
      where.dateDebut = {};
      if (dateDebut) where.dateDebut.gte = new Date(dateDebut);
      if (dateFin) where.dateDebut.lte = new Date(dateFin);
    }

    return prisma.vente.findMany({
      where,
      include: { agence: { select: { nom: true, code: true } } },
      orderBy: { [sortBy]: sortOrder },
    });
  },

  /**
   * Génère un fichier CSV avec totaux
   */
  async generateCSV(params: VenteQueryParams): Promise<string> {
    const ventes = await this.getExportData(params);

    const totalVentes = ventes.reduce(
      (sum, v) => sum + Number(v.totalVente),
      0,
    );
    const totalPayes = ventes.reduce((sum, v) => sum + Number(v.totalPaye), 0);
    const totalSoldes = ventes.reduce(
      (sum, v) => sum + Number(v.totalSolde),
      0,
    );

    const headers = [
      "Agence",
      "Kiosque",
      "Agent",
      "Banque",
      "N° TS10",
      "Total Ventes",
      "Total Payes",
      "Total Solde",
      "Date Debut",
      "Date Fin",
    ];

    const rows = ventes.map((v) => [
      v.agence?.nom || v.agenceNom || "",
      v.kiosque,
      v.agent,
      v.banque || "",
      v.numeroTS10,
      v.totalVente.toString(),
      v.totalPaye.toString(),
      v.totalSolde.toString(),
      v.dateDebut.toISOString(),
      v.dateFin.toISOString(),
    ]);

    rows.push([
      "TOTAL GÉNÉRAL",
      "",
      "",
      "",
      "",
      totalVentes.toString(),
      totalPayes.toString(),
      totalSoldes.toString(),
      "",
      "",
    ]);

    return [headers, ...rows]
      .map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))
      .join("\n");
  },

  /**
   * Génère un fichier Excel (.xlsx) avec totaux
   */
  async generateExcel(params: VenteQueryParams): Promise<Buffer> {
    const ventes = await this.getExportData(params);

    const totalVentes = ventes.reduce(
      (sum, v) => sum + Number(v.totalVente),
      0,
    );
    const totalPayes = ventes.reduce((sum, v) => sum + Number(v.totalPaye), 0);
    const totalSoldes = ventes.reduce(
      (sum, v) => sum + Number(v.totalSolde),
      0,
    );

    const data: any[] = ventes.map((v) => ({
      Agence: v.agence?.nom || v.agenceNom || "",
      Kiosque: v.kiosque,
      "Nom Agent": v.agent,
      Banque: v.banque || "",
      "N° TS10": v.numeroTS10,
      "Total Ventes": Number(v.totalVente),
      "Total Payés": Number(v.totalPaye),
      "Total Solde": Number(v.totalSolde),
      "Date Début": v.dateDebut,
      "Date Fin": v.dateFin,
    }));

    data.push({
      Agence: "TOTAL GÉNÉRAL",
      Kiosque: "",
      "Nom Agent": "",
      Banque: "",
      "N° TS10": "",
      "Total Ventes": totalVentes,
      "Total Payés": totalPayes,
      "Total Solde": totalSoldes,
      "Date Début": "",
      "Date Fin": "",
    });

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Ventes");

    return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  },

  /**
   * Génère un document PDF complet en mode Paysage (10 colonnes)
   */
  async generatePDF(params: VenteQueryParams): Promise<PDFKit.PDFDocument> {
    const ventes = await this.getExportData(params);
    const printer = createPdfPrinter(pdfFonts);

    const totalVenteGen = ventes.reduce(
      (sum, v) => sum + Number(v.totalVente),
      0,
    );
    const totalPayeGen = ventes.reduce(
      (sum, v) => sum + Number(v.totalPaye),
      0,
    );
    const totalSoldeGen = ventes.reduce(
      (sum, v) => sum + Number(v.totalSolde),
      0,
    );

    // Construction de l'en-tête du tableau (10 colonnes)
    const tableBody: any[][] = [
      [
        { text: "Agence", style: "tableHeader" },
        { text: "Kiosque", style: "tableHeader" },
        { text: "Agent", style: "tableHeader" },
        { text: "Banque", style: "tableHeader" },
        { text: "N° TS10", style: "tableHeader" },
        { text: "Ventes", style: "tableHeader", alignment: "right" },
        { text: "Payés", style: "tableHeader", alignment: "right" },
        { text: "Solde", style: "tableHeader", alignment: "right" },
        { text: "Début", style: "tableHeader", alignment: "center" },
        { text: "Fin", style: "tableHeader", alignment: "center" },
      ],
    ];

    // Remise des lignes complètes
    ventes.forEach((v) => {
      tableBody.push([
        v.agence?.nom || v.agenceNom || "",
        v.kiosque,
        v.agent,
        v.banque || "-",
        v.numeroTS10,
        { text: formatCurrency(v.totalVente), alignment: "right" },
        { text: formatCurrency(v.totalPaye), alignment: "right" },
        { text: formatCurrency(v.totalSolde), alignment: "right" },
        { text: formatDateCourte(v.dateDebut), alignment: "center" },
        { text: formatDateCourte(v.dateFin), alignment: "center" },
      ]);
    });

    // Ligne de total général sur les 10 colonnes (fusion des 5 premières colonnes)
    tableBody.push([
      {
        text: "TOTAL GÉNÉRAL",
        colSpan: 5,
        style: "tableTotal",
        alignment: "right",
      },
      {},
      {},
      {},
      {},
      {
        text: formatCurrency(totalVenteGen),
        style: "tableTotal",
        alignment: "right",
      },
      {
        text: formatCurrency(totalPayeGen),
        style: "tableTotal",
        alignment: "right",
      },
      {
        text: formatCurrency(totalSoldeGen),
        style: "tableTotal",
        alignment: "right",
      },
      { text: "", style: "tableTotal" },
      { text: "", style: "tableTotal" },
    ]);

    const docDefinition: TDocumentDefinitions = {
      // ⚠️ Format paysage obligatoire pour 10 colonnes !
      pageOrientation: "landscape",
      pageSize: "A4",
      content: [
        { text: "Rapport des Ventes Détaillé", style: "header" },
        {
          text: `Généré le : ${new Date().toLocaleDateString("fr-FR")} | Total lignes : ${ventes.length}`,
          style: "subheader",
        },
        {
          style: "tableExample",
          table: {
            headerRows: 1,
            dontBreakRows: true,
            // Répartition optimisée de la largeur pour le format horizontal (A4 Landscape ~ 842pt de large)
            widths: [
              "auto",
              "auto",
              "*",
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
          layout: "lightHorizontalLines",
        },
      ],
      styles: {
        header: { fontSize: 16, bold: true, margin: [0, 0, 0, 8] },
        subheader: { fontSize: 9, italics: true, margin: [0, 0, 0, 15] },
        tableHeader: {
          bold: true,
          fontSize: 8,
          color: "black",
          fillColor: "#f0f0f0",
        },
        tableTotal: { bold: true, fontSize: 8, fillColor: "#e6f2ff" },
        tableExample: { margin: [0, 5, 0, 15] },
      },
      defaultStyle: { fontSize: 8 },
    };

    return printer.createPdfKitDocument(docDefinition);
  },
};
