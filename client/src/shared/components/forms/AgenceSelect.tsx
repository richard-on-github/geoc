import { forwardRef } from 'react'
import { useAgences } from '@/features/agences/hooks' // ou depuis un point d'export global

interface AgenceSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const AgenceSelect = forwardRef<HTMLSelectElement, AgenceSelectProps>((props, ref) => {
  const { data, isLoading } = useAgences({ limit: 100, page: 1 })

  return (
    <select ref={ref} {...props} disabled={isLoading || props.disabled}>
      <option value="">Aucune agence</option>
      {data?.items.map((agence) => (
        <option key={agence.id} value={agence.id}>
          {agence.nom} ({agence.code})
        </option>
      ))}
    </select>
  )
})
AgenceSelect.displayName = 'AgenceSelect'
