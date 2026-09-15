import * as xlsx from "xlsx";
import type {
  Content,
  TDocumentDefinitions,
  TableCell,
} from "pdfmake/interfaces.js";
import { prisma } from "../../config/prisma.js";
import crypto from "crypto";
import type {
  BrouillardQueryParams,
  BrouillardResult,
} from "./brouillard.interface.js";
import { brouillardService } from "./brouillard.service.js";
import {
  createPdfPrinter,
  pdfFonts,
  loadWatermarkLogoDataUrl,
  formatCurrency,
  formatDateCourte,
  formatDateHeureCourte,
  COULEUR_SECONDAIRE,
  COULEUR_AVERTISSEMENT,
  COULEUR_FOND_TOTAL,
  type PdfEncryptionOptions,
} from "../../utils/pdf-export.js";

export interface ExportMetadataBrouillard {
  genererParNom: string;
  genererParEmail: string;
  dateGeneration: Date;
  reference: string;
}

interface ExcelRow {
  "Num Pièce": string;
  "Libellé opérations": string;
  Date: string;
  Recettes: string | number;
  Dépenses: string | number;
  Solde: number;
  Type: string;
}

export const brouillardExportService = {
  async getExportData(
    params: BrouillardQueryParams,
  ): Promise<BrouillardResult> {
    return brouillardService.getBrouillard(params);
  },

  async buildExportMetadata(
    actorId: string,
  ): Promise<ExportMetadataBrouillard> {
    const user = await prisma.user.findUnique({
      where: { id: actorId },
      select: { nom: true, prenom: true, email: true },
    });

    return {
      genererParNom: user
        ? `${user.prenom} ${user.nom}`.trim()
        : "Utilisateur inconnu",
      genererParEmail: user?.email ?? "N/A",
      dateGeneration: new Date(),
      reference: crypto.randomUUID().slice(0, 8).toUpperCase(),
    };
  },

  async generateCSV(
    brouillard: BrouillardResult,
    metadata: ExportMetadataBrouillard,
  ): Promise<string> {
    const headers = [
      "Num Pièce",
      "Libellé opérations",
      "Date",
      "Recettes",
      "Dépenses",
      "Solde",
      "Type",
    ];

    const rows: string[][] = brouillard.lignes.map((l) => [
      l.numeroPiece,
      l.libelle,
      formatDateCourte(l.date),
      l.recettes ? l.recettes.toString() : "",
      l.depenses ? l.depenses.toString() : "",
      l.solde.toString(),
      l.type,
    ]);

    rows.push([
      "",
      "TOTAL",
      "",
      brouillard.totalRecettes.toString(),
      brouillard.totalDepenses.toString(),
      brouillard.soldeFinal.toString(),
      "",
    ]);

    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

    const infoLines: string[] = [
      [
        `# BROUILLARD - ${brouillard.numeroRegistre} - Référence ${metadata.reference}`,
      ],
      [
        brouillard.dateDebut && brouillard.dateFin
          ? `# Entre le : ${formatDateCourte(brouillard.dateDebut)} - Et le : ${formatDateCourte(brouillard.dateFin)}`
          : "# Toutes dates",
      ],
      [
        `# Généré par : ${metadata.genererParNom} (${metadata.genererParEmail})`,
      ],
      [
        `# Date de génération : ${formatDateHeureCourte(metadata.dateGeneration)}`,
      ],
      [`# Solde final : ${brouillard.soldeFinal}`],
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
    brouillard: BrouillardResult,
    metadata: ExportMetadataBrouillard,
  ): Promise<Buffer> {
    const data: ExcelRow[] = brouillard.lignes.map((l) => ({
      "Num Pièce": l.numeroPiece,
      "Libellé opérations": l.libelle,
      Date: formatDateCourte(l.date),
      Recettes: l.recettes || "",
      Dépenses: l.depenses || "",
      Solde: l.solde,
      Type: l.type,
    }));

    data.push({
      "Num Pièce": "",
      "Libellé opérations": "TOTAL",
      Date: "",
      Recettes: brouillard.totalRecettes,
      Dépenses: brouillard.totalDepenses,
      Solde: brouillard.soldeFinal,
      Type: "",
    });

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Brouillard");

    const infoRows: Array<[string, string]> = [
      ["Registre", brouillard.numeroRegistre],
      [
        "Période",
        brouillard.dateDebut && brouillard.dateFin
          ? `Entre le ${formatDateCourte(brouillard.dateDebut)} et le ${formatDateCourte(brouillard.dateFin)}`
          : "Toutes dates",
      ],
      ["Référence export", metadata.reference],
      ["Généré par", `${metadata.genererParNom} (${metadata.genererParEmail})`],
      ["Date de génération", formatDateHeureCourte(metadata.dateGeneration)],
      ["Solde final", String(brouillard.soldeFinal)],
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
    brouillard: BrouillardResult,
    metadata: ExportMetadataBrouillard,
    encryption: PdfEncryptionOptions,
  ): Promise<PDFKit.PDFDocument> {
    const printer = createPdfPrinter(pdfFonts);
    const logoDataUrl = loadWatermarkLogoDataUrl();

    const tableBody: TableCell[][] = [
      [
        { text: "Num Pièce", style: "tableHeader" },
        { text: "Libellé opérations", style: "tableHeader" },
        { text: "Date", style: "tableHeader", alignment: "center" },
        { text: "Recettes", style: "tableHeader", alignment: "right" },
        { text: "Dépenses", style: "tableHeader", alignment: "right" },
        { text: "Solde", style: "tableHeader", alignment: "right" },
        { text: "Type", style: "tableHeader", alignment: "center" },
      ],
    ];

    brouillard.lignes.forEach((l) => {
      const estOuverture = l.type === "A";
      tableBody.push([
        {
          text: l.numeroPiece || "-",
          style: estOuverture ? "ligneOuverture" : undefined,
        },
        { text: l.libelle, style: estOuverture ? "ligneOuverture" : undefined },
        {
          text: formatDateCourte(l.date),
          alignment: "center",
          style: estOuverture ? "ligneOuverture" : undefined,
        },
        {
          text: l.recettes ? formatCurrency(l.recettes) : "-",
          alignment: "right",
          style: estOuverture ? "ligneOuverture" : undefined,
        },
        {
          text: l.depenses ? formatCurrency(l.depenses) : "-",
          alignment: "right",
          style: estOuverture ? "ligneOuverture" : undefined,
        },
        {
          text: formatCurrency(l.solde),
          alignment: "right",
          bold: true,
          style: estOuverture ? "ligneOuverture" : undefined,
        },
        {
          text: l.type,
          alignment: "center",
          style: estOuverture ? "ligneOuverture" : undefined,
        },
      ]);
    });

    tableBody.push([
      { text: "TOTAL", colSpan: 3, style: "tableTotal" },
      {},
      {},
      {
        text: formatCurrency(brouillard.totalRecettes),
        style: "tableTotal",
        alignment: "right",
      },
      {
        text: formatCurrency(brouillard.totalDepenses),
        style: "tableTotal",
        alignment: "right",
      },
      {
        text: formatCurrency(brouillard.soldeFinal),
        style: "tableTotal",
        alignment: "right",
      },
      { text: "", style: "tableTotal" },
    ]);

    const entete: Content = {
      margin: [0, 0, 0, 16],
      columns: [
        {
          width: "*",
          stack: [
            { text: "Entre le :", style: "enteteLabel" },
            {
              text: brouillard.dateDebut
                ? formatDateCourte(brouillard.dateDebut)
                : "-",
              style: "enteteValeur",
              margin: [0, 0, 0, 8],
            },
            { text: "Et le :", style: "enteteLabel" },
            {
              text: brouillard.dateFin
                ? formatDateCourte(brouillard.dateFin)
                : "-",
              style: "enteteValeur",
            },
          ],
        },
        {
          width: "*",
          alignment: "center",
          stack: [
            ...(logoDataUrl
              ? [
                  {
                    image: "logoLonato",
                    width: 70,
                    alignment: "center" as const,
                    margin: [0, 0, 0, 6] as [number, number, number, number],
                  },
                ]
              : []),
            {
              text: "LOTERIE NATIONALE TOGOLAISE",
              style: "brandTitle",
              alignment: "center",
            },
            {
              text: "BROUILLARD",
              style: "brouillardTitre",
              alignment: "center",
              margin: [0, 6, 0, 0],
            },
          ],
        },
        {
          width: "*",
          alignment: "right",
          stack: [
            {
              text: formatDateCourte(metadata.dateGeneration),
              style: "enteteValeur",
            },
          ],
        },
      ],
    };

    const registreLine: Content = {
      margin: [0, 0, 0, 16],
      text: [
        { text: "N°Registre    ", style: "enteteLabel" },
        { text: brouillard.numeroRegistre, style: "enteteValeur" },
      ],
    };

    const avertissement: Content = {
      margin: [0, 16, 0, 0],
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
      pageOrientation: "portrait",
      pageSize: "A4",
      pageMargins: [30, 30, 30, 50],
      images: logoDataUrl ? { logoLonato: logoDataUrl } : undefined,
      footer: (currentPage: number, pageCount: number) => ({
        margin: [30, 8, 30, 12],
        stack: [
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 0,
                x2: 535,
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
                text: `${currentPage}/${pageCount}`,
                style: "footerText",
              },
            ],
          },
        ],
      }),
      content: [
        entete,
        registreLine,
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto"],
            body: tableBody,
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => "#666666",
            vLineColor: () => "#666666",
          },
        },
        avertissement,
      ],
      styles: {
        brandTitle: { fontSize: 11, bold: true },
        brouillardTitre: { fontSize: 12, bold: true, decoration: "underline" },
        enteteLabel: { fontSize: 8, bold: true, decoration: "underline" },
        enteteValeur: { fontSize: 9 },
        tableHeader: { bold: true, fontSize: 8, fillColor: "#F2F2F2" },
        tableTotal: { bold: true, fontSize: 8, fillColor: COULEUR_FOND_TOTAL },
        ligneOuverture: { italics: true, fillColor: "#F5F5F5" },
        avertissement: {
          fontSize: 7,
          bold: true,
          color: COULEUR_AVERTISSEMENT,
        },
        footerText: { fontSize: 7, color: "#777777" },
      },
      defaultStyle: { fontSize: 8 },
    };

    return printer.createPdfKitDocument(docDefinition);
  },
};
