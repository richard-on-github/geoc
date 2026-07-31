import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";
import { contextStorage } from "../utils/context.js";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

type PrismaQueryArgs = {
  where?: Record<string, unknown>;
  [key: string]: unknown;
};

type PrismaQueryContext = {
  model: string;
  operation: string;
  args: PrismaQueryArgs;
  query: (args: PrismaQueryArgs) => Promise<unknown>;
};

const globalForPrisma = globalThis as {
  prismaInstance?: {
    base: PrismaClient;
    extended: any;
  };
};

if (!globalForPrisma.prismaInstance) {
  const baseClient = new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

  const extendedClient = baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({
          model,
          operation,
          args,
          query,
        }: PrismaQueryContext) {
          const ctx = contextStorage.getStore();

          // RÈGLE A : Hors contexte HTTP (scripts/crons) ou scope GLOBAL -> Pas de filtrage
          if (!ctx || ctx.dataScope === "GLOBAL") {
            return query(args);
          }
          if (operation === "create" || operation === "createMany") {
            return query(args);
          }
          if (ctx?.dataScope === "AGENCE" && ctx.agenceId) {
            args.where = args.where || {};

            if (model === "Agence") {
              if (args.where.id && args.where.id !== ctx.agenceId) {
                args.where.id = "ACCES_INTERDIT_HORS_PERIMETRE";
              } else {
                args.where.id = ctx.agenceId;
              }
            } else {
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

export const prisma = globalForPrisma.prismaInstance.extended;
export const basePrisma = globalForPrisma.prismaInstance.base;
