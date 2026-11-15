# Sonoma 🎵

Application web collaborative de playlists pour soirées.
Un hôte crée une soirée, partage un lien d'invitation, et ses invités proposent des morceaux et votent pour la playlist de la soirée.

Projet réalisé à Ada Tech School.

---

## Sommaire

1. [Le projet](#le-projet)
2. [Stack technique](#stack-technique)
3. [Prérequis](#prérequis)
4. [Installation](#installation)
5. [Lancer le projet](#lancer-le-projet)
6. [Scripts disponibles](#scripts-disponibles)
7. [Dépendances du projet](#dépendances-du-projet)
8. [Structure du projet](#structure-du-projet)
9. [Dépannage](#dépannage)
10. [Contribuer](#contribuer)
11. [Équipe](#équipe)

---

## Le projet

### Problématique

Organiser la musique d'une soirée est souvent chaotique : une personne gère la file d'attente, les invités n'ont pas leur mot à dire, et la playlist finit par ne plaire qu'à l'hôte. Sur papier ou dans un groupe de discussion, les propositions se perdent et personne ne sait ce qui sera joué.

### Cible prioritaire

Les hôtes de soirées (anniversaires, after-works, fêtes entre amis ou entre collègues) et leurs invités, qui veulent choisir la musique ensemble sans friction.

### Périmètre de la V1

| Dans la V1 | Hors V1 (plus tard) |
|---|---|
| Création de soirée par l'hôte (nom, date, service de streaming) | Application mobile native |
| Invitation des invités via un lien partageable | Notifications en temps réel |
| Proposition de morceaux par les invités (recherche Spotify) | Statistiques et historique des soirées |
| Vote des invités sur les morceaux proposés | Gestion avancée des droits et rôles |
| Tableau de bord hôte (soirées récentes, statuts) | Lecture audio intégrée (player) |
| Connexion / inscription des hôtes | Alertes lors de l'ajout d'un morceau |

---

## Stack technique

| Partie | Technologie |
|---|---|
| Frontend | React (Vite) + React Router |
| Backend | Node.js + Express |
| Base de données | PostgreSQL 16 (via Docker) |
| Qualité du code | ESLint |

Le choix de cette stack et des conventions associées est justifié dans les ADR : voir le dossier `docs/ADRs/`.

---

## Prérequis

Installer ces outils avant de commencer :

| Outil | Version | Vérifier l'installation |
|---|---|---|
| [Node.js](https://nodejs.org/) (fournit npm) | LTS | `node -v` et `npm -v` |
| [Git](https://git-scm.com/) | récente | `git --version` |
| [Docker Engine](https://docs.docker.com/engine/install/) et Docker Compose | récente | `docker --version` |

Docker Desktop doit être **lancé** (icône active) avant de démarrer la base de données.

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/lundoki92/sonoma.git
cd sonoma
```

### 2. Configurer les variables d'environnement

Créer le fichier `backend/.env` à partir des valeurs suivantes :

```env
# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5433
DB_USER=sonoma_user
DB_PASSWORD=your_local_password
DB_DATABASE=sonoma

# Express server
PORT=3000

# Spotify (recherche de morceaux)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Authentification
JWT_SECRET=your_jwt_secret
```

Choisir ses propres identifiants locaux et s'assurer qu'ils correspondent aux variables référencées dans `backend/docker-compose.yml`.

⚠️ Le fichier `backend/.env` contient des secrets : il est ignoré par Git et ne doit **jamais** être commité.

### 3. Installer les dépendances

Le projet contient **deux** `package.json` (backend et frontend). Il faut installer les dépendances dans chacun :

```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 4. Démarrer la base de données

Se placer dans le dossier `backend/`, où se trouvent `docker-compose.yml` et `.env` :

```bash
cd backend
docker compose up -d
cd ..
```

PostgreSQL est alors accessible sur le port `5433` de la machine locale.

### 5. Créer les tables et les données de test

Le schéma de la base est défini dans `backend/db/migration_up.sql`.

Depuis le dossier `backend/` :

```bash
docker compose exec -T postgres psql -U sonoma_user -d sonoma < db/migration_up.sql
```

Remplacer `sonoma_user` par la valeur de `DB_USER` dans le `.env`.

Pour charger des données de test :

```bash
docker compose exec -T postgres psql -U sonoma_user -d sonoma < db/seed.sql
```

---

## Lancer le projet

La base de données doit être démarrée. Ouvrir **deux** terminaux.

### Backend

```bash
cd backend
npm run dev
```

Le serveur Express démarre sur http://localhost:3000 (redémarrage automatique grâce à `node --watch`).

### Frontend

```bash
cd frontend
npm run dev
```

Le serveur Vite démarre sur http://localhost:5173. Les appels vers `/api` sont automatiquement proxifiés vers le backend.

### Arrêter le projet

- Frontend et backend : `Ctrl + C` dans les terminaux.
- Base de données :

```bash
cd backend
docker compose down
cd ..
```

---

## Scripts disponibles

### Backend (`backend/`)

| Commande | Effet |
|---|---|
| `npm run dev` | Lance le serveur avec redémarrage automatique (`node --watch`) |
| `npm start` | Lance le serveur sans redémarrage automatique |

### Frontend (`frontend/`)

| Commande | Effet |
|---|---|
| `npm run dev` | Lance le serveur de développement Vite |
| `npm run build` | Construit la version de production dans `dist/` |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run preview` | Affiche la version de production en local |

---

## Dépendances du projet

Ces dépendances sont installées automatiquement par `npm install` (étape 3).
Cette section explique leur rôle.

### Backend

| Paquet | Type | Rôle |
|---|---|---|
| `express` | principale | Créer le serveur et les routes de l'API |
| `pg` | principale | Communiquer avec PostgreSQL |
| `dotenv` | principale | Lire les variables du fichier `.env` |
| `cors` | principale | Autoriser le frontend à appeler l'API |
| `bcryptjs` | principale | Hacher les mots de passe |
| `jsonwebtoken` | principale | Gérer les sessions (JWT dans un cookie) |
| `cookie-parser` | principale | Lire les cookies de session |
| `nodemon` | développement | Redémarrer le serveur à chaque modification |

### Frontend

| Paquet | Type | Rôle |
|---|---|---|
| `react`, `react-dom` | principale | Construire l'interface (installés par Vite) |
| `react-router` | principale | Naviguer entre les pages |
| `@fortawesome/fontawesome-free` | principale | Icônes (Font Awesome) |
| `vite` | développement | Serveur de développement et compilation |
| `eslint` + plugins | développement | Vérifier la qualité du code |

---

## Structure du projet

```
sonoma/
├── backend/
│   ├── controllers/         # Contrôleurs (logique des routes)
│   ├── db/                  # migration_up.sql et seed.sql
│   ├── errors.js            # Erreurs HTTP partagées
│   ├── middlewares/         # auth, guestAuth, errors
│   ├── models/              # Requêtes SQL (tracks, users, playlists, votes)
│   ├── requests/            # Requêtes SQL auxiliaires
│   ├── routes/              # Définition des routes Express
│   ├── server/              # Point d'entrée et connexion DB
│   ├── services/            # Logique métier
│   ├── docker-compose.yml   # Conteneur PostgreSQL
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Composants réutilisables (Header, Button, Champ…)
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Écrans (HomeAdmin, Playlist, CreatePlaylist, GuestJoin…)
│   │   ├── styles/          # Tokens et CSS globaux
│   │   └── utils/           # Utilitaires partagés
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── ADRs/                # Décisions d'architecture
│   ├── 0-docs.md
│   └── 1-installation.md   # Guide d'installation détaillé
├── .gitignore
└── README.md
```

---

## Dépannage

| Problème | Solution |
|---|---|
| `docker: command not found` ou erreur de connexion à Docker | Vérifier que Docker Desktop est installé **et lancé** |
| Le port 5433 est déjà utilisé | Un autre PostgreSQL tourne déjà : l'arrêter, ou changer `DB_PORT` dans `.env` et `docker-compose.yml` |
| Le backend ne se connecte pas à la base | Vérifier que `backend/.env` existe et que ses valeurs correspondent à `docker-compose.yml` |
| `Cannot find module …` | Relancer `npm install` dans le dossier concerné (backend ou frontend) |
| Le frontend ne trouve pas l'API | Vérifier que le backend tourne sur le port 3000 et que le proxy Vite est actif |
| Les morceaux ne s'affichent pas côté invité | Comportement attendu aujourd'hui : l'endpoint invité ne renvoie pas encore l'ensemble des morceaux de la soirée |

---

## Contribuer

Les règles complètes sont dans le dossier `docs/ADRs/` et le guide d'installation dans `docs/1-installation.md`.

En résumé :

- `main` : version stable, protégée.
- Chaque tâche se fait sur une branche créée depuis `main` (`feat/…`, `fix/…`, `docs/…`, `style/…`).
- Toute modification passe par une **pull request**, relue et approuvée.
- Les messages de commit suivent la convention [Conventional Commits](https://www.conventionalcommits.org/fr/) (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`…).
- Ne pas modifier `backend/db/migration_up.sql` sans accord.

---

## Équipe

| Membre | GitHub |
|---|---|
| Andréa Vignon | [@Androuashky](https://github.com/Androuashky) |
| Jennifer LECOQ | [@lundoki92](https://github.com/lundoki92) |
| Jérémy | [@jottavy](https://github.com/jottavy) |
| Nastassja | [@nlhdd](https://github.com/nlhdd) |