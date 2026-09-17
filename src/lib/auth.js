// ---------------------------------------------------------------------------
// Authentification de DÉMONSTRATION (POC) : trois comptes fixes, vérifiés
// dans le navigateur, sans serveur. Chaque compte désigne une personne de
// l'annuaire ; son agence n'est pas stockée ici, elle est retrouvée dans
// l'annuaire à la connexion. La session { role, agence, nom } vit dans
// localStorage (clé "session") pour survivre au rechargement de la page.
// Le vrai CRM aura une authentification serveur et des comptes individuels.
// ---------------------------------------------------------------------------

const CLE_SESSION = 'session'

const COMPTES = [
  { identifiant: 'technicien', motDePasse: 'Tech2026', role: 'technicien', nom: 'S. Traoré' },
  { identifiant: 'manager', motDePasse: 'Manager2026', role: 'manager', nom: 'M. Koffi' },
  { identifiant: 'admin', motDePasse: 'Admin2026', role: 'admin', nom: null },
]

// Retourne le compte correspondant (identifiant insensible à la casse), ou null.
export function verifierIdentifiants(identifiant, motDePasse) {
  return (
    COMPTES.find(
      (c) =>
        c.identifiant === identifiant.trim().toLowerCase() && c.motDePasse === motDePasse,
    ) || null
  )
}

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
// "Profil : Technicien, S. Traoré (Angré)" / "Profil : Admin"
export function libelleSession(session = getSession()) {
  if (!session) return ''
  if (session.role === 'admin') return 'Profil : Admin'
  const role = session.role === 'manager' ? 'Manager' : 'Technicien'
  return `Profil : ${role}${session.nom ? `, ${session.nom}` : ''} (${session.agence})`
}
