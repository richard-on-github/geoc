import { sendMail } from "../../utils/mailer.js";

export interface ImportResultDetail {
  filename: string;
  count?: number;
  error?: string;
}

interface SendVenteImportNotificationParams {
  /** Libellé de la source, affiché dans le mail (ex: "Import manuel", "Import automatique (IMAP)"). */
  source: string;
  /** Email de la personne (utilisateur connecté) ou de l'expéditeur (mail IMAP) à l'origine de l'import. */
  actor: string;
  periode: string;
  succeeded: ImportResultDetail[];
  failed: ImportResultDetail[];
  /** Uniquement pertinent pour un import déclenché par un mail entrant (threading IMAP). */
  originalSubject?: string;
  inReplyTo?: string;
  references?: string;
}

/**
 * Envoie un mail récapitulatif à la boîte IMAP_USER (utilisée comme boîte de
 * notification centrale de l'application) après un import de ventes, qu'il
 * soit manuel (upload depuis l'UI) ou automatique (pièce jointe IMAP).
 * N'envoie rien si aucun fichier n'a été traité. Ne fait jamais échouer
 * l'appelant : toute erreur d'envoi est capturée et loguée ici.
 */
export async function sendVenteImportNotification(
  params: SendVenteImportNotificationParams,
): Promise<void> {
  const {
    source,
    actor,
    periode,
    succeeded,
    failed,
    originalSubject,
    inReplyTo,
    references,
  } = params;

  if (succeeded.length === 0 && failed.length === 0) {
    return;
  }

  const destinataire = process.env.IMAP_USER;
  if (!destinataire) {
    console.error(
      "[Notification Import] IMAP_USER non défini, impossible d'envoyer le mail de confirmation.",
    );
    return;
  }

  const subject = `[Import ventes] ${source} — ${originalSubject || `Période ${periode}`}`;

  const lignesSucces = succeeded
    .map((f) => `  ✅ ${f.filename} — ${f.count ?? 0} ligne(s) importée(s)`)
    .join("\n");
  const lignesEchec = failed
    .map((f) => `  ❌ ${f.filename} — ${f.error || "Erreur inconnue"}`)
    .join("\n");

  const text = [
    `Source : ${source}`,
    `Importé par : ${actor}`,
    `Période concernée : ${periode}`,
    "",
    succeeded.length > 0
      ? `Fichier(s) importé(s) avec succès :\n${lignesSucces}`
      : null,
    failed.length > 0 ? `Fichier(s) en échec :\n${lignesEchec}` : null,
    "",
    "Ceci est un message automatique, merci de ne pas y répondre directement.",
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    await sendMail({
      to: destinataire,
      subject,
      text,
      inReplyTo,
      references,
    });
    console.log(
      `[Notification Import] Mail de confirmation envoyé à ${destinataire}.`,
    );
  } catch (error: any) {
    console.error(
      `[Notification Import] Échec de l'envoi du mail de confirmation à ${destinataire} :`,
      error.message,
    );
  }
}