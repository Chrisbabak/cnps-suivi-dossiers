// ---------------------------------------------------------------------------
// Jeu de données de démonstration : 12 dossiers réalistes mais FICTIFS
// (matricules inventés, aucun nom d'assuré — conformité protection des données).
// Chargé automatiquement au tout premier lancement dans un navigateur,
// puis rechargeable à volonté via le bouton "Charger des données de démo".
// ---------------------------------------------------------------------------

import { ilYaJoursIso } from './dates.js'
import { genererId } from './numero.js'

// Chaque entrée décrit : reçu il y a N jours, clôturé (ou non) après X jours.
const MODELES = [
  {
    recuIlYa: 26, clotureApres: 3,
    type: 'Demande', motif: 'Attestation', canal: 'Agence', priorite: 'Normale',
    matricule: '115004782', agence: 'Plateau', agent: 'A. Kouassi',
    statut: 'Clôturé', commentaire: 'Attestation de non-redevance remise au guichet.',
  },
  {
    recuIlYa: 24, clotureApres: 9,
    type: 'Réclamation', motif: 'Prestations sociales', canal: 'Téléphone', priorite: 'Urgente',
    matricule: '208119345', agence: 'Bouaké', agent: 'M. Diabaté',
    statut: 'Clôturé', commentaire: 'Pension non versée sur 2 mois — régularisée après vérification.',
    notes: [{ ilYa: 20, texte: 'Assuré rappelé : anomalie de RIB identifiée, correction transmise au service paiement.' }],
  },
  {
    recuIlYa: 21, clotureApres: 4,
    type: 'Demande', motif: 'Ouverture de dossier', canal: 'e-CNPS', priorite: 'Normale',
    matricule: 'E-045210', agence: 'Yopougon', agent: 'S. Traoré',
    statut: 'Clôturé', commentaire: 'Immatriculation nouvel employeur (12 salariés).',
  },
  {
    recuIlYa: 19, clotureApres: 2,
    type: 'Demande', motif: 'Attestation', canal: 'Email', priorite: 'Normale',
    matricule: '176880231', agence: 'Cocody', agent: "F. N'Guessan",
    statut: 'Clôturé', commentaire: 'Attestation de travail déclarée, envoyée par email.',
  },
  {
    recuIlYa: 16, clotureApres: null,
    type: 'Réclamation', motif: 'Recouvrement', canal: 'Courrier', priorite: 'Normale',
    matricule: 'E-032877', agence: 'San Pedro', agent: 'A. Kouassi',
    statut: 'En attente pièces', commentaire: 'Contestation de mise en demeure — attente des états de paie.',
    notes: [{ ilYa: 10, texte: 'Employeur relancé par courriel pour transmettre les états de paie 2025.' }],
  },
  {
    recuIlYa: 13, clotureApres: 5,
    type: 'Demande', motif: 'Mise à jour dossier', canal: 'Agence', priorite: 'Normale',
    matricule: '199245067', agence: 'Korhogo', agent: 'M. Diabaté',
    statut: 'Clôturé', commentaire: 'Changement d’adresse et de RIB pris en compte.',
  },
  {
    recuIlYa: 11, clotureApres: null,
    type: 'Réclamation', motif: 'Paiement cotisations', canal: 'WhatsApp', priorite: 'Urgente',
    matricule: 'E-051944', agence: 'Yamoussoukro', agent: 'S. Traoré',
    statut: 'En cours', commentaire: 'Paiement effectué non imputé au compte employeur.',
    notes: [{ ilYa: 9, texte: 'Preuve de paiement reçue via WhatsApp, transmise à la comptabilité pour imputation.' }],
  },
  {
    recuIlYa: 8, clotureApres: null,
    type: 'Demande', motif: 'Déclaration employeur', canal: 'e-CNPS', priorite: 'Normale',
    matricule: 'E-047305', agence: 'Plateau', agent: "F. N'Guessan",
    statut: 'Validé', commentaire: 'DISA en cours de traitement, validation superviseur faite.',
  },
  {
    recuIlYa: 7, clotureApres: null,
    type: 'Demande', motif: 'Prestations sociales', canal: 'Téléphone', priorite: 'Normale',
    matricule: '221073518', agence: 'Yopougon', agent: 'A. Kouassi',
    statut: 'En cours', commentaire: 'Demande d’allocations familiales — dossier en instruction.',
  },
  {
    recuIlYa: 4, clotureApres: null,
    type: 'Réclamation', motif: 'Prestations sociales', canal: 'Agence', priorite: 'Urgente',
    matricule: '184652090', agence: 'Plateau', agent: 'M. Diabaté',
    statut: 'En cours', commentaire: 'Montant de pension jugé incorrect après revalorisation.',
    notes: [{ ilYa: 3, texte: 'Dossier transmis au service prestations pour recalcul de la pension.' }],
  },
  {
    recuIlYa: 2, clotureApres: null,
    type: 'Demande', motif: 'Ouverture de dossier', canal: 'Agence', priorite: 'Normale',
    matricule: '230098412', agence: 'Cocody', agent: 'S. Traoré',
    statut: 'En attente pièces', commentaire: 'Immatriculation assuré volontaire — pièce d’identité à fournir.',
  },
  {
    recuIlYa: 0, clotureApres: null,
    type: 'Demande', motif: 'Attestation', canal: 'Email', priorite: 'Normale',
    matricule: '145733826', agence: 'Bouaké', agent: "F. N'Guessan",
    statut: 'Nouveau', commentaire: 'Demande d’attestation de mise à jour des cotisations.',
  },
]

