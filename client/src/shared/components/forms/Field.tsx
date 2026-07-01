import React from 'react'

interface FieldProps {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}

export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[hsl(var(--foreground))]">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  )
}
