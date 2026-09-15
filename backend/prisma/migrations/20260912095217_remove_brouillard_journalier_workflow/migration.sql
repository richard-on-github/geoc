/*
  Warnings:

  - You are about to drop the `Brouillard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Brouillard" DROP CONSTRAINT "Brouillard_clotureParId_fkey";

-- DropForeignKey
ALTER TABLE "Brouillard" DROP CONSTRAINT "Brouillard_rejeteParId_fkey";

-- DropForeignKey
ALTER TABLE "Brouillard" DROP CONSTRAINT "Brouillard_valideParId_fkey";

-- DropForeignKey
ALTER TABLE "Brouillard" DROP CONSTRAINT "Brouillard_venteId_fkey";

-- DropTable
DROP TABLE "Brouillard";

-- DropEnum
DROP TYPE "StatutAnomalieBrouillard";

-- DropEnum
DROP TYPE "StatutBrouillard";
