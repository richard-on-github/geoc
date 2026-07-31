import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  console.log("Début du seeding de l'administrateur...");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Les variables d'environnement ADMIN_EMAIL et ADMIN_PASSWORD sont requises pour créer le compte administrateur.",
    );
  }

  const roles = await prisma.role.findMany();
  const roleMap = new Map(roles.map((role) => [role.code, role.id]));

  const getRoleId = (code: string) => {
    const id = roleMap.get(code);

    if (!id) {
      throw new Error(`Le rôle ${code} est introuvable`);
    }

    return id;
  };

  const systemExists = await prisma.user.findUnique({
    where: {
      email: "system@geoc.com",
    },
  });

  if (!systemExists) {
    await prisma.user.create({
      data: {
        prenom: "Email",

        nom: "Import Bot",

        email: "system@geoc.com",

        telephone: null,

        passwordHash: await hashPassword(crypto.randomUUID()),

        roleId: getRoleId("SYSTEM"),

        actif: true,

        mustChangePassword: false,

        agenceId: null,
      },
    });

    console.log("✓ Utilisateur SYSTEM créé");
  }

  const adminExists = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        prenom: "Admin",
        nom: "Super",
        email: adminEmail,
        telephone: null,
        passwordHash: await hashPassword(adminPassword),
        roleId: getRoleId("ADMIN"),
        actif: true,
        mustChangePassword: false,
        agenceId: null,
      },
    });

    console.log(`✓ Administrateur créé avec l'email : ${adminEmail}`);
  } else {
    console.log(`↳ L'administrateur (${adminEmail}) existe déjà.`);
  }

  console.log("Seeding utilisateur terminé avec succès.");
}
