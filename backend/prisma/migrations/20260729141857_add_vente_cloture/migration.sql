-- CreateEnum
CREATE TYPE "StatutCloture" AS ENUM ('OUVERT', 'CLOTURE');

-- AlterTable
ALTER TABLE "Vente" ADD COLUMN     "clotureId" TEXT;

-- CreateTable
CREATE TABLE "VenteCloture" (
    "id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "dateCloture" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalVentes" DECIMAL(12,2) NOT NULL,
    "totalPayes" DECIMAL(12,2) NOT NULL,
    "totalSoldes" DECIMAL(12,2) NOT NULL,
    "nbLignes" INTEGER NOT NULL,
    "clotureParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenteCloture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VenteCloture_periode_key" ON "VenteCloture"("periode");

-- AddForeignKey
ALTER TABLE "Vente" ADD CONSTRAINT "Vente_clotureId_fkey" FOREIGN KEY ("clotureId") REFERENCES "VenteCloture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenteCloture" ADD CONSTRAINT "VenteCloture_clotureParId_fkey" FOREIGN KEY ("clotureParId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
