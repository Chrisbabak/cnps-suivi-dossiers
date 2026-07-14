// ---------------------------------------------------------------------------
// Page "Fiche dossier" : vue détaillée d'un dossier avec chemin de fer
// (avancement du traitement), informations, réaffectation, et journal
// des notes & interactions.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import StatutSelect from '../components/StatutSelect.jsx'
import { STATUTS, PRIORITES } from '../lib/constants.js'
import { formatDate, formatDateHeure, delaiEnJours, enDepassement } from '../lib/dates.js'

// Apparence des types d'événements du journal.
const TYPES_EVENEMENT = {
  creation: { libelle: 'Création', classes: 'bg-blue-100 text-blue-800' },
  statut: { libelle: 'Statut', classes: 'bg-emerald-100 text-emerald-800' },
  affectation: { libelle: 'Affectation', classes: 'bg-purple-100 text-purple-800' },
  priorite: { libelle: 'Priorité', classes: 'bg-orange-100 text-orange-800' },
  note: { libelle: 'Note', classes: 'bg-amber-100 text-amber-800' },
}

// Chemin de fer : les 5 étapes du traitement, avec l'étape courante mise
// en avant et les étapes franchies cochées. Chaque étape est CLIQUABLE :
// un clic fait passer le dossier à ce statut.
function CheminDeFer({ statut, onChange }) {
  const indexActuel = STATUTS.indexOf(statut)
  const termine = statut === 'Clôturé'
  return (
    <ol className="flex items-start" aria-label="Avancement du dossier (cliquer une étape pour changer le statut)">
      {STATUTS.map((etape, i) => {
        const franchie = i < indexActuel || termine
        const actuelle = i === indexActuel && !termine
        return (
          <li key={etape} className="relative flex flex-1 flex-col items-stretch">
            {/* Trait de liaison avec l'étape précédente */}
            {i > 0 && (
              <div
                aria-hidden="true"
                className={`absolute right-1/2 top-3.5 h-0.5 w-full ${
                  i <= indexActuel || termine ? 'bg-cnps-500' : 'bg-gray-200'
                }`}
              />
            )}
            <button
              type="button"
              onClick={() => onChange(etape)}
              disabled={i === indexActuel}
              title={i === indexActuel ? 'Statut actuel' : `Passer au statut « ${etape} »`}
              className="group relative z-10 flex flex-col items-center gap-1.5 rounded-md px-0.5 pb-1 focus:outline-none focus:ring-2 focus:ring-cnps-500 disabled:cursor-default"
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-transform ${
                  franchie
                    ? 'border-cnps-600 bg-cnps-600 text-white'
                    : actuelle
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                } ${i !== indexActuel ? 'group-hover:scale-110 group-hover:border-amber-400' : ''}`}
              >
                {franchie ? '✓' : i + 1}
              </span>
              <span
                className={`text-center text-[10px] leading-tight sm:text-xs ${
                  actuelle
                    ? 'font-semibold text-gray-900'
                    : franchie
                      ? 'text-cnps-700'
                      : 'text-gray-500'
                } ${i !== indexActuel ? 'group-hover:text-gray-900 group-hover:underline' : ''}`}
              >
                {etape}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

// Élément d'information (libellé + valeur) de la fiche.
function Info({ libelle, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{libelle}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{children}</dd>
    </div>
  )
}

const CLASSE_SELECT =
  'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500'

export default function FicheDossier() {
  const { id } = useParams()
  const { dossiers, settings, changerStatut, ajouterNote, reaffecterAgent, changerPriorite } =
    useData()
  const dossier = dossiers.find((d) => d.id === id)

  const [note, setNote] = useState('')
  const [auteur, setAuteur] = useState('')

  if (!dossier) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="mb-2 font-medium text-gray-700">Dossier introuvable</p>
        <p className="mb-4 text-sm text-gray-500">
          Il a peut-être été supprimé, ou les données ont été réinitialisées.
        </p>
        <Link to="/dossiers" className="font-medium text-cnps-600 underline">
          Retour à la liste des dossiers
        </Link>
      </div>
    )
  }

  const delai = delaiEnJours(dossier)
  const depasse = enDepassement(dossier, settings.delaiCible)
  // Journal trié du plus récent au plus ancien (comparaison sur l'instant réel,
  // les événements de démo et les événements saisis n'ayant pas le même fuseau).
  const journal = [...(dossier.historique || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const soumettreNote = (e) => {
    e.preventDefault()
    const texte = note.trim()
    if (!texte) return
    ajouterNote(dossier, texte, auteur || dossier.agent)
    setNote('')
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/dossiers" className="mb-3 inline-block text-sm text-cnps-600 hover:underline">
        ← Retour à la liste
      </Link>

      {/* En-tête : numéro, badges, statut, chemin de fer */}
      <div className="mb-4 rounded-lg bg-white p-5 shadow">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-xl font-bold text-gray-900">{dossier.numero}</h1>
            <span className="rounded-full bg-cnps-100 px-2.5 py-0.5 text-xs font-medium text-cnps-800">
              {dossier.type}
            </span>
            {dossier.priorite === 'Urgente' && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold uppercase text-red-700">
                Urgent
              </span>
            )}
            <span
              className={`text-sm font-medium ${depasse ? 'text-red-600' : 'text-gray-500'}`}
              title={`Délai cible : ${settings.delaiCible} jours`}
            >
              {delai} j{depasse && ' ⚠ hors délai'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="statut-fiche" className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Statut
            </label>
            <div className="w-44" id="statut-fiche">
              <StatutSelect dossier={dossier} onChange={changerStatut} />
            </div>
          </div>
        </div>
        <CheminDeFer statut={dossier.statut} onChange={(statut) => changerStatut(dossier, statut)} />
        <p className="mt-3 text-center text-xs text-gray-400">
          Cliquez sur une étape pour faire avancer (ou reculer) le dossier.
        </p>
      </div>

      {/* Informations du dossier */}
      <div className="mb-4 rounded-lg bg-white p-5 shadow">
        <h2 className="mb-3 text-sm font-semibold text-gray-800">Informations</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <Info libelle="Matricule">
            <span className="font-mono">{dossier.matricule}</span>
          </Info>
          <Info libelle="Motif">{dossier.motif}</Info>
          <Info libelle="Canal">{dossier.canal}</Info>
          <Info libelle="Agence">{dossier.agence}</Info>
          <Info libelle="Reçu le">{formatDate(dossier.dateReception)}</Info>
          <Info libelle="Clôturé le">{formatDate(dossier.dateCloture)}</Info>
          <Info libelle="Agent en charge">
            <select
              value={dossier.agent}
              onChange={(e) => reaffecterAgent(dossier, e.target.value)}
              aria-label="Réaffecter le dossier à un agent"
              className={CLASSE_SELECT}
            >
              {/* L'agent actuel reste proposé même s'il a été retiré des paramètres */}
              {!settings.agents.includes(dossier.agent) && <option>{dossier.agent}</option>}
              {settings.agents.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Info>
          <Info libelle="Priorité">
            <select
              value={dossier.priorite}
              onChange={(e) => changerPriorite(dossier, e.target.value)}
              aria-label="Changer la priorité du dossier"
              className={CLASSE_SELECT}
            >
              {PRIORITES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Info>
        </dl>
        {dossier.commentaire && (
          <p className="mt-4 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <span className="font-medium text-gray-500">Commentaire initial : </span>
            {dossier.commentaire}
          </p>
        )}
      </div>

      {/* Notes & interactions */}
      <div className="rounded-lg bg-white p-5 shadow">
        <h2 className="mb-3 text-sm font-semibold text-gray-800">Notes &amp; interactions</h2>

        {/* Ajout d'une note */}
        <form onSubmit={soumettreNote} className="mb-5 rounded-md border border-gray-200 p-3">
          <label htmlFor="nouvelle-note" className="mb-1 block text-xs font-medium text-gray-500">
            Ajouter une note (appel, visite, pièce reçue…)
          </label>
          <textarea
            id="nouvelle-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex. Assuré rappelé : pièce d'identité promise pour demain."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="auteur-note" className="text-xs text-gray-500">
                par
              </label>
              <select
                id="auteur-note"
                value={auteur || dossier.agent}
                onChange={(e) => setAuteur(e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-cnps-500 focus:outline-none"
              >
                {!settings.agents.includes(dossier.agent) && <option>{dossier.agent}</option>}
                {settings.agents.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={!note.trim()}
              className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ajouter la note
            </button>
          </div>
        </form>

        {/* Journal des événements */}
        {journal.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun événement enregistré pour ce dossier.</p>
        ) : (
          <ol className="space-y-3">
            {journal.map((evt) => {
              const type = TYPES_EVENEMENT[evt.type] || TYPES_EVENEMENT.note
              return (
                <li key={evt.id} className="flex gap-3">
                  <span
                    className={`mt-0.5 h-fit shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${type.classes}`}
                  >
                    {type.libelle}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800">{evt.texte}</p>
                    <p className="text-xs text-gray-400">
                      {formatDateHeure(evt.date)}
                      {evt.agent && ` — ${evt.agent}`}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
