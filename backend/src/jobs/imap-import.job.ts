import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { venteService } from "../modules/ventes/vente.service.js";
import { emailAutoriseService } from "../modules/ventes/email-autorise/email-autorise.service.js";
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

function derivePeriodeFromEmailDate(emailDate: Date | undefined): string {
  const date =
    emailDate instanceof Date && !isNaN(emailDate.getTime())
      ? emailDate
      : new Date();
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  return `${annee}-${mois}`;
}

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
      const searchResult = await client.search({ seen: false }, { uid: true });

      if (searchResult === false) {
        console.log("[IMAP Job] Recherche IMAP impossible ou sans résultat.");
        return;
      }

      const uids = searchResult;

      console.log(`[IMAP Job] ${uids.length} mail(s) non lu(s) trouvé(s).`);

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

      for (const uid of uids) {
        console.log(`[IMAP Job] Traitement du mail réel UID=${uid}`);

        try {
          const emailRaw = await client.download(uid, undefined, { uid: true });
          const parsedEmail = await simpleParser(emailRaw.content);

          const senderEmail = parsedEmail.from?.value?.[0]?.address
            ?.trim()
            .toLowerCase();

          if (!senderEmail) {
            console.log(
              `[IMAP Job] UID=${uid} : impossible de déterminer l'expéditeur, mail ignoré.`,
            );
            await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
            continue;
          }

          const isSenderAutorise =
            await emailAutoriseService.isAutorise(senderEmail);

          if (!isSenderAutorise) {
            console.log(
              `[IMAP Job] UID=${uid} : expéditeur non autorisé (${senderEmail}), mail ignoré.`,
            );
            // On marque quand même le mail comme lu pour ne pas le retraiter
            // à chaque cycle du cron.
            await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
            continue;
          }

          const periode = derivePeriodeFromEmailDate(parsedEmail.date);

          if (
            !parsedEmail.attachments ||
            parsedEmail.attachments.length === 0
          ) {
            console.log(`[IMAP Job] UID=${uid} : Aucun fichier joint.`);
          } else {
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
                `[IMAP Job] Import en cours de ${filename} (Taille: ${attachment.size} octets, période: ${periode})...`,
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
                  periode,
                  systemUser.id,
                  "127.0.0.1",
                );

                console.log(`[IMAP Job] ✅ Import réussi pour : ${filename}`);
              } catch (error: any) {
                console.error(
                  `[IMAP Job] ❌ Erreur import sur ${filename}:`,
                  error.message,
                );
              }
            }
          }

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
    } catch {}
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
