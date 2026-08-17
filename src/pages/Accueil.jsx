// ---------------------------------------------------------------------------
// Page "Accueil" : tableau de bord adapté au profil connecté.
// - Technicien : ses dossiers ouverts, puis ceux de son agence.
// - Chef d'agence : indicateurs de l'agence, charge par agent, dossiers ouverts.
// Le technicien et l'agence sont choisis via des sélecteurs, mémorisés
// sur le poste (dans le vrai CRM, l'identité viendra du compte de l'agent).
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import TableDossiers from '../components/TableDossiers.jsx'
import { getRole } from '../lib/auth.js'
import { delaiEnJours, enDepassement } from '../lib/dates.js'

const CLE_POSTE = 'cnps-poste-v1' // choix technicien/agence propre à ce poste

const CLASSE_SELECT =
  'rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500'

// Carte indicateur compacte.
function Indicateur({ libelle, valeur, detail, alerte = false }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{libelle}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          alerte && parseInt(valeur, 10) > 0 ? 'text-red-600' : 'text-gray-900'
        }`}
      >
        {valeur}
      </p>
      {detail && <p className="mt-0.5 text-xs text-gray-500">{detail}</p>}
    </div>
  )
}

// Barres horizontales de charge par agent (dossiers ouverts).
function ChargeParAgent({ donnees }) {
  const max = Math.max(...donnees.map((d) => d.valeur), 1)
  return (
    <ul className="space-y-2">
      {donnees.map(({ label, valeur }) => (
        <li key={label}>
          <div className="mb-0.5 flex items-baseline justify-between gap-2 text-xs">
            <span className="truncate text-gray-700">{label}</span>
            <span className="font-semibold text-gray-900">{valeur}</span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
            role="img"
            aria-label={`${label} : ${valeur} dossier(s) ouvert(s)`}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${(valeur / max) * 100}%`, backgroundColor: '#2F9E41' }}
            />
          </div>
        </li>
      ))}
      {donnees.length === 0 && <li className="text-sm text-gray-400">Aucun dossier ouvert</li>}
    </ul>
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
  const role = getRole()

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
    const agenceTous = dossiers.filter((d) => d.agence === poste.agence)
    const agenceOuverts = agenceTous.filter((d) => d.statut !== 'Clôturé')
    const agenceClotures = agenceTous.filter((d) => d.statut === 'Clôturé')
    const agenceDansDelais = agenceClotures.filter((d) => delaiEnJours(d) <= cible).length

    // Charge par agent au sein de l'agence (vue chef).
    const compteParAgent = new Map()
    for (const d of agenceOuverts) {
      compteParAgent.set(d.agent, (compteParAgent.get(d.agent) || 0) + 1)
    }

    return {
      mesOuverts: trierParPriorite(mesOuverts, cible),
      mesDepassements: mesOuverts.filter((d) => enDepassement(d, cible)).length,
      mesUrgents: mesOuverts.filter((d) => d.priorite === 'Urgente').length,
      mesClotures: mesDossiers.filter((d) => d.statut === 'Clôturé').length,
      agenceOuverts: trierParPriorite(agenceOuverts, cible),
      agenceDepassements: agenceOuverts.filter((d) => enDepassement(d, cible)).length,
      agenceUrgents: agenceOuverts.filter((d) => d.priorite === 'Urgente').length,
      agencePctDelais:
        agenceClotures.length > 0
          ? `${Math.round((100 * agenceDansDelais) / agenceClotures.length)} %`
          : '—',
      chargeParAgent: [...compteParAgent.entries()]
        .map(([label, valeur]) => ({ label, valeur }))
        .sort((a, b) => b.valeur - a.valeur),
    }
  }, [dossiers, poste, cible])

  // ------------------------------------------------------------------ CHEF --
  if (role === 'chef') {
    return (
      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Bonjour</h1>
            <p className="text-sm text-gray-500">
              Vue chef d'agence — situation de l'agence {poste.agence}.
            </p>
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

        {/* Indicateurs de l'agence */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Indicateur libelle="Dossiers ouverts" valeur={stats.agenceOuverts.length} />
          <Indicateur libelle="En dépassement" valeur={stats.agenceDepassements} alerte />
          <Indicateur libelle="Urgents" valeur={stats.agenceUrgents} alerte />
          <Indicateur
            libelle="Dans les délais"
            valeur={stats.agencePctDelais}
            detail={`clôturés · cible ${cible} j`}
          />
        </div>

        {/* Charge par agent */}
        <div className="mb-4 rounded-lg bg-white p-4 shadow">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">
              Charge par agent (dossiers ouverts de l'agence)
            </h2>
            <Link to="/pilotage" className="text-sm font-medium text-cnps-600 hover:underline">
              Pilotage global →
            </Link>
          </div>
          <ChargeParAgent donnees={stats.chargeParAgent} />
        </div>

        {/* Dossiers ouverts de l'agence */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Dossiers ouverts de l'agence {poste.agence}
            </h2>
            <Link to="/dossiers" className="text-sm font-medium text-cnps-600 hover:underline">
              Voir tous les dossiers →
            </Link>
          </div>
          <TableDossiers
            dossiers={stats.agenceOuverts}
            delaiCible={cible}
            messageVide={`Aucun dossier ouvert dans l'agence ${poste.agence}.`}
          />
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------ TECHNICIEN --
  return (
    <div>
      {/* En-tête : identité du poste */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Bonjour{poste.agent ? ` ${poste.agent}` : ''}
          </h1>
          <p className="text-sm text-gray-500">
            Votre activité et celle de votre agence, en un coup d'œil.
          </p>
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
        <TableDossiers
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
        <TableDossiers
          dossiers={stats.agenceOuverts}
          delaiCible={cible}
          messageVide={`Aucun dossier ouvert dans l'agence ${poste.agence}.`}
        />
      </div>
    </div>
  )
}
