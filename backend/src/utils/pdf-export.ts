import type { TDocumentDefinitions } from "pdfmake/interfaces.js";
import { createRequire } from "node:module";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { Prisma } from "@prisma/client";

const require = createRequire(import.meta.url);

export type PdfBackground = TDocumentDefinitions["background"];

export function unwrap<T>(moduleImport: unknown): T {
  if (
    moduleImport &&
    typeof moduleImport === "object" &&
    "default" in moduleImport &&
    (moduleImport as { default?: unknown }).default
  ) {
    return unwrap<T>((moduleImport as { default: unknown }).default);
  }
  return moduleImport as T;
}

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

export interface PdfPrinterInstance {
  createPdfKitDocument(docDefinition: TDocumentDefinitions): PDFKit.PDFDocument;
  urlResolver?: {
    resolve: (url: string) => Promise<string>;
  };
}

export interface FontDescriptors {
  [fontName: string]: {
    normal: string;
    bold?: string;
    italics?: string;
    bolditalics?: string;
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

/** Instancie proprement PdfPrinter avec vfs et urlResolver résolus. */
export function createPdfPrinter(fonts: FontDescriptors): PdfPrinterInstance {
  const vfs =
    typeof VirtualFSClass === "function" ? new VirtualFSClass() : null;

  let urlResolver: { resolve: (url: string) => Promise<string> };
  if (typeof URLResolverClass === "function") {
    urlResolver = new URLResolverClass(vfs) as {
      resolve: (url: string) => Promise<string>;
    };
  } else {
    urlResolver = { resolve: async (url: string) => url };
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

export function resolveFontPath(fontFilename: string): string {
  const candidates = [
    path.resolve(__dirname, "../assets/fonts", fontFilename),
    path.resolve(process.cwd(), "src/assets/fonts", fontFilename),
    path.resolve(
      process.cwd(),
      "node_modules/roboto-font/fonts/Roboto",
      fontFilename,
    ),
  ];
  for (const fontPath of candidates) {
    if (fs.existsSync(fontPath)) return fontPath;
  }
  return candidates[0];
}

export function resolveAssetPath(relativeFromSrc: string): string | null {
  const candidates = [
    path.resolve(__dirname, "../assets", relativeFromSrc),
    path.resolve(process.cwd(), "src/assets", relativeFromSrc),
  ];
  for (const assetPath of candidates) {
    if (fs.existsSync(assetPath)) return assetPath;
  }
  return null;
}

export function loadWatermarkLogoDataUrl(): string | null {
  const logoPath = resolveAssetPath("images/logo-lonato.png");
  if (!logoPath) return null;
  const buffer = fs.readFileSync(logoPath);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export const pdfFonts: FontDescriptors = {
  Roboto: {
    normal: resolveFontPath("Roboto-Regular.ttf"),
    bold: resolveFontPath("Roboto-Bold.ttf"),
    italics: resolveFontPath("Roboto-Italic.ttf"),
    // Déclarer 'bolditalics' avec fallback sur 'Roboto-Italic.ttf' si 'Roboto-BoldItalic.ttf' n'existe pas
    bolditalics:
      resolveFontPath("Roboto-BoldItalic.ttf") ||
      resolveFontPath("Roboto-Italic.ttf"),
  },
};

export const COULEUR_PRIMAIRE = "#00843D";
export const COULEUR_SECONDAIRE = "#20603D";
export const COULEUR_AVERTISSEMENT = "#C0392B";
export const COULEUR_FOND_TOTAL = "#D9ECE0";

export function formatCurrency(
  amount: number | Prisma.Decimal | string,
): string {
  const num = Number(amount) || 0;
  return num.toLocaleString("fr-FR").replace(/[\u00A0\u202F]/g, " ") + " FCFA";
}

export function formatDateCourte(dateInput?: Date | string): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("fr-FR");
}

/** Formate une heure en UTC (les versements et l'heure limite sont toujours raisonnés en UTC). */
export function formatHeureCourte(dateInput?: Date | string | null): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";
  return (
    d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC"
  );
}

export function formatDateHeureCourte(dateInput: Date): string {
  return dateInput.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
