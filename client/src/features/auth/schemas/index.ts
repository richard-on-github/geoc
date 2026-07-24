import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, "L'adresse email est requise").email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(1, 'Confirmation requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>
