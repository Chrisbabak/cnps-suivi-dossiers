// ---------------------------------------------------------------------------
// Authentification de DÉMONSTRATION uniquement.
// Le contrôle se fait entièrement côté navigateur, sans serveur : il donne
// l'expérience d'un espace connecté pour la maquette, mais ne constitue PAS
// une protection réelle des données. Le vrai CRM aura une authentification
// serveur (SSO / annuaire d'agents) et des rôles gérés centralement.
// ---------------------------------------------------------------------------

const CLE_SESSION = 'cnps-session-v1'

// Comptes de démonstration : un technicien et un chef d'agence.
// Le rôle détermine la vue de la page d'accueil.
const COMPTES = [
  { identifiant: 'User', motDePasse: 'User2026', role: 'technicien', libelle: 'Technicien' },
  { identifiant: 'Chef', motDePasse: 'Chef2026', role: 'chef', libelle: "Chef d'agence" },
]

// Vérifie le couple identifiant / mot de passe (identifiant insensible à la
// casse) et retourne le compte correspondant, ou null.
export function verifierIdentifiants(identifiant, motDePasse) {
  return (
    COMPTES.find(
      (c) =>
        c.identifiant.toLowerCase() === identifiant.trim().toLowerCase() &&
        c.motDePasse === motDePasse,
    ) || null
  )
}

// Lit la session { role } ; compatibilité avec l'ancien format ("ouverte").
function lireSession() {
  const brut = localStorage.getItem(CLE_SESSION)
  if (!brut) return null
  if (brut === 'ouverte') return { role: 'technicien' }
  try {
    const session = JSON.parse(brut)
    return session && session.role ? session : null
  } catch {
    return null
  }
}

// La session vit dans localStorage : une fois connecté, l'utilisateur reste
// connecté sur ce navigateur jusqu'à cliquer sur "Se déconnecter".
export function estConnecte() {
  return lireSession() !== null
}

export function getRole() {
  return lireSession()?.role || 'technicien'
}

export function libelleRole() {
  const compte = COMPTES.find((c) => c.role === getRole())
  return compte ? compte.libelle : 'Technicien'
}

export function ouvrirSession(role) {
  localStorage.setItem(CLE_SESSION, JSON.stringify({ role }))
}

export function fermerSession() {
  localStorage.removeItem(CLE_SESSION)
}
