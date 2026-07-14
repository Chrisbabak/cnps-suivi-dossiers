// ---------------------------------------------------------------------------
// Génération des numéros de dossier au format "D-AAAA-NNN".
// Le compteur repart à 001 chaque année.
// ---------------------------------------------------------------------------

export function prochainNumero(dossiers, date = new Date()) {
  const annee = date.getFullYear()
  const prefixe = `D-${annee}-`
  let max = 0
  for (const dossier of dossiers) {
    if (typeof dossier.numero === 'string' && dossier.numero.startsWith(prefixe)) {
      const n = parseInt(dossier.numero.slice(prefixe.length), 10)
      if (!Number.isNaN(n) && n > max) max = n
    }
  }
  return `${prefixe}${String(max + 1).padStart(3, '0')}`
}

// Identifiant technique unique (interne, jamais affiché).
export function genererId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
