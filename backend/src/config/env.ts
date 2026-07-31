import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().regex(/^\d+$/).transform(Number).default("3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requise"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET doit faire au moins 32 caractères"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("30m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  IMAP_USER: z.string().email("Adresse email IMAP invalide"),
  IMAP_PASSWORD: z.string().min(1, "Mot de passe IMAP requis"),
  IMAP_HOST: z.string().min(1, "Hôte IMAP requis"),
  IMAP_PORT: z.string().regex(/^\d+$/).transform(Number).default("993"),
  IMAP_JOB_FREQUENCE: z.string().regex(/^\d+$/).transform(Number).default("5"),

  ADMIN_EMAIL: z.string().email("Email administrateur invalide"),
  ADMIN_PASSWORD: z
    .string()
    .min(8, "Le mot de passe admin doit contenir au moins 8 caractères"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;