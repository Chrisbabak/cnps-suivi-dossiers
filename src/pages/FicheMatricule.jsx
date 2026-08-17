// ---------------------------------------------------------------------------
// Page "Fiche matricule" : vue à 360° d'un assuré ou d'un employeur,
// identifié par son matricule (pas de nom dans le modèle de données —
// conformité protection des données). Regroupe tous ses dossiers.
// ---------------------------------------------------------------------------

import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import TableDossiers from '../components/TableDossiers.jsx'
import { delaiEnJours, formatDate } from '../lib/dates.js'

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
    return {
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
          Aucun dossier pour le matricule <span className="font-mono">{matricule}</span>
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
            <h1 className="font-mono text-xl font-bold text-gray-900">{matricule}</h1>
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
          Premier contact le {formatDate(infos.premierContact)} · Agence
          {infos.agences.length > 1 ? 's' : ''} : {infos.agences.join(', ')}
        </p>
      </div>

      {/* Indicateurs */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Indicateur libelle="Dossiers au total" valeur={infos.lies.length} />
        <Indicateur libelle="En cours" valeur={infos.ouverts} />
        <Indicateur libelle="Réclamations" valeur={infos.reclamations} />
        <Indicateur
          libelle="Délai moyen"
          valeur={infos.delaiMoyen == null ? '—' : `${infos.delaiMoyen.toFixed(1)} j`}
          detail="de clôture"
        />
      </div>

      {/* Historique des dossiers */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
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
    </div>
  )
}
