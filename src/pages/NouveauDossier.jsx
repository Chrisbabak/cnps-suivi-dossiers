// ---------------------------------------------------------------------------
// Page "Nouveau dossier" : formulaire d'enregistrement d'une demande
// ou d'une réclamation. Le numéro de dossier est généré automatiquement.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { CANAUX, TYPES, MOTIFS, PRIORITES } from '../lib/constants.js'
import { aujourdhuiIso } from '../lib/dates.js'

// Petit composant de champ avec libellé (accessibilité : label relié au champ).
function Champ({ id, label, obligatoire = false, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {obligatoire && (
          <span className="text-red-600" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
    </div>
  )
}

const CLASSE_CHAMP =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500'

export default function NouveauDossier() {
  const { creerDossier, settings } = useData()

  // Valeurs initiales du formulaire (réutilisées après chaque enregistrement).
  const formulaireVide = () => ({
    type: 'Demande',
    canal: 'Agence',
    motif: MOTIFS[0],
    matricule: '',
    agence: settings.agences[0] || '',
    agent: settings.agents[0] || '',
    priorite: 'Normale',
    commentaire: '',
    dateReception: aujourdhuiIso(),
  })

  const [form, setForm] = useState(formulaireVide)
  const [confirmation, setConfirmation] = useState(null)

  const changer = (champ) => (e) => setForm({ ...form, [champ]: e.target.value })

  const soumettre = (e) => {
    e.preventDefault()
    const dossier = creerDossier({ ...form, matricule: form.matricule.trim() })
    setConfirmation(dossier.numero)
    setForm(formulaireVide()) // formulaire prêt pour la saisie suivante
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Nouveau dossier</h1>

      {confirmation && (
        <div
          role="status"
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <span>
            Dossier <strong className="font-mono">{confirmation}</strong> enregistré avec succès.
          </span>
          <Link to="/dossiers" className="font-medium text-cnps-600 underline hover:text-cnps-800">
            Voir la liste des dossiers
          </Link>
        </div>
      )}

      <form onSubmit={soumettre} className="rounded-lg bg-white p-5 shadow sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ id="type" label="Type">
            <select id="type" value={form.type} onChange={changer('type')} className={CLASSE_CHAMP}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Champ>

          <Champ id="canal" label="Canal de réception">
            <select id="canal" value={form.canal} onChange={changer('canal')} className={CLASSE_CHAMP}>
              {CANAUX.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Champ>

          <Champ id="motif" label="Motif">
            <select id="motif" value={form.motif} onChange={changer('motif')} className={CLASSE_CHAMP}>
              {MOTIFS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Champ>

          <Champ id="matricule" label="Matricule assuré ou employeur" obligatoire>
            <input
              id="matricule"
              type="text"
              required
              value={form.matricule}
              onChange={changer('matricule')}
              placeholder="Ex. 115004782 ou E-045210"
              className={CLASSE_CHAMP}
            />
          </Champ>

          <Champ id="agence" label="Agence">
            <select id="agence" value={form.agence} onChange={changer('agence')} className={CLASSE_CHAMP}>
              {settings.agences.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Champ>

          <Champ id="agent" label="Agent en charge">
            <select id="agent" value={form.agent} onChange={changer('agent')} className={CLASSE_CHAMP}>
              {settings.agents.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Champ>

          <Champ id="priorite" label="Priorité">
            <select
              id="priorite"
              value={form.priorite}
              onChange={changer('priorite')}
              className={CLASSE_CHAMP}
            >
              {PRIORITES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Champ>

          <Champ id="dateReception" label="Date de réception">
            <input
              id="dateReception"
              type="date"
              required
              value={form.dateReception}
              onChange={changer('dateReception')}
              max={aujourdhuiIso()}
              className={CLASSE_CHAMP}
            />
          </Champ>

          <div className="sm:col-span-2">
            <Champ id="commentaire" label="Commentaire">
              <textarea
                id="commentaire"
                rows={3}
                value={form.commentaire}
                onChange={changer('commentaire')}
                placeholder="Précisions utiles au traitement (facultatif)"
                className={CLASSE_CHAMP}
              />
            </Champ>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            Le numéro de dossier (format D-AAAA-NNN) est attribué automatiquement.
          </p>
          <button
            type="submit"
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Enregistrer le dossier
          </button>
        </div>
      </form>
    </div>
  )
}
