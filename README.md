# 🍕 Oh'Pizza - Système de Commande de Pizzas en Ligne

## 📚 Guide pour Débutants en Programmation

Bienvenue dans le projet Oh'Pizza ! Ce guide est spécialement conçu pour les débutants qui commencent à apprendre la programmation. Nous allons expliquer chaque concept étape par étape.

## 🎯 Qu'est-ce que ce projet ?

Oh'Pizza est une application web complète qui permet aux clients de :
- 🏠 Voir la page d'accueil avec les informations du restaurant
- 🍕 Consulter le menu des pizzas disponibles
- 🛒 Ajouter des pizzas à leur panier
- 📝 Passer des commandes
- ⭐ Laisser des avis
- 📞 Contacter le restaurant
- 👨‍💼 Gérer le restaurant (partie admin)

## 🏗️ Architecture du Projet (Comment c'est organisé)

Notre application est divisée en **deux parties principales** :

### 1. 🎨 Frontend (Ce que voit l'utilisateur)
- **Technologie** : React + TypeScript + Vite
- **Rôle** : Interface utilisateur (boutons, formulaires, pages)
- **Port** : http://localhost:5173

### 2. ⚙️ Backend (Le serveur qui gère les données)
- **Technologie** : Node.js + Express + MySQL
- **Rôle** : API pour gérer les données (pizzas, commandes, etc.)
- **Port** : http://localhost:5000

## 📁 Structure des Dossiers

```
ohpizza/
├── 📁 src/                    # Code du frontend (React)
│   ├── 📁 components/         # Composants réutilisables
│   ├── 📁 pages/             # Pages de l'application
│   ├── 📁 contexts/          # Gestion d'état global
│   └── 📁 hooks/             # Fonctions personnalisées
├── 📁 backend/               # Code du serveur
│   ├── 📁 models/            # Modèles de données
│   ├── 📁 routes/            # Routes API
│   └── server.js             # Serveur principal
├── 📁 public/                # Fichiers statiques
└── 📁 images/                # Images du projet
```

## 🚀 Comment Démarrer le Projet

### Prérequis
- Node.js installé sur votre ordinateur
- MySQL pour la base de données

### Étapes d'installation

1. **Installer les dépendances du frontend** :
   ```bash
   npm install
   ```

2. **Installer les dépendances du backend** :
   ```bash
   cd backend
   npm install
   ```

3. **Configurer la base de données** :
   - Créer une base de données MySQL nommée `ohpizza`
   - Exécuter le script de configuration :
   ```bash
   cd backend
   node setup_database.js
   ```

4. **Démarrer le serveur backend** :
   ```bash
   cd backend
   npm start
   ```

5. **Démarrer le frontend** (dans un nouveau terminal) :
   ```bash
   npm run dev
   ```

6. **Ouvrir l'application** :
   - Frontend : http://localhost:5173
   - Backend API : http://localhost:5000

## 🧩 Concepts de Programmation Expliqués

### 🔧 Technologies Utilisées

#### React
- **Qu'est-ce que c'est ?** : Une bibliothèque JavaScript pour créer des interfaces utilisateur
- **Pourquoi ?** : Permet de créer des composants réutilisables et des interfaces interactives

#### TypeScript
- **Qu'est-ce que c'est ?** : JavaScript avec des types (plus sûr et plus facile à déboguer)
- **Pourquoi ?** : Évite les erreurs et améliore l'expérience de développement

#### Node.js
- **Qu'est-ce que c'est ?** : Permet d'exécuter JavaScript côté serveur
- **Pourquoi ?** : Un seul langage (JavaScript) pour tout le projet

#### Express
- **Qu'est-ce que c'est ?** : Framework web pour Node.js
- **Pourquoi ?** : Simplifie la création d'API et de serveurs web

#### MySQL
- **Qu'est-ce que c'est ?** : Base de données relationnelle
- **Pourquoi ?** : Stocke toutes les données (pizzas, commandes, utilisateurs)

## 📊 Base de Données

Notre base de données contient plusieurs tables :

- **pizza** : Informations sur les pizzas (nom, prix, description)
- **ingredients** : Liste des ingrédients disponibles
- **pizza_categories** : Catégories de pizzas
- **avis** : Avis des clients
- **horaire** : Horaires d'ouverture du restaurant

## 🔄 Comment ça Fonctionne ?

1. **L'utilisateur visite le site** → React affiche la page
2. **L'utilisateur clique sur "Menu"** → React demande les pizzas au backend
3. **Le backend reçoit la demande** → Express interroge MySQL
4. **MySQL renvoie les données** → Express les envoie à React
5. **React affiche les pizzas** → L'utilisateur peut les voir

## 🛠️ Scripts Disponibles

### Frontend
- `npm run dev` : Démarre le serveur de développement
- `npm run build` : Compile l'application pour la production
- `npm run preview` : Prévisualise la version de production

### Backend
- `npm start` : Démarre le serveur backend
- `npm run dev` : Démarre avec rechargement automatique (nodemon)

## 📝 Fonctionnalités Principales

### 🏠 Page d'Accueil
- Présentation du restaurant
- Images attractives
- Informations de contact

### 🍕 Menu
- Liste des pizzas avec images
- Filtrage par catégories
- Ajout au panier

### 🛒 Panier
- Gestion des quantités
- Calcul du total
- Validation de commande

### ⭐ Avis
- Affichage des avis clients
- Système de notation par étoiles

### 👨‍💼 Administration
- Gestion des pizzas
- Gestion des horaires
- Consultation des avis

## 🎓 Pour Apprendre Plus

### Ressources Recommandées
- [MDN Web Docs](https://developer.mozilla.org/) : Documentation web complète
- [React Documentation](https://react.dev/) : Guide officiel React
- [Node.js Documentation](https://nodejs.org/docs/) : Guide officiel Node.js
- [W3Schools](https://www.w3schools.com/) : Tutoriels pour débutants

### Prochaines Étapes
1. Comprendre les composants React
2. Apprendre les hooks React (useState, useEffect)
3. Comprendre les API REST
4. Apprendre SQL et les bases de données
5. Découvrir le CSS et le design responsive

## 🤝 Contribution

Ce projet est parfait pour apprendre ! N'hésitez pas à :
- Poser des questions sur le code
- Proposer des améliorations
- Ajouter de nouvelles fonctionnalités

## 📞 Support

Si vous avez des questions ou besoin d'aide :
1. Lisez les commentaires dans le code
2. Consultez la documentation des technologies utilisées
3. Recherchez sur Stack Overflow
4. Demandez de l'aide à la communauté

---

**Bonne programmation ! 🚀**

*Ce projet a été créé dans un but éducatif pour apprendre le développement web moderne.*
