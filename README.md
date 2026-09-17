# CNPS — Suivi des demandes & réclamations

Maquette web de **préfiguration CRM** pour le suivi des demandes et réclamations en agence
(enregistrement, liste avec filtres, délais et alertes, tableau de bord de pilotage, export/import CSV).

> ⚠️ Maquette de démonstration : les données sont stockées **uniquement dans le navigateur**
> (`localStorage`), sans serveur ni base de données. Aucune donnée personnelle réelle ne doit y être saisie
> en dehors de matricules. Toute la persistance passe par [src/lib/storage.js](src/lib/storage.js)
> (interface `getAll / save / remove / exportCsv`), ce qui permettra de brancher plus tard une vraie base
> (ex. Supabase) sans réécrire l'application.

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) (JavaScript)
- [Tailwind CSS](https://tailwindcss.com/)
- Aucun backend, aucun appel réseau, aucun cookie, aucun outil d'analytics

## Rôles et périmètres

L'application s'ouvre sur un écran de connexion. Trois comptes de démonstration :

| Compte | Identifiant | Mot de passe | Personne | Agence (retrouvée dans l'annuaire) |
| --- | --- | --- | --- | --- |
| Technicien | `technicien` | `Tech2026` | S. Traoré | Angré |
| Manager | `manager` | `Manager2026` | M. Koffi | Angré |
| Admin | `admin` | `Admin2026` | | toutes agences |

Chaque compte désigne une personne de l'annuaire. Techniciens et managers y sont rattachés
à une agence ([src/lib/annuaire.js](src/lib/annuaire.js), listes éditables dans Paramètres),
et **l'agence est retrouvée automatiquement** à la connexion : elle n'est jamais saisie.
La session `{ role, agence, nom }` est stockée en localStorage (clé `session`) et survit au
rechargement ; « Se déconnecter » renvoie à l'écran de connexion. Le futur système de comptes
n'aura qu'à remplacer la liste des comptes de [src/lib/auth.js](src/lib/auth.js) et alimenter
l'annuaire.

| | Technicien | Manager | Admin |
| --- | --- | --- | --- |
| Accueil | ses dossiers + agence (lecture) | dossiers et compteurs de l'agence | compteurs globaux, toutes agences |
| Dossiers | agence **verrouillée** | agence **verrouillée** + **réassignation** (techniciens de son agence) | toutes agences |
| Modifier un dossier | les siens ; ceux de ses collègues si le réglage l'autorise | ceux de son agence | tous |
| Supprimer un dossier | non | non | oui |
| Pilotage | masqué | limité à son agence | national |
| Paramètres | masqué | masqué | visible |

Un dossier d'une autre agence s'ouvre en **lecture seule** (consultation de la vue nationale).
Le réglage « Droits des techniciens » (Paramètres) décide si un technicien peut modifier les
dossiers de ses collègues de la même agence.

La logique de périmètre est centralisée dans [src/lib/permissions.js](src/lib/permissions.js)
(`canSee`, `getDossierScope`, `canDeleteDossier`, `canReassignDossier`, `canEditDossier`) ; les routes sont
gardées (accès direct par URL à un écran interdit → redirection vers l'accueil).

**Vision assuré nationale** (quel que soit le rôle) : cliquer un matricule dans un tableau
ouvre une modale « Historique de l'assuré » listant ses dossiers de **toutes** les agences ;
à la création d'un dossier, une **alerte doublon** (non bloquante) signale les dossiers en
cours existants pour le matricule saisi.

> ⚠️ Ce contrôle d'accès est purement **cosmétique** (vérifié dans le navigateur, sans
> serveur) : il préfigure les rôles du futur CRM mais ne protège pas réellement les données.

## Délais cibles (SLA)

- **Délai d'un dossier** : nombre de jours calendaires entre sa date de réception et sa date de
  clôture (ou aujourd'hui s'il est encore ouvert).
- **Délai cible** : fixé par motif dans Paramètres (ex. attestation 3 j, allocations familiales
  10 j, retraite 30 j) ; un motif sans délai propre prend le délai par défaut (5 j). Un dossier
  **urgent** a un délai cible divisé par deux (arrondi au jour supérieur).
- **Hors délai** : le délai du dossier dépasse son délai cible. La ligne passe en rouge et le
  dossier remonte en tête des listes de l'accueil.
- **% dans les délais** (Pilotage) : part des dossiers clôturés dont le délai est inférieur ou
  égal à leur délai cible.

Chaque changement de statut passe par une **confirmation** (commentaire facultatif, enregistré
dans le journal avec le nom de la personne connectée) ; une clôture déclenche des félicitations.

## Lancement en local

```bash
npm install
npm run dev        # http://localhost:5173
```

Build de production :

```bash
npm run build      # génère le dossier dist/
npm run preview    # prévisualise le build en local
```

## Hébergement

Le site est déployé à deux endroits :

| Où | URL | Mise à jour |
| --- | --- | --- |
| Netlify | https://cnps-suivi-dossiers.netlify.app | **automatique à chaque push sur `main`** (webhook + build Netlify) |
| GitHub Pages | https://chrisbabak.github.io/cnps-suivi-dossiers/ | **automatique à chaque push sur `main`** |

Le dépôt GitHub est [Chrisbabak/cnps-suivi-dossiers](https://github.com/Chrisbabak/cnps-suivi-dossiers) ;
le workflow [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) reconstruit
et publie le site sur GitHub Pages après chaque push (variable `BASE_PATH` pour servir le site
sous le sous-chemin `/cnps-suivi-dossiers/`).

## Déploiement sur Netlify

Le fichier [netlify.toml](netlify.toml) contient déjà la configuration
(build `npm run build`, publication `dist/`, redirection SPA `/* → /index.html 200`).

### Méthode A — Glisser-déposer (la plus simple)

1. Construire le site : `npm run build`
2. Ouvrir [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. Glisser-déposer le dossier `dist/` dans la page — le site est en ligne immédiatement.

> Remarque : le fichier `public/_redirects` est copié dans `dist/` au build, ce qui garantit
> le bon fonctionnement des routes même avec cette méthode.

### Méthode B — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod    # répondre "dist" si le dossier de publication est demandé
```

## Format du CSV d'export / import

- Séparateur : `;` (point-virgule, compatible Excel français)
- Encodage : UTF-8 **avec BOM** (les accents s'affichent correctement dans Excel)
- Dates au format `AAAA-MM-JJ` ; première ligne = en-têtes

| Colonne          | Description                                        | Exemple               |
| ---------------- | -------------------------------------------------- | --------------------- |
| `numero`         | Numéro de dossier (unique)                         | `D-2026-004`          |
| `type`           | `Demande` ou `Réclamation`                         | `Réclamation`         |
| `canal`          | Agence, Téléphone, Email, e-CNPS, WhatsApp, Courrier | `Téléphone`         |
| `motif`          | Motif de la demande                                | `Prestations sociales`|
| `matricule`      | Matricule assuré ou employeur (obligatoire)        | `115004782`           |
| `agence`         | Agence de rattachement                             | `Agence Centrale`     |
| `agent`          | Agent en charge                                    | `A. Kouassi`          |
| `priorite`       | `Normale` ou `Urgente`                             | `Urgente`             |
| `statut`         | Nouveau, En cours, En attente pièces, Validé, Clôturé | `En cours`         |
| `date_reception` | Date de réception                                  | `2026-07-01`          |
| `date_cloture`   | Date de clôture (vide si non clôturé)              | `2026-07-06`          |
| `commentaire`    | Commentaire libre                                  |                       |

À l'import, les lignes dont le `numero` existe déjà sont ignorées (pas de doublons).

## Fonctionnalités

- **Échanges avec l'assuré** : chaque dossier consigne les appels entrants et sortants, visites
  en agence, emails, courriers et messages WhatsApp (plus des notes internes), avec un journal
  filtrable ; la fiche assuré regroupe tous ses échanges, tous dossiers et toutes agences
  confondus ; le pilotage mesure les échanges par canal
- **Reprise d'historique** : import CSV pour migrer les demandes et réclamations d'un outil existant

- **Nouveau dossier** : formulaire complet, numéro auto au format `D-AAAA-NNN` (compteur annuel)
- **Dossiers** : recherche plein texte (n°, matricule, motif, agent), filtres statut/agence/canal,
  tri par date, changement de statut directement dans la ligne (le passage à « Clôturé »
  enregistre la date de clôture), lignes en rouge quand le délai cible est dépassé
- **Pilotage** : KPI (total, en cours, clôturés, délai moyen, % dans les délais, réclamations),
  répartitions par motif, canal, statut, agence, type et échanges, charge par agent, mises à jour en temps réel
- **Paramètres** : agences, agents et délai cible configurables ; import CSV ;
  bouton « Charger des données de démo » (34 dossiers fictifs, chargés automatiquement
  au premier lancement dans un navigateur, puis rechargeables à volonté) ;
  réinitialisation avec double confirmation (après réinitialisation, la démo ne se
  recharge pas toute seule)

## Limites connues (assumées pour une préfiguration)

- Les données sont locales à un navigateur/poste : pas de partage entre agents
- Pas d'authentification ni de gestion de droits
- La sauvegarde/restauration se fait via l'export/import CSV
