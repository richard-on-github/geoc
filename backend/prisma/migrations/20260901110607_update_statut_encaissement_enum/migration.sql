/*
  Warnings:

  - The values [NON_ENCAISSE,PARTIEL,COMPLET] on the enum `StatutEncaissement` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatutEncaissement_new" AS ENUM ('NON_SOLDE', 'PARTIELLEMENT_SOLDE', 'SOLDE');
ALTER TABLE "public"."Vente" ALTER COLUMN "statutEncaissement" DROP DEFAULT;
ALTER TABLE "Vente" ALTER COLUMN "statutEncaissement" TYPE "StatutEncaissement_new" USING ("statutEncaissement"::text::"StatutEncaissement_new");
ALTER TYPE "StatutEncaissement" RENAME TO "StatutEncaissement_old";
ALTER TYPE "StatutEncaissement_new" RENAME TO "StatutEncaissement";
DROP TYPE "public"."StatutEncaissement_old";
ALTER TABLE "Vente" ALTER COLUMN "statutEncaissement" SET DEFAULT 'NON_SOLDE';
COMMIT;

-- AlterTable
ALTER TABLE "Vente" ALTER COLUMN "statutEncaissement" SET DEFAULT 'NON_SOLDE';
