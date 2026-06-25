import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

interface SampleUserInput {
  prenom: string;
  nom: string;
  email: string;
  roleCode: string;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  console.log("Début du seeding des utilisateurs...");

  // 1. Récupération de tous les rôles pour lier l'ID via le code système
  const roles = await prisma.role.findMany();
  const roleMap = new Map<string, string>(roles.map((r) => [r.code, r.id]));

  const adminRoleId = roleMap.get("ADMIN");
  if (!adminRoleId) {
    throw new Error(
      "Le rôle système 'ADMIN' est introuvable. Veuillez exécuter le seed des rôles d'abord.",
    );
  }

  // 2. Vérifier et créer l'administrateur par défaut
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  if (!existingAdmin) {
    console.log("  ↳ Création de l'utilisateur administrateur par défaut...");
    const passwordHash = await hashPassword("Password123!");
    await prisma.user.create({
      data: {
        prenom: "Admin",
        nom: "System",
        email: "admin@example.com",
        telephone: "+22890000000",
        passwordHash,
        roleId: adminRoleId,
        mustChangePassword: false,
        actif: true,
      },
    });
    console.log(
      "    ✓ Utilisateur Admin créé (admin@example.com / Password123!)",
    );
  } else {
    console.log("  ↳ L'utilisateur Admin existe déjà, étape ignorée.");
  }

  // 3. Créer les utilisateurs de test pour chaque rôle applicatif
  const sampleUsers: SampleUserInput[] = [
    {
      prenom: "Direction",
      nom: "User",
      email: "direction@example.com",
      roleCode: "DIRECTION",
    },
    {
      prenom: "Contrôleur",
      nom: "User",
      email: "controleur@example.com",
      roleCode: "CONTROLEUR",
    },
    {
      prenom: "Auditeur",
      nom: "User",
      email: "auditeur@example.com",
      roleCode: "AUDITEUR",
    },
    {
      prenom: "Comptable",
      nom: "User",
      email: "comptable@example.com",
      roleCode: "COMPTABLE",
    },
    {
      prenom: "Chef",
      nom: "Agence",
      email: "chefagence@example.com",
      roleCode: "CHEF_AGENCE",
    },
    {
      prenom: "Caissier",
      nom: "User",
      email: "caissier@example.com",
      roleCode: "CAISSIER",
    },
  ];

  for (const sampleUser of sampleUsers) {
    const targetRoleId = roleMap.get(sampleUser.roleCode);
    if (!targetRoleId) {
      console.warn(
        `[ATTENTION] Rôle pour le code '${sampleUser.roleCode}' introuvable. Utilisateur ignoré.`,
      );
      continue;
    }

    const exists = await prisma.user.findUnique({
      where: { email: sampleUser.email },
    });

    if (!exists) {
      const passwordHash = await hashPassword("Test1234!");
      await prisma.user.create({
        data: {
          prenom: sampleUser.prenom,
          nom: sampleUser.nom,
          email: sampleUser.email,
          telephone: null,
          passwordHash,
          roleId: targetRoleId,
          mustChangePassword: true,
          actif: true,
        },
      });
      console.log(
        `    ✓ Utilisateur ${sampleUser.roleCode} créé (${sampleUser.email} / Test1234!)`,
      );
    } else {
      console.log(
        `    ↳ L'utilisateur ${sampleUser.roleCode} existe déjà, étape ignorée.`,
      );
    }
  }

  console.log("Seeding des utilisateurs complété.");
}
