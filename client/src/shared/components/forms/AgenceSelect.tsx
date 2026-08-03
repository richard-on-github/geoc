import { forwardRef } from 'react'
import { useAgences } from '@/features/agences/hooks'

export const AgenceSelect = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  (props, ref) => {
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
  },
)
