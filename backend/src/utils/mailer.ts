import nodemailer from "nodemailer";

/**
 * Transport SMTP. Réutilise directement les identifiants IMAP déjà
 * configurés : un App Password Gmail donne accès à IMAP *et* SMTP sur le
 * même compte, donc aucune variable d'environnement supplémentaire n'est
 * nécessaire tant que le seul besoin est d'envoyer depuis/vers ce compte.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: true,
  auth: {
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASSWORD,
  },
});

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** Permet de répondre dans le même fil de discussion que le mail d'origine. */
  inReplyTo?: string;
  references?: string;
}

export async function sendMail(options: SendMailOptions): Promise<void> {
  await transporter.sendMail({
    from: process.env.IMAP_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    inReplyTo: options.inReplyTo,
    references: options.references,
  });
}