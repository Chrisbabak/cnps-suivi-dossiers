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

## Connexion (démo)

L'application s'ouvre sur une page de connexion. Compte de démonstration :

- Identifiant : `User`
- Mot de passe : `User2026`

> ⚠️ Cette authentification est purement **cosmétique** (vérifiée dans le navigateur,
> sans serveur) : elle donne l'expérience d'un espace connecté pour la maquette mais ne
> protège pas réellement les données. Le vrai CRM aura une authentification serveur.

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
| Netlify | https://cnps-suivi-dossiers.netlify.app | manuelle (CLI ou glisser-déposer) |
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

- **Nouveau dossier** : formulaire complet, numéro auto au format `D-AAAA-NNN` (compteur annuel)
- **Dossiers** : recherche plein texte (n°, matricule, motif, agent), filtres statut/agence/canal,
  tri par date, changement de statut directement dans la ligne (le passage à « Clôturé »
  enregistre la date de clôture), lignes en rouge quand le délai cible est dépassé
- **Pilotage** : KPI (total, en cours, clôturés, délai moyen, % dans les délais, réclamations),
  répartitions par motif/canal/statut/agence et charge par agent — mis à jour en temps réel
- **Paramètres** : agences, agents et délai cible configurables ; import CSV ;
  bouton « Charger des données de démo » (12 dossiers fictifs, chargés automatiquement
  au premier lancement dans un navigateur, puis rechargeables à volonté) ;
  réinitialisation avec double confirmation (après réinitialisation, la démo ne se
  recharge pas toute seule)

## Limites connues (assumées pour une préfiguration)

- Les données sont locales à un navigateur/poste : pas de partage entre agents
- Pas d'authentification ni de gestion de droits
- La sauvegarde/restauration se fait via l'export/import CSV
