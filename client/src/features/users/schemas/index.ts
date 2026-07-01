import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().min(1, 'L\'email est requis').email('Email invalide'),
  prenom: z.string().min(1, 'Le prénom est requis').max(50),
  nom: z.string().min(1, 'Le nom est requis').max(50),
  roleId: z.string().min(1, 'Le rôle est requis'),
  telephone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre'),
  permissionIds: z.array(z.string().min(1)).optional().default([]),
})

export const updateUserSchema = z.object({
  email: z.string().min(1, 'L\'email est requis').email('Email invalide'),
  prenom: z.string().min(1, 'Le prénom est requis').max(50),
  nom: z.string().min(1, 'Le nom est requis').max(50),
  roleId: z.string().min(1, 'Le rôle est requis'),
  telephone: z.string().optional(),
  permissionIds: z.array(z.string().min(1)).optional().default([]),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
