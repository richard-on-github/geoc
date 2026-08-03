import React from 'react'

interface FieldProps {
  id: string
  label: string
  error?: string | undefined
  children: React.ReactNode
}

export function Field({ id, label, error, children }: FieldProps) {
  const hasError = typeof error === 'string' && error.trim().length > 0

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[hsl(var(--foreground))]">
        {label}
      </label>
      {children}
      {hasError && (
        <p role="alert" className="text-xs text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  )
}
