// ---------------------------------------------------------------------------
// Page "Paramètres" : listes configurables (agences, agents), délai cible,
// import CSV, chargement des données de démo et réinitialisation.
// ---------------------------------------------------------------------------

import { useRef, useState } from 'react'
import { useData } from '../context/DataContext.jsx'

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
      setMessage(parties.join(' — '))
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

        <ListeEditable
          id="ajout-agent"
          titre="Agents"
          valeurs={settings.agents}
          onChange={(agents) => majSettings({ agents })}
          placeholder="Nom du nouvel agent"
        />

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">Délai cible de traitement</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="delai-cible" className="text-sm text-gray-700">
              Un dossier est en dépassement au-delà de
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
              className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500"
            />
            <span className="text-sm text-gray-700">jours.</span>
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
              Importer un CSV
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
            {dossiers.length} dossier(s) actuellement enregistré(s) dans ce navigateur. L’import
            attend le même format que l’export CSV (séparateur « ; », en-têtes identiques) ; les
            numéros de dossier déjà présents sont ignorés.
          </p>
        </div>
      </div>
    </div>
  )
}
