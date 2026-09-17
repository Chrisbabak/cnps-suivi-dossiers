// ---------------------------------------------------------------------------
// Fonctions utilitaires de dates.
// Les dates sont stockées au format ISO "AAAA-MM-JJ" (fuseau local).
// ---------------------------------------------------------------------------

function pad(n) {
  return String(n).padStart(2, '0')
}

// Convertit un objet Date en "AAAA-MM-JJ" (fuseau local, pas UTC).
export function versIso(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Date du jour au format ISO.
export function aujourdhuiIso() {
  return versIso(new Date())
}

// Date ISO d'il y a N jours (utilisé pour les données de démo).
export function ilYaJoursIso(jours) {
  const d = new Date()
  d.setDate(d.getDate() - jours)
  return versIso(d)
}

// Affichage français "JJ/MM/AAAA à HH:MM" pour un horodatage complet.
export function formatDateHeure(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

// Affichage français "JJ/MM/AAAA".
export function formatDate(iso) {
  if (!iso) return '-'
  const [annee, mois, jour] = iso.split('-')
  return `${jour}/${mois}/${annee}`
}

// Délai d'un dossier en jours :
// date de clôture (ou aujourd'hui si non clôturé) − date de réception.
export function delaiEnJours(dossier) {
  const debut = new Date(`${dossier.dateReception}T00:00:00`)
  const fin = new Date(`${dossier.dateCloture || aujourdhuiIso()}T00:00:00`)
  const jours = Math.round((fin.getTime() - debut.getTime()) / 86_400_000)
  return Math.max(0, jours)
}

// Délai cible d'un dossier (SLA), en jours calendaires :
// celui de son motif (Paramètres), à défaut le délai cible général ;
// un dossier urgent doit être traité deux fois plus vite.
export function delaiCibleDossier(dossier, settings) {
  const base = settings?.slaParMotif?.[dossier.motif] ?? settings?.delaiCible ?? 5
  return dossier.priorite === 'Urgente' ? Math.max(1, Math.ceil(base / 2)) : base
}

// Un dossier est "hors délai" si son délai dépasse son délai cible.
export function enDepassement(dossier, settings) {
  return delaiEnJours(dossier) > delaiCibleDossier(dossier, settings)
}
