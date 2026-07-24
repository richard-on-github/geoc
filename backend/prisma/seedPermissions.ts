import {prisma} from "../src/config/prisma.js";

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
        code: "operation.create",
        nom: "Créer une opération",
        description: "Permet d'initier une nouvelle opération bancaire ou financière.",
    },
    {
        code: "operation.read",
        nom: "Consulter les opérations",
        description: "Permet de consulter l'historique et le détail des opérations.",
    },
    {
        code: "operation.validate",
        nom: "Valider une opération",
        description: "Permet d'approuver formellement une opération financière.",
    },
    {
        code: "operation.reject",
        nom: "Rejeter une opération",
        description: "Permet de refuser ou d'annuler une opération en attente.",
    },

    {
        code: "brouillard.read",
        nom: "Consulter le brouillard",
        description: "Permet de consulter le brouillard journalier de caisse.",
    },
    {
        code: "brouillard.close",
        nom: "Clôturer le brouillard",
        description: "Permet de vérifier, valider et clôturer le brouillard de caisse.",
    },

    {
        code: "garantie.read",
        nom: "Consulter les garanties",
        description: "Permet de consulter les dossiers et les pièces de garanties.",
    },
    {
        code: "garantie.update",
        nom: "Modifier les garanties",
        description: "Permet de modifier ou de restructurer les dossiers de garanties.",
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
        code: "caisse.create",
        nom: "Créer une caisse",
        description: "Permet de créer un nouveau guichet de caisse physique ou virtuel.",
    },
    {
        code: "caisse.read",
        nom: "Consulter les caisses",
        description: "Permet de consulter la liste et le statut des caisses.",
    },
    {
        code: "caisse.update",
        nom: "Modifier une caisse",
        description: "Permet de modifier l'affectation ou les plafonds d'une caisse.",
    },

    {
        code: "ts10.create",
        nom: "Créer un document TS10",
        description: "Permet d'initier une transaction ou un document de régularisation TS10.",
    },
    {
        code: "ts10.read",
        nom: "Consulter les documents TS10",
        description: "Permet de consulter l'historique et le détail des documents TS10.",
    },
    {
        code: "ts10.update",
        nom: "Modifier un document TS10",
        description: "Permet de modifier ou de restructurer un document TS10.",
    },

    // ==========================================
    // MODULE : VENTES
    // ==========================================
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
        code: "vente.export",
        nom: "Exporter des ventes",
        description:
            "Permet de générer des rapports d'export des ventes au format CSV, Excel ou PDF.",
    },

    {
        code: "dashboard.read",
        nom: "Consulter le tableau de bord",
        description: "Permet de consulter le tableau de bord et ses indicateurs de performance.",
    },
] as const;

export async function seedPermissions(): Promise<void> {
    console.log(`🚀 Début de la synchronisation de ${permissionsData.length} permissions...`);
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