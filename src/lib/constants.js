// ---------------------------------------------------------------------------
// Listes de référence de l'application.
// Les listes fixes (canaux, motifs, statuts…) sont définies ici ;
// les listes configurables (agences, agents, délai cible) ont uniquement
// leurs valeurs PAR DÉFAUT ici — elles sont modifiables dans "Paramètres".
// ---------------------------------------------------------------------------

export const CANAUX = ['Agence', 'Téléphone', 'Email', 'e-CNPS', 'WhatsApp', 'Courrier']

export const TYPES = ['Demande', 'Réclamation']

export const MOTIFS = [
  'Prestations sociales',
  'Recouvrement',
  'Déclaration employeur',
  'Paiement cotisations',
  'Ouverture de dossier',
  'Attestation',
  'Mise à jour dossier',
  'Autre',
]

export const STATUTS = ['Nouveau', 'En cours', 'En attente pièces', 'Validé', 'Clôturé']

export const PRIORITES = ['Normale', 'Urgente']

// Les 18 agences CNPS et leur région de rattachement.
export const AGENCES = [
  { region: 'Abidjan', nom: 'Plateau' },
  { region: 'Abidjan', nom: 'Adjamé' },
  { region: 'Abidjan', nom: 'Yopougon' },
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
export const DEFAULT_SETTINGS = {
  agences: AGENCES.map((a) => a.nom),
  agents: ['A. Kouassi', 'M. Diabaté', 'S. Traoré', "F. N'Guessan"],
  delaiCible: 5, // délai cible de traitement, en jours
}
