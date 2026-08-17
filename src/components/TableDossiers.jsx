// ---------------------------------------------------------------------------
// Tableau compact de dossiers, réutilisé par l'accueil et la fiche matricule.
// Ligne cliquable → fiche dossier ; matricule cliquable → modale
// "Historique de l'assuré" (tous ses dossiers, toutes agences).
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STYLES_STATUT } from './StatutSelect.jsx'
import ModaleHistoriqueAssure from './ModaleHistoriqueAssure.jsx'
import { formatDate, delaiEnJours, enDepassement } from '../lib/dates.js'

export default function TableDossiers({ dossiers, delaiCible, messageVide }) {
  const navigate = useNavigate()
  const [matriculeOuvert, setMatriculeOuvert] = useState(null)

  if (dossiers.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-gray-400">{messageVide}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">N° dossier</th>
            <th scope="col" className="px-3 py-2 font-semibold">Reçu le</th>
            <th scope="col" className="px-3 py-2 font-semibold">Type</th>
            <th scope="col" className="px-3 py-2 font-semibold">Motif</th>
            <th scope="col" className="px-3 py-2 font-semibold">Matricule</th>
            <th scope="col" className="px-3 py-2 font-semibold">Agent</th>
            <th scope="col" className="px-3 py-2 font-semibold">Statut</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Délai</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {dossiers.map((d) => {
            const depasse = enDepassement(d, delaiCible)
            const enRetardOuvert = depasse && d.statut !== 'Clôturé'
            return (
              <tr
                key={d.id}
                onClick={() => navigate(`/dossiers/${d.id}`)}
                title="Ouvrir la fiche du dossier"
                className={`cursor-pointer ${
                  enRetardOuvert ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                }`}
              >
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs font-semibold text-gray-900">
                  {d.numero}
                  {d.priorite === 'Urgente' && (
                    <span className="ml-1.5 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">
                      Urgent
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                  {formatDate(d.dateReception)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">{d.type}</td>
                <td className="px-3 py-2 text-gray-800">{d.motif}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {/* Ouvre l'historique national de l'assuré (toutes agences) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMatriculeOuvert(d.matricule)
                    }}
                    title={`Historique de l'assuré ${d.matricule}`}
                    className="font-mono text-xs text-cnps-700 underline decoration-cnps-200 underline-offset-2 hover:decoration-cnps-600"
                  >
                    {d.matricule}
                  </button>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">{d.agent}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${
                      STYLES_STATUT[d.statut] || 'bg-gray-100 text-gray-800 border-gray-300'
                    }`}
                  >
                    {d.statut}
                  </span>
                </td>
                <td
                  className={`whitespace-nowrap px-3 py-2 text-right font-medium ${
                    depasse ? 'text-red-600' : 'text-gray-700'
                  }`}
                >
                  {delaiEnJours(d)} j{depasse && <span aria-hidden="true"> ⚠</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {matriculeOuvert && (
        <ModaleHistoriqueAssure
          matricule={matriculeOuvert}
          onFermer={() => setMatriculeOuvert(null)}
        />
      )}
    </div>
  )
}
