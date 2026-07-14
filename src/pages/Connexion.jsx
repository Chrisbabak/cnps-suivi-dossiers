// ---------------------------------------------------------------------------
// Page d'accueil / connexion : logo CNPS, message de bienvenue et formulaire.
// Tant que l'utilisateur n'est pas connecté, cette page couvre toute l'app.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifierIdentifiants, ouvrirSession } from '../lib/auth.js'

const CLASSE_CHAMP =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-cnps-500 focus:outline-none focus:ring-1 focus:ring-cnps-500'

export default function Connexion({ onConnexion }) {
  const navigate = useNavigate()
  const [identifiant, setIdentifiant] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState(null)

  const soumettre = (e) => {
    e.preventDefault()
    if (verifierIdentifiants(identifiant, motDePasse)) {
      ouvrirSession()
      navigate('/dossiers', { replace: true }) // atterrissage : page Dossiers
      onConnexion()
    } else {
      setErreur('Identifiant ou mot de passe incorrect.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      {/* Bandeau vert institutionnel en fond de partie haute */}
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
                Connectez-vous à votre espace de suivi des demandes &amp; réclamations.
              </p>
            </div>

            {erreur && (
              <div
                role="alert"
                className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {erreur}
              </div>
            )}

            <form onSubmit={soumettre} className="space-y-4">
              <div>
                <label htmlFor="identifiant" className="mb-1 block text-sm font-medium text-gray-700">
                  Identifiant
                </label>
                <input
                  id="identifiant"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  className={CLASSE_CHAMP}
                />
              </div>
              <div>
                <label htmlFor="mot-de-passe" className="mb-1 block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  id="mot-de-passe"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className={CLASSE_CHAMP}
                />
              </div>
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
