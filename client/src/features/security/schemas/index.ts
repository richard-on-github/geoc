import { z } from 'zod'

export const createRoleSchema = z.object({
  nom: z.string().min(1, 'Le nom du rôle est requis'),
  code: z
    .string()
    .min(1, 'Le code du rôle est requis')
    .regex(/^[a-zA-Z_]+$/, 'Le code ne doit contenir que des lettres et des underscores')
    .toUpperCase(),
  description: z.string().optional(),
  dataScope: z.enum(['GLOBAL', 'AGENCE'], { required_error: 'Le scope est requis' }),
  niveau: z.number().int().min(0, 'Le niveau doit être un entier positif'),
  permissionIds: z.array(z.string().min(1)).optional().default([]),
})

export const updateRoleSchema = z.object({
  nom: z.string().min(1).optional(),
  code: z
    .string()
    .min(1, 'Le code est requis')
    .regex(/^[a-zA-Z_]+$/, 'Lettres et underscores uniquement')
    .toUpperCase()
    .optional(),
  description: z.string().optional(),
  dataScope: z.enum(['GLOBAL', 'AGENCE']).optional(),
  niveau: z.number().int().min(0).optional(),
  actif: z.boolean().optional(),
  permissionIds: z.array(z.string().min(1)).optional(),
})

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>
export type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>
