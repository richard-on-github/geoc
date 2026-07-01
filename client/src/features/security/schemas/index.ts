import { z } from 'zod'

export const createRoleSchema = z.object({
  nom: z.string().min(1, 'Le nom du rôle est requis'),
  code: z
    .string()
    .min(1, 'Le code du rôle est requis')
    .regex(/^[a-zA-Z_]+$/, 'Le code ne doit contenir que des lettres et des underscores')
    .toUpperCase(),
  description: z.string().optional(),
  permissionIds: z.array(z.string().min(1)).optional().default([]),
})

export const updateRoleSchema = z.object({
  nom: z.string().min(1).optional(),
  code: z
    .string()
    .min(1, 'Le code du rôle est requis')
    .regex(/^[a-zA-Z_]+$/, 'Le code ne doit contenir que des lettres et des underscores')
    .toUpperCase(),
  description: z.string().optional(),
  actif: z.boolean().optional(),
  permissionIds: z.array(z.string().min(1)).optional(),
})

export const roleQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  search: z.string().optional(),
  actif: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true
      if (val === 'false') return false
      return undefined
    }),
})

export const roleIdParamsSchema = z.object({
  id: z.string().min(1, 'ID rôle requis'),
})

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>
export type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>
