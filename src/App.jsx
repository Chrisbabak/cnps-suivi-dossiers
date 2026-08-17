// ---------------------------------------------------------------------------
// Racine de l'application : session par rôle (POC), routage + données.
// Tant qu'aucune session n'est ouverte, le sélecteur de profil couvre
// toutes les URL. Chaque route est gardée : l'accès direct par URL à un
// écran interdit pour le rôle redirige vers l'accueil.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from './context/DataContext.jsx'
import { getSession, fermerSession } from './lib/auth.js'
import { canSee } from './lib/permissions.js'
import Layout from './components/Layout.jsx'
import Accueil from './pages/Accueil.jsx'
import Connexion from './pages/Connexion.jsx'
import Dossiers from './pages/Dossiers.jsx'
import FicheDossier from './pages/FicheDossier.jsx'
import FicheMatricule from './pages/FicheMatricule.jsx'
import NouveauDossier from './pages/NouveauDossier.jsx'
import Pilotage from './pages/Pilotage.jsx'
import Parametres from './pages/Parametres.jsx'

// Base du routeur : '' en racine (Netlify), '/cnps-suivi-dossiers' sur GitHub Pages.
const BASE_ROUTEUR = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  const [session, setSession] = useState(getSession)

  const deconnexion = () => {
    fermerSession()
    setSession(null)
  }

  // Garde de route : écran non autorisé pour le rôle → retour à l'accueil.
  const garder = (ecran, element) =>
    canSee(ecran, session?.role) ? element : <Navigate to="/accueil" replace />

  return (
    <BrowserRouter basename={BASE_ROUTEUR}>
      <DataProvider>
        {!session ? (
          <Connexion onConnexion={() => setSession(getSession())} />
        ) : (
          <Layout session={session} onDeconnexion={deconnexion}>
            <Routes>
              <Route path="/" element={<Navigate to="/accueil" replace />} />
              <Route path="/accueil" element={<Accueil />} />
              <Route path="/dossiers" element={garder('dossiers', <Dossiers />)} />
              <Route path="/dossiers/:id" element={garder('dossiers', <FicheDossier />)} />
              <Route
                path="/matricules/:matricule"
                element={garder('dossiers', <FicheMatricule />)}
              />
              <Route path="/nouveau" element={garder('nouveau', <NouveauDossier />)} />
              <Route path="/pilotage" element={garder('pilotage', <Pilotage />)} />
              <Route path="/parametres" element={garder('parametres', <Parametres />)} />
              {/* Route inconnue : retour à l'accueil */}
              <Route path="*" element={<Navigate to="/accueil" replace />} />
            </Routes>
          </Layout>
        )}
      </DataProvider>
    </BrowserRouter>
  )
}
