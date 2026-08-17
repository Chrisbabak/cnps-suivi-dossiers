// ---------------------------------------------------------------------------
// Annuaire des utilisateurs (techniciens et managers) : chaque personne est
// rattachée à UNE agence. Toutes les déductions "utilisateur → agence"
// passent par ces fonctions.
// ---------------------------------------------------------------------------

// Noms des techniciens rattachés à une agence donnée.
export function agentsDeLAgence(settings, agence) {
  return settings.agents.filter((a) => a.agence === agence).map((a) => a.nom)
}

// Tous les noms de techniciens (tous rattachements confondus).
export function nomsDesAgents(settings) {
  return settings.agents.map((a) => a.nom)
}

// Agence de rattachement d'un technicien (null si inconnu de l'annuaire).
export function agenceDeAgent(settings, nom) {
  return settings.agents.find((a) => a.nom === nom)?.agence || null
}

// Agence de rattachement d'un manager (null si inconnu de l'annuaire).
export function agenceDeManager(settings, nom) {
  return settings.managers.find((m) => m.nom === nom)?.agence || null
}
