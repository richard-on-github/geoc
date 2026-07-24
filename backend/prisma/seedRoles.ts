import { DataScope } from "@prisma/client";
import { prisma } from "../src/config/prisma.js";

export async function seedRoles() {
  console.log("Début du seeding des rôles système...");

  const allPermissions = await prisma.permission.findMany();
  const permMap = new Map(allPermissions.map((p) => [p.code, p.id]));

  const systemRoles = [
    {
      code: "SYSTEM",
      niveau: 0,
      nom: "Compte système",
      dataScope: "GLOBAL",
      description:
        "Compte technique utilisé pour les traitements automatiques (imports email, tâches planifiées).",
      allowedCodes: [],
    },

    {
      code: "ADMIN",
      niveau: 100,
      nom: "Administrateur Système",
      dataScope: "GLOBAL",
      description: "Accès total et configuration de l'infrastructure",
      allowedCodes: allPermissions.map((p) => p.code),
    },

    {
      code: "CAISSIER",
      niveau: 10,
      nom: "Caissier / Guichetier",
      dataScope: "AGENCE",
      description: "Gestion opérationnelle quotidienne des dépôts/retraits",
      allowedCodes: ["operation.create", "operation.read"],
    },

    {
      code: "CHEF_AGENCE",
      niveau: 50,
      nom: "Chef d'Agence",
      dataScope: "AGENCE",
      description: "Superviseur d'agence locale",
      allowedCodes: ["operation.read", "operation.validate", "brouillard.read"],
    },

    {
      code: "AUDITEUR",
      niveau: 60,
      nom: "Auditeur",
      dataScope: "GLOBAL",
      description: "Contrôle de conformité et inspection",
      allowedCodes: ["audit.read"],
    },

    {
      code: "CONTROLEUR",
      niveau: 70,
      nom: "Contrôleur Permanent",
      dataScope: "GLOBAL",
      description: "Validation de second niveau et gestion des anomalies",
      allowedCodes: ["operation.validate", "operation.reject", "audit.read"],
    },

    {
      code: "DIRECTION",
      niveau: 80,
      nom: "Direction Générale",
      dataScope: "GLOBAL",
      description: "Consultation et pilotage stratégique global",
      allowedCodes: [
        "user.read",
        "operation.read",
        "audit.read",
        "brouillard.read",
        "agence.read",
      ],
    },

    {
      code: "COMPTABLE",
      niveau: 20,
      nom: "Comptable",
      dataScope: "AGENCE",
      description: "Gestion des écritures financières et du grand livre",
      allowedCodes: [
        "brouillard.read",
        "operation.read",
        "ts10.read",
        "ts10.update",
      ],
    },
  ];

  for (const sysRole of systemRoles) {
    const roleObj = await prisma.role.upsert({
      where: {
        code: sysRole.code,
      },

      update: {
        nom: sysRole.nom,
        niveau: sysRole.niveau,
        dataScope: sysRole.dataScope as DataScope,
        description: sysRole.description,
        isSystem: true,
        actif: true,
      },

      create: {
        code: sysRole.code,
        nom: sysRole.nom,
        niveau: sysRole.niveau,
        dataScope: sysRole.dataScope as DataScope,
        description: sysRole.description,
        isSystem: true,
        actif: true,
      },
    });

    const permissions = sysRole.allowedCodes
      .map((code) => permMap.get(code))
      .filter((id): id is string => !!id);

    for (const permissionId of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: roleObj.id,
            permissionId,
          },
        },

        update: {},

        create: {
          roleId: roleObj.id,
          permissionId,
        },
      });
    }
  }

  console.log("Rôles système et permissions injectés avec succès.");
}
