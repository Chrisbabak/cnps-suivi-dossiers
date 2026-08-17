// ---------------------------------------------------------------------------
// Habillage général : en-tête institutionnel, navigation (limitée aux
// écrans autorisés pour le rôle), profil de session, pied de page.
// ---------------------------------------------------------------------------

import { NavLink } from 'react-router-dom'
import { libelleSession } from '../lib/auth.js'
import { canSee } from '../lib/permissions.js'

// Onglets de navigation ; chaque entrée est liée à un écran des permissions.
const LIENS = [
  { to: '/accueil', label: 'Accueil', ecran: 'accueil' },
  { to: '/dossiers', label: 'Dossiers', ecran: 'dossiers' },
  { to: '/nouveau', label: 'Nouveau dossier', ecran: 'nouveau' },
  { to: '/pilotage', label: 'Pilotage', ecran: 'pilotage' },
  { to: '/parametres', label: 'Paramètres', ecran: 'parametres' },
]

export default function Layout({ children, session, onDeconnexion }) {
  const liensVisibles = LIENS.filter((lien) => canSee(lien.ecran, session?.role))

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="bg-cnps-700 text-white shadow">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          {/* Logo + titre cliquables : ancre classique (pas de NavLink) pour
              provoquer un rechargement complet et revenir à l'accueil. */}
          <a
            href="/"
            className="flex items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white/60"
            title="Retour à l'accueil"
          >
            {/* Emblème officiel CNPS (téléchargé depuis cnps.ci).
                BASE_URL : fonctionne à la racine comme sous un sous-chemin (GitHub Pages). */}
            <img
              src={`${import.meta.env.BASE_URL}favicon.png`}
              alt="Logo CNPS"
              className="h-11 w-11 shrink-0 rounded-md bg-white p-0.5"
            />
            <div>
              <p className="text-base font-semibold leading-tight">
                CNPS <span className="font-normal text-cnps-100">· Suivi des demandes &amp; réclamations</span>
              </p>
              <p className="text-xs leading-tight text-cnps-100">
                Caisse Nationale de Prévoyance Sociale
              </p>
            </div>
          </a>
          <nav aria-label="Navigation principale" className="flex flex-wrap gap-1">
            {liensVisibles.map((lien) => (
              <NavLink
                key={lien.to}
                to={lien.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cnps-900 text-white'
                      : 'text-cnps-100 hover:bg-cnps-600 hover:text-white'
                  }`
                }
              >
                {lien.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {/* Profil de la session (rôle, nom, agence) */}
            <span className="hidden text-xs text-cnps-100 sm:inline">
              {libelleSession(session)}
            </span>
            <button
              type="button"
              onClick={onDeconnexion}
              className="rounded-md border border-cnps-400 px-3 py-1.5 text-sm text-cnps-100 transition-colors hover:bg-cnps-600 hover:text-white"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>

      <footer className="border-t border-gray-200 bg-white">
        <p className="mx-auto max-w-7xl px-4 py-3 text-center text-xs text-gray-500 sm:px-6">
          Maquette CRM — données de démonstration · Réalisé par{' '}
          <a
            href="https://declick.co"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-cnps-600"
          >
            Declick.co
          </a>
        </p>
      </footer>
    </div>
  )
}
