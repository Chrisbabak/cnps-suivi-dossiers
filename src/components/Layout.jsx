// ---------------------------------------------------------------------------
// Habillage général : en-tête institutionnel, navigation, pied de page.
// ---------------------------------------------------------------------------

import { NavLink } from 'react-router-dom'

const LIENS = [
  { to: '/dossiers', label: 'Dossiers' },
  { to: '/nouveau', label: 'Nouveau dossier' },
  { to: '/pilotage', label: 'Pilotage' },
  { to: '/parametres', label: 'Paramètres' },
]

export default function Layout({ children, onDeconnexion }) {
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
            {LIENS.map((lien) => (
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
          <button
            type="button"
            onClick={onDeconnexion}
            className="ml-auto rounded-md border border-cnps-400 px-3 py-1.5 text-sm text-cnps-100 transition-colors hover:bg-cnps-600 hover:text-white"
          >
            Se déconnecter
          </button>
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
