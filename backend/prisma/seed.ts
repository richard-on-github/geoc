import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log("Seeding database...");

  // Vérifier si l'admin existe déjà
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  if (!existingAdmin) {
    console.log("  ↳ Creating default admin user...");
    const passwordHash = await hashPassword("Password123!");
    await prisma.user.create({
      data: {
        prenom: "Admin",
        nom: "System",
        email: "admin@example.com",
        telephone: "+22890000000",
        passwordHash,
        role: Role.ADMIN,
        mustChangePassword: false,
        actif: true,
      },
    });
    console.log("    ✓ Admin user created (admin@example.com / Password123!)");
  } else {
    console.log("  ↳ Admin user already exists, skipping.");
  }

  // Créer quelques utilisateurs de test pour chaque rôle
  const sampleUsers = [
    {
      prenom: "Direction",
      nom: "User",
      email: "direction@example.com",
      role: Role.DIRECTION,
    },
    {
      prenom: "Contrôleur",
      nom: "User",
      email: "controleur@example.com",
      role: Role.CONTROLEUR,
    },
    {
      prenom: "Auditeur",
      nom: "User",
      email: "auditeur@example.com",
      role: Role.AUDITEUR,
    },
    {
      prenom: "Comptable",
      nom: "User",
      email: "comptable@example.com",
      role: Role.COMPTABLE,
    },
    {
      prenom: "Chef",
      nom: "Agence",
      email: "chefagence@example.com",
      role: Role.CHEF_AGENCE,
    },
    {
      prenom: "Caissier",
      nom: "User",
      email: "caissier@example.com",
      role: Role.CAISSIER,
    },
  ];

  for (const user of sampleUsers) {
    const exists = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!exists) {
      const passwordHash = await hashPassword("Test1234!");
      await prisma.user.create({
        data: {
          ...user,
          telephone: null,
          passwordHash,
          mustChangePassword: true,
          actif: true,
        },
      });
      console.log(
        `    ✓ ${user.role} user created (${user.email} / Test1234!)`,
      );
    } else {
      console.log(`    ↳ ${user.role} user already exists, skipping.`);
    }
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
