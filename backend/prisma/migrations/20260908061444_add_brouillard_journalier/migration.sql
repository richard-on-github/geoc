-- CreateEnum
CREATE TYPE "StatutAnomalieBrouillard" AS ENUM ('OK', 'MOINS_VERSE', 'MOINS_VERSE_RETARD', 'RETARD', 'NON_VERSE', 'TROP_VERSE', 'ANOMALIE');

-- CreateEnum
CREATE TYPE "StatutBrouillard" AS ENUM ('OUVERT', 'CLOTURE', 'VALIDE', 'REJETE');

-- CreateTable
CREATE TABLE "Brouillard" (
    "id" TEXT NOT NULL,
    "venteId" TEXT NOT NULL,
    "journee" TIMESTAMP(3) NOT NULL,
    "agenceId" TEXT,
    "numeroTS10" TEXT NOT NULL,
    "ventes" DECIMAL(14,2) NOT NULL,
    "gainsPayes" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "soldeAttendu" DECIMAL(14,2) NOT NULL,
    "montantVerse" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "ecart" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "penalite" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "situation" TEXT,
    "statutAnomalie" "StatutAnomalieBrouillard" NOT NULL DEFAULT 'OK',
    "statut" "StatutBrouillard" NOT NULL DEFAULT 'OUVERT',
    "clotureParId" TEXT,
    "clotureAt" TIMESTAMP(3),
    "valideParId" TEXT,
    "valideAt" TIMESTAMP(3),
    "rejeteParId" TEXT,
    "rejeteAt" TIMESTAMP(3),
    "rejetRaison" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brouillard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brouillard_venteId_key" ON "Brouillard"("venteId");

-- CreateIndex
CREATE INDEX "Brouillard_numeroTS10_idx" ON "Brouillard"("numeroTS10");

-- CreateIndex
CREATE INDEX "Brouillard_journee_idx" ON "Brouillard"("journee");

-- CreateIndex
CREATE INDEX "Brouillard_statut_idx" ON "Brouillard"("statut");

-- AddForeignKey
ALTER TABLE "Brouillard" ADD CONSTRAINT "Brouillard_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "Vente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brouillard" ADD CONSTRAINT "Brouillard_clotureParId_fkey" FOREIGN KEY ("clotureParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brouillard" ADD CONSTRAINT "Brouillard_valideParId_fkey" FOREIGN KEY ("valideParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brouillard" ADD CONSTRAINT "Brouillard_rejeteParId_fkey" FOREIGN KEY ("rejeteParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
