-- This is an empty migration.
UPDATE "Vente"
SET
    "annee" = EXTRACT(YEAR FROM "dateDebut")::INTEGER,
  "mois" = EXTRACT(MONTH FROM "dateDebut")::INTEGER,
  "jourAnnee" = EXTRACT(DOY FROM "dateDebut")::INTEGER;