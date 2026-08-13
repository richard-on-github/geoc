-- CreateTable
CREATE TABLE "EmailAutorise" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ajouteParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailAutorise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailAutorise_email_key" ON "EmailAutorise"("email");

-- AddForeignKey
ALTER TABLE "EmailAutorise" ADD CONSTRAINT "EmailAutorise_ajouteParId_fkey" FOREIGN KEY ("ajouteParId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
