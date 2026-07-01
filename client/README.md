# GEOC — Gestion Électronique des Opérations de la Caisse

Application interne LONATO Togo.

## Prérequis

- Node.js 20+
- npm 10+

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Copier les variables d'environnement
copy .env.example .env

# 3. Ajuster .env selon votre environnement local
# VITE_API_BASE_URL=http://localhost:4000/api

# 4. Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur http://localhost:3000

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | Vérification ESLint |
| `npm run lint:fix` | Correction automatique ESLint |
| `npm run format` | Formatage Prettier |
| `npm run type-check` | Vérification TypeScript sans build |

## Extensions VSCode recommandées

Ouvrir le projet dans VSCode affiche une notification pour installer les extensions recommandées (`.vscode/extensions.json`).

## Architecture

```
src/
  app/           # Configuration, providers, routeur, layouts
  features/      # Modules métier (auth, users, security, audit, dashboard)
  shared/        # Code partagé (composants, hooks, utils, types)
  styles/        # Design system Tailwind v4
  types/         # Types globaux (env.d.ts)
  assets/        # Ressources statiques
```

## Stack technique

React 19 · TypeScript strict · Vite · React Router v7 · TanStack Query · Zustand · Axios · Tailwind CSS v4 · shadcn/ui · React Hook Form · Zod · TanStack Table

## Ajouter des composants shadcn/ui

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
# etc.
```

Les composants sont générés dans `src/shared/ui/`.
