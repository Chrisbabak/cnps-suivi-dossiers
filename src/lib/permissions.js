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

// Modification d'un dossier (statut, agent, priorité, échanges) :
// - admin : tous les dossiers ;
// - manager : les dossiers de son agence ;
// - technicien : ses dossiers, et ceux de ses collègues de la même agence
//   si le réglage « modifDossiersCollegues » est actif (Paramètres).
// Un dossier d'une autre agence est toujours en lecture seule.
export function canEditDossier(session, dossier, settings) {
  if (!session || !dossier) return false
  if (session.role === 'admin') return true
  if (dossier.agence !== session.agence) return false
  if (session.role === 'manager') return true
  return dossier.agent === session.nom || settings?.modifDossiersCollegues !== false
}

// Explication affichée quand un dossier est en lecture seule.
export function motifLectureSeule(session, dossier) {
  if (dossier.agence !== session?.agence) {
    return `Ce dossier est suivi par l'agence ${dossier.agence}. Vous pouvez le consulter, pas le modifier.`
  }
  return `Ce dossier est suivi par ${dossier.agent}. Votre agence ne permet pas de modifier le dossier d'un collègue.`
}
