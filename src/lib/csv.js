// ---------------------------------------------------------------------------
// Export / import CSV.
// Format : séparateur ";" (Excel français), encodage UTF-8 avec BOM.
// Colonnes : numero;type;canal;motif;matricule;agence;agent;priorite;
//            statut;date_reception;date_cloture;commentaire
// ---------------------------------------------------------------------------

import { genererId } from './numero.js'

const SEPARATEUR = ';'

export const CSV_ENTETES = [
  'numero',
  'type',
  'canal',
  'motif',
  'matricule',
  'agence',
  'agent',
  'priorite',
  'statut',
  'date_reception',
  'date_cloture',
  'commentaire',
]

// Échappe une valeur : guillemets si elle contient ";", '"' ou un saut de ligne.
function echapper(valeur) {
  const texte = valeur == null ? '' : String(valeur)
  if (/[;"\n\r]/.test(texte)) {
    return `"${texte.replaceAll('"', '""')}"`
  }
  return texte
}

// Convertit la liste des dossiers en contenu CSV (chaîne prête à télécharger).
export function dossiersVersCsv(dossiers) {
  const lignes = [CSV_ENTETES.join(SEPARATEUR)]
  for (const d of dossiers) {
    lignes.push(
      [
        d.numero,
        d.type,
        d.canal,
        d.motif,
        d.matricule,
        d.agence,
        d.agent,
        d.priorite,
        d.statut,
        d.dateReception,
        d.dateCloture || '',
        d.commentaire || '',
      ]
        .map(echapper)
        .join(SEPARATEUR),
    )
  }
  // Le BOM UTF-8 permet à Excel (français) d'afficher correctement les accents.
  return '\uFEFF' + lignes.join('\r\n')
}

// Découpe une ligne CSV en champs, en respectant les guillemets.
function decouperLigne(ligne) {
  const champs = []
  let courant = ''
  let entreGuillemets = false
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i]
    if (entreGuillemets) {
      if (c === '"' && ligne[i + 1] === '"') {
        courant += '"'
        i++ // guillemet doublé = guillemet littéral
      } else if (c === '"') {
        entreGuillemets = false
      } else {
        courant += c
      }
    } else if (c === '"') {
      entreGuillemets = true
    } else if (c === SEPARATEUR) {
      champs.push(courant)
      courant = ''
    } else {
      courant += c
    }
  }
  champs.push(courant)
  return champs
}

// Analyse un contenu CSV et retourne { dossiers, erreurs }.
// Les lignes invalides sont ignorées et signalées dans "erreurs".
export function csvVersDossiers(texte) {
  const contenu = texte.replace(/^\uFEFF/, '') // retire le BOM éventuel
  const lignes = contenu.split(/\r?\n/).filter((l) => l.trim() !== '')
  const erreurs = []
  if (lignes.length < 2) {
    return { dossiers: [], erreurs: ['Fichier vide ou sans ligne de données.'] }
  }

  const entetes = decouperLigne(lignes[0]).map((e) => e.trim().toLowerCase())
  const index = {}
  for (const colonne of CSV_ENTETES) index[colonne] = entetes.indexOf(colonne)
  if (index.numero === -1 || index.matricule === -1) {
    return {
      dossiers: [],
      erreurs: ['En-têtes non reconnus : le fichier doit suivre le format d’export de l’application.'],
    }
  }

  const lire = (champs, colonne) => (index[colonne] >= 0 ? (champs[index[colonne]] || '').trim() : '')

  const dossiers = []
  for (let i = 1; i < lignes.length; i++) {
    const champs = decouperLigne(lignes[i])
    const numero = lire(champs, 'numero')
    const matricule = lire(champs, 'matricule')
    if (!numero || !matricule) {
      erreurs.push(`Ligne ${i + 1} ignorée : numéro ou matricule manquant.`)
      continue
    }
    dossiers.push({
      id: genererId(),
      numero,
      type: lire(champs, 'type') || 'Demande',
      canal: lire(champs, 'canal') || 'Agence',
      motif: lire(champs, 'motif') || 'Autre',
      matricule,
      agence: lire(champs, 'agence'),
      agent: lire(champs, 'agent'),
      priorite: lire(champs, 'priorite') || 'Normale',
      statut: lire(champs, 'statut') || 'Nouveau',
      dateReception: lire(champs, 'date_reception'),
      dateCloture: lire(champs, 'date_cloture') || null,
      commentaire: lire(champs, 'commentaire'),
    })
  }
  return { dossiers, erreurs }
}

// Déclenche le téléchargement d'un fichier CSV côté navigateur.
export function telechargerCsv(nomFichier, contenu) {
  const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nomFichier
  document.body.appendChild(lien)
  lien.click()
  document.body.removeChild(lien)
  URL.revokeObjectURL(url)
}
