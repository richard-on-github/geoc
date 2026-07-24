import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { venteService } from "../modules/ventes/vente.service.js";
import { parseExcelToVenteRows } from "../utils/excel-parser.js";
import { prisma } from "../config/prisma.js";
import cron from "node-cron";

const imapConfig = {
  host: process.env.IMAP_HOST || "imap.gmail.com",
  port: parseInt(process.env.IMAP_PORT || "993", 10),
  secure: true,
  auth: {
    user: process.env.IMAP_USER || "votre-email@gmail.com",
    pass: process.env.IMAP_PASSWORD || "votre-mot-de-passe-d-application",
  },
};

let isJobRunning = false;

export async function checkAndImportEmails() {
  if (isJobRunning) {
    console.log(
      "[IMAP Job] Job précédent toujours en cours, ignorance du tour.",
    );
    return;
  }
  isJobRunning = true;

  const client = new ImapFlow({
    ...imapConfig,
    logger: false,
  });

  try {
    console.log("[IMAP Job] Connexion au serveur IMAP...");
    await client.connect();

    await client.mailboxOpen("INBOX");
    const lock = await client.getMailboxLock("INBOX");

    try {
      // 1. CORRECTION : Recherche des NON LUS (seen: false) ET récupération des UIDs (uid: true)
      const uids = await client.search({ seen: false }, { uid: true });

      console.log(`[IMAP Job] ${uids.length} mail(s) non lu(s) trouvé(s).`);

      if (uids.length === 0) return;

      const systemUser = await prisma.user.findUnique({
        where: { email: "system@geoc.com" },
      });

      if (!systemUser?.id) {
        throw new Error(
          "Aucun utilisateur SYSTEM trouvé dans la base de données.",
        );
      }

      // 2. Boucle sur les vrais UIDs
      for (const uid of uids) {
        console.log(`[IMAP Job] Traitement du mail réel UID=${uid}`);

        try {
          const emailRaw = await client.download(uid, undefined, { uid: true });
          const parsedEmail = await simpleParser(emailRaw.content);

          if (
            !parsedEmail.attachments ||
            parsedEmail.attachments.length === 0
          ) {
            console.log(`[IMAP Job] UID=${uid} : Aucun fichier joint.`);
          } else {
            // 3. CORRECTION : Détection robuste (MIME Type OU Extension du fichier)
            for (const attachment of parsedEmail.attachments) {
              const filename = attachment.filename || "";
              const isValidExtension = /\.(xlsx|xls|csv)$/i.test(filename);
              const isValidMime = [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "text/csv",
                "application/octet-stream",
              ].includes(attachment.contentType);

              if (!isValidExtension && !isValidMime) {
                console.log(
                  `[IMAP Job] Fichier ignoré (format non supporté) : ${filename}`,
                );
                continue;
              }

              console.log(
                `[IMAP Job] Import en cours de ${filename} (Taille: ${attachment.size} octets)...`,
              );

              try {
                // attachment.content est un Buffer Node.js natif
                const parsedRows = await parseExcelToVenteRows(
                  attachment.content,
                );

                await venteService.importVentes(
                  attachment.content,
                  parsedRows,
                  filename || "import_auto.xlsx",
                  systemUser.id,
                  "127.0.0.1",
                );

                console.log(`[IMAP Job] ✅ Import réussi pour : ${filename}`);
              } catch (error: any) {
                console.error(
                  `[IMAP Job] ❌ Erreur import sur ${filename}:`,
                  error.message,
                );
                // Astuce : tu pourrais décider ici de ne pas marquer le mail comme lu en faisant un `continue`
              }
            }
          }

          // 4. CORRECTION : Marquage propre comme LU sur le bon UID
          await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
          console.log(
            `[IMAP Job] Mail UID=${uid} marqué comme lu avec succès.`,
          );
        } catch (error) {
          console.error(
            `[IMAP Job] Erreur globale sur le traitement du mail UID=${uid}`,
            error,
          );
        }
      }
    } finally {
      lock.release();
    }
  } catch (error) {
    console.error("[IMAP Job] Erreur de connexion/IMAP :", error);
  } finally {
    try {
      if (client.usable) await client.logout();
    } catch {
      // Ignorer les erreurs de fermeture
    }
    console.log("[IMAP Job] Déconnexion IMAP et fin du cycle.");
    isJobRunning = false; // Libération du verrou pour le prochain Cron
  }
}

export const startImapImportCron = () => {
  console.log(
    `[Cron] Job IMAP démarré (planifié toutes les ${process.env.IMAP_JOB_FREQUENCE} min).`,
  );
  cron.schedule(`*/${process.env.IMAP_JOB_FREQUENCE} * * * *`, async () => {
    console.log("[Cron] Déclenchement périodique de la vérification...");
    await checkAndImportEmails();
  });
};
