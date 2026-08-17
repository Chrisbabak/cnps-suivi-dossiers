// ---------------------------------------------------------------------------
// Page "Accueil" : tableau de bord du technicien connecté au poste.
// 1. Ses dossiers ouverts (avec alertes de dépassement / urgences)
// 2. Les dossiers ouverts de son agence
// Le technicien et l'agence sont choisis via des sélecteurs, mémorisés
// sur le poste (dans le vrai CRM, l'identité viendra du compte de l'agent).
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { STYLES_STATUT } from '../components/StatutSelect.jsx'
import { formatDate, delaiEnJours, enDepassement } from '../lib/dates.js'

const CLE_POSTE = 'cnps-poste-v1' // choix technicien/agence propre à ce poste

const CLASSE_SELECT =
  'rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500'

// Carte indicateur compacte.
function Indicateur({ libelle, valeur, alerte = false }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{libelle}</p>
      <p className={`mt-1 text-2xl font-bold ${alerte && valeur > 0 ? 'text-red-600' : 'text-gray-900'}`}>
        {valeur}
      </p>
    </div>
  )
}

// Tableau compact de dossiers (lignes cliquables vers la fiche).
function TableCompacte({ dossiers, delaiCible, messageVide }) {
  const navigate = useNavigate()
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
            return (
              <tr
                key={d.id}
                onClick={() => navigate(`/dossiers/${d.id}`)}
                title="Ouvrir la fiche du dossier"
                className={`cursor-pointer ${depasse ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
              >
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs font-semibold text-gray-900">
                  {d.numero}
                  {d.priorite === 'Urgente' && (
                    <span className="ml-1.5 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">
                      Urgent
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">{formatDate(d.dateReception)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">{d.type}</td>
                <td className="px-3 py-2 text-gray-800">{d.motif}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-gray-700">{d.matricule}</td>
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
                <td className={`whitespace-nowrap px-3 py-2 text-right font-medium ${depasse ? 'text-red-600' : 'text-gray-700'}`}>
                  {delaiEnJours(d)} j{depasse && <span aria-hidden="true"> ⚠</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Trie les dossiers ouverts : dépassements d'abord, puis urgents, puis anciens.
function trierParPriorite(dossiers, delaiCible) {
  return [...dossiers].sort((a, b) => {
    const score = (d) => (enDepassement(d, delaiCible) ? 2 : 0) + (d.priorite === 'Urgente' ? 1 : 0)
    return score(b) - score(a) || a.dateReception.localeCompare(b.dateReception)
  })
}

export default function Accueil() {
  const { dossiers, settings } = useData()

  // Technicien + agence du poste, mémorisés dans le navigateur.
  const [poste, setPoste] = useState(() => {
    try {
      const brut = JSON.parse(localStorage.getItem(CLE_POSTE) || '{}')
      return {
        agent: settings.agents.includes(brut.agent) ? brut.agent : settings.agents[0] || '',
        agence: settings.agences.includes(brut.agence) ? brut.agence : settings.agences[0] || '',
      }
    } catch {
      return { agent: settings.agents[0] || '', agence: settings.agences[0] || '' }
    }
  })

  useEffect(() => {
    localStorage.setItem(CLE_POSTE, JSON.stringify(poste))
  }, [poste])

  const cible = settings.delaiCible

  const stats = useMemo(() => {
    const mesDossiers = dossiers.filter((d) => d.agent === poste.agent)
    const mesOuverts = mesDossiers.filter((d) => d.statut !== 'Clôturé')
    const agenceOuverts = dossiers.filter((d) => d.agence === poste.agence && d.statut !== 'Clôturé')
    return {
      mesOuverts: trierParPriorite(mesOuverts, cible),
      mesDepassements: mesOuverts.filter((d) => enDepassement(d, cible)).length,
      mesUrgents: mesOuverts.filter((d) => d.priorite === 'Urgente').length,
      mesClotures: mesDossiers.filter((d) => d.statut === 'Clôturé').length,
      agenceOuverts: trierParPriorite(agenceOuverts, cible),
      agenceDepassements: agenceOuverts.filter((d) => enDepassement(d, cible)).length,
    }
  }, [dossiers, poste, cible])

  return (
    <div>
      {/* En-tête : identité du poste */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Bonjour{poste.agent ? ` ${poste.agent}` : ''}
          </h1>
          <p className="text-sm text-gray-500">Votre activité et celle de votre agence, en un coup d'œil.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="poste-agent" className="mb-1 block text-xs font-medium text-gray-500">
              Technicien
            </label>
            <select
              id="poste-agent"
              value={poste.agent}
              onChange={(e) => setPoste({ ...poste, agent: e.target.value })}
              className={CLASSE_SELECT}
            >
              {settings.agents.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="poste-agence" className="mb-1 block text-xs font-medium text-gray-500">
              Agence
            </label>
            <select
              id="poste-agence"
              value={poste.agence}
              onChange={(e) => setPoste({ ...poste, agence: e.target.value })}
              className={CLASSE_SELECT}
            >
              {settings.agences.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Indicateurs du technicien */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Indicateur libelle="Mes dossiers ouverts" valeur={stats.mesOuverts.length} />
        <Indicateur libelle="En dépassement" valeur={stats.mesDepassements} alerte />
        <Indicateur libelle="Urgents" valeur={stats.mesUrgents} alerte />
        <Indicateur libelle="Clôturés (total)" valeur={stats.mesClotures} />
      </div>

      {/* Mes dossiers */}
      <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">Mes dossiers en cours</h2>
          <Link to="/nouveau" className="text-sm font-medium text-cnps-600 hover:underline">
            + Nouveau dossier
          </Link>
        </div>
        <TableCompacte
          dossiers={stats.mesOuverts}
          delaiCible={cible}
          messageVide={`Aucun dossier ouvert pour ${poste.agent || 'ce technicien'} — bravo !`}
        />
      </div>

      {/* Dossiers de l'agence */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Dossiers ouverts de l'agence {poste.agence}
            {stats.agenceDepassements > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                {stats.agenceDepassements} en dépassement
              </span>
            )}
          </h2>
          <Link to="/dossiers" className="text-sm font-medium text-cnps-600 hover:underline">
            Voir tous les dossiers →
          </Link>
        </div>
        <TableCompacte
          dossiers={stats.agenceOuverts}
          delaiCible={cible}
          messageVide={`Aucun dossier ouvert dans l'agence ${poste.agence}.`}
        />
      </div>
    </div>
  )
}
