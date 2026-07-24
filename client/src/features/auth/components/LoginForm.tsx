import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '../schemas'
import { useLogin } from '../hooks'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values: LoginFormValues) => {
    login(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Connexion</h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Accédez à votre espace GEOC
        </p>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--foreground))]">
          Adresse email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={errors.email !== undefined}
          disabled={isPending}
          className="w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]"
          placeholder="exemple@lonato.tg"
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-[hsl(var(--destructive))]">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Mot de passe */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[hsl(var(--foreground))]"
          >
            Mot de passe
          </label>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            aria-describedby={errors.password ? 'password-error' : undefined}
            aria-invalid={errors.password !== undefined}
            disabled={isPending}
            className="w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 pr-10 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]"
            placeholder="••••••••"
            {...register('password')}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            onClick={() => {
              setShowPassword((v) => !v)
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus-visible:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" role="alert" className="text-xs text-[hsl(var(--destructive))]">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        {isPending ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}
