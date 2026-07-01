/**
 * Accès centralisé et validé aux variables d'environnement.
 * Toute lecture de import.meta.env doit passer par ce module.
 */

function requireEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key]
  if (value === undefined || value === '') {
    throw new Error(`Variable d'environnement manquante : ${key}`)
  }
  return value
}

export const env = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL'),
  apiTimeout: Number(requireEnv('VITE_API_TIMEOUT')),
  appName: requireEnv('VITE_APP_NAME'),
  appVersion: requireEnv('VITE_APP_VERSION'),
} as const

export type Env = typeof env
