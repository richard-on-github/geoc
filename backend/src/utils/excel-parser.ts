import * as xlsx from "xlsx";
import { ApiError } from "./ApiError.js";
import type { ParsedVenteRow } from "../modules/ventes/vente.interface.js";

export async function parseExcelToVenteRows(
  fileBuffer: Buffer,
): Promise<ParsedVenteRow[]> {
  // 1. Lire le buffer avec la librairie xlsx
  // L'option cellDates: true permet de convertir automatiquement les cellules de date en objet Date JS
  const workbook = xlsx.read(fileBuffer, { type: "buffer", cellDates: true });

  // 2. Prendre la première feuille (ex: 'DAY-1')
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw ApiError.badRequest("Le fichier Excel est vide.");
  }

  const worksheet = workbook.Sheets[sheetName];

  // 3. Convertir la feuille en JSON
  // defval: "" évite d'avoir des valeurs `undefined` si une cellule est vide
  const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: "" }) as Record<
    string,
    any
  >[];

  if (rawData.length === 0) {
    throw ApiError.badRequest("La feuille Excel ne contient aucune donnée.");
  }

  const parsedRows: ParsedVenteRow[] = [];

  // 4. Nettoyer et transformer les données
  for (const [index, row] of rawData.entries()) {
    // Normalisation des clés pour éviter les bugs liés aux espaces invisibles (ex: " TOTAL VENTES")
    const cleanRow: Record<string, any> = {};
    for (const key in row) {
      cleanRow[key.trim()] = row[key];
    }

    // Ignorer la ligne de résumé initiale ou les lignes vides (où AGENCE est vide)
    if (!cleanRow["AGENCE"] || !cleanRow["KIOSQUE"]) {
      continue;
    }

    try {
      parsedRows.push({
        agenceNomBrut: String(cleanRow["AGENCE"]).trim(),
        kiosque: String(cleanRow["KIOSQUE"]).trim(),
        agent: String(cleanRow["NOM AGENT"]).trim(),
        banque: cleanRow["BANQUE"]
          ? String(cleanRow["BANQUE"]).trim()
          : undefined,

        // Le numéro TS10 peut parfois être lu comme un float (ex: 10001.0). On s'assure d'avoir la chaîne "10001"
        numeroTS10: String(cleanRow["N° TS10"]).replace(/\.0$/, "").trim(),

        // Conversion en nombre (fallback à 0 si invalide ou vide)
        totalVente: Number(cleanRow["TOTAL VENTES"]) || 0,
        totalPaye: Number(cleanRow["TOTAL PAYÉS"]) || 0,
        totalSolde: Number(cleanRow["TOTAL SOLDE"]) || 0,

        // Les dates 'ENTRE' et 'ET'
        dateDebut: new Date(cleanRow["ENTRE"]),
        dateFin: new Date(cleanRow["ET"]),
      });
    } catch (error) {
      throw ApiError.badRequest(
        `Erreur de formatage à la ligne ${index + 2}. Vérifiez les dates et les montants.`,
      );
    }
  }

  return parsedRows;
}
