// ---------------------------------------------------------------------------
// Authentification de DÉMONSTRATION uniquement.
// Le contrôle se fait entièrement côté navigateur, sans serveur : il donne
// l'expérience d'un espace connecté pour la maquette, mais ne constitue PAS
// une protection réelle des données. Le vrai CRM aura une authentification
// serveur (SSO / annuaire d'agents).
// ---------------------------------------------------------------------------

const CLE_SESSION = 'cnps-session-v1'

// Compte unique de démonstration.
const COMPTE_DEMO = { identifiant: 'User', motDePasse: 'User2026' }

// Vérifie le couple identifiant / mot de passe (identifiant insensible à la casse).
export function verifierIdentifiants(identifiant, motDePasse) {
  return (
    identifiant.trim().toLowerCase() === COMPTE_DEMO.identifiant.toLowerCase() &&
    motDePasse === COMPTE_DEMO.motDePasse
  )
}

// La session vit dans localStorage : une fois connecté, l'utilisateur reste
// connecté sur ce navigateur (même après fermeture), jusqu'à cliquer sur
// "Se déconnecter".
export function estConnecte() {
  return localStorage.getItem(CLE_SESSION) === 'ouverte'
}

export function ouvrirSession() {
  localStorage.setItem(CLE_SESSION, 'ouverte')
}

export function fermerSession() {
  localStorage.removeItem(CLE_SESSION)
}
