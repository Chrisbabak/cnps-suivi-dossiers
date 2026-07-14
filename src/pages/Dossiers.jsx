// ---------------------------------------------------------------------------
// Page "Dossiers" : liste des dossiers avec recherche plein texte,
// filtres (statut / agence / canal), tri par date, changement de statut
// en ligne et mise en évidence des dossiers en dépassement de délai.
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import StatutSelect from '../components/StatutSelect.jsx'
import { STATUTS, CANAUX } from '../lib/constants.js'
import { formatDate, delaiEnJours, enDepassement } from '../lib/dates.js'
import { telechargerCsv } from '../lib/csv.js'
import { exportCsv } from '../lib/storage.js'
import { aujourdhuiIso } from '../lib/dates.js'

const CLASSE_FILTRE =
  'rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500'

export default function Dossiers() {
  const { dossiers, changerStatut, supprimerDossier, chargerDemo, settings } = useData()
  const navigate = useNavigate()

  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [filtreAgence, setFiltreAgence] = useState('')
  const [filtreCanal, setFiltreCanal] = useState('')
  const [triRecent, setTriRecent] = useState(true) // true = plus récents d'abord

  // Liste filtrée et triée (recalculée à chaque changement de données/filtres).
  const affiches = useMemo(() => {
    const texte = recherche.trim().toLowerCase()
    return dossiers
      .filter((d) => {
        if (filtreStatut && d.statut !== filtreStatut) return false
        if (filtreAgence && d.agence !== filtreAgence) return false
        if (filtreCanal && d.canal !== filtreCanal) return false
        if (!texte) return true
        // Recherche plein texte : n° de dossier, matricule, motif, agent.
        return [d.numero, d.matricule, d.motif, d.agent]
          .join(' ')
          .toLowerCase()
          .includes(texte)
      })
      .sort((a, b) => {
        const diff = a.dateReception.localeCompare(b.dateReception) || a.numero.localeCompare(b.numero)
        return triRecent ? -diff : diff
      })
  }, [dossiers, recherche, filtreStatut, filtreAgence, filtreCanal, triRecent])

  const exporter = () => {
    telechargerCsv(`dossiers-cnps-${aujourdhuiIso()}.csv`, exportCsv())
  }

  const supprimer = (dossier) => {
    if (window.confirm(`Supprimer définitivement le dossier ${dossier.numero} ?`)) {
      supprimerDossier(dossier.id)
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Dossiers</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exporter}
            disabled={dossiers.length === 0}
            className="rounded-md border border-cnps-600 px-3 py-1.5 text-sm font-medium text-cnps-700 transition-colors hover:bg-cnps-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Exporter CSV
          </button>
          <Link
            to="/nouveau"
            className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
          >
            + Nouveau dossier
          </Link>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg bg-white p-3 shadow-sm">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="recherche" className="mb-1 block text-xs font-medium text-gray-500">
            Recherche (n°, matricule, motif, agent)
          </label>
          <input
            id="recherche"
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Ex. D-2026-004, 115004782…"
            className={`${CLASSE_FILTRE} w-full`}
          />
        </div>
        <div>
          <label htmlFor="filtre-statut" className="mb-1 block text-xs font-medium text-gray-500">
            Statut
          </label>
          <select
            id="filtre-statut"
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className={CLASSE_FILTRE}
          >
            <option value="">Tous</option>
            {STATUTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtre-agence" className="mb-1 block text-xs font-medium text-gray-500">
            Agence
          </label>
          <select
            id="filtre-agence"
            value={filtreAgence}
            onChange={(e) => setFiltreAgence(e.target.value)}
            className={CLASSE_FILTRE}
          >
            <option value="">Toutes</option>
            {settings.agences.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtre-canal" className="mb-1 block text-xs font-medium text-gray-500">
            Canal
          </label>
          <select
            id="filtre-canal"
            value={filtreCanal}
            onChange={(e) => setFiltreCanal(e.target.value)}
            className={CLASSE_FILTRE}
          >
            <option value="">Tous</option>
            {CANAUX.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {dossiers.length === 0 ? (
        // État vide : proposer la saisie ou le chargement des données de démo.
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="mb-1 font-medium text-gray-700">Aucun dossier enregistré</p>
          <p className="mb-4 text-sm text-gray-500">
            Créez un premier dossier ou chargez le jeu de données de démonstration.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/nouveau"
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Créer un dossier
            </Link>
            <button
              type="button"
              onClick={chargerDemo}
              className="rounded-md border border-cnps-600 px-4 py-2 text-sm font-medium text-cnps-700 hover:bg-cnps-50"
            >
              Charger des données de démo
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    N° dossier
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    <button
                      type="button"
                      onClick={() => setTriRecent(!triRecent)}
                      className="inline-flex items-center gap-1 uppercase hover:text-cnps-700"
                      title="Trier par date de réception"
                    >
                      Reçu le <span aria-hidden="true">{triRecent ? '↓' : '↑'}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Motif
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Matricule
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Canal
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Agence
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Agent
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Statut
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                    Délai
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {affiches.map((d) => {
                  const delai = delaiEnJours(d)
                  const depasse = enDepassement(d, settings.delaiCible)
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
                        {/* Lien explicite sur le numéro : accessible au clavier,
                            en plus du clic sur toute la ligne. */}
                        <Link
                          to={`/dossiers/${d.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline"
                        >
                          {d.numero}
                        </Link>
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
                      <td className="px-3 py-2 text-gray-800" title={d.commentaire || undefined}>
                        {d.motif}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-gray-700">
                        {d.matricule}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-600">{d.canal}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-600">{d.agence}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-600">{d.agent}</td>
                      {/* stopPropagation : changer le statut ne doit pas ouvrir la fiche */}
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <StatutSelect dossier={d} onChange={changerStatut} />
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-2 text-right font-medium ${
                          depasse ? 'text-red-600' : 'text-gray-700'
                        }`}
                        title={
                          d.dateCloture
                            ? `Clôturé le ${formatDate(d.dateCloture)}`
                            : `Délai cible : ${settings.delaiCible} j`
                        }
                      >
                        {delai} j{depasse && <span aria-hidden="true"> ⚠</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            supprimer(d)
                          }}
                          aria-label={`Supprimer le dossier ${d.numero}`}
                          className="rounded px-1.5 py-0.5 text-xs text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          Suppr.
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
            {affiches.length} dossier{affiches.length > 1 ? 's' : ''} affiché
            {affiches.length > 1 ? 's' : ''} sur {dossiers.length} — les lignes en rouge dépassent
            le délai cible ({settings.delaiCible} jours).
          </p>
        </div>
      )}
    </div>
  )
}
