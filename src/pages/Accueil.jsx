// ---------------------------------------------------------------------------
// Page "Accueil" : tableau de bord adapté au rôle de la session.
// - Technicien : ses dossiers (agent = lui) + dossiers ouverts de son agence
// - Manager    : tous les dossiers de son agence + compteurs agence
// - Admin      : vue toutes agences (compteurs globaux)
// L'identité (rôle, agence, nom) vient de la session choisie à la connexion.
// ---------------------------------------------------------------------------

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import TableDossiers from '../components/TableDossiers.jsx'
import { getSession } from '../lib/auth.js'
import { enDepassement } from '../lib/dates.js'

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

// Barres horizontales simples (charge par agent, ouverts par agence…).
function Barres({ donnees, uniteAria }) {
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
            aria-label={`${label} : ${valeur} ${uniteAria}`}
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

// Compte les dossiers ouverts par valeur d'un champ (barres).
function compterOuvertsPar(dossiersOuverts, champ) {
  const compteur = new Map()
  for (const d of dossiersOuverts) compteur.set(d[champ], (compteur.get(d[champ]) || 0) + 1)
  return [...compteur.entries()]
    .map(([label, valeur]) => ({ label, valeur }))
    .sort((a, b) => b.valeur - a.valeur)
}

export default function Accueil() {
  const { dossiers, settings } = useData()
  const session = getSession()
  const cible = settings.delaiCible

  const stats = useMemo(() => {
    const ouverts = dossiers.filter((d) => d.statut !== 'Clôturé')
    const agenceTous = session?.agence ? dossiers.filter((d) => d.agence === session.agence) : []
    const agenceOuverts = agenceTous.filter((d) => d.statut !== 'Clôturé')
    const mesDossiers = session?.nom ? dossiers.filter((d) => d.agent === session.nom) : []
    const mesOuverts = mesDossiers.filter((d) => d.statut !== 'Clôturé')

    return {
      // Technicien
      mesOuverts: trierParPriorite(mesOuverts, cible),
      mesDepassements: mesOuverts.filter((d) => enDepassement(d, cible)).length,
      mesUrgents: mesOuverts.filter((d) => d.priorite === 'Urgente').length,
      mesClotures: mesDossiers.filter((d) => d.statut === 'Clôturé').length,
      // Agence (technicien + manager)
      agenceOuverts: trierParPriorite(agenceOuverts, cible),
      agenceDepassements: agenceOuverts.filter((d) => enDepassement(d, cible)).length,
      agenceUrgents: agenceOuverts.filter((d) => d.priorite === 'Urgente').length,
      agenceClotures: agenceTous.filter((d) => d.statut === 'Clôturé').length,
      chargeParAgent: compterOuvertsPar(agenceOuverts, 'agent'),
      // Admin (global)
      totalGlobal: dossiers.length,
      ouvertsGlobal: trierParPriorite(ouverts, cible),
      depassementsGlobal: ouverts.filter((d) => enDepassement(d, cible)).length,
      urgentsGlobal: ouverts.filter((d) => d.priorite === 'Urgente').length,
      ouvertsParAgence: compterOuvertsPar(ouverts, 'agence'),
    }
  }, [dossiers, session, cible])

  // ----------------------------------------------------------------- ADMIN --
  if (session?.role === 'admin') {
    return (
      <div>
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-gray-900">Bonjour</h1>
          <p className="text-sm text-gray-500">Vue Admin — situation nationale, toutes agences.</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Indicateur libelle="Dossiers au total" valeur={stats.totalGlobal} />
          <Indicateur libelle="Ouverts" valeur={stats.ouvertsGlobal.length} />
          <Indicateur libelle="En dépassement" valeur={stats.depassementsGlobal} alerte />
          <Indicateur libelle="Urgents" valeur={stats.urgentsGlobal} alerte />
        </div>

        <div className="mb-4 rounded-lg bg-white p-4 shadow">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Dossiers ouverts par agence</h2>
            <Link to="/pilotage" className="text-sm font-medium text-cnps-600 hover:underline">
              Pilotage national →
            </Link>
          </div>
          <Barres donnees={stats.ouvertsParAgence} uniteAria="dossier(s) ouvert(s)" />
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Dossiers ouverts (toutes agences)
            </h2>
            <Link to="/dossiers" className="text-sm font-medium text-cnps-600 hover:underline">
              Voir tous les dossiers →
            </Link>
          </div>
          <TableDossiers
            dossiers={stats.ouvertsGlobal}
            delaiCible={cible}
            messageVide="Aucun dossier ouvert."
          />
        </div>
      </div>
    )
  }

  // --------------------------------------------------------------- MANAGER --
  if (session?.role === 'manager') {
    return (
      <div>
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-gray-900">Bonjour</h1>
          <p className="text-sm text-gray-500">
            Vue Manager — situation de l'agence {session.agence}.
          </p>
        </div>

        {/* Compteurs agence : ouverts, en dépassement, urgents, clôturés */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Indicateur libelle="Dossiers ouverts" valeur={stats.agenceOuverts.length} />
          <Indicateur libelle="En dépassement" valeur={stats.agenceDepassements} alerte />
          <Indicateur libelle="Urgents" valeur={stats.agenceUrgents} alerte />
          <Indicateur libelle="Clôturés" valeur={stats.agenceClotures} />
        </div>

        <div className="mb-4 rounded-lg bg-white p-4 shadow">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">
              Charge par agent (dossiers ouverts de l'agence)
            </h2>
            <Link to="/pilotage" className="text-sm font-medium text-cnps-600 hover:underline">
              Pilotage de l'agence →
            </Link>
          </div>
          <Barres donnees={stats.chargeParAgent} uniteAria="dossier(s) ouvert(s)" />
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Dossiers ouverts de l'agence {session.agence}
            </h2>
            <Link to="/dossiers" className="text-sm font-medium text-cnps-600 hover:underline">
              Voir tous les dossiers →
            </Link>
          </div>
          <TableDossiers
            dossiers={stats.agenceOuverts}
            delaiCible={cible}
            messageVide={`Aucun dossier ouvert dans l'agence ${session.agence}.`}
          />
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------ TECHNICIEN --
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">
          Bonjour{session?.nom ? ` ${session.nom}` : ''}
        </h1>
        <p className="text-sm text-gray-500">
          Votre activité et celle de l'agence {session?.agence}, en un coup d'œil.
        </p>
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
          messageVide={`Aucun dossier ouvert pour ${session?.nom || 'ce technicien'} — bravo !`}
        />
      </div>

      {/* Dossiers ouverts de l'agence (lecture) */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Dossiers ouverts de l'agence {session?.agence}
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
          messageVide={`Aucun dossier ouvert dans l'agence ${session?.agence}.`}
        />
      </div>
    </div>
  )
}
