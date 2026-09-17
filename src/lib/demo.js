// ---------------------------------------------------------------------------
// Jeu de données de démonstration : 34 dossiers réalistes mais FICTIFS
// (matricules inventés, aucun nom d'assuré, par conformité à la protection
// des données), répartis sur 8 semaines, avec leurs échanges avec l'assuré.
// Chargé automatiquement au tout premier lancement dans un navigateur,
// puis rechargeable à volonté via le bouton "Charger des données de démo".
//
// Chaque dossier est décrit par :
//   r  : reçu il y a r jours          c : clôturé c jours après réception (ou null)
//   ech : échanges [jours après réception, heure, canal, compte rendu]
//   notes : notes internes [jours après réception, heure, texte]
//   jv : jour de validation (dossiers "Validé")
// Chaque technicien ne traite que des dossiers de son agence (annuaire).
// ---------------------------------------------------------------------------

import { ilYaJoursIso } from './dates.js'
import { genererId } from './numero.js'

// Ordre chronologique : les numéros D-AAAA-NNN sont attribués dans cet ordre.
const MODELES = [
  {
    r: 55, c: 4, type: 'Demande', motif: 'Attestation', canal: 'Agence', priorite: 'Normale',
    matricule: '115004782', agence: 'Plateau', agent: 'A. Kouassi', statut: 'Clôturé',
    objet: "Attestation de non-redevance pour un appel d'offres.",
    ech: [[4, '15:10', 'Visite en agence', 'Attestation remise en main propre au guichet.']],
  },
  {
    r: 52, c: 9, type: 'Réclamation', motif: 'Retraite', canal: 'Téléphone', priorite: 'Urgente',
    matricule: '208119345', agence: 'Bouaké', agent: "F. N'Guessan", statut: 'Clôturé',
    objet: 'Pension non versée depuis deux mois.',
    ech: [
      [0, '09:05', 'Appel entrant', 'Assuré inquiet : aucun versement depuis juillet.'],
      [3, '11:20', 'Appel sortant', 'Anomalie de RIB identifiée, nouveau RIB demandé.'],
      [5, '10:00', 'Email', 'RIB corrigé reçu par email.'],
      [9, '16:30', 'Appel sortant', 'Assuré informé du versement du rappel.'],
    ],
    notes: [[4, '14:00', 'Correction transmise au service paiement.']],
  },
  {
    r: 49, c: 3, type: 'Demande', motif: 'Immatriculation employeur', canal: 'e-CNPS', priorite: 'Normale',
    matricule: 'E-045210', agence: 'Angré', agent: 'S. Traoré', statut: 'Clôturé',
    objet: "Immatriculation d'un nouvel employeur (12 salariés).",
    ech: [
      [1, '10:15', 'Email', 'Statuts et registre de commerce demandés.'],
      [3, '09:40', 'Email', 'Pièces reçues, numéro employeur communiqué.'],
    ],
  },
  {
    r: 47, c: 2, type: 'Demande', motif: 'Attestation', canal: 'Email', priorite: 'Normale',
    matricule: '176880231', agence: 'Cocody', agent: 'B. Koné', statut: 'Clôturé',
    objet: 'Attestation de travail déclarée.',
    ech: [[2, '11:00', 'Email', 'Attestation envoyée en pièce jointe.']],
  },
  {
    r: 45, c: 6, type: 'Demande', motif: 'Allocations familiales', canal: 'Agence', priorite: 'Normale',
    matricule: '190445120', agence: 'Angré', agent: 'N. Brou', statut: 'Clôturé',
    objet: "Demande d'allocations familiales pour un troisième enfant.",
    ech: [
      [0, '10:30', 'Visite en agence', 'Dossier déposé, extrait de naissance manquant.'],
      [4, '09:15', 'WhatsApp', "Photo de l'extrait de naissance reçue."],
      [6, '15:00', 'Appel sortant', "Assurée informée de l'ouverture des droits."],
    ],
  },
  {
    r: 43, c: null, type: 'Réclamation', motif: 'Recouvrement', canal: 'Courrier', priorite: 'Normale',
    matricule: 'E-032877', agence: 'San Pedro', agent: 'R. Aka', statut: 'En attente pièces',
    objet: "Contestation d'une mise en demeure de cotisations.",
    ech: [
      [2, '10:00', 'Courrier', "Accusé de réception envoyé à l'employeur."],
      [12, '14:30', 'Email', 'Relance : états de paie 2025 toujours attendus.'],
      [30, '11:10', 'Appel sortant', "Le comptable promet l'envoi des états sous huit jours."],
    ],
  },
  {
    r: 41, c: 5, type: 'Demande', motif: 'Mise à jour du dossier', canal: 'Agence', priorite: 'Normale',
    matricule: '199245067', agence: 'Korhogo', agent: 'I. Ouattara', statut: 'Clôturé',
    objet: "Changement d'adresse et de coordonnées bancaires.",
    ech: [
      [0, '09:30', 'Visite en agence', 'Formulaire de mise à jour rempli sur place.'],
      [5, '16:00', 'Appel sortant', 'Assuré informé de la prise en compte.'],
    ],
  },
  {
    r: 38, c: 3, type: 'Demande', motif: 'Relevé de carrière', canal: 'Téléphone', priorite: 'Normale',
    matricule: '184652090', agence: 'Plateau', agent: 'M. Diabaté', statut: 'Clôturé',
    objet: 'Relevé de carrière pour une simulation de retraite.',
    ech: [
      [0, '10:45', 'Appel entrant', 'Demande de relevé de carrière.'],
      [3, '09:00', 'Email', 'Relevé envoyé par email.'],
    ],
  },
  {
    r: 36, c: 7, type: 'Réclamation', motif: 'Paiement des cotisations', canal: 'Email', priorite: 'Normale',
    matricule: 'E-058331', agence: 'Angré', agent: 'S. Traoré', statut: 'Clôturé',
    objet: 'Double prélèvement des cotisations du deuxième trimestre.',
    ech: [
      [0, '08:50', 'Email', 'Relevé bancaire reçu montrant le double prélèvement.'],
      [2, '11:30', 'Appel sortant', 'Employeur informé de la vérification en cours.'],
      [7, '15:20', 'Email', "Remboursement confirmé à l'employeur."],
    ],
    notes: [[3, '10:00', 'Écart confirmé par la comptabilité.']],
  },
  {
    r: 33, c: 4, type: 'Demande', motif: 'Affiliation travailleur indépendant', canal: 'Agence', priorite: 'Normale',
    matricule: '231154608', agence: 'Bouaké', agent: "F. N'Guessan", statut: 'Clôturé',
    objet: "Immatriculation d'un travailleur indépendant.",
    ech: [
      [0, '11:00', 'Visite en agence', 'Pièces vérifiées au guichet.'],
      [4, '10:10', 'Appel sortant', "Numéro d'immatriculation communiqué."],
    ],
  },
  {
    r: 31, c: 2, type: 'Demande', motif: 'Déclaration des salaires', canal: 'e-CNPS', priorite: 'Normale',
    matricule: 'E-061207', agence: 'Cocody', agent: 'B. Koné', statut: 'Clôturé',
    objet: 'Aide à la déclaration trimestrielle en ligne.',
    ech: [
      [0, '14:00', 'Appel entrant', 'Difficulté de connexion à e-CNPS.'],
      [2, '09:30', 'Appel sortant', 'Accès réinitialisé, déclaration faite avec l\'employeur.'],
    ],
  },
  {
    r: 29, c: 8, type: 'Réclamation', motif: 'Maternité', canal: 'WhatsApp', priorite: 'Urgente',
    matricule: '176004392', agence: 'Yamoussoukro', agent: 'D. Yao', statut: 'Clôturé',
    objet: 'Indemnités journalières de maternité non perçues.',
    ech: [
      [0, '19:10', 'WhatsApp', "Message de l'assurée signalant le retard."],
      [1, '09:00', 'Appel sortant', 'Certificat médical manquant identifié.'],
      [4, '10:30', 'Visite en agence', "Certificat déposé à l'agence."],
      [8, '11:00', 'Appel sortant', "Paiement confirmé à l'assurée."],
    ],
  },
  {
    r: 27, c: null, type: 'Demande', motif: 'Attestation', canal: 'Agence', priorite: 'Normale',
    matricule: '222807561', agence: 'Angré', agent: 'S. Traoré', statut: 'En attente pièces',
    objet: "Attestation d'immatriculation pour un dossier de visa.",
    ech: [
      [0, '10:20', 'Visite en agence', "Pièce d'identité expirée, nouvelle pièce demandée."],
      [10, '09:40', 'Appel sortant', 'Relance : pièce toujours attendue.'],
    ],
  },
  {
    r: 25, c: 3, type: 'Demande', motif: 'Mise à jour du dossier', canal: 'Email', priorite: 'Normale',
    matricule: '195532874', agence: 'Plateau', agent: 'A. Kouassi', statut: 'Clôturé',
    objet: "Ajout d'un ayant droit (conjoint).",
    ech: [
      [0, '08:30', 'Email', 'Acte de mariage reçu.'],
      [3, '14:15', 'Email', "Confirmation de l'ajout envoyée."],
    ],
  },
  {
    r: 23, c: null, type: 'Réclamation', motif: 'Recouvrement', canal: 'Téléphone', priorite: 'Normale',
    matricule: 'E-070118', agence: 'Plateau', agent: 'M. Diabaté', statut: 'En cours',
    objet: "Pénalités de retard contestées par l'employeur.",
    ech: [
      [0, '11:40', 'Appel entrant', 'Employeur conteste les pénalités de juin.'],
      [6, '10:00', 'Email', 'Justificatifs de paiement reçus.'],
    ],
    notes: [[8, '15:00', "Demande d'annulation transmise au recouvrement."]],
  },
  {
    r: 21, c: 5, type: 'Demande', motif: 'Pension de réversion', canal: 'Courrier', priorite: 'Normale',
    matricule: '188120995', agence: 'Korhogo', agent: 'I. Ouattara', statut: 'Clôturé',
    objet: 'Demande de pension de réversion.',
    ech: [
      [0, '09:00', 'Courrier', 'Dossier de réversion reçu par courrier.'],
      [5, '11:20', 'Courrier', 'Notification de pension envoyée.'],
    ],
  },
  {
    r: 20, c: null, type: 'Réclamation', motif: 'Retraite', canal: 'Agence', priorite: 'Urgente',
    matricule: '208119345', agence: 'Angré', agent: 'N. Brou', statut: 'En cours',
    objet: 'Écart sur le montant du rappel de pension.',
    ech: [
      [0, '10:00', 'Visite en agence', 'Assuré de passage à Angré, écart de 35 000 F constaté.'],
      [4, '09:45', 'Appel sortant', 'Dossier transmis, assuré informé du délai de traitement.'],
    ],
    notes: [[1, '16:00', 'Historique consulté : réclamation précédente traitée à Bouaké.']],
  },
  {
    r: 18, c: null, jv: 10, type: 'Demande', motif: 'Déclaration des salaires', canal: 'e-CNPS', priorite: 'Normale',
    matricule: 'E-045210', agence: 'Plateau', agent: 'M. Diabaté', statut: 'Validé',
    objet: 'Déclaration annuelle des salaires (DISA) à valider.',
    ech: [
      [0, '08:45', 'Email', 'DISA déposée sur e-CNPS.'],
      [5, '10:30', 'Appel sortant', 'Deux salariés à corriger, employeur prévenu.'],
      [9, '14:00', 'Email', 'Corrections reçues.'],
    ],
  },
  {
    r: 16, c: null, type: 'Demande', motif: 'Assurance volontaire', canal: 'Agence', priorite: 'Normale',
    matricule: '230098412', agence: 'Cocody', agent: 'B. Koné', statut: 'En attente pièces',
    objet: "Immatriculation d'un assuré volontaire.",
    ech: [
      [0, '11:30', 'Visite en agence', "Pièce d'identité à fournir."],
      [7, '10:00', 'WhatsApp', 'Relance envoyée par WhatsApp.'],
    ],
  },
  {
    r: 14, c: null, type: 'Réclamation', motif: 'Paiement des cotisations', canal: 'WhatsApp', priorite: 'Urgente',
    matricule: 'E-051944', agence: 'Yamoussoukro', agent: 'D. Yao', statut: 'En cours',
    objet: 'Paiement effectué mais non imputé au compte employeur.',
    ech: [
      [0, '17:45', 'WhatsApp', 'Preuve de virement reçue.'],
      [2, '09:10', 'Appel sortant', "Référence du virement confirmée avec l'employeur."],
    ],
    notes: [[3, '11:00', 'Transmis à la comptabilité pour imputation.']],
  },
  {
    r: 12, c: null, type: 'Demande', motif: 'Allocations familiales', canal: 'Téléphone', priorite: 'Normale',
    matricule: '221073518', agence: 'Angré', agent: 'S. Traoré', statut: 'En cours',
    objet: "Demande d'allocations familiales, dossier en instruction.",
    ech: [
      [0, '10:05', 'Appel entrant', "Assurée demande où en est son dossier d'allocations."],
      [5, '15:30', 'Appel sortant', 'Pièce complémentaire demandée : certificat de scolarité.'],
    ],
  },
  {
    r: 11, c: null, type: 'Réclamation', motif: 'Recouvrement', canal: 'Email', priorite: 'Normale',
    matricule: 'E-066540', agence: 'San Pedro', agent: 'R. Aka', statut: 'En cours',
    objet: "Contestation d'une taxation d'office.",
    ech: [
      [0, '09:20', 'Email', 'Réclamation reçue avec les déclarations jointes.'],
      [6, '11:00', 'Appel sortant', 'Rendez-vous fixé avec le gérant.'],
    ],
  },
  {
    r: 10, c: null, type: 'Demande', motif: 'Attestation', canal: 'Agence', priorite: 'Normale',
    matricule: '197630412', agence: 'Plateau', agent: 'A. Kouassi', statut: 'En cours',
    objet: 'Attestation de cessation de travail pour un départ à la retraite.',
    ech: [[0, '09:50', 'Visite en agence', 'Demande déposée au guichet.']],
  },
  {
    r: 9, c: null, type: 'Réclamation', motif: 'Retraite', canal: 'Téléphone', priorite: 'Urgente',
    matricule: '184652090', agence: 'Plateau', agent: 'A. Kouassi', statut: 'En cours',
    objet: 'Montant de pension jugé incorrect après revalorisation.',
    ech: [
      [0, '08:40', 'Appel entrant', 'Assuré conteste le nouveau montant.'],
      [2, '10:15', 'Appel sortant', 'Bulletin de pension demandé.'],
      [3, '16:10', 'Email', 'Bulletin reçu.'],
    ],
    notes: [[4, '09:00', 'Transmis au service prestations pour recalcul.']],
  },
  {
    r: 8, c: null, type: 'Demande', motif: 'Mise à jour du dossier', canal: 'WhatsApp', priorite: 'Normale',
    matricule: '211948307', agence: 'Angré', agent: 'N. Brou', statut: 'En cours',
    objet: 'Correction de la date de naissance.',
    ech: [[0, '12:30', 'WhatsApp', "Photo de l'extrait de naissance reçue."]],
  },
  {
    r: 7, c: null, type: 'Demande', motif: 'Déclaration des salaires', canal: 'Email', priorite: 'Normale',
    matricule: 'E-058331', agence: 'Angré', agent: 'S. Traoré', statut: 'En cours',
    objet: 'Régularisation de la déclaration du troisième trimestre.',
    ech: [
      [0, '09:00', 'Email', 'Déclaration rectificative reçue.'],
      [3, '14:40', 'Appel sortant', 'Montant du reliquat confirmé avec le comptable.'],
    ],
  },
  {
    r: 6, c: null, type: 'Demande', motif: 'Retraite', canal: 'Agence', priorite: 'Normale',
    matricule: '205571163', agence: 'Bouaké', agent: "F. N'Guessan", statut: 'En cours',
    objet: 'Demande de pension de vieillesse.',
    ech: [[0, '10:40', 'Visite en agence', 'Dossier de retraite déposé complet.']],
  },
  {
    r: 5, c: null, type: 'Réclamation', motif: 'Attestation', canal: 'Téléphone', priorite: 'Normale',
    matricule: '219904586', agence: 'Korhogo', agent: 'I. Ouattara', statut: 'En attente pièces',
    objet: 'Attestation refusée pour cotisations manquantes.',
    ech: [
      [0, '11:15', 'Appel entrant', 'Assuré conteste le refus.'],
      [2, '09:30', 'Appel sortant', 'Bulletins de salaire demandés.'],
    ],
  },
  {
    r: 4, c: null, type: 'Demande', motif: "Demande d'information", canal: 'Courrier', priorite: 'Normale',
    matricule: 'E-072264', agence: 'Yamoussoukro', agent: 'D. Yao', statut: 'Nouveau',
    objet: "Demande de rendez-vous pour un contrôle d'assiette.",
    ech: [[0, '10:00', 'Courrier', "Courrier de l'employeur enregistré."]],
  },
  {
    r: 3, c: null, type: 'Réclamation', motif: 'Accident du travail', canal: 'Agence', priorite: 'Urgente',
    matricule: '226315870', agence: 'Angré', agent: 'S. Traoré', statut: 'Nouveau',
    objet: "Rente d'accident du travail suspendue sans explication.",
    ech: [[0, '09:25', 'Visite en agence', 'Assuré reçu au guichet, très inquiet.']],
  },
  {
    r: 2, c: null, type: 'Demande', motif: 'Immatriculation employeur', canal: 'e-CNPS', priorite: 'Normale',
    matricule: 'E-074491', agence: 'Cocody', agent: 'B. Koné', statut: 'Nouveau',
    objet: "Immatriculation d'une nouvelle entreprise (5 salariés).",
    ech: [[0, '15:00', 'Email', 'Demande reçue via e-CNPS.']],
  },
  {
    r: 1, c: null, type: 'Demande', motif: 'Attestation', canal: 'Email', priorite: 'Normale',
    matricule: '190445120', agence: 'Angré', agent: 'S. Traoré', statut: 'Nouveau',
    objet: 'Attestation de droits aux prestations familiales.',
    ech: [[0, '08:55', 'Email', 'Demande reçue par email.']],
  },
  {
    r: 1, c: null, type: 'Demande', motif: 'Mise à jour du dossier', canal: 'Téléphone', priorite: 'Normale',
    matricule: '243377058', agence: 'Plateau', agent: 'M. Diabaté', statut: 'Nouveau',
    objet: 'Changement de numéro de téléphone.',
    ech: [[0, '10:30', 'Appel entrant', 'Demande de mise à jour du contact.']],
  },
  {
    r: 0, c: null, type: 'Demande', motif: 'Attestation', canal: 'Email', priorite: 'Normale',
    matricule: '208119345', agence: 'Bouaké', agent: "F. N'Guessan", statut: 'Nouveau',
    objet: 'Attestation de mise à jour des cotisations.',
    ech: [[0, '08:20', 'Email', 'Demande reçue par email.']],
  },
]

