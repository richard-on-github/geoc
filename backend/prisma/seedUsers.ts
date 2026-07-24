import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

interface SampleUserInput {
  prenom: string;
  nom: string;
  email: string;
  roleCode: string;
  agenceTarget?: "principale" | "nord";
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  console.log("Début du seeding des agences et utilisateurs...");

  const roles = await prisma.role.findMany();

  const roleMap = new Map(roles.map((role) => [role.code, role.id]));

  const getRoleId = (code: string) => {
    const id = roleMap.get(code);

    if (!id) {
      throw new Error(`Le rôle ${code} est introuvable`);
    }

    return id;
  };

  let agencePrincipale = await prisma.agence.findFirst({
    where: {
      nom: "Agence Principale",
    },
  });

  if (!agencePrincipale) {
    agencePrincipale = await prisma.agence.create({
      data: {
        nom: "Agence Principale",
        code: "MAIN",
      },
    });

    console.log("✓ Agence Principale créée");
  }

  let agenceNord = await prisma.agence.findFirst({
    where: {
      nom: "Agence Nord",
    },
  });

  if (!agenceNord) {
    agenceNord = await prisma.agence.create({
      data: {
        nom: "Agence Nord",
        code: "NORD",
      },
    });

    console.log("✓ Agence Nord créée");
  }

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
      email: "admin@example.com",
    },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        prenom: "Admin",

        nom: "System",

        email: "admin@example.com",

        telephone: "+22890000000",

        passwordHash: await hashPassword("Password123!"),

        roleId: getRoleId("ADMIN"),

        actif: true,

        mustChangePassword: false,

        agenceId: null,
      },
    });

    console.log("✓ Administrateur créé");
  }

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
      prenom: "Jean",
      nom: "Chef-Principale",
      email: "chef.principale@example.com",
      roleCode: "CHEF_AGENCE",
      agenceTarget: "principale",
    },

    {
      prenom: "Awa",
      nom: "Caisse-Principale",
      email: "caissier.principale@example.com",
      roleCode: "CAISSIER",
      agenceTarget: "principale",
    },

    {
      prenom: "Marc",
      nom: "Chef-Nord",
      email: "chef.nord@example.com",
      roleCode: "CHEF_AGENCE",
      agenceTarget: "nord",
    },

    {
      prenom: "Koffi",
      nom: "Caisse-Nord",
      email: "caissier.nord@example.com",
      roleCode: "CAISSIER",
      agenceTarget: "nord",
    },
  ];

  for (const user of sampleUsers) {
    const exists = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (exists) {
      console.log(`↳ ${user.email} existe déjà`);

      continue;
    }

    let agenceId: null | string = null;

    if (user.agenceTarget === "principale") {
      agenceId = agencePrincipale.id;
    }

    if (user.agenceTarget === "nord") {
      agenceId = agenceNord.id;
    }

    await prisma.user.create({
      data: {
        prenom: user.prenom,

        nom: user.nom,

        email: user.email,

        telephone: null,

        passwordHash: await hashPassword("Test1234!"),

        roleId: getRoleId(user.roleCode),

        actif: true,

        mustChangePassword: true,

        agenceId,
      },
    });

    console.log(`✓ ${user.roleCode} créé : ${user.email}`);
  }

  console.log("Seeding utilisateurs terminé avec succès.");
}
