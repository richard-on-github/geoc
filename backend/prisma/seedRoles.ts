import { prisma } from "../src/config/prisma.js";

export async function seedRoles() {
  console.log("Début du seeding des rôles système...");

  const allPermissions = await prisma.permission.findMany();
  const permMap = new Map(allPermissions.map((p) => [p.code, p.id]));

  const systemRoles = [
    { code: "ADMIN", nom: "Administrateur Système", description: "Accès total et configuration de l'infrastructure", allowedCodes: allPermissions.map(p => p.code) },
    { code: "CAISSIER", nom: "Caissier / Guichetier", description: "Gestion opérationnelle quotidienne des dépôts/retraits", allowedCodes: ["operation.create", "operation.read"] },
    { code: "CHEF_AGENCE", nom: "Chef d'Agence", description: "Superviseur d'agence locale", allowedCodes: ["operation.read", "operation.validate", "brouillard.read"] },
    { code: "AUDITEUR", nom: "Auditeur", description: "Contrôle de conformité et inspection", allowedCodes: ["audit.read"] },
    { code: "CONTROLEUR", nom: "Contrôleur Permanent", description: "Validation de second niveau et gestion des anomalies", allowedCodes: ["operation.validate", "operation.reject", "audit.read"] },
    { code: "DIRECTION", nom: "Direction Générale", description: "Consultation et pilotage stratégique global", allowedCodes: ["user.read", "operation.read", "audit.read", "brouillard.read", "agence.read"] },
    { code: "COMPTABLE", nom: "Comptable", description: "Gestion des écritures financières et du grand livre", allowedCodes: ["brouillard.read", "operation.read", "ts10.read", "ts10.update"] }
  ];

  for (const sysRole of systemRoles) {
    const roleObj = await prisma.role.upsert({
      where: { code: sysRole.code },
      update: {
        nom: sysRole.nom,
        description: sysRole.description,
        isSystem: true,
        actif: true,
      },
      create: {
        code: sysRole.code,
        nom: sysRole.nom,
        description: sysRole.description,
        isSystem: true,
        actif: true,
      },
    });

    // Liaison des permissions associées au rôle
    const entriesToConnect = sysRole.allowedCodes
      .map(code => permMap.get(code))
      .filter((id): id is string => !!id);

    for (const pId of entriesToConnect) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: roleObj.id,
            permissionId: pId,
          },
        },
        update: {},
        create: {
          roleId: roleObj.id,
          permissionId: pId,
        },
      });
    }
  }

  console.log("Rôles système et liaisons de permissions injectés avec succès.");
}