import { prisma } from "../src/config/prisma.js";

export const permissionsData = [
  { code: "user.create", nom: "Créer un utilisateur", description: "Permet de créer un nouvel utilisateur" },
  { code: "user.read", nom: "Voir les utilisateurs", description: "Permet de lister et visualiser les fiches utilisateurs" },
  { code: "user.update", nom: "Modifier un utilisateur", description: "Permet de modifier les informations des utilisateurs" },
  { code: "user.delete", nom: "Supprimer un utilisateur", description: "Permet de supprimer un utilisateur" },
  
  { code: "role.create", nom: "Créer un rôle", description: "Permet de créer un nouveau rôle" },
  { code: "role.read", nom: "Voir les rôles", description: "Permet de visualiser les rôles existants" },
  { code: "role.update", nom: "Modifier un rôle", description: "Permet d'altérer les droits des rôles" },
  { code: "role.delete", nom: "Supprimer un rôle", description: "Permet d'effacer un rôle" },
  
  { code: "permission.create", nom: "Créer une permission", description: "Permet de créer une clé de permission" },
  { code: "permission.read", nom: "Voir les permissions", description: "Permet de voir le catalogue des permissions globale" },
  { code: "permission.update", nom: "Modifier une permission", description: "Permet de modifier une permission" },
  { code: "permission.delete", nom: "Supprimer une permission", description: "Permet de détruire une permission" },
  
  { code: "audit.read", nom: "Consulter les audits logs", description: "Permet de lire les traces d'audit de l'écosystème" },
  
  { code: "operation.create", nom: "Créer une opération", description: "Permet d'ouvrir une opération bancaire ou financière" },
  { code: "operation.read", nom: "Visualiser les opérations", description: "Permet de consulter le détail d'une opération" },
  { code: "operation.validate", nom: "Valider une opération", description: "Permet d'approuver formellement une opération" },
  { code: "operation.reject", nom: "Rejeter une opération", description: "Permet d'opposer un refus sur une opération" },
  
  { code: "brouillard.read", nom: "Lire le brouillard", description: "Permet de consulter le brouillard de caisse" },
  { code: "brouillard.close", nom: "Clôturer le brouillard", description: "Permet de valider et fermer le brouillard journalier" },
  
  { code: "garantie.read", nom: "Consulter les garanties", description: "Permet de lire les pièces et dossiers de garanties" },
  { code: "garantie.update", nom: "Mettre à jour les garanties", description: "Permet d'éditer ou de restructurer les garanties" },
  
  { code: "agence.create", nom: "Créer une agence", description: "Permet d'ajouter une succursale au système informatique" },
  { code: "agence.read", nom: "Visualiser les agences", description: "Permet de voir le parc d'agences" },
  { code: "agence.update", nom: "Modifier une agence", description: "Permet de modifier les configurations géographiques ou de structures" },
  
  { code: "caisse.create", nom: "Créer une caisse", description: "Permet de créer un guichet de caisse physique/virtuel" },
  { code: "caisse.read", nom: "Voir les caisses", description: "Permet de monitorer le statut des caisses" },
  { code: "caisse.update", nom: "Modifier une caisse", description: "Permet de modifier l'affectation ou les plafonds de caisse" },
  
  { code: "ts10.create", nom: "Créer un TS10", description: "Permet d'initier une transaction ou un document de type TS10" },
  { code: "ts10.read", nom: "Consulter les TS10", description: "Permet la consultation des documents de régularisation TS10" },
  { code: "ts10.update", nom: "Modifier un TS10", description: "Permet de restructurer un flux TS10" }
];

export async function seedPermissions() {
  console.log("Début du seeding des permissions...");
  for (const item of permissionsData) {
    await prisma.permission.upsert({
      where: { code: item.code },
      update: { nom: item.nom, description: item.description },
      create: item,
    });
  }
  console.log("Permissions synchronisées avec succès.");
}