// ---------------------------------------------------------------------------
// Journal d'un dossier ou d'un assuré : échanges avec l'assuré (appels,
// visites, emails…), notes internes et étapes de suivi, du plus récent au
// plus ancien. Filtrable : tout / échanges / suivi interne.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDateHeure } from '../lib/dates.js'

const STYLES_SUIVI = {
  creation: { libelle: 'Ouverture', classes: 'bg-blue-100 text-blue-800' },
  statut: { libelle: 'Statut', classes: 'bg-emerald-100 text-emerald-800' },
  affectation: { libelle: 'Affectation', classes: 'bg-purple-100 text-purple-800' },
  priorite: { libelle: 'Priorité', classes: 'bg-orange-100 text-orange-800' },
  note: { libelle: 'Note interne', classes: 'bg-gray-200 text-gray-700' },
}

// Les échanges sont distingués par sens : l'assuré nous contacte, ou l'inverse.
const STYLES_CANAL = {
  'Appel entrant': 'bg-sky-100 text-sky-800',
  'Appel sortant': 'bg-teal-100 text-teal-800',
  'Visite en agence': 'bg-amber-100 text-amber-800',
  Email: 'bg-indigo-100 text-indigo-800',
  Courrier: 'bg-stone-200 text-stone-800',
  WhatsApp: 'bg-green-100 text-green-800',
}

export function estEchange(evt) {
  return evt.type === 'interaction'
}

// Tri chronologique inverse sur l'instant réel (les événements de démo et
// les événements saisis n'ont pas le même format d'horodatage).
export function trierJournal(evenements) {
  return [...evenements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function Badge({ evt }) {
  if (estEchange(evt)) {
    return (
      <span
        className={`mt-0.5 h-fit shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
          STYLES_CANAL[evt.canal] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {evt.canal}
      </span>
    )
  }
  const style = STYLES_SUIVI[evt.type] || STYLES_SUIVI.note
  return (
    <span
      className={`mt-0.5 h-fit shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${style.classes}`}
    >
      {style.libelle}
    </span>
  )
}

const FILTRES = [
  { valeur: 'tout', libelle: 'Tout' },
  { valeur: 'echanges', libelle: "Échanges avec l'assuré" },
  { valeur: 'suivi', libelle: 'Suivi interne' },
]

// evenements : [{ ...evt, dossier? }] ; si "dossier" est fourni, un lien
// vers le dossier concerné est affiché (vue assuré, tous dossiers confondus).
export default function Journal({ evenements, messageVide }) {
  const [filtre, setFiltre] = useState('tout')

  const nbEchanges = evenements.filter(estEchange).length
  const visibles = trierJournal(evenements).filter((evt) => {
    if (filtre === 'echanges') return estEchange(evt)
    if (filtre === 'suivi') return !estEchange(evt)
    return true
  })

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1" role="group" aria-label="Filtrer le journal">
        {FILTRES.map((f) => (
          <button
            key={f.valeur}
            type="button"
            onClick={() => setFiltre(f.valeur)}
            aria-pressed={filtre === f.valeur}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filtre === f.valeur
                ? 'border-cnps-600 bg-cnps-600 text-white'
                : 'border-gray-300 bg-white text-gray-600 hover:border-cnps-400 hover:text-cnps-700'
            }`}
          >
            {f.libelle}
            {f.valeur === 'echanges' && ` (${nbEchanges})`}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="text-sm text-gray-400">{messageVide}</p>
      ) : (
        <ol className="space-y-3">
          {visibles.map((evt) => (
            <li key={evt.id} className="flex gap-3">
              <Badge evt={evt} />
              <div className="min-w-0">
                <p className="text-sm text-gray-800">{evt.texte}</p>
                <p className="text-xs text-gray-400">
                  {formatDateHeure(evt.date)}
                  {evt.agent && `, ${evt.agent}`}
                  {evt.dossier && (
                    <>
                      {' · '}
                      <Link
                        to={`/dossiers/${evt.dossier.id}`}
                        className="font-mono text-cnps-700 underline decoration-cnps-200 underline-offset-2 hover:decoration-cnps-600"
                      >
                        {evt.dossier.numero}
                      </Link>{' '}
                      ({evt.dossier.agence})
                    </>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
