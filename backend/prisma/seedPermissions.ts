import { prisma } from "../src/config/prisma.js";

export interface PermissionItem {
    code: string;
    nom: string;
    description: string;
}

export const permissionsData: readonly PermissionItem[] = [
    {
        code: "user.create",
        nom: "Créer un utilisateur",
        description: "Permet de créer un nouvel utilisateur dans le système.",
    },
    {
        code: "user.read",
        nom: "Consulter les utilisateurs",
        description: "Permet de lister et de consulter les profils des utilisateurs.",
    },
    {
        code: "user.update",
        nom: "Modifier un utilisateur",
        description: "Permet de modifier les informations et paramètres d'un utilisateur.",
    },
    {
        code: "user.delete",
        nom: "Supprimer un utilisateur",
        description: "Permet de supprimer ou de désactiver le compte d'un utilisateur.",
    },

    {
        code: "role.create",
        nom: "Créer un rôle",
        description: "Permet de créer un nouveau rôle personnalisé.",
    },
    {
        code: "role.read",
        nom: "Consulter les rôles",
        description: "Permet de consulter la liste des rôles existants.",
    },
    {
        code: "role.update",
        nom: "Modifier un rôle",
        description: "Permet de modifier les droits et habilitations attribués à un rôle.",
    },
    {
        code: "role.delete",
        nom: "Supprimer un rôle",
        description: "Permet de supprimer un rôle du système.",
    },
    {
        code: "permission.read",
        nom: "Consulter les permissions",
        description: "Permet de consulter le catalogue global des permissions.",
    },

    {
        code: "audit.read",
        nom: "Consulter le journal d'audit",
        description: "Permet de consulter les traces d'audit et l'historique des actions du système.",
    },

    {
        code: "agence.create",
        nom: "Créer une agence",
        description: "Permet d'ajouter une nouvelle agence au système.",
    },
    {
        code: "agence.read",
        nom: "Consulter les agences",
        description: "Permet de consulter la liste et les informations des agences.",
    },
    {
        code: "agence.update",
        nom: "Modifier une agence",
        description: "Permet de modifier les configurations et informations d'une agence.",
    },
    {
        code: "agence.delete",
        nom: "Supprimer une agence",
        description: "Permet de retirer ou de désactiver une agence du système.",
    },

    {
        code: "vente.read",
        nom: "Consulter les ventes",
        description: "Permet de consulter le catalogue et l'historique détaillé des ventes.",
    },
    {
        code: "vente.import",
        nom: "Importer des ventes",
        description:
            "Permet d'intégrer des flux de ventes (via fichiers Excel/CSV ou synchronisation IMAP).",
    },
    {
        code: "vente.cloture",
        nom: "Clôturer les ventes",
        description: "Permet de valider et clôturer manuellement les ventes d'une période mensuelle.",
    },
    {
        code: "vente.export.csv",
        nom: "Exporter les ventes (CSV)",
        description: "Permet de générer des rapports d'export des ventes au format CSV.",
    },
    {
        code: "vente.export.excel",
        nom: "Exporter les ventes (Excel)",
        description: "Permet de générer des rapports d'export des ventes au format Excel.",
    },
    {
        code: "vente.export.pdf",
        nom: "Exporter les ventes (PDF)",
        description: "Permet de générer des rapports d'export des ventes au format PDF.",
    },
    {
        code: "dashboard.read",
        nom: "Consulter le tableau de bord",
        description: "Permet de consulter le tableau de bord et ses indicateurs de performance.",
    },
] as const;

export async function seedPermissions(): Promise<void> {
    console.log(`Début de la synchronisation de ${permissionsData.length} permissions...`);
    const startTime = Date.now();

    try {
        for (const item of permissionsData) {
            await prisma.permission.upsert({
                where: {code: item.code},
                update: {
                    nom: item.nom,
                    description: item.description,
                },
                create: item,
            });
        }

        const duration = Date.now() - startTime;
        console.log(`Permissions synchronisées avec succès en ${duration} ms.`);
    } catch (error) {
        console.error("Erreur lors de la synchronisation des permissions :", error);
        throw error;
    }
}