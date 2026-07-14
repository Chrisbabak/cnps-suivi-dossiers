// ---------------------------------------------------------------------------
// Palette graphique dérivée de la charte CNPS (bleu, orange, vert, jaune
// du logo), ajustée pour rester lisible sur fond blanc et distinguable
// par les personnes daltoniennes (validée : contraste >= 3:1, écart CVD OK).
// ---------------------------------------------------------------------------

// Ordre FIXE : une catégorie garde toujours la même couleur.
export const PALETTE_CNPS = [
  '#3B5BC4', // bleu CNPS (éclairci)
  '#C96A06', // orange CNPS (assombri)
  '#2F9E41', // vert CNPS
  '#A87900', // jaune CNPS (assombri en ambre)
  '#7C4DBE', // violet (complément)
  '#0891B2', // cyan (complément)
]

// Couleurs sémantiques des statuts (cohérentes avec les badges de la liste).
export const COULEURS_STATUT = {
  Nouveau: '#3B5BC4',
  'En cours': '#A87900',
  'En attente pièces': '#7C4DBE',
  Validé: '#2F9E41',
  Clôturé: '#6B7280', // gris : dossier sorti du flux
}
