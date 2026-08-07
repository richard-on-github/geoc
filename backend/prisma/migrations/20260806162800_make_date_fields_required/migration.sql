/*
  Warnings:

  - Made the column `annee` on table `Vente` required. This step will fail if there are existing NULL values in that column.
  - Made the column `jourAnnee` on table `Vente` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mois` on table `Vente` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Vente" ALTER COLUMN "annee" SET NOT NULL,
ALTER COLUMN "jourAnnee" SET NOT NULL,
ALTER COLUMN "mois" SET NOT NULL;
