import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'adresse email est requise')
    .email('Adresse email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Le mot de passe actuel est requis'),
    newPassword: z
      .string()
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre'),
    confirmPassword: z
      .string()
      .min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export const resetPasswordRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'adresse email est requise')
    .email('Adresse email invalide'),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre'),
    confirmPassword: z
      .string()
      .min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
export type ResetPasswordRequestFormValues = z.infer<typeof resetPasswordRequestSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
