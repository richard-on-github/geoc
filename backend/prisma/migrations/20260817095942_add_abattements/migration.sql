-- CreateTable
CREATE TABLE "AbattementParametres" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "heureLimiteUTC" INTEGER NOT NULL DEFAULT 13,
    "tauxRetard" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "tauxMoinsVerse" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "tauxMoinsVerseAvecRetard" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "tauxNonVerse" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedParId" TEXT,

    CONSTRAINT "AbattementParametres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbattementVersement" (
    "id" TEXT NOT NULL,
    "venteId" TEXT NOT NULL,
    "montantVerse" DECIMAL(65,30) NOT NULL,
    "dateVersement" TIMESTAMP(3) NOT NULL,
    "renseigneParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbattementVersement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AbattementVersement_venteId_key" ON "AbattementVersement"("venteId");

-- AddForeignKey
ALTER TABLE "AbattementParametres" ADD CONSTRAINT "AbattementParametres_updatedParId_fkey" FOREIGN KEY ("updatedParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbattementVersement" ADD CONSTRAINT "AbattementVersement_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "Vente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbattementVersement" ADD CONSTRAINT "AbattementVersement_renseigneParId_fkey" FOREIGN KEY ("renseigneParId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
