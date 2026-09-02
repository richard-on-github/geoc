import type { TDocumentDefinitions, Column } from "pdfmake/interfaces.js";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  createPdfPrinter,
  pdfFonts,
  formatCurrency,
  formatDateCourte,
} from "../../utils/pdf-export.js";
import { montantEnLettres } from "../../utils/nombre-en-lettres.js";

function buildReceiptBlock(
  encaissement: { id: string; montant: number; dateEncaissement: Date },
  vente: {
    agenceNom: string;
    agent: string;
    numeroTS10: string;
    dateDebut: Date;
    jourAnnee: number;
  },
  copie: "CLIENT" | "AGENCE",
  agentConnecte: string,
): Column {
  const numeroRecu = `260${encaissement.id.slice(0, 6).toUpperCase()}`;
  const dateStr = formatDateCourte(encaissement.dateEncaissement);
  const montantStr = formatCurrency(encaissement.montant);

  // Sécurisation de l'extraction des deux derniers chiffres (ex: 2026 -> 26)
  const anneeCourte = encaissement.dateEncaissement
    .getFullYear()
    .toString()
    .slice(-2);
  const numeroTirage = `J${vente.jourAnnee}/${anneeCourte}`;

  return {
    width: "*", // TypeScript accepte ceci maintenant grâce au type Column
    stack: [
      {
        columns: [
          {
            image: "./src/assets/images/logo-lonato.png",
            width: 50,
            alignment: "left",
          },
          {
            text: [
              { text: `N° ${numeroRecu}\n`, bold: true },
              { text: dateStr, bold: true },
            ],
            alignment: "right",
          },
        ],
        margin: [0, 0, 0, 15],
      },

      // Ligne avec N° de collecteur à gauche et Titre centré
      {
        columns: [
          {
            text: vente.numeroTS10,
            width: "20%",
            style: "recuValeurForte",
            alignment: "left",
          },
          {
            text: "RECU DE VERSEMENT",
            width: "60%",
            style: "recuTitre",
            alignment: "center",
          },
          { text: "", width: "20%" },
        ],
        margin: [0, 0, 0, 20],
      },

      // Bloc : Montant, Registre (Agent Connecté), Reçu de
      {
        columns: [
          { text: "Montant", style: "recuLabel", width: "40%" },
          {
            text: montantStr,
            style: "recuValeurForte",
            alignment: "right",
            width: "60%",
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          { text: "Registre", style: "recuLabelUnderline", width: "40%" },
          {
            text: agentConnecte,
            style: "recuValeurForte",
            alignment: "right",
            width: "60%",
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            text: "Reçu de Mr / Mme / Mlle",
            style: "recuLabelUnderline",
            width: "45%",
          },
          {
            text: vente.agent,
            style: "recuValeurForte",
            alignment: "right",
            width: "55%",
          },
        ],
        margin: [0, 0, 0, 18],
      },

      // Bloc : La somme de
      {
        text: "La somme de :",
        style: "recuLabelUnderline",
        margin: [0, 0, 0, 6],
      },
      {
        text: montantEnLettres(encaissement.montant).toUpperCase(),
        style: "recuSommeEnLettres",
        margin: [0, 0, 0, 18],
      },

      // Bloc : Informations complémentaires
      {
        columns: [
          { text: "Date", style: "recuLabelUnderline", width: "40%" },
          {
            text: dateStr,
            style: "recuValeur",
            alignment: "right",
            width: "60%",
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            text: "Type de Produit",
            style: "recuLabelUnderline",
            width: "40%",
          },
          {
            text: "L5/90",
            style: "recuValeur",
            alignment: "right",
            width: "60%",
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          { text: "N°Tirage", style: "recuLabelUnderline", width: "40%" },
          {
            text: numeroTirage,
            style: "recuValeur",
            alignment: "right",
            width: "60%",
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          { text: "N°Collecteur", style: "recuLabelUnderline", width: "40%" },
          {
            text: vente.numeroTS10,
            style: "recuValeur",
            alignment: "right",
            width: "60%",
          },
        ],
        margin: [0, 0, 0, 25],
      },

      // Bloc : Détails des versements
      {
        table: {
          widths: ["*", "auto"],
          body: [
            [
              {
                text: "Détails Versements",
                style: "recuTableHeader",
                alignment: "left",
                margin: [0, 0, 0, 6],
              },
              {
                text: "Montant",
                style: "recuTableHeader",
                alignment: "right",
                margin: [0, 0, 0, 6],
              },
            ],
            [
              {
                text: `VERS. Produit L5/90 ${numeroTirage} ${vente.agent}`,
                style: "recuTableCell",
                alignment: "left",
              },
              {
                text: montantStr,
                style: "recuTableCellForte",
                alignment: "right",
              },
            ],
          ],
        },
        layout: "noBorders",
        margin: [0, 0, 0, 35],
      },

      // Bloc : Signatures
      {
        columns: [
          {
            width: "*",
            text: "Signature du Caissier",
            style: "recuSignatureLabel",
            alignment: "left",
          },
          {
            width: "*",
            text: "Signature du bénéficiaire",
            style: "recuSignatureLabel",
            alignment: "right",
          },
        ],
      },

      // Ligne Exemplaire en bas
      {
        text: `Exemplaire ${copie === "CLIENT" ? "client" : "agence"}`,
        style: "recuExemplaire",
        alignment: "center",
        margin: [0, 20, 0, 0],
      },
    ],
  };
}

export const venteRecuService = {
  async generatePDF(
    encaissementId: string,
    agentConnecte: string,
  ): Promise<PDFKit.PDFDocument> {
    const encaissement = await prisma.encaissement.findUnique({
      where: { id: encaissementId },
      include: { vente: true },
    });

    if (!encaissement) {
      throw ApiError.notFound("Encaissement introuvable.");
    }

    const { vente } = encaissement;

    const fonts = {
      Courier: {
        normal: "Courier",
        bold: "Courier-Bold",
        italics: "Courier-Oblique",
        bolditalics: "Courier-BoldOblique",
      },
      ...pdfFonts,
    };

    const printer = createPdfPrinter(fonts as any);

    const encaissementValues = {
      id: encaissement.id,
      montant: Number(encaissement.montant),
      dateEncaissement: encaissement.dateEncaissement,
    };

    const docDefinition: TDocumentDefinitions = {
      pageOrientation: "landscape",
      pageSize: "A4",
      pageMargins: [24, 24, 24, 24],
      background: (
        _currentPage: number,
        pageSize: { width: number; height: number },
      ) => ({
        canvas: [
          {
            type: "line",
            x1: pageSize.width / 2,
            y1: 16,
            x2: pageSize.width / 2,
            y2: pageSize.height - 16,
            lineWidth: 0.75,
            lineColor: "#999999",
          },
        ],
      }),
      content: [
        {
          columns: [
            buildReceiptBlock(
              encaissementValues,
              vente,
              "CLIENT",
              agentConnecte,
            ),
            buildReceiptBlock(
              encaissementValues,
              vente,
              "AGENCE",
              agentConnecte,
            ),
          ],
          columnGap: 45,
        },
      ],
      styles: {
        recuTitre: { fontSize: 13, bold: true, decoration: "underline" },
        recuLabel: { fontSize: 10, bold: true },
        recuLabelUnderline: {
          fontSize: 10,
          bold: true,
          decoration: "underline",
        },
        recuValeur: { fontSize: 10 },
        recuValeurForte: { fontSize: 10, bold: true },
        recuSommeEnLettres: { fontSize: 10, lineHeight: 1.2 },
        recuTableHeader: { fontSize: 10, bold: true },
        recuTableCell: { fontSize: 10 },
        recuTableCellForte: { fontSize: 10, bold: true },
        recuSignatureLabel: {
          fontSize: 10,
          bold: true,
          decoration: "underline",
        },
        recuExemplaire: { fontSize: 8, italics: true, color: "#888888" },
      },
      defaultStyle: {
        fontSize: 10,
        font: "Courier",
        color: "#000000",
        lineHeight: 1.15,
      },
    };

    return printer.createPdfKitDocument(docDefinition);
  },
};
