import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";
import { contextStorage } from "../utils/context.js"; // Ajustez le chemin vers votre fichier de contexte

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

// Pour éviter les fuites de mémoire au hot-reload, on stocke le couple (base + extended)
const globalForPrisma = globalThis as {
  prismaInstance?: {
    base: PrismaClient;
    extended: any;
  };
};

// Si l'instance n'existe pas encore (premier démarrage), on la crée
if (!globalForPrisma.prismaInstance) {
  // 1. L'instance brute connectée à PostgreSQL
  const baseClient = new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

  // 2. L'instance étendue avec le mécanisme de scoping automatique
  const extendedClient = baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const ctx = contextStorage.getStore();

          // RÈGLE A : Hors contexte HTTP (scripts/crons) ou scope GLOBAL -> Pas de filtrage
          if (!ctx || ctx.dataScope === "GLOBAL") {
            return query(args);
          }

          // RÈGLE B : Si l'utilisateur est restreint à son AGENCE
          if (ctx?.dataScope === "AGENCE" && ctx.agenceId) {
            args.where = args.where || {};

            // 1. CAS SPÉCIAL : Le modèle Agence lui-même (filtrage sur sa clé primaire `id`)
            if (model === "Agence") {
              // Sécurité : si la requête cherche un ID précis (ex: findById, update) différent de la sienne
              if (args.where.id && args.where.id !== ctx.agenceId) {
                // On force une valeur impossible pour que PostgreSQL renvoie 0 résultat (404 propre)
                args.where.id = "ACCES_INTERDIT_HORS_PERIMETRE";
              } else {
                // Sinon (ex: findAll), on restreint la liste à son agence uniquement
                args.where.id = ctx.agenceId;
              }
            }
            // 2. CAS DES MODÈLES SECTORISÉS : Modèles possédant une colonne `agenceId`
            else {
              // Liste exacte des modèles de votre schéma possédant un champ `agenceId`
              const modelsWithAgenceId = ["User", "AuditLog", "Vente"];

              if (modelsWithAgenceId.includes(model)) {
                args.where.agenceId = ctx.agenceId;
              }
            }
          }

          return query(args);
        },
      },
    },
  });

  globalForPrisma.prismaInstance = {
    base: baseClient,
    extended: extendedClient,
  };
}

// --- EXPORTS ---

// L'instance par défaut que vous utilisez partout dans vos repositories (Scoping automatique actif)
export const prisma = globalForPrisma.prismaInstance.extended;

// L'instance brute sans filtre automatique (À utiliser pour les Seeds, les tâches Cron globales, etc.)
export const basePrisma = globalForPrisma.prismaInstance.base;
