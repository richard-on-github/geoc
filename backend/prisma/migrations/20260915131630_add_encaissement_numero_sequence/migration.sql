/*
  Warnings:

  - A unique constraint covering the columns `[numeroSequence]` on the table `Encaissement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Encaissement" ADD COLUMN     "numeroSequence" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Encaissement_numeroSequence_key" ON "Encaissement"("numeroSequence");
