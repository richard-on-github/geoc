import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { seedPermissions } from "./seedPermissions.js";
import { seedRoles } from "./seedRoles.js";
import { seedUsers } from "./seedUsers.js";

// Configuration de la connexion PostgreSQL avec le driver natif et l'adaptateur PrismaPg
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("La variable d'environnement DATABASE_URL est requise.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log(
    "Démarrage global du processus de seeding de la base de données...",
  );

  // 1. Synchronisation séquentielle des briques d'autorisations
  await seedPermissions();
  await seedRoles();

  // 2. Exécution du module utilisateur en lui injectant l'instance prisma configurée
  await seedUsers(prisma);

  console.log("Processus de seeding global achevé avec succès.");
}

main()
  .catch((e: unknown) => {
    console.error("Échec critique lors du processus de seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
