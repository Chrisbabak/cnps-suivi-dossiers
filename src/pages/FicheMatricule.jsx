// ---------------------------------------------------------------------------
// Page "Fiche matricule" : vue à 360° d'un assuré ou d'un employeur,
// identifié par son matricule (pas de nom dans le modèle de données, par
// conformité à la protection des données). Regroupe tous ses dossiers et
// tous ses échanges avec la CNPS, toutes agences confondues.
// ---------------------------------------------------------------------------

import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import TableDossiers from '../components/TableDossiers.jsx'
import Journal, { estEchange, trierJournal } from '../components/Journal.jsx'
import { delaiEnJours, formatDate, formatDateHeure } from '../lib/dates.js'

// Indicateur compact.
function Indicateur({ libelle, valeur, detail }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{libelle}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{valeur}</p>
      {detail && <p className="mt-0.5 text-xs text-gray-500">{detail}</p>}
    </div>
  )
}

export default function FicheMatricule() {
  const { matricule } = useParams()
  const { dossiers, settings } = useData()

  const infos = useMemo(() => {
    const lies = dossiers
      .filter((d) => d.matricule === matricule)
      .sort((a, b) => b.dateReception.localeCompare(a.dateReception))
    const clotures = lies.filter((d) => d.statut === 'Clôturé')
    const delais = clotures.map(delaiEnJours)
    // Journal consolidé : chaque événement garde la référence de son dossier.
    const evenements = lies.flatMap((d) =>
      (d.historique || []).map((evt) => ({
        ...evt,
        id: `${d.id}-${evt.id}`,
        dossier: { id: d.id, numero: d.numero, agence: d.agence },
      })),
    )
    const echanges = trierJournal(evenements.filter(estEchange))
    return {
      evenements,
      echanges,
      lies,
      ouverts: lies.filter((d) => d.statut !== 'Clôturé').length,
      reclamations: lies.filter((d) => d.type === 'Réclamation').length,
      delaiMoyen: delais.length ? delais.reduce((s, x) => s + x, 0) / delais.length : null,
      premierContact: lies.length ? lies[lies.length - 1].dateReception : null,
      agences: [...new Set(lies.map((d) => d.agence))],
    }
  }, [dossiers, matricule])

  // Un matricule employeur commence par "E-" dans les données de démo.
  const typeTiers = matricule.startsWith('E-') ? 'Employeur' : 'Assuré'

  if (infos.lies.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="mb-2 font-medium text-gray-700">
          Aucun dossier pour le matricule <span className="tabular-nums">{matricule}</span>
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <Link to="/dossiers" className="text-cnps-600 underline">
            Retour à la liste
          </Link>
          <Link
            to={`/nouveau?matricule=${encodeURIComponent(matricule)}`}
            className="text-cnps-600 underline"
          >
            Créer un dossier pour ce matricule
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link to="/dossiers" className="mb-3 inline-block text-sm text-cnps-600 hover:underline">
        ← Retour à la liste
      </Link>

      {/* En-tête de la fiche */}
      <div className="mb-4 rounded-lg bg-white p-5 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="tabular-nums text-xl font-bold text-gray-900">{matricule}</h1>
            <span className="rounded-full bg-cnps-100 px-2.5 py-0.5 text-xs font-medium text-cnps-800">
              {typeTiers}
            </span>
            {infos.ouverts > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                {infos.ouverts} dossier{infos.ouverts > 1 ? 's' : ''} en cours
              </span>
            )}
          </div>
          <Link
            to={`/nouveau?matricule=${encodeURIComponent(matricule)}`}
            className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
          >
            + Nouveau dossier pour ce matricule
          </Link>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Premier dossier le {formatDate(infos.premierContact)}
          {infos.echanges[0] &&
            ` · Dernier échange le ${formatDateHeure(infos.echanges[0].date)} (${infos.echanges[0].canal})`}
          {' · '}Agence{infos.agences.length > 1 ? 's' : ''} : {infos.agences.join(', ')}
        </p>
      </div>

      {/* Indicateurs */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Indicateur libelle="Dossiers au total" valeur={infos.lies.length} />
        <Indicateur libelle="En cours" valeur={infos.ouverts} />
        <Indicateur
          libelle="Échanges"
          valeur={infos.echanges.length}
          detail="appels, visites, emails…"
        />
        <Indicateur
          libelle="Délai moyen"
          valeur={infos.delaiMoyen == null ? '-' : `${infos.delaiMoyen.toFixed(1)} j`}
          detail={`de clôture · ${infos.reclamations} réclamation${infos.reclamations > 1 ? 's' : ''}`}
        />
      </div>

      {/* Historique des dossiers */}
      <div className="mb-4 overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Historique des dossiers ({infos.lies.length})
          </h2>
        </div>
        <TableDossiers
          dossiers={infos.lies}
          delaiCible={settings.delaiCible}
          messageVide="Aucun dossier."
        />
      </div>

      {/* Tous les échanges avec l'assuré, tous dossiers confondus */}
      <div className="rounded-lg bg-white p-5 shadow">
        <h2 className="mb-3 text-sm font-semibold text-gray-800">
          Échanges avec {typeTiers === 'Employeur' ? "l'employeur" : "l'assuré"}, toutes agences
        </h2>
        <Journal evenements={infos.evenements} messageVide="Rien à afficher pour ce filtre." />
      </div>
    </div>
  )
}
