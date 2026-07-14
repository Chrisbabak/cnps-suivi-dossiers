// ---------------------------------------------------------------------------
// Racine de l'application : connexion (démo), routage + fournisseur de données.
// Tant que l'utilisateur n'est pas connecté, la page de connexion couvre
// toutes les URL ; après connexion, l'URL demandée s'affiche directement.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from './context/DataContext.jsx'
import { estConnecte, fermerSession } from './lib/auth.js'
import Layout from './components/Layout.jsx'
import Connexion from './pages/Connexion.jsx'
import Dossiers from './pages/Dossiers.jsx'
import FicheDossier from './pages/FicheDossier.jsx'
import NouveauDossier from './pages/NouveauDossier.jsx'
import Pilotage from './pages/Pilotage.jsx'
import Parametres from './pages/Parametres.jsx'

// Base du routeur : '' en racine (Netlify), '/cnps-suivi-dossiers' sur GitHub Pages.
const BASE_ROUTEUR = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  const [connecte, setConnecte] = useState(estConnecte)

  const deconnexion = () => {
    fermerSession()
    setConnecte(false)
  }

  return (
    <BrowserRouter basename={BASE_ROUTEUR}>
      <DataProvider>
        {!connecte ? (
          <Connexion onConnexion={() => setConnecte(true)} />
        ) : (
          <Layout onDeconnexion={deconnexion}>
            <Routes>
              <Route path="/" element={<Navigate to="/dossiers" replace />} />
              <Route path="/dossiers" element={<Dossiers />} />
              <Route path="/dossiers/:id" element={<FicheDossier />} />
              <Route path="/nouveau" element={<NouveauDossier />} />
              <Route path="/pilotage" element={<Pilotage />} />
              <Route path="/parametres" element={<Parametres />} />
              {/* Route inconnue : retour à la liste */}
              <Route path="*" element={<Navigate to="/dossiers" replace />} />
            </Routes>
          </Layout>
        )}
      </DataProvider>
    </BrowserRouter>
  )
}
