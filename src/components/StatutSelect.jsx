// ---------------------------------------------------------------------------
// Sélecteur de statut coloré, utilisable directement dans une ligne du tableau.
// ---------------------------------------------------------------------------

import { STATUTS } from '../lib/constants.js'

// Couleurs associées à chaque statut (badge + sélecteur).
const STYLES_STATUT = {
  Nouveau: 'bg-blue-100 text-blue-900 border-blue-300',
  'En cours': 'bg-amber-100 text-amber-900 border-amber-300',
  'En attente pièces': 'bg-purple-100 text-purple-900 border-purple-300',
  Validé: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  Clôturé: 'bg-gray-200 text-gray-700 border-gray-300',
}

export default function StatutSelect({ dossier, onChange }) {
  return (
    <select
      value={dossier.statut}
      onChange={(e) => onChange(dossier, e.target.value)}
      aria-label={`Statut du dossier ${dossier.numero}`}
      className={`w-full min-w-[9.5rem] cursor-pointer rounded-md border px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cnps-500 ${
        STYLES_STATUT[dossier.statut] || 'bg-gray-100 text-gray-800 border-gray-300'
      }`}
    >
      {STATUTS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  )
}
