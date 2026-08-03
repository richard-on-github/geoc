function requireEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key] as string | undefined

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Variable d'environnement manquante : ${String(key)}`)
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
