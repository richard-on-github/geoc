-- CreateEnum
CREATE TYPE "DataScope" AS ENUM ('GLOBAL', 'AGENCE');

-- CreateEnum
CREATE TYPE "TypeImport" AS ENUM ('MANUEL', 'EMAIL', 'API');

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "dataScope" "DataScope" NOT NULL DEFAULT 'AGENCE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "agenceId" TEXT;

-- CreateTable
CREATE TABLE "Agence" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenteImportLog" (
    "id" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "nomFichier" TEXT,
    "typeImport" "TypeImport" NOT NULL DEFAULT 'MANUEL',
    "lignes" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenteImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vente" (
    "id" TEXT NOT NULL,
    "agenceId" TEXT,
    "agenceNom" TEXT,
    "kiosque" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "banque" TEXT,
    "numeroTS10" TEXT NOT NULL,
    "totalVente" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "totalPaye" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "totalSolde" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "importId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agence_code_key" ON "Agence"("code");

-- CreateIndex
CREATE UNIQUE INDEX "VenteImportLog_fileHash_key" ON "VenteImportLog"("fileHash");

-- CreateIndex
CREATE INDEX "Vente_agenceId_idx" ON "Vente"("agenceId");

-- CreateIndex
CREATE INDEX "Vente_dateDebut_dateFin_idx" ON "Vente"("dateDebut", "dateFin");

-- CreateIndex
CREATE INDEX "Vente_numeroTS10_idx" ON "Vente"("numeroTS10");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenteImportLog" ADD CONSTRAINT "VenteImportLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vente" ADD CONSTRAINT "Vente_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vente" ADD CONSTRAINT "Vente_importId_fkey" FOREIGN KEY ("importId") REFERENCES "VenteImportLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
