import * as xlsx from "xlsx";
import type {
  Content,
  TDocumentDefinitions,
  TableCell,
} from "pdfmake/interfaces.js";

type PdfBackground = TDocumentDefinitions["background"];
import { prisma } from "../../config/prisma.js";
import type { Prisma } from "@prisma/client";
import type { VenteQueryParams } from "./vente.interface.js";

import { createRequire } from "node:module";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);

type ModuleWithDefault<T> = T | { default: T | { default: T } };
type VenteExportData = Prisma.VenteGetPayload<{
  include: { agence: { select: { nom: true; code: true } } };
}>;

function unwrap<T>(moduleImport: unknown): T {
  if (
    moduleImport &&
    typeof moduleImport === "object" &&
    "default" in moduleImport &&
    moduleImport.default
  ) {
    return unwrap<T>(moduleImport.default);
  }
  return moduleImport as T;
}

/**
 * Options de chiffrement PDF. IMPORTANT (comportement réel de pdfmake, vérifié
 * dans sa documentation officielle) : ces champs doivent être placés directement
 * sur l'objet `docDefinition` passé à `createPdfKitDocument`, PAS dans un second
 * paramètre "options" — celui-ci ne sert qu'à des réglages sans rapport
 * (fontLayoutCache, tableLayouts, bufferPages...) et pdfmake l'ignore
 * silencieusement pour tout ce qui concerne le chiffrement. `version`
 * détermine la méthode de chiffrement utilisée (ex: "1.7ext3" => AES-256).
 */
export interface PdfEncryptionOptions {
  userPassword?: string;
  ownerPassword?: string;
  version?: "1.3" | "1.4" | "1.5" | "1.6" | "1.7" | "1.7ext3";
  permissions?: {
    printing?: "lowResolution" | "highResolution";
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
    fillingForms?: boolean;
    contentAccessibility?: boolean;
    documentAssembly?: boolean;
  };
}

interface PdfPrinterInstance {
  createPdfKitDocument(docDefinition: TDocumentDefinitions): PDFKit.PDFDocument;
  urlResolver?: {
    resolve: (url: string) => Promise<string>;
  };
}

type PdfPrinterConstructor = new (
  fonts: FontDescriptors,
  vfs?: unknown,
  urlResolver?: unknown,
) => PdfPrinterInstance;

const PdfPrinterClass = unwrap<PdfPrinterConstructor>(
  require("pdfmake/js/Printer"),
);

let VirtualFSClass: (new () => unknown) | null = null;
try {
  VirtualFSClass = unwrap<new () => unknown>(require("pdfmake/js/virtual-fs"));
} catch {
  VirtualFSClass = null;
}

let URLResolverClass: (new (vfs?: unknown) => unknown) | null = null;
try {
  URLResolverClass = unwrap<new (vfs?: unknown) => unknown>(
    require("pdfmake/js/URLResolver"),
  );
} catch {
  URLResolverClass = null;
}

interface FontDescriptors {
  [fontName: string]: {
    normal: string;
    bold?: string;
    italics?: string;
    bolditalics?: string;
  };
}

/**
 * Instancie proprement PdfPrinter avec vfs et urlResolver résolus
 */
