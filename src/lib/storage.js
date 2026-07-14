// ---------------------------------------------------------------------------
// Couche de persistance de la maquette (localStorage du navigateur).
//
// TOUTES les lectures/écritures de données passent par ce module.
// Pour brancher plus tard une vraie base de données (ex. Supabase),
// il suffira de réimplémenter ces fonctions en conservant la même
// interface (getAll / save / remove / exportCsv + paramètres),
// sans toucher au reste de l'application.
// ---------------------------------------------------------------------------

import { dossiersVersCsv } from './csv.js'
import { DEFAULT_SETTINGS } from './constants.js'

// v4 : données de démo concentrées sur moins d'agences (répartition parlante).
// Un changement de version repart d'un état neuf — les données de démo
// sont rechargées automatiquement au lancement suivant.
const STORAGE_KEY = 'cnps-suivi-dossiers-v4'

// Lit l'état complet { dossiers, settings } avec valeurs par défaut.
function lireEtat() {
  try {
    const brut = localStorage.getItem(STORAGE_KEY)
    if (!brut) return { dossiers: [], settings: { ...DEFAULT_SETTINGS } }
    const etat = JSON.parse(brut)
    return {
      dossiers: Array.isArray(etat.dossiers) ? etat.dossiers : [],
      settings: { ...DEFAULT_SETTINGS, ...(etat.settings || {}) },
    }
  } catch {
    // Données corrompues : on repart d'un état vide plutôt que de planter.
    return { dossiers: [], settings: { ...DEFAULT_SETTINGS } }
  }
}

function ecrireEtat(etat) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(etat))
}

// --- Dossiers ---------------------------------------------------------------

// Retourne tous les dossiers.
export function getAll() {
  return lireEtat().dossiers
}

// Crée ou met à jour un dossier (identifié par son champ "id").
export function save(dossier) {
  const etat = lireEtat()
  const i = etat.dossiers.findIndex((d) => d.id === dossier.id)
  if (i >= 0) etat.dossiers[i] = dossier
  else etat.dossiers.push(dossier)
  ecrireEtat(etat)
  return dossier
}

// Ajoute plusieurs dossiers d'un coup (import CSV, données de démo).
export function saveMany(dossiers) {
  const etat = lireEtat()
  etat.dossiers.push(...dossiers)
  ecrireEtat(etat)
}

// Supprime un dossier par son identifiant.
export function remove(id) {
  const etat = lireEtat()
  etat.dossiers = etat.dossiers.filter((d) => d.id !== id)
  ecrireEtat(etat)
}

// Retourne le contenu CSV de tous les dossiers (UTF-8 + BOM, séparateur ";").
export function exportCsv() {
  return dossiersVersCsv(getAll())
}

// --- Paramètres (agences, agents, délai cible) -------------------------------

export function getSettings() {
  return lireEtat().settings
}

export function saveSettings(settings) {
  const etat = lireEtat()
  etat.settings = { ...DEFAULT_SETTINGS, ...settings }
  ecrireEtat(etat)
  return etat.settings
}

// --- Initialisation / réinitialisation ---------------------------------------

// Indique si l'application a déjà été utilisée dans ce navigateur.
// Sert à ne charger les données de démo qu'au tout premier lancement.
export function estInitialise() {
  return localStorage.getItem(STORAGE_KEY) !== null
}

// Efface toutes les données (dossiers ET paramètres) mais écrit un état vide :
// l'application reste "initialisée", la démo ne se recharge donc pas toute
// seule après une réinitialisation volontaire.
export function clearAll() {
  ecrireEtat({ dossiers: [], settings: { ...DEFAULT_SETTINGS } })
}
