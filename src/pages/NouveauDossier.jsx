// ---------------------------------------------------------------------------
// Page "Nouveau dossier" : formulaire d'enregistrement d'une demande
// ou d'une réclamation. Le numéro de dossier est généré automatiquement.
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { getSession } from '../lib/auth.js'
import { agentsDeLAgence } from '../lib/annuaire.js'
import { CANAUX, TYPES, MOTIFS, GROUPES_MOTIFS, PRIORITES } from '../lib/constants.js'
import { aujourdhuiIso, delaiEnJours } from '../lib/dates.js'

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
  const { creerDossier, settings, dossiers } = useData()
  // Matricule pré-rempli quand on vient de la fiche matricule (?matricule=…).
  const [parametres] = useSearchParams()

  // Périmètre de la session : technicien/manager créent dans LEUR agence
  // (agence verrouillée) ; le technicien est l'agent par défaut.
  const session = getSession()
  const agenceVerrouillee = session?.role !== 'admin' && Boolean(session?.agence)

  // Valeurs initiales du formulaire (réutilisées après chaque enregistrement).
  const formulaireVide = () => {
    const agence = session?.agence || settings.agences[0] || ''
    const agentsAgence = agentsDeLAgence(settings, agence)
    return {
      type: 'Demande',
      canal: 'Agence',
      motif: MOTIFS[0],
      matricule: parametres.get('matricule') || '',
      agence,
      agent: session?.role === 'technicien' ? session.nom : agentsAgence[0] || '',
      priorite: 'Normale',
      commentaire: '',
      dateReception: aujourdhuiIso(),
    }
  }

  const [form, setForm] = useState(formulaireVide)
  const navigate = useNavigate()

  const changer = (champ) => (e) => setForm({ ...form, [champ]: e.target.value })

  // Changer d'agence (admin) repositionne l'agent sur un technicien de
  // cette agence — un dossier est traité par un agent de son agence.
  const changerAgence = (e) => {
    const agence = e.target.value
    const agentsAgence = agentsDeLAgence(settings, agence)
    setForm({ ...form, agence, agent: agentsAgence[0] || '' })
  }

  // Agents proposés : ceux de l'agence du formulaire (annuaire).
  const agentsProposes = agentsDeLAgence(settings, form.agence)

  // Alerte doublon (vision nationale) : dossiers NON clôturés déjà ouverts
  // pour le matricule saisi, toutes agences confondues. Non bloquant.
  const doublons = useMemo(() => {
    const matricule = form.matricule.trim()
    if (matricule.length < 3) return []
    return dossiers.filter((d) => d.matricule === matricule && d.statut !== 'Clôturé')
  }, [dossiers, form.matricule])

  const soumettre = (e) => {
    e.preventDefault()
    const dossier = creerDossier({ ...form, matricule: form.matricule.trim() })
    // On bascule directement sur la fiche du dossier créé, avec un bandeau de confirmation.
    navigate(`/dossiers/${dossier.id}`, { state: { cree: true } })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Nouveau dossier</h1>

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
              {GROUPES_MOTIFS.map((g) => (
                <optgroup key={g.groupe} label={g.groupe}>
                  {g.motifs.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </optgroup>
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
            {doublons.length > 0 && (
              <div
                role="status"
                className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900"
              >
                <p className="font-semibold">
                  ⚠️ Cet assuré a déjà {doublons.length} dossier{doublons.length > 1 ? 's' : ''} en
                  cours :
                </p>
                <ul className="mt-1 space-y-0.5">
                  {doublons.map((d) => (
                    <li key={d.id}>
                      {/* Nouvel onglet : la saisie en cours n'est pas perdue */}
                      <a
                        href={`${import.meta.env.BASE_URL}dossiers/${d.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Ouvrir le dossier ${d.numero} dans un nouvel onglet`}
                        className="font-semibold tabular-nums underline underline-offset-2 hover:text-amber-700"
                      >
                        {d.numero} ↗
                      </a>{' '}
                      · {d.motif} · {d.agence} · {d.statut} ({delaiEnJours(d)} j)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Champ>

          <Champ id="agence" label="Agence">
            {/* Technicien / manager : agence verrouillée sur leur rattachement */}
            <select
              id="agence"
              value={form.agence}
              onChange={changerAgence}
              disabled={agenceVerrouillee}
              title={agenceVerrouillee ? `Votre agence : ${session.agence}` : undefined}
              className={`${CLASSE_CHAMP} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500`}
            >
              {settings.agences.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Champ>

          <Champ id="agent" label="Agent en charge">
            {/* Agents de l'agence sélectionnée (annuaire) */}
            <select id="agent" value={form.agent} onChange={changer('agent')} className={CLASSE_CHAMP}>
              {!agentsProposes.includes(form.agent) && form.agent && <option>{form.agent}</option>}
              {agentsProposes.map((a) => (
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