function createPdfPrinter(fonts: FontDescriptors): PdfPrinterInstance {
  const vfs =
    typeof VirtualFSClass === "function" ? new VirtualFSClass() : null;

  let urlResolver: { resolve: (url: string) => Promise<string> };
  if (typeof URLResolverClass === "function") {
    urlResolver = new URLResolverClass(vfs) as {
      resolve: (url: string) => Promise<string>;
    };
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function resolveAssetPath(relativeFromSrc: string): string | null {
  const candidates = [
    path.resolve(__dirname, "../../assets", relativeFromSrc),
    path.resolve(process.cwd(), "src/assets", relativeFromSrc),
  ];

  for (const assetPath of candidates) {
    if (fs.existsSync(assetPath)) {
      return assetPath;
    }
  }
  return null;
}

/** Charge le logo en data URL base64 pour l'utiliser comme filigrane pdfmake. Retourne null si introuvable. */
function loadWatermarkLogoDataUrl(): string | null {
  const logoPath = resolveAssetPath("images/logo-lonato.png");
  if (!logoPath) return null;
  const buffer = fs.readFileSync(logoPath);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

const pdfFonts: FontDescriptors = {
  Roboto: {
    normal: resolveFontPath("Roboto-Regular.ttf"),
    bold: resolveFontPath("Roboto-Bold.ttf"),
    italics: resolveFontPath("Roboto-Italic.ttf"),
  },
};

// Charte graphique de l'export (Pantone Lonato)
const COULEUR_PRIMAIRE = "#00843D";
const COULEUR_SECONDAIRE = "#20603D";
const COULEUR_AVERTISSEMENT = "#C0392B";
const COULEUR_FOND_TOTAL = "#D9ECE0";

function formatCurrency(amount: number | Prisma.Decimal | string): string {
  const num = Number(amount) || 0;
  return num.toLocaleString("fr-FR").replace(/[\u00A0\u202F]/g, " ") + " FCFA";
}

function formatDateCourte(dateInput?: Date | string): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("fr-FR");
}

function formatDateHeureCourte(dateInput: Date): string {
  return dateInput.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface VenteExcelRow {
  "Journée (jour de l'année)": number;
  Agence: string;
  Kiosque: string;
  "Nom Agent": string;
  Banque: string;
  "N° TS10": string;
  "Total Ventes": number;
  "Total Payés": number;
  "Total Solde": number;
  "Date Début": Date | string;
  "Date Fin": Date | string;
  Mois: number;
  Année: number;
}

/** Informations contextuelles jointes à chaque export pour qu'il soit auto-descriptif. */
export interface ExportMetadata {
  genererParNom: string;
  genererParEmail: string;
  agenceExportateur: string;
  dateGeneration: Date;
  reference: string;
  filtresAppliques: string[];
  nombreLignes: number;
}

function decrireFiltres(query: VenteQueryParams): string[] {
  const filtres: string[] = [];
  if (query.search) filtres.push(`Recherche : "${query.search}"`);
  if (query.agenceId) filtres.push(`Agence (ID) : ${query.agenceId}`);
  if (query.agenceNom) filtres.push(`Agence : ${query.agenceNom}`);
  if (query.dateDebut)
    filtres.push(`À partir du : ${formatDateCourte(query.dateDebut)}`);
  if (query.dateFin)
    filtres.push(`Jusqu'au : ${formatDateCourte(query.dateFin)}`);
  if (query.jour) filtres.push(`Journée (jour de l'année) : ${query.jour}`);
  if (query.mois) filtres.push(`Mois : ${query.mois}`);
  if (query.annee) filtres.push(`Année : ${query.annee}`);
  if (query.clotureId) filtres.push(`Clôture (ID) : ${query.clotureId}`);
  if (query.nonClotureesOnly) filtres.push("Ventes non clôturées uniquement");
  if (filtres.length === 0)
    filtres.push("Aucun filtre appliqué (ensemble des ventes)");
  return filtres;
}

export const venteExportService = {
  async getExportData(params: VenteQueryParams) {
    const {
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
    if (clotureId) where.clotureId = clotureId;
    if (nonClotureesOnly) where.clotureId = null;
    if (jour) where.jourAnnee = jour;
    if (mois) where.mois = mois;
    if (annee) where.annee = annee;

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
   * Construit les informations d'en-tête permettant d'identifier l'export
   * (qui l'a généré, depuis quelle agence, avec quels filtres) sans avoir à
   * ouvrir/lire le corps du document.
   */
  async buildExportMetadata(
    query: VenteQueryParams,
    actorId: string,
    nombreLignes: number,
  ): Promise<ExportMetadata> {
    const user = await prisma.user.findUnique({
      where: { id: actorId },
      select: {
        nom: true,
        prenom: true,
        email: true,
        agence: { select: { nom: true } },
      },
    });

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
    };
  },

  async generateCSV(
    params: VenteQueryParams,
    metadata: ExportMetadata,
  ): Promise<string> {
    const ventes = await this.getExportData(params);

    const totalVentes = ventes.reduce(
      (sum: number, v: VenteExportData) => sum + Number(v.totalVente),
      0,
    );
    const totalPayes = ventes.reduce(
      (sum: number, v: VenteExportData) => sum + Number(v.totalPaye),
      0,
    );
    const totalSoldes = ventes.reduce(
      (sum: number, v: VenteExportData) => sum + Number(v.totalSolde),
      0,
    );

    const headers = [
      "Journee (jour de l'annee)",
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
      "Mois",
      "Annee",
    ];

    const rows: string[][] = ventes.map((v: VenteExportData) => [
      v.jourAnnee.toString(),
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
      v.mois.toString(),
      v.annee.toString(),
    ]);

    rows.push([
      "",
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
      "",
      "",
    ]);

    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

    // Bloc d'informations en tête de fichier : rend le fichier auto-descriptif
    // sans avoir à en lire le corps. Le CSV ne peut pas être chiffré individuellement
    // (contrairement au PDF et à l'Excel) : seule l'archive zip qui le contient l'est.
    const infoLines: string[] = [
      [`# Export des ventes - Référence ${metadata.reference}`],
      [
        `# Généré par : ${metadata.genererParNom} (${metadata.genererParEmail})`,
      ],
      [`# Agence exportateur : ${metadata.agenceExportateur}`],
      [
        `# Date de génération : ${formatDateHeureCourte(metadata.dateGeneration)}`,
      ],
      [`# Filtres appliqués : ${metadata.filtresAppliques.join(" | ")}`],
      [`# Nombre de lignes : ${metadata.nombreLignes}`],
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
    params: VenteQueryParams,
    metadata: ExportMetadata,
  ): Promise<Buffer> {
    const ventes = await this.getExportData(params);

    const totalVentes = ventes.reduce(
      (sum: number, v: VenteExportData) => sum + Number(v.totalVente),
      0,
    );
    const totalPayes = ventes.reduce(
      (sum: number, v: VenteExportData) => sum + Number(v.totalPaye),
      0,
    );
    const totalSoldes = ventes.reduce(
      (sum: number, v: VenteExportData) => sum + Number(v.totalSolde),
      0,
    );

    const data: VenteExcelRow[] = ventes.map((v: VenteExportData) => ({
      "Journée (jour de l'année)": v.jourAnnee,
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
      Mois: v.mois,
      Année: v.annee,
    }));

    data.push({
      "Journée (jour de l'année)": 0,
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
      Mois: 0,
      Année: 0,
    });

    const workbook = xlsx.utils.book_new();

    // La feuille "Ventes" (les données) doit être la première / active, sinon
    // certains lecteurs (Excel, LibreOffice) ouvrent le fichier sur la feuille
    // insérée en premier - qui donnerait l'impression d'un fichier vide si
    // c'était la feuille d'informations. On l'ajoute donc en premier, puis on
    // épingle explicitement l'onglet actif par sécurité.
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Ventes");

    // Feuille d'informations : rend le fichier auto-descriptif sans avoir à
    // relire le corps de la feuille "Ventes". La coloration/mise en forme des
    // cellules n'est pas disponible dans la version communautaire de la
    // librairie xlsx ; l'avertissement est donc porté en texte explicite.
    const infoRows: Array<[string, string]> = [
      ["Référence export", metadata.reference],
      ["Généré par", `${metadata.genererParNom} (${metadata.genererParEmail})`],
      ["Agence exportateur", metadata.agenceExportateur],
      ["Date de génération", formatDateHeureCourte(metadata.dateGeneration)],
      ["Filtres appliqués", metadata.filtresAppliques.join(" | ")],
      ["Nombre de lignes", String(metadata.nombreLignes)],
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
    params: VenteQueryParams,
    metadata: ExportMetadata,
    encryption: PdfEncryptionOptions,
  ): Promise<PDFKit.PDFDocument> {
    const ventes = await this.getExportData(params);
    const printer = createPdfPrinter(pdfFonts);
    const watermarkDataUrl = loadWatermarkLogoDataUrl();

    const totalVenteGen = ventes.reduce(
      (sum: number, v: VenteExportData) => sum + Number(v.totalVente),
      0,
    );
    const totalPayeGen = ventes.reduce(
      (sum: number, v: VenteExportData) => sum + Number(v.totalPaye),
      0,
    );
    const totalSoldeGen = ventes.reduce(
      (sum: number, v: VenteExportData) => sum + Number(v.totalSolde),
      0,
    );

    const tableBody: TableCell[][] = [
      [
        { text: "Journée", style: "tableHeader", alignment: "center" },
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

    ventes.forEach((v: VenteExportData) => {
      tableBody.push([
        { text: String(v.jourAnnee), alignment: "center" },
        { text: v.agence?.nom || v.agenceNom || "" },
        { text: v.kiosque },
        { text: v.agent },
        { text: v.banque || "-" },
        { text: v.numeroTS10 },
        { text: formatCurrency(v.totalVente), alignment: "right" },
        { text: formatCurrency(v.totalPaye), alignment: "right" },
        { text: formatCurrency(v.totalSolde), alignment: "right" },
        { text: formatDateCourte(v.dateDebut), alignment: "center" },
        { text: formatDateCourte(v.dateFin), alignment: "center" },
      ]);
    });

    tableBody.push([
      {
        text: "TOTAL GÉNÉRAL",
        colSpan: 6,
        style: "tableTotal",
        alignment: "right",
      },
      {},
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

    const infoBlock: Content = {
      margin: [0, 0, 0, 12],
      table: {
        widths: ["*", "*"],
        body: [
          [
            {
              text: `Référence export : ${metadata.reference}`,
              style: "infoText",
            },
            {
              text: `Nombre de lignes : ${metadata.nombreLignes}`,
              style: "infoText",
            },
          ],
          [
            {
              text: `Généré par : ${metadata.genererParNom} (${metadata.genererParEmail})`,
              style: "infoText",
            },
            {
              text: `Agence exportateur : ${metadata.agenceExportateur}`,
              style: "infoText",
            },
          ],
          [
            {
              text: `Date de génération : ${formatDateHeureCourte(metadata.dateGeneration)}`,
              style: "infoText",
            },
            {
              text: `Filtres appliqués : ${metadata.filtresAppliques.join(" | ")}`,
              style: "infoText",
            },
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

    const avertissement: Content = {
      margin: [0, 0, 0, 14],
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

    const background: PdfBackground = watermarkDataUrl
      ? (
          _currentPage: number,
          pageSize: { width: number; height: number },
        ) => ({
          image: "watermarkLogo",
          width: 260,
          opacity: 0.06,
          absolutePosition: {
            x: (pageSize.width - 260) / 2,
            y: (pageSize.height - 260) / 2,
          },
        })
      : undefined;

    const docDefinition: TDocumentDefinitions & PdfEncryptionOptions = {
      // Chiffrement : DOIT être ici, sur docDefinition, et non passé en 2e
      // argument de createPdfKitDocument (voir commentaire sur PdfEncryptionOptions).
      userPassword: encryption.userPassword,
      ownerPassword: encryption.ownerPassword,
      permissions: encryption.permissions,
      version: encryption.version ?? "1.7ext3",
      pageOrientation: "landscape",
      pageSize: "A4",
      pageMargins: [40, 90, 40, 60],
      images: watermarkDataUrl
        ? { watermarkLogo: watermarkDataUrl }
        : undefined,
      background,
      header: (currentPage: number, pageCount: number) => ({
        margin: [40, 24, 40, 0],
        columns: [
          {
            width: "*",
            stack: [
              { text: "LONATO", style: "brandName" },
              { text: "Rapport des Ventes", style: "brandSubtitle" },
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
                x2: 762,
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
                text: `Document confidentiel - Réf. ${metadata.reference} - © ${new Date().getFullYear()} Lonato`,
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
        { text: "Rapport des Ventes Détaillé", style: "header" },
        {
          text: `Généré le ${formatDateHeureCourte(metadata.dateGeneration)}`,
          style: "subheader",
        },
        infoBlock,
        avertissement,
        {
          style: "tableExample",
          table: {
            headerRows: 1,
            dontBreakRows: true,
            widths: [
              "auto",
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
          layout: {
            hLineWidth: (i: number) => (i === 1 ? 1 : 0.5),
            vLineWidth: () => 0,
            hLineColor: () => "#CCCCCC",
          },
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 4],
          color: COULEUR_SECONDAIRE,
        },
        subheader: {
          fontSize: 9,
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
        brandName: { fontSize: 14, bold: true, color: COULEUR_PRIMAIRE },
        brandSubtitle: { fontSize: 9, color: COULEUR_SECONDAIRE },
        pageIndicator: { fontSize: 8, color: "#555555" },
        footerText: { fontSize: 7, color: "#777777" },
        tableHeader: {
          bold: true,
          fontSize: 8,
          color: "#FFFFFF",
          fillColor: COULEUR_SECONDAIRE,
        },
        tableTotal: { bold: true, fontSize: 8, fillColor: COULEUR_FOND_TOTAL },
        tableExample: { margin: [0, 5, 0, 15] },
      },
      defaultStyle: { fontSize: 8 },
    };

    return printer.createPdfKitDocument(docDefinition);
  },
};
