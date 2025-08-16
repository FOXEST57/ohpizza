# 🎓 Guide Complet pour Débutants - Oh'Pizza

## 📖 Table des Matières

1. [Concepts de Base](#concepts-de-base)
2. [Structure du Projet](#structure-du-projet)
3. [Frontend React Expliqué](#frontend-react-expliqué)
4. [Backend Node.js Expliqué](#backend-nodejs-expliqué)
5. [Base de Données MySQL](#base-de-données-mysql)
6. [Comment Lire le Code](#comment-lire-le-code)
7. [Exercices Pratiques](#exercices-pratiques)

## 🧠 Concepts de Base

### Qu'est-ce qu'une Application Web ?

Imaginez une application web comme un restaurant :
- **Frontend** = La salle de restaurant (ce que voient les clients)
- **Backend** = La cuisine (où se prépare tout)
- **Base de données** = Le garde-manger (où sont stockés les ingrédients)

### Client-Serveur : Comment ça Marche ?

```
[Navigateur Web] ←→ [Serveur Frontend] ←→ [Serveur Backend] ←→ [Base de Données]
    (Client)           (React/Vite)        (Node.js/Express)      (MySQL)
```

1. **Client** : Votre navigateur web (Chrome, Firefox, etc.)
2. **Frontend** : L'interface utilisateur (boutons, formulaires, images)
3. **Backend** : Le serveur qui traite les demandes
4. **Base de données** : Stockage permanent des données

## 🏗️ Structure du Projet

### Vue d'Ensemble

```
ohpizza/
├── 📄 package.json          # Configuration du projet frontend
├── 📄 index.html            # Page HTML principale
├── 📄 vite.config.ts        # Configuration de Vite (outil de build)
├── 📁 src/                  # Code source du frontend
├── 📁 backend/              # Code du serveur
├── 📁 public/               # Fichiers publics (images, CSS)
└── 📁 images/               # Images du projet
```

### Dossier `src/` (Frontend)

```
src/
├── 📄 main.tsx              # Point d'entrée de l'application
├── 📄 App.tsx               # Composant principal
├── 📄 index.css             # Styles globaux
├── 📁 components/           # Composants réutilisables
│   ├── Header.tsx           # En-tête du site
│   └── Footer.tsx           # Pied de page
├── 📁 pages/                # Pages de l'application
│   ├── Home.tsx             # Page d'accueil
│   ├── Menu.tsx             # Page du menu
│   ├── Cart.tsx             # Page du panier
│   └── Admin.tsx            # Page d'administration
├── 📁 contexts/             # Gestion d'état global
└── 📁 hooks/                # Fonctions personnalisées
```

### Dossier `backend/` (Serveur)

```
backend/
├── 📄 server.js             # Serveur principal
├── 📄 package.json          # Configuration du projet backend
├── 📁 models/               # Modèles de données
│   ├── Pizza.js             # Modèle pour les pizzas
│   ├── Avis.js              # Modèle pour les avis
│   └── database.js          # Configuration base de données
└── 📁 routes/               # Routes API
    ├── pizzas.js            # Routes pour les pizzas
    ├── avis.js              # Routes pour les avis
    └── categories.js        # Routes pour les catégories
```

## 🎨 Frontend React Expliqué

### Qu'est-ce que React ?

React est comme un jeu de LEGO pour créer des sites web :
- Chaque **composant** = une pièce de LEGO
- On assemble les pièces pour créer une page complète
- On peut réutiliser les mêmes pièces plusieurs fois

### Exemple de Composant Simple

```tsx
// Ceci est un composant React
function Bouton() {
  return (
    <button className="mon-bouton">
      Cliquez ici !
    </button>
  );
}
```

**Explication ligne par ligne :**
1. `function Bouton()` : On crée une fonction nommée "Bouton"
2. `return (` : On retourne du code HTML
3. `<button>` : Balise HTML pour un bouton
4. `className` : Équivalent de "class" en HTML (pour le CSS)
5. `</button>` : Fermeture de la balise

### JSX : HTML dans JavaScript

JSX permet d'écrire du HTML directement dans JavaScript :

```tsx
// ✅ Correct (JSX)
const element = <h1>Bonjour le monde !</h1>;

// ❌ Sans JSX (plus compliqué)
const element = React.createElement('h1', null, 'Bonjour le monde !');
```

### Props : Passer des Données

Les props sont comme des paramètres de fonction :

```tsx
// Composant qui reçoit des props
function Pizza({ nom, prix }) {
  return (
    <div>
      <h3>{nom}</h3>
      <p>Prix : {prix}€</p>
    </div>
  );
}

// Utilisation du composant
<Pizza nom="Margherita" prix={12} />
```

### State : Données qui Changent

Le state stocke des données qui peuvent changer :

```tsx
import { useState } from 'react';

function Compteur() {
  // useState crée une variable qui peut changer
  const [nombre, setNombre] = useState(0);
  
  return (
    <div>
      <p>Compteur : {nombre}</p>
      <button onClick={() => setNombre(nombre + 1)}>
        +1
      </button>
    </div>
  );
}
```

**Explication :**
- `useState(0)` : Crée une variable "nombre" avec la valeur initiale 0
- `setNombre` : Fonction pour changer la valeur de "nombre"
- `onClick` : Événement qui se déclenche quand on clique

## ⚙️ Backend Node.js Expliqué

### Qu'est-ce que Node.js ?

Node.js permet d'utiliser JavaScript côté serveur :
- Normalement, JavaScript fonctionne seulement dans le navigateur
- Node.js permet de l'utiliser pour créer des serveurs

### Express : Framework Web

Express simplifie la création de serveurs :

```javascript
// Serveur basique avec Express
const express = require('express');
const app = express();

// Route GET : quand quelqu'un visite "/hello"
app.get('/hello', (req, res) => {
  res.send('Bonjour le monde !');
});

// Démarrer le serveur sur le port 3000
app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});
```

### API REST : Communication Frontend-Backend

Une API REST utilise des "verbes" HTTP :

- **GET** : Récupérer des données ("Donne-moi la liste des pizzas")
- **POST** : Créer quelque chose ("Ajoute cette nouvelle pizza")
- **PUT** : Modifier quelque chose ("Change le prix de cette pizza")
- **DELETE** : Supprimer quelque chose ("Supprime cette pizza")

```javascript
// Exemples de routes API
app.get('/api/pizzas', (req, res) => {
  // Récupérer toutes les pizzas
});

app.post('/api/pizzas', (req, res) => {
  // Créer une nouvelle pizza
});

app.put('/api/pizzas/:id', (req, res) => {
  // Modifier la pizza avec l'ID spécifié
});

app.delete('/api/pizzas/:id', (req, res) => {
  // Supprimer la pizza avec l'ID spécifié
});
```

## 🗄️ Base de Données MySQL

### Qu'est-ce qu'une Base de Données ?

Imaginez un classeur géant avec des tiroirs :
- **Base de données** = Le classeur
- **Tables** = Les tiroirs
- **Colonnes** = Les sections dans chaque tiroir
- **Lignes** = Les fiches individuelles

### Structure de Notre Base de Données

#### Table `pizza`
```sql
+-------------+--------------+
| Colonne     | Type         |
+-------------+--------------+
| id_pizza    | INT (clé)    |
| nom_pizza   | VARCHAR(100) |
| prix_pizza  | DECIMAL(5,2) |
| description | TEXT         |
| image_url   | VARCHAR(255) |
+-------------+--------------+
```

#### Table `ingredients`
```sql
+------------------+--------------+
| Colonne          | Type         |
+------------------+--------------+
| id_ingredients   | INT (clé)    |
| nom_ingredients  | VARCHAR(100) |
| prix_ingredients | DECIMAL(5,2) |
+------------------+--------------+
```

### Requêtes SQL de Base

```sql
-- Récupérer toutes les pizzas
SELECT * FROM pizza;

-- Récupérer une pizza spécifique
SELECT * FROM pizza WHERE id_pizza = 1;

-- Ajouter une nouvelle pizza
INSERT INTO pizza (nom_pizza, prix_pizza, description) 
VALUES ('Margherita', 12.50, 'Pizza classique');

-- Modifier le prix d'une pizza
UPDATE pizza SET prix_pizza = 13.00 WHERE id_pizza = 1;

-- Supprimer une pizza
DELETE FROM pizza WHERE id_pizza = 1;
```

## 📚 Comment Lire le Code

### Conventions de Nommage

```javascript
// Variables : camelCase
const nomUtilisateur = 'Jean';
const ageUtilisateur = 25;

// Constantes : UPPER_CASE
const API_URL = 'http://localhost:5000';
const MAX_PIZZAS = 10;

// Fonctions : camelCase
function calculerTotal() { }
function ajouterAuPanier() { }

// Composants React : PascalCase
function MenuPizza() { }
function BoutonAjouter() { }
```

### Structure d'un Fichier React

```tsx
// 1. Imports (bibliothèques externes)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 2. Imports locaux (nos fichiers)
import './Menu.css';
import { useCart } from '../contexts/CartContext';

// 3. Types TypeScript (si nécessaire)
interface Pizza {
  id: number;
  nom: string;
  prix: number;
}

// 4. Composant principal
function Menu() {
  // 4a. State et variables
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  
  // 4b. Fonctions
  const chargerPizzas = async () => {
    // Code pour charger les pizzas
  };
  
  // 4c. Effects (code qui s'exécute au chargement)
  useEffect(() => {
    chargerPizzas();
  }, []);
  
  // 4d. Rendu JSX
  return (
    <div className="menu">
      {/* Contenu du composant */}
    </div>
  );
}

// 5. Export du composant
export default Menu;
```

### Structure d'un Fichier Backend

```javascript
// 1. Imports
const express = require('express');
const mysql = require('mysql2/promise');

// 2. Configuration
const router = express.Router();

// 3. Routes
router.get('/pizzas', async (req, res) => {
  try {
    // Code pour récupérer les pizzas
    res.json(pizzas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Export
module.exports = router;
```

## 🔄 Flux de Données

### Exemple : Afficher la Liste des Pizzas

1. **Frontend** : L'utilisateur visite la page Menu
2. **React** : Le composant Menu se charge
3. **useEffect** : Déclenche une requête au backend
4. **Axios** : Envoie une requête GET à `/api/pizzas`
5. **Backend** : Reçoit la requête sur la route `/api/pizzas`
6. **Express** : Exécute la fonction de la route
7. **MySQL** : Exécute la requête SQL `SELECT * FROM pizza`
8. **Backend** : Renvoie les données en JSON
9. **Frontend** : Reçoit les données et met à jour le state
10. **React** : Re-rend le composant avec les nouvelles données

### Exemple : Ajouter une Pizza au Panier

1. **Utilisateur** : Clique sur "Ajouter au panier"
2. **React** : Déclenche la fonction `ajouterAuPanier`
3. **Context** : Met à jour le state global du panier
4. **React** : Re-rend tous les composants qui utilisent le panier
5. **Interface** : Le compteur du panier se met à jour

## 🎯 Exercices Pratiques

### Niveau Débutant

1. **Modifier un texte** :
   - Ouvrez `src/pages/Home.tsx`
   - Changez le titre de la page d'accueil
   - Observez le changement dans le navigateur

2. **Ajouter un style** :
   - Ouvrez `src/pages/Home.css`
   - Changez la couleur de fond
   - Rechargez la page pour voir le résultat

3. **Comprendre les props** :
   - Regardez comment le composant `Header` est utilisé dans `App.tsx`
   - Identifiez quelles données sont passées en props

### Niveau Intermédiaire

1. **Ajouter un nouveau champ** :
   - Ajoutez un champ "description" à l'affichage des pizzas
   - Modifiez le composant Menu pour l'afficher

2. **Créer un nouveau composant** :
   - Créez un composant `PizzaCard` pour afficher une pizza
   - Utilisez-le dans la page Menu

3. **Comprendre les API** :
   - Ouvrez les outils de développement (F12)
   - Allez dans l'onglet "Network"
   - Rechargez la page Menu et observez les requêtes

### Niveau Avancé

1. **Ajouter une nouvelle route API** :
   - Créez une route pour récupérer une pizza par ID
   - Testez-la avec un outil comme Postman

2. **Implémenter une nouvelle fonctionnalité** :
   - Ajoutez un système de favoris
   - Créez le frontend et le backend nécessaires

## 🚨 Erreurs Courantes et Solutions

### Erreurs Frontend

**Erreur** : "Cannot read property 'map' of undefined"
```tsx
// ❌ Problème
{pizzas.map(pizza => <div key={pizza.id}>{pizza.nom}</div>)}

// ✅ Solution
{pizzas && pizzas.map(pizza => <div key={pizza.id}>{pizza.nom}</div>)}
// ou
{pizzas?.map(pizza => <div key={pizza.id}>{pizza.nom}</div>)}
```

**Erreur** : "Each child in a list should have a unique key prop"
```tsx
// ❌ Problème
{pizzas.map(pizza => <div>{pizza.nom}</div>)}

// ✅ Solution
{pizzas.map(pizza => <div key={pizza.id}>{pizza.nom}</div>)}
```

### Erreurs Backend

**Erreur** : "Cannot GET /api/pizzas"
- Vérifiez que la route est bien définie
- Vérifiez que le serveur est démarré
- Vérifiez l'URL dans le frontend

**Erreur** : "CORS policy"
```javascript
// Solution : Ajouter CORS dans server.js
const cors = require('cors');
app.use(cors());
```

## 📖 Ressources pour Continuer

### Documentation Officielle
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Node.js](https://nodejs.org/docs/)
- [Express](https://expressjs.com/)
- [MySQL](https://dev.mysql.com/doc/)

### Tutoriels Recommandés
- [freeCodeCamp](https://www.freecodecamp.org/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [W3Schools](https://www.w3schools.com/)
- [JavaScript.info](https://javascript.info/)

### Outils de Développement
- **VS Code** : Éditeur de code recommandé
- **Chrome DevTools** : Outils de débogage
- **Postman** : Test des API
- **MySQL Workbench** : Interface graphique pour MySQL

---

**Félicitations ! 🎉**

Vous avez maintenant une base solide pour comprendre le projet Oh'Pizza. N'hésitez pas à expérimenter, poser des questions, et surtout... amusez-vous en codant !

*Remember: Every expert was once a beginner. Keep coding! 💪*