// Horodatage fictif : la date d'il y a N jours, à une heure de bureau donnée.
function horodatage(ilYaJours, heure = '09:00') {
  return `${ilYaJoursIso(Math.max(0, ilYaJours))}T${heure}:00`
}

// Reconstitue un historique plausible (journal de la fiche) pour un dossier
// de démo, en fonction de son statut : création, avancements, notes, clôture.
function historiqueDemo(m) {
  const evt = (ilYa, heure, type, texte) => ({
    id: genererId(),
    date: horodatage(ilYa, heure),
    type,
    texte,
    agent: m.agent,
  })

  const evenements = [evt(m.recuIlYa, '09:00', 'creation', `Dossier créé (canal ${m.canal})`)]
  if (m.statut !== 'Nouveau') {
    evenements.push(evt(m.recuIlYa - 1, '10:30', 'statut', 'Statut modifié : Nouveau → En cours'))
  }
  if (m.statut === 'En attente pièces') {
    evenements.push(
      evt(m.recuIlYa - 2, '15:00', 'statut', 'Statut modifié : En cours → En attente pièces'),
    )
  }
  if (m.statut === 'Validé') {
    evenements.push(evt(m.recuIlYa - 2, '11:15', 'statut', 'Statut modifié : En cours → Validé'))
  }
  if (m.statut === 'Clôturé') {
    evenements.push(
      evt(m.recuIlYa - m.clotureApres, '16:45', 'statut', 'Statut modifié : En cours → Clôturé'),
    )
  }
  for (const n of m.notes || []) {
    evenements.push(evt(n.ilYa, '14:20', 'note', n.texte))
  }
  return evenements
}

// Construit les 12 dossiers de démo (sans numéro : il est attribué au chargement
// pour ne pas entrer en conflit avec les dossiers déjà enregistrés).
export function creerDossiersDemo() {
  return MODELES.map((m) => ({
    id: genererId(),
    numero: null, // attribué par le contexte au moment du chargement
    type: m.type,
    canal: m.canal,
    motif: m.motif,
    matricule: m.matricule,
    agence: m.agence,
    agent: m.agent,
    priorite: m.priorite,
    statut: m.statut,
    commentaire: m.commentaire,
    dateReception: ilYaJoursIso(m.recuIlYa),
    dateCloture: m.clotureApres == null ? null : ilYaJoursIso(m.recuIlYa - m.clotureApres),
    historique: historiqueDemo(m),
  }))
}
