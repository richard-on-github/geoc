import { cn } from '@/shared/lib'
import { formatCurrency } from '@/shared/utils'
import type { BrouillardResult } from '../types'

interface BrouillardTableProps {
  brouillard: BrouillardResult
}

export function BrouillardTable({ brouillard }: BrouillardTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-(--radius) border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div>
            <span className="text-[hsl(var(--muted-foreground))]">N° Registre</span>
            <p className="font-semibold">{brouillard.numeroRegistre}</p>
          </div>
          <div>
            <span className="text-[hsl(var(--muted-foreground))]">Entre le</span>
            <p className="font-semibold">
              {brouillard.dateDebut
                ? new Date(brouillard.dateDebut).toLocaleDateString()
                : 'Depuis le début'}
            </p>
          </div>
          <div>
            <span className="text-[hsl(var(--muted-foreground))]">Et le</span>
            <p className="font-semibold">
              {brouillard.dateFin
                ? new Date(brouillard.dateFin).toLocaleDateString()
                : "Jusqu'à aujourd'hui"}
            </p>
          </div>
          <div>
            <span className="text-[hsl(var(--muted-foreground))]">Solde final</span>
            <p className="font-semibold">{formatCurrency(brouillard.soldeFinal)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))] shadow-sm">
        <table className="w-full text-sm" aria-label="Brouillard">
          <thead className="bg-[hsl(var(--muted))]">
            <tr>
              {[
                'Num Pièce',
                'Libellé opérations',
                'Date',
                'Recettes',
                'Dépenses',
                'Solde',
                'Type',
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
            {brouillard.lignes.map((ligne, index) => (
              <tr
                key={`${ligne.numeroPiece || 'ouverture'}-${String(index)}`}
                className={cn(ligne.type === 'A' && 'bg-gray-50 italic')}
              >
                <td className="px-4 py-3 whitespace-nowrap">{ligne.numeroPiece || '-'}</td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{ligne.libelle}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(ligne.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {ligne.recettes > 0 ? formatCurrency(ligne.recettes) : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  {ligne.depenses > 0 ? formatCurrency(ligne.depenses) : '-'}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(ligne.solde)}
                </td>
                <td className="px-4 py-3 text-center">{ligne.type}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-[hsl(var(--border))] bg-[hsl(var(--muted))] font-semibold">
            <tr>
              <td className="px-4 py-3" colSpan={3}>
                TOTAL
              </td>
              <td className="px-4 py-3 text-right">{formatCurrency(brouillard.totalRecettes)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(brouillard.totalDepenses)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(brouillard.soldeFinal)}</td>
              <td className="px-4 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
