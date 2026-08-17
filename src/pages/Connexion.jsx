// ---------------------------------------------------------------------------
// Écran de connexion (POC) : sélecteur de profil, sans mot de passe.
// - Technicien / Manager : choisir la PERSONNE dans l'annuaire — son agence
//   de rattachement est déduite automatiquement (affichée en dessous).
// - Admin : aucun champ supplémentaire.
// La session est stockée en localStorage et survit au rechargement.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ouvrirSession } from '../lib/auth.js'
import { ROLES } from '../lib/permissions.js'
import { agenceDeAgent, agenceDeManager } from '../lib/annuaire.js'
import { useData } from '../context/DataContext.jsx'

const CLASSE_CHAMP =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500'

export default function Connexion({ onConnexion }) {
  const navigate = useNavigate()
  const { settings } = useData()

  const [role, setRole] = useState('technicien')
  const [nomAgent, setNomAgent] = useState(settings.agents[0]?.nom || '')
  const [nomManager, setNomManager] = useState(settings.managers[0]?.nom || '')

  // L'agence n'est jamais saisie : elle est déduite de l'annuaire.
  const agenceDeduite =
    role === 'technicien'
      ? agenceDeAgent(settings, nomAgent)
      : role === 'manager'
        ? agenceDeManager(settings, nomManager)
        : null

  const soumettre = (e) => {
    e.preventDefault()
    const session = {
      role,
      agence: agenceDeduite,
      nom: role === 'admin' ? null : role === 'manager' ? nomManager : nomAgent,
    }
    ouvrirSession(session)
    navigate('/accueil', { replace: true })
    onConnexion()
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-cnps-700 via-cnps-600 to-gray-100 px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-xl bg-white p-8 shadow-xl">
            {/* Logo complet officiel */}
            <div className="mb-6 flex justify-center">
              <img
                src={`${import.meta.env.BASE_URL}logo-cnps-complet.svg`}
                alt="CNPS — Caisse Nationale de Prévoyance Sociale"
                className="w-full max-w-xs"
              />
            </div>

            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900">Bienvenue</h2>
              <p className="mt-1 text-sm text-gray-600">
                Choisissez votre profil pour accéder à votre espace de suivi des demandes &amp;
                réclamations.
              </p>
            </div>

            <form onSubmit={soumettre} className="space-y-4">
              <div>
                <label htmlFor="profil" className="mb-1 block text-sm font-medium text-gray-700">
                  Profil
                </label>
                <select
                  id="profil"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={CLASSE_CHAMP}
                >
                  {ROLES.map((r) => (
                    <option key={r.valeur} value={r.valeur}>
                      {r.libelle}
                    </option>
                  ))}
                </select>
              </div>

              {role === 'technicien' && (
                <div>
                  <label htmlFor="nom" className="mb-1 block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <select
                    id="nom"
                    value={nomAgent}
                    onChange={(e) => setNomAgent(e.target.value)}
                    className={CLASSE_CHAMP}
                  >
                    {settings.agents.map((a) => (
                      <option key={a.nom} value={a.nom}>
                        {a.nom} — {a.agence}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {role === 'manager' && (
                <div>
                  <label htmlFor="nom-manager" className="mb-1 block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <select
                    id="nom-manager"
                    value={nomManager}
                    onChange={(e) => setNomManager(e.target.value)}
                    className={CLASSE_CHAMP}
                  >
                    {settings.managers.map((m) => (
                      <option key={m.nom} value={m.nom}>
                        {m.nom} — {m.agence}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Agence déduite automatiquement de l'annuaire (jamais saisie) */}
              {role !== 'admin' && agenceDeduite && (
                <p className="rounded-md bg-cnps-50 px-3 py-2 text-xs text-cnps-800">
                  Agence de rattachement : <strong>{agenceDeduite}</strong>{' '}
                  <span className="text-cnps-600">(déduite automatiquement)</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Se connecter
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-cnps-100">
            Maquette CRM — données de démonstration · Réalisé par{' '}
            <a
              href="https://declick.co"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-white"
            >
              Declick.co
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
