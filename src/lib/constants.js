// ---------------------------------------------------------------------------
// Listes de référence de l'application.
// Les listes fixes (canaux, motifs, statuts…) sont définies ici ;
// les listes configurables (agences, agents, délai cible) ont uniquement
// leurs valeurs PAR DÉFAUT ici — elles sont modifiables dans "Paramètres".
// ---------------------------------------------------------------------------

export const CANAUX = ['Agence', 'Téléphone', 'Email', 'e-CNPS', 'WhatsApp', 'Courrier']

export const TYPES = ['Demande', 'Réclamation']

// Motifs regroupés par domaine, à l'image de ce que couvrira le CRM.
export const GROUPES_MOTIFS = [
  {
    groupe: 'Prestations',
    motifs: [
      'Retraite',
      'Pension de réversion',
      'Allocations familiales',
      'Maternité',
      'Accident du travail',
      'Invalidité',
    ],
  },
  {
    groupe: 'Employeurs et cotisations',
    motifs: [
      'Immatriculation employeur',
      'Déclaration des salaires',
      'Paiement des cotisations',
      'Recouvrement',
    ],
  },
  {
    groupe: 'Assurés et affiliation',
    motifs: [
      'Immatriculation assuré',
      'Affiliation travailleur indépendant',
      'Assurance volontaire',
      'Mise à jour du dossier',
    ],
  },
  {
    groupe: 'Documents et informations',
    motifs: ['Attestation', 'Relevé de carrière', "Demande d'information", 'Suivi de dossier'],
  },
  { groupe: 'Autre', motifs: ['Autre'] },
]

export const MOTIFS = GROUPES_MOTIFS.flatMap((g) => g.motifs)

export const STATUTS = ['Nouveau', 'En cours', 'En attente pièces', 'Validé', 'Clôturé']

export const PRIORITES = ['Normale', 'Urgente']

// Échanges avec l'assuré ou l'employeur, consignés dans le journal d'un dossier.
// "Note interne" n'est pas un échange : elle reste visible des seuls agents.
export const CANAUX_INTERACTION = [
  'Appel entrant',
  'Appel sortant',
  'Visite en agence',
  'Email',
  'Courrier',
  'WhatsApp',
]
export const NOTE_INTERNE = 'Note interne'

// Les 18 agences CNPS et leur région de rattachement.
export const AGENCES = [
  { region: 'Abidjan', nom: 'Plateau' },
  { region: 'Abidjan', nom: 'Adjamé' },
  { region: 'Abidjan', nom: 'Angré' },
  { region: 'Abidjan', nom: 'Treichville' },
  { region: 'Abidjan', nom: 'Cocody' },
  { region: 'Abidjan', nom: 'Abobo' },
  { region: 'Sud', nom: 'Grand-Bassam' },
  { region: 'Sud', nom: 'Dabou' },
  { region: 'Centre', nom: 'Yamoussoukro' },
  { region: 'Centre', nom: 'Bouaké' },
  { region: 'Est', nom: 'Abengourou' },
  { region: 'Ouest', nom: 'Daloa' },
  { region: 'Ouest', nom: 'Man' },
  { region: 'Ouest', nom: 'Gagnoa' },
  { region: 'Nord', nom: 'Korhogo' },
  { region: 'Nord-Ouest', nom: 'Odienné' },
  { region: 'Sud-Ouest', nom: 'San Pedro' },
  { region: 'Centre-Ouest', nom: 'Dimbokro' },
]

// Table de correspondance agence → région (utilisée par le pilotage).
// Une agence ajoutée dans les paramètres sans région connue est classée "Autre".
export const REGION_PAR_AGENCE = Object.fromEntries(AGENCES.map((a) => [a.nom, a.region]))

// Paramètres par défaut (utilisés au premier lancement, modifiables ensuite).
// L'ANNUAIRE relie chaque utilisateur à SON agence : c'est lui qui déduit
// l'agence à la connexion et délimite les périmètres. Le futur système de
// gestion des comptes n'aura qu'à alimenter ces listes.
export const DEFAULT_SETTINGS = {
  agences: AGENCES.map((a) => a.nom),
  // Techniciens : une agence de rattachement par personne.
  agents: [
    { nom: 'A. Kouassi', agence: 'Plateau' },
    { nom: 'M. Diabaté', agence: 'Plateau' },
    { nom: 'S. Traoré', agence: 'Angré' },
    { nom: 'N. Brou', agence: 'Angré' },
    { nom: "F. N'Guessan", agence: 'Bouaké' },
    { nom: 'B. Koné', agence: 'Cocody' },
    { nom: 'R. Aka', agence: 'San Pedro' },
    { nom: 'I. Ouattara', agence: 'Korhogo' },
    { nom: 'D. Yao', agence: 'Yamoussoukro' },
  ],
  // Managers : un responsable par agence active.
  managers: [
    { nom: 'K. Bamba', agence: 'Plateau' },
    { nom: 'A. Kouamé', agence: 'Bouaké' },
    { nom: 'M. Koffi', agence: 'Angré' },
    { nom: 'S. Gnamien', agence: 'Cocody' },
    { nom: 'J. Tanoh', agence: 'San Pedro' },
    { nom: 'L. Coulibaly', agence: 'Korhogo' },
    { nom: "P. N'Dri", agence: 'Yamoussoukro' },
  ],
  delaiCible: 5, // délai cible par défaut (motif sans délai propre), en jours
  // Un technicien peut-il modifier les dossiers de ses collègues de la même agence ?
  modifDossiersCollegues: true,
  // Délai cible par motif, en jours calendaires (réglable dans Paramètres).
  slaParMotif: {
    Retraite: 30,
    'Pension de réversion': 30,
    'Allocations familiales': 10,
    Maternité: 10,
    'Accident du travail': 15,
    Invalidité: 30,
    'Immatriculation employeur': 5,
    'Déclaration des salaires': 10,
    'Paiement des cotisations': 5,
    Recouvrement: 15,
    'Immatriculation assuré': 5,
    'Affiliation travailleur indépendant': 5,
    'Assurance volontaire': 5,
    'Mise à jour du dossier': 3,
    Attestation: 3,
    'Relevé de carrière': 5,
    "Demande d'information": 2,
    'Suivi de dossier': 2,
    Autre: 5,
  },
}
