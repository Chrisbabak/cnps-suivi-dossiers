// ---------------------------------------------------------------------------
// TOUTE la logique de périmètre par rôle est centralisée ici :
// les composants interrogent ces fonctions, aucune règle n'est dispersée.
//
//  Rôle       | Écrans                                   | Particularités
//  -----------|------------------------------------------|---------------------------------
//  technicien | accueil, dossiers, nouveau               | agence verrouillée, pas de suppr.
//  manager    | + pilotage (limité à son agence)         | agence verrouillée, réassignation
//  admin      | + paramètres                             | toutes agences, suppression
// ---------------------------------------------------------------------------

export const ROLES = [
  { valeur: 'technicien', libelle: 'Technicien' },
  { valeur: 'manager', libelle: 'Manager' },
  { valeur: 'admin', libelle: 'Admin' },
]

// Écrans accessibles par rôle (utilisé par la navigation ET les gardes de route).
const ECRANS_PAR_ROLE = {
  technicien: ['accueil', 'dossiers', 'nouveau'],
  manager: ['accueil', 'dossiers', 'nouveau', 'pilotage'],
  admin: ['accueil', 'dossiers', 'nouveau', 'pilotage', 'parametres'],
}

// Le rôle peut-il voir cet écran ?
export function canSee(ecran, role) {
  return (ECRANS_PAR_ROLE[role] || []).includes(ecran)
}

// Périmètre de consultation des dossiers :
// { agence: null } = toutes agences (admin), sinon l'agence de la session
// (filtre Agence pré-positionné et verrouillé pour technicien et manager).
export function getDossierScope(session) {
  if (!session || session.role === 'admin') return { agence: null }
  return { agence: session.agence }
}

// Seul l'admin peut supprimer un dossier.
export function canDeleteDossier(role) {
  return role === 'admin'
}

// Le manager peut réassigner un dossier à un autre agent depuis la liste.
export function canReassignDossier(role) {
  return role === 'manager'
}
