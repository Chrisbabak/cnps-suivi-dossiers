// Configuration Vite standard pour une application React.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Chemin de base du site : "/" par défaut (Netlify, local) ;
  // "/cnps-suivi-dossiers/" quand on construit pour GitHub Pages
  // (variable BASE_PATH définie dans le workflow GitHub Actions).
  base: process.env.BASE_PATH || '/',
})
