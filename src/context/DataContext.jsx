// ---------------------------------------------------------------------------
// Contexte global de données.
// Fait le lien entre la couche de persistance (lib/storage.js) et l'interface :
// chaque action met à jour le stockage PUIS l'état React, ce qui garantit
// que toutes les pages (liste, pilotage…) se rafraîchissent en temps réel.
// ---------------------------------------------------------------------------

import { createContext, useContext, useState } from 'react'
import * as storage from '../lib/storage.js'
import { prochainNumero, genererId } from '../lib/numero.js'
import { creerDossiersDemo } from '../lib/demo.js'
import { csvVersDossiers } from '../lib/csv.js'
import { aujourdhuiIso } from '../lib/dates.js'

const DataContext = createContext(null)

// Au tout premier lancement dans un navigateur, charge automatiquement
// les 12 dossiers de démonstration (pratique pour présenter la maquette).
// Les lancements suivants — y compris après "Réinitialiser les données" —
// n'y touchent plus.
function chargerDonneesInitiales() {
  if (!storage.estInitialise()) {
    const demo = creerDossiersDemo()
    const tous = []
    for (const d of demo) {
      d.numero = prochainNumero(tous)
      tous.push(d)
    }
    storage.saveMany(demo)
  }
  return storage.getAll()
}

export function DataProvider({ children }) {
  const [dossiers, setDossiers] = useState(chargerDonneesInitiales)
  const [settings, setSettings] = useState(() => storage.getSettings())

  // Recharge l'état React depuis le stockage après chaque écriture.
  const rafraichir = () => setDossiers(storage.getAll())

  // Fabrique un événement d'historique horodaté (journal de la fiche dossier).
  const evenement = (type, texte, agent = null) => ({
    id: genererId(),
    date: new Date().toISOString(),
    type, // 'creation' | 'statut' | 'affectation' | 'priorite' | 'note'
    texte,
    agent,
  })

  // Crée un dossier : numéro auto "D-AAAA-NNN", statut initial "Nouveau",
  // avec un premier événement "création" dans son historique.
  const creerDossier = (champs) => {
    const dossier = {
      id: genererId(),
      numero: prochainNumero(storage.getAll()),
      statut: 'Nouveau',
      dateCloture: null,
      ...champs,
      historique: [evenement('creation', `Dossier créé (canal ${champs.canal})`, champs.agent)],
    }
    storage.save(dossier)
    rafraichir()
    return dossier
  }

  // Met à jour un dossier existant.
  const majDossier = (dossier) => {
    storage.save(dossier)
    rafraichir()
  }

  // Ajoute un événement à l'historique d'un dossier (avec d'éventuels
  // autres champs modifiés) puis enregistre.
  const majAvecEvenement = (dossier, champs, evt) => {
    majDossier({ ...dossier, ...champs, historique: [...(dossier.historique || []), evt] })
  }

  // Change le statut ; le passage à "Clôturé" enregistre la date de clôture.
  const changerStatut = (dossier, statut) => {
    if (statut === dossier.statut) return
    const champs = { statut, dateCloture: statut === 'Clôturé' ? dossier.dateCloture || aujourdhuiIso() : null }
    majAvecEvenement(dossier, champs, evenement('statut', `Statut modifié : ${dossier.statut} → ${statut}`))
  }

  // Ajoute une note libre au journal du dossier.
  const ajouterNote = (dossier, texte, agent) => {
    majAvecEvenement(dossier, {}, evenement('note', texte, agent))
  }

  // Réaffecte le dossier à un autre agent.
  const reaffecterAgent = (dossier, agent) => {
    if (agent === dossier.agent) return
    majAvecEvenement(dossier, { agent }, evenement('affectation', `Dossier réaffecté de ${dossier.agent} à ${agent}`))
  }

  // Change la priorité du dossier.
  const changerPriorite = (dossier, priorite) => {
    if (priorite === dossier.priorite) return
    majAvecEvenement(dossier, { priorite }, evenement('priorite', `Priorité modifiée : ${dossier.priorite} → ${priorite}`))
  }

  const supprimerDossier = (id) => {
    storage.remove(id)
    rafraichir()
  }

  // Charge les 12 dossiers de démonstration (numéros attribués à la suite).
  const chargerDemo = () => {
    const demo = creerDossiersDemo()
    const tous = [...storage.getAll()]
    for (const d of demo) {
      d.numero = prochainNumero(tous)
      tous.push(d)
    }
    storage.saveMany(demo)
    rafraichir()
    return demo.length
  }

  // Importe un contenu CSV ; les numéros déjà présents sont ignorés (doublons).
  const importerCsv = (texte) => {
    const { dossiers: lus, erreurs } = csvVersDossiers(texte)
    const numerosExistants = new Set(storage.getAll().map((d) => d.numero))
    const nouveaux = lus.filter((d) => !numerosExistants.has(d.numero))
    storage.saveMany(nouveaux)
    rafraichir()
    return { importes: nouveaux.length, doublons: lus.length - nouveaux.length, erreurs }
  }

  // Met à jour les paramètres (agences, agents, délai cible).
  const majSettings = (nouveaux) => {
    setSettings(storage.saveSettings({ ...settings, ...nouveaux }))
  }

  // Efface tout (dossiers + paramètres) et repart des valeurs par défaut.
  const reinitialiser = () => {
    storage.clearAll()
    setDossiers(storage.getAll())
    setSettings(storage.getSettings())
  }

  const valeur = {
    dossiers,
    settings,
    creerDossier,
    majDossier,
    changerStatut,
    ajouterNote,
    reaffecterAgent,
    changerPriorite,
    supprimerDossier,
    chargerDemo,
    importerCsv,
    majSettings,
    reinitialiser,
  }

  return <DataContext.Provider value={valeur}>{children}</DataContext.Provider>
}

// Hook d'accès au contexte de données.
export function useData() {
  const contexte = useContext(DataContext)
  if (!contexte) throw new Error('useData doit être utilisé dans <DataProvider>')
  return contexte
}