// Horodatage fictif : j jours après la réception d'un dossier reçu il y a r jours.
function horodatage(r, j, heure) {
  return `${ilYaJoursIso(Math.max(0, r - j))}T${heure}:00`
}

// Reconstitue l'historique complet d'un dossier : ouverture, étapes de
// statut, échanges avec l'assuré et notes internes.
function historiqueDemo(m) {
  const evt = (j, heure, type, texte, extra = {}) => ({
    id: genererId(),
    date: horodatage(m.r, j, heure),
    type,
    texte,
    agent: m.agent,
    ...extra,
  })

  const evenements = [evt(0, '08:00', 'creation', `Dossier ouvert (canal ${m.canal})`)]
  if (m.statut !== 'Nouveau') {
    evenements.push(evt(Math.min(1, m.r), '10:30', 'statut', 'Statut modifié : Nouveau → En cours'))
  }
  if (m.statut === 'En attente pièces') {
    evenements.push(evt(Math.min(2, m.r), '15:00', 'statut', 'Statut modifié : En cours → En attente pièces'))
  }
  if (m.statut === 'Validé') {
    evenements.push(evt(m.jv ?? 2, '11:15', 'statut', 'Statut modifié : En cours → Validé'))
  }
  if (m.statut === 'Clôturé') {
    evenements.push(evt(m.c, '16:45', 'statut', 'Statut modifié : En cours → Clôturé'))
  }
  for (const [j, heure, canal, texte] of m.ech || []) {
    evenements.push(evt(j, heure, 'interaction', texte, { canal }))
  }
  for (const [j, heure, texte] of m.notes || []) {
    evenements.push(evt(j, heure, 'note', texte))
  }
  return evenements
}

// Construit les dossiers de démo (sans numéro : il est attribué au chargement
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
    commentaire: m.objet,
    dateReception: ilYaJoursIso(m.r),
    dateCloture: m.c == null ? null : ilYaJoursIso(m.r - m.c),
    historique: historiqueDemo(m),
  }))
}
