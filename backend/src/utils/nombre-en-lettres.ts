const UNITES = [
  "",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
  "dix-sept",
  "dix-huit",
  "dix-neuf",
];

const DIZAINES = [
  "",
  "",
  "vingt",
  "trente",
  "quarante",
  "cinquante",
  "soixante",
  "soixante-dix",
  "quatre-vingt",
  "quatre-vingt-dix",
];

function convertirMoinsDeCent(n: number): string {
  if (n < 20) return UNITES[n];

  const dizaine = Math.floor(n / 10);
  const unite = n % 10;

  // Particularités françaises : 70-79 = "soixante-DIX-neuf", 90-99 = "quatre-vingt-DIX-neuf"
  if (dizaine === 7 || dizaine === 9) {
    const base = dizaine === 7 ? DIZAINES[6] : DIZAINES[8];
    return `${base}-${UNITES[10 + unite]}`;
  }

  const motDizaine = DIZAINES[dizaine];

  if (unite === 0) {
    // "quatre-vingts" prend un s au pluriel (mais pas "quatre-vingt-un" etc.)
    return dizaine === 8 ? `${motDizaine}s` : motDizaine;
  }

  if (unite === 1 && dizaine !== 8) {
    return `${motDizaine}-et-un`;
  }

  return `${motDizaine}-${UNITES[unite]}`;
}

function convertirGroupeDeTrois(n: number): string {
  if (n === 0) return "";

  const centaines = Math.floor(n / 100);
  const reste = n % 100;

  let mots = "";
  if (centaines > 0) {
    mots += centaines === 1 ? "cent" : `${UNITES[centaines]} cent`;
    // "deux cents" prend un s, mais pas "deux cent un"
    if (reste === 0 && centaines > 1) mots += "s";
  }

  if (reste > 0) {
    if (mots) mots += " ";
    mots += convertirMoinsDeCent(reste);
  }

  return mots;
}

/** Convertit un entier positif en toutes lettres, en français. */
export function nombreEnLettres(valeur: number): string {
  const n = Math.round(Math.abs(valeur));
  if (n === 0) return "zéro";

  const milliards = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const milliers = Math.floor((n % 1_000_000) / 1_000);
  const unites = n % 1_000;

  const parties: string[] = [];

  if (milliards > 0) {
    parties.push(
      milliards === 1
        ? "un milliard"
        : `${convertirGroupeDeTrois(milliards)} milliards`,
    );
  }
  if (millions > 0) {
    parties.push(
      millions === 1
        ? "un million"
        : `${convertirGroupeDeTrois(millions)} millions`,
    );
  }
  if (milliers > 0) {
    parties.push(
      milliers === 1 ? "mille" : `${convertirGroupeDeTrois(milliers)} mille`,
    );
  }
  if (unites > 0) {
    parties.push(convertirGroupeDeTrois(unites));
  }

  const resultat = parties.join(" ");
  return valeur < 0 ? `moins ${resultat}` : resultat;
}

/** "8150" -> "HUIT MILLE CENT CINQUANTE FRANCS" (format utilisé sur les reçus). */
export function montantEnLettres(montant: number, devise = "francs"): string {
  return `${nombreEnLettres(montant)} ${devise}`.toUpperCase();
}
