/*
  Warnings:

  - You are about to drop the `AbattementVersement` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatutEncaissement" AS ENUM ('NON_ENCAISSE', 'PARTIEL', 'COMPLET');

-- DropForeignKey
ALTER TABLE "AbattementVersement" DROP CONSTRAINT "AbattementVersement_renseigneParId_fkey";

-- DropForeignKey
ALTER TABLE "AbattementVersement" DROP CONSTRAINT "AbattementVersement_venteId_fkey";

-- AlterTable
ALTER TABLE "Vente" ADD COLUMN     "statutEncaissement" "StatutEncaissement" NOT NULL DEFAULT 'NON_ENCAISSE';

-- DropTable
DROP TABLE "AbattementVersement";

-- CreateTable
CREATE TABLE "Encaissement" (
    "id" TEXT NOT NULL,
    "venteId" TEXT NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "dateEncaissement" TIMESTAMP(3) NOT NULL,
    "enregistreParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Encaissement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Encaissement_venteId_idx" ON "Encaissement"("venteId");

-- AddForeignKey
ALTER TABLE "Encaissement" ADD CONSTRAINT "Encaissement_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "Vente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encaissement" ADD CONSTRAINT "Encaissement_enregistreParId_fkey" FOREIGN KEY ("enregistreParId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
