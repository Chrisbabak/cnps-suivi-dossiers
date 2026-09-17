// ---------------------------------------------------------------------------
// Page "Paramètres" : annuaire (techniciens, managers), délais cibles par motif,
// import CSV, chargement des données de démo et réinitialisation.
// ---------------------------------------------------------------------------

import { useRef, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { GROUPES_MOTIFS } from '../lib/constants.js'

// Éditeur d'annuaire : personnes rattachées à une agence (ajout / retrait).
function ListeUtilisateurs({ id, titre, utilisateurs, agences, onChange, placeholder }) {
  const [nom, setNom] = useState('')
  const [agence, setAgence] = useState(agences[0] || '')

  const ajouter = (e) => {
    e.preventDefault()
    const nomPropre = nom.trim()
    if (!nomPropre || utilisateurs.some((u) => u.nom === nomPropre)) return
    onChange([...utilisateurs, { nom: nomPropre, agence }])
    setNom('')
  }

  const retirer = (nomARetirer) => onChange(utilisateurs.filter((u) => u.nom !== nomARetirer))

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-3 text-sm font-semibold text-gray-800">{titre}</h2>
      <ul className="mb-3 space-y-1.5">
        {utilisateurs.map((u) => (
          <li
            key={u.nom}
            className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-800"
          >
            <span>
              {u.nom} <span className="text-xs text-gray-500">({u.agence})</span>
            </span>
            <button
              type="button"
              onClick={() => retirer(u.nom)}
              aria-label={`Retirer ${u.nom}`}
              className="rounded px-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              ✕
            </button>
          </li>
        ))}
        {utilisateurs.length === 0 && <li className="text-sm text-gray-400">Liste vide</li>}
      </ul>
      <form onSubmit={ajouter} className="flex flex-wrap gap-2">
        <label htmlFor={id} className="sr-only">
          Ajouter à « {titre} »
        </label>
        <input
          id={id}
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500"
        />
        <select
          value={agence}
          onChange={(e) => setAgence(e.target.value)}
          aria-label="Agence de rattachement"
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-cnps-500 focus:outline-none"
        >
          {agences.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-cnps-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cnps-700"
        >
          Ajouter
        </button>
      </form>
    </div>
  )
}

// Éditeur générique de liste de valeurs (ajout / suppression).
function ListeEditable({ id, titre, valeurs, onChange, placeholder }) {
  const [nouvelle, setNouvelle] = useState('')

  const ajouter = (e) => {
    e.preventDefault()
    const valeur = nouvelle.trim()
    if (!valeur || valeurs.includes(valeur)) return
    onChange([...valeurs, valeur])
    setNouvelle('')
  }

  const retirer = (valeur) => onChange(valeurs.filter((v) => v !== valeur))

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-3 text-sm font-semibold text-gray-800">{titre}</h2>
      <ul className="mb-3 space-y-1.5">
        {valeurs.map((v) => (
          <li
            key={v}
            className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-800"
          >
            {v}
            <button
              type="button"
              onClick={() => retirer(v)}
              aria-label={`Retirer ${v}`}
              className="rounded px-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              ✕
            </button>
          </li>
        ))}
        {valeurs.length === 0 && <li className="text-sm text-gray-400">Liste vide</li>}
      </ul>
      <form onSubmit={ajouter} className="flex gap-2">
        <label htmlFor={id} className="sr-only">
          Ajouter à « {titre} »
        </label>
        <input
          id={id}
          type="text"
          value={nouvelle}
          onChange={(e) => setNouvelle(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500"
        />
        <button
          type="submit"
          className="rounded-md bg-cnps-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cnps-700"
        >
          Ajouter
        </button>
      </form>
    </div>
  )
}

export default function Parametres() {
  const { settings, majSettings, dossiers, chargerDemo, importerCsv, reinitialiser } = useData()
  const fichierRef = useRef(null)
  const [message, setMessage] = useState(null)

  // Import d'un fichier CSV (même format que l'export).
  const importerFichier = (e) => {
    const fichier = e.target.files?.[0]
    if (!fichier) return
    const lecteur = new FileReader()
    lecteur.onload = () => {
      const { importes, doublons, erreurs } = importerCsv(String(lecteur.result))
      const parties = [`${importes} dossier(s) importé(s)`]
      if (doublons > 0) parties.push(`${doublons} doublon(s) ignoré(s)`)
      if (erreurs.length > 0) parties.push(erreurs.join(' '))
      setMessage(parties.join(' · '))
    }
    lecteur.readAsText(fichier, 'utf-8')
    e.target.value = '' // permet de réimporter le même fichier
  }

  const chargerDonneesDemo = () => {
    const n = chargerDemo()
    setMessage(`${n} dossiers de démonstration chargés.`)
  }

  // Réinitialisation avec double confirmation (action irréversible).
  const toutEffacer = () => {
    if (!window.confirm('Supprimer TOUS les dossiers et les paramètres ?')) return
    if (!window.confirm('Confirmation définitive : cette action est irréversible. Continuer ?'))
      return
    reinitialiser()
    setMessage('Toutes les données ont été réinitialisées.')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Paramètres</h1>

      {message && (
        <div
          role="status"
          className="mb-4 rounded-md border border-cnps-200 bg-cnps-50 px-4 py-3 text-sm text-cnps-800"
        >
          {message}
        </div>
      )}

      <div className="space-y-4">
        <ListeEditable
          id="ajout-agence"
          titre="Agences"
          valeurs={settings.agences}
          onChange={(agences) => majSettings({ agences })}
          placeholder="Nom de la nouvelle agence"
        />

        <ListeUtilisateurs
          id="ajout-agent"
          titre="Techniciens (annuaire : une agence par personne)"
          utilisateurs={settings.agents}
          agences={settings.agences}
          onChange={(agents) => majSettings({ agents })}
          placeholder="Nom du nouveau technicien"
        />

        <ListeUtilisateurs
          id="ajout-manager"
          titre="Managers (un responsable par agence)"
          utilisateurs={settings.managers}
          agences={settings.agences}
          onChange={(managers) => majSettings({ managers })}
          placeholder="Nom du nouveau manager"
        />

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-1 text-sm font-semibold text-gray-800">Droits des techniciens</h2>
          <p className="mb-3 text-xs text-gray-500">
            Un dossier d'une autre agence est toujours en lecture seule. Toute modification est
            tracée dans le journal, avec le nom de son auteur.
          </p>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={settings.modifDossiersCollegues !== false}
              onChange={(e) => majSettings({ modifDossiersCollegues: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-cnps-600 focus:ring-cnps-500"
            />
            <span className="text-sm text-gray-700">
              Un technicien peut modifier les dossiers de ses collègues de la même agence
              <span className="block text-xs text-gray-500">
                Utile en cas d'absence. Décoché : il peut les consulter, pas les modifier.
              </span>
            </span>
          </label>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-1 text-sm font-semibold text-gray-800">Délais cibles (SLA) par motif</h2>
          <p className="mb-3 text-xs text-gray-500">
            Un dossier est hors délai quand le nombre de jours calendaires depuis sa réception
            dépasse le délai de son motif. Pour un dossier urgent, ce délai est divisé par deux.
          </p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {GROUPES_MOTIFS.map((g) => (
              <fieldset key={g.groupe}>
                <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {g.groupe}
                </legend>
                <div className="space-y-1.5">
                  {g.motifs.map((motif) => (
                    <div key={motif} className="flex items-center justify-between gap-3">
                      <label htmlFor={`sla-${motif}`} className="text-sm text-gray-700">
                        {motif}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          id={`sla-${motif}`}
                          type="number"
                          min={1}
                          max={365}
                          value={settings.slaParMotif?.[motif] ?? settings.delaiCible}
                          onChange={(e) =>
                            majSettings({
                              slaParMotif: {
                                ...settings.slaParMotif,
                                [motif]: Math.max(1, parseInt(e.target.value, 10) || 1),
                              },
                            })
                          }
                          className="w-16 rounded-md border border-gray-300 px-2 py-1 text-right text-sm tabular-nums shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500"
                        />
                        <span className="text-xs text-gray-500">j</span>
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
            <label htmlFor="delai-cible" className="text-sm text-gray-700">
              Délai par défaut pour un motif sans délai propre :
            </label>
            <input
              id="delai-cible"
              type="number"
              min={1}
              max={365}
              value={settings.delaiCible}
              onChange={(e) =>
                majSettings({ delaiCible: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className="w-16 rounded-md border border-gray-300 px-2 py-1 text-right text-sm tabular-nums shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500"
            />
            <span className="text-xs text-gray-500">j</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">Données</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fichierRef.current?.click()}
              className="rounded-md border border-cnps-600 px-3 py-1.5 text-sm font-medium text-cnps-700 hover:bg-cnps-50"
            >
              Reprendre un historique (CSV)
            </button>
            <input
              ref={fichierRef}
              type="file"
              accept=".csv,text/csv"
              onChange={importerFichier}
              className="hidden"
              aria-label="Fichier CSV à importer"
            />
            <button
              type="button"
              onClick={chargerDonneesDemo}
              className="rounded-md border border-cnps-600 px-3 py-1.5 text-sm font-medium text-cnps-700 hover:bg-cnps-50"
            >
              Charger des données de démo
            </button>
            <button
              type="button"
              onClick={toutEffacer}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Réinitialiser les données
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            {dossiers.length} dossier(s) actuellement enregistré(s) dans ce navigateur. La reprise
            d'historique permet de migrer les demandes et réclamations d'un outil existant : le
            fichier suit le format de l'export CSV (séparateur « ; », mêmes en-têtes), et les
            numéros de dossier déjà présents sont ignorés.
          </p>
        </div>
      </div>
    </div>
  )
}
