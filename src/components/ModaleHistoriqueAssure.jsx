// ---------------------------------------------------------------------------
// Modale "Historique de l'assuré" : liste TOUS les dossiers d'un matricule,
// toutes agences confondues (la vision assuré est nationale, quel que soit
// le rôle). Lecture seule, avec un lien vers la fiche matricule complète.
// ---------------------------------------------------------------------------

import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { STYLES_STATUT } from './StatutSelect.jsx'
import { formatDate, delaiEnJours, enDepassement } from '../lib/dates.js'

export default function ModaleHistoriqueAssure({ matricule, onFermer }) {
  const { dossiers, settings } = useData()

  // Tous les dossiers du matricule, du plus récent au plus ancien.
  const lies = useMemo(
    () =>
      dossiers
        .filter((d) => d.matricule === matricule)
        .sort((a, b) => b.dateReception.localeCompare(a.dateReception)),
    [dossiers, matricule],
  )

  // Fermeture au clavier (Échap).
  useEffect(() => {
    const surTouche = (e) => {
      if (e.key === 'Escape') onFermer()
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [onFermer])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onFermer}
      role="dialog"
      aria-modal="true"
      aria-label={`Historique de l'assuré ${matricule}`}
    >
      {/* stopPropagation : cliquer dans la fenêtre ne doit pas la fermer */}
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Historique de l'assuré <span className="font-mono">{matricule}</span>
            <span className="ml-2 font-normal text-gray-500">
              {lies.length} dossier{lies.length > 1 ? 's' : ''} · toutes agences
            </span>
          </h2>
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer"
            className="rounded px-2 py-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto">
          {lies.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">
              Aucun dossier pour ce matricule.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">N°</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Date</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Type</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Motif</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Agence</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Statut</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Délai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lies.map((d) => {
                  const depasse = enDepassement(d, settings.delaiCible)
                  return (
                    <tr key={d.id}>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs font-semibold text-gray-900">
                        {d.numero}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                        {formatDate(d.dateReception)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-600">{d.type}</td>
                      <td className="px-3 py-2 text-gray-800">{d.motif}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-600">{d.agence}</td>
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
                        {delaiEnJours(d)} j
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <Link
            to={`/matricules/${encodeURIComponent(matricule)}`}
            onClick={onFermer}
            className="text-sm font-medium text-cnps-600 hover:underline"
          >
            Voir la fiche complète →
          </Link>
          <button
            type="button"
            onClick={onFermer}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
