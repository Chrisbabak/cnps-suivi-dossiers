// ---------------------------------------------------------------------------
// Changement de statut confirmé : chaque changement est historisé, il passe
// donc par une fenêtre de validation (avec un commentaire facultatif,
// enregistré dans le journal). À la clôture, confettis et félicitations.
//
// Usage :  const { demander, elements } = useConfirmationStatut()
//          demander(dossier, 'Clôturé')   …   {elements} dans le rendu
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useData } from '../context/DataContext.jsx'
import { getSession } from '../lib/auth.js'
import { aujourdhuiIso, delaiEnJours, delaiCibleDossier } from '../lib/dates.js'

const COULEURS_CNPS = ['#26418F', '#E8820D', '#2F9E41', '#FFC20E', '#1B5E3A']

// Nom inscrit dans le journal : la personne connectée, ou son profil.
export function auteurSession() {
  const session = getSession()
  if (session?.nom) return session.nom
  return session?.role === 'admin' ? 'Admin' : null
}

function celebrer() {
  const options = { colors: COULEURS_CNPS, disableForReducedMotion: true, zIndex: 60 }
  confetti({ ...options, particleCount: 120, spread: 75, origin: { y: 0.6 } })
  setTimeout(() => confetti({ ...options, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 200)
  setTimeout(() => confetti({ ...options, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 350)
}

const PLACEHOLDERS = {
  Clôturé: "Ex. Attestation remise à l'assuré, dossier soldé.",
  Validé: 'Ex. Validé par le superviseur.',
  'En attente pièces': 'Ex. Certificat de scolarité demandé à l\'assurée.',
}

function Modale({ dossier, statut, onAnnuler, onConfirmer }) {
  const [commentaire, setCommentaire] = useState('')
  const zone = useRef(null)

  useEffect(() => {
    zone.current?.focus()
    const surTouche = (e) => {
      if (e.key === 'Escape') onAnnuler()
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [onAnnuler])

  const cloture = statut === 'Clôturé'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onAnnuler}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-confirmation"
    >
      <form
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          onConfirmer(commentaire.trim())
        }}
      >
        <h2 id="titre-confirmation" className="text-base font-semibold text-gray-900">
          {cloture ? 'Clôturer le dossier ?' : 'Confirmer le changement de statut'}
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          Dossier <strong className="tabular-nums">{dossier.numero}</strong> :{' '}
          « {dossier.statut} » → <strong>« {statut} »</strong>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Ce changement sera enregistré dans l'historique du dossier, avec votre nom et votre
          commentaire.
        </p>
        <label htmlFor="commentaire-statut" className="mb-1 mt-4 block text-xs font-medium text-gray-600">
          Commentaire (facultatif)
        </label>
        <textarea
          id="commentaire-statut"
          ref={zone}
          rows={2}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder={PLACEHOLDERS[statut] || 'Précisez la raison du changement.'}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onAnnuler}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className={`rounded-md px-3 py-1.5 text-sm font-semibold text-white shadow-sm ${
              cloture ? 'bg-cnps-600 hover:bg-cnps-700' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {cloture ? 'Clôturer le dossier' : 'Confirmer'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Felicitations({ message, onFermer }) {
  return (
    <div
      role="status"
      className="fixed left-1/2 top-28 z-[70] w-[min(92vw,30rem)] -translate-x-1/2 rounded-lg bg-cnps-700 px-5 py-4 text-white shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{message.titre}</p>
          <p className="mt-1 text-sm text-cnps-100">{message.detail}</p>
        </div>
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer le message"
          className="rounded px-1.5 text-cnps-100 hover:bg-cnps-600 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export function useConfirmationStatut() {
  const { changerStatut, settings } = useData()
  const [demande, setDemande] = useState(null) // { dossier, statut }
  const [bravo, setBravo] = useState(null)

  useEffect(() => {
    if (!bravo) return undefined
    const minuterie = setTimeout(() => setBravo(null), 7000)
    return () => clearTimeout(minuterie)
  }, [bravo])

  const demander = (dossier, statut) => {
    if (statut !== dossier.statut) setDemande({ dossier, statut })
  }

  const confirmer = (commentaire) => {
    const { dossier, statut } = demande
    changerStatut(dossier, statut, commentaire, auteurSession())
    setDemande(null)
    if (statut === 'Clôturé') {
      const clos = { ...dossier, dateCloture: dossier.dateCloture || aujourdhuiIso() }
      const jours = delaiEnJours(clos)
      const cible = delaiCibleDossier(dossier, settings)
      const duree = `${jours} jour${jours > 1 ? 's' : ''}`
      setBravo(
        jours <= cible
          ? {
              titre: `Bravo ! Dossier ${dossier.numero} clôturé`,
              detail: `Traité en ${duree}, dans le délai cible de ${cible} jours. L'assuré a sa réponse.`,
            }
          : {
              titre: `Dossier ${dossier.numero} clôturé`,
              detail: `Traité en ${duree}, au-delà du délai cible de ${cible} jours. L'assuré a enfin sa réponse.`,
            },
      )
      celebrer()
    }
  }

  const elements = (
    <>
      {demande && (
        <Modale
          dossier={demande.dossier}
          statut={demande.statut}
          onAnnuler={() => setDemande(null)}
          onConfirmer={confirmer}
        />
      )}
      {bravo && <Felicitations message={bravo} onFermer={() => setBravo(null)} />}
    </>
  )

  return { demander, elements }
}
