import { NOMS_MOIS } from '../../../shared/utils'

interface VentePeriodeControlsProps {
  annee: number
  /** Si fourni (avec onChangeMois), affiche aussi le sélecteur de mois. */
  mois?: number
  onChangeAnnee: (annee: number) => void
  onChangeMois?: (mois: number) => void
}

/** Nombre d'années passées/futures proposées dans le sélecteur, autour de l'année courante. */
const ANNEES_PASSEES = 10
const ANNEES_FUTURES = 1

export function VentePeriodeControls({
  annee,
  mois,
  onChangeAnnee,
  onChangeMois,
}: VentePeriodeControlsProps) {
  const anneeActuelle = new Date().getUTCFullYear()
  const anneeMin = Math.min(anneeActuelle - ANNEES_PASSEES, annee)
  const anneeMax = Math.max(anneeActuelle + ANNEES_FUTURES, annee)
  const annees = Array.from({ length: anneeMax - anneeMin + 1 }, (_, i) => anneeMax - i)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label
          htmlFor="vente-periode-annee"
          className="text-xs font-medium text-[hsl(var(--muted-foreground))]"
        >
          Année
        </label>
        <select
          id="vente-periode-annee"
          value={annee}
          onChange={(e) => {
            onChangeAnnee(Number(e.target.value))
          }}
          className="rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-1.5 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
        >
          {annees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {mois !== undefined && onChangeMois && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="vente-periode-mois"
            className="text-xs font-medium text-[hsl(var(--muted-foreground))]"
          >
            Mois
          </label>
          <select
            id="vente-periode-mois"
            value={mois}
            onChange={(e) => {
              onChangeMois(Number(e.target.value))
            }}
            className="rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-1.5 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
          >
            {NOMS_MOIS.map((nom, index) => (
              <option key={nom} value={index + 1}>
                {nom}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
