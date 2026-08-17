// ---------------------------------------------------------------------------
// Session de DÉMONSTRATION : simple sélecteur de rôle, sans mot de passe
// ni gestion de comptes (POC). La session { role, agence, nom } vit dans
// localStorage (clé "session") pour survivre au rechargement de la page.
// Le vrai CRM aura une authentification serveur et des comptes individuels.
// ---------------------------------------------------------------------------

const CLE_SESSION = 'session'

// Retourne la session courante { role, agence, nom } ou null.
export function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(CLE_SESSION))
    return session && session.role ? session : null
  } catch {
    return null
  }
}

export function ouvrirSession(session) {
  localStorage.setItem(CLE_SESSION, JSON.stringify(session))
}

export function fermerSession() {
  localStorage.removeItem(CLE_SESSION)
}

// Libellé du profil affiché dans l'en-tête, ex. :
// "Profil : Technicien — S. Traoré (Yopougon)" / "Profil : Manager — K. Bamba (Plateau)" / "Profil : Admin"
export function libelleSession(session = getSession()) {
  if (!session) return ''
  if (session.role === 'admin') return 'Profil : Admin'
  const role = session.role === 'manager' ? 'Manager' : 'Technicien'
  return `Profil : ${role}${session.nom ? ` — ${session.nom}` : ''} (${session.agence})`
}
