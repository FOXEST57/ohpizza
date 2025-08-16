/**
 * ========================================
 * SERVEUR BACKEND OH'PIZZA - NODE.JS + EXPRESS
 * ========================================
 * 
 * Ce fichier est le CŒUR du serveur backend.
 * Il gère :
 * - Les connexions à la base de données MySQL
 * - Les routes API (endpoints)
 * - L'upload d'images
 * - La communication avec le frontend React
 * 
 * CONCEPTS CLÉS POUR DÉBUTANTS :
 * - API REST : système de communication entre frontend et backend
 * - Express : framework Node.js pour créer des serveurs web
 * - Middleware : fonctions qui s'exécutent entre la requête et la réponse
 * - Routes : chemins d'accès aux données (ex: /api/pizzas)
 */

// ========================================
// IMPORTATION DES MODULES (BIBLIOTHÈQUES)
// ========================================

/**
 * Express : framework pour créer le serveur web
 * C'est comme les fondations d'une maison pour notre API
 */
import express from 'express';

/**
 * CORS : permet au frontend (React) de communiquer avec le backend
 * Sans CORS, le navigateur bloque les requêtes entre différents ports
 */
import cors from 'cors';

/**
 * Dotenv : lit les variables d'environnement depuis le fichier .env
 * Utile pour stocker des informations sensibles (mots de passe, etc.)
 */
import dotenv from 'dotenv';

/**
 * MySQL2 : permet de se connecter et communiquer avec la base de données MySQL
 * /promise : version moderne avec async/await
 */
import mysql from 'mysql2/promise';

/**
 * Multer : gère l'upload de fichiers (images des pizzas)
 */
import multer from 'multer';

/**
 * Path : utilitaire pour gérer les chemins de fichiers
 * Fonctionne sur Windows, Mac et Linux
 */
import path from 'path';

/**
 * FileURLToPath : convertit les URLs en chemins de fichiers
 * Nécessaire avec les modules ES6
 */
import { fileURLToPath } from 'url';

// ========================================
// CONFIGURATION INITIALE
// ========================================

/**
 * Charge les variables d'environnement depuis le fichier .env
 * Exemple : DB_PASSWORD=monmotdepasse
 */
dotenv.config();

/**
 * Obtient le chemin du fichier actuel (server.js)
 * Nécessaire pour les modules ES6
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Création de l'application Express
 * C'est notre serveur web principal
 */
const app = express();

/**
 * Port d'écoute du serveur
 * process.env.PORT : variable d'environnement (production)
 * 3001 : port par défaut (développement)
 */
const PORT = process.env.PORT || 3001;

// ========================================
// MIDDLEWARE - FONCTIONS INTERMÉDIAIRES
// ========================================

/**
 * QU'EST-CE QU'UN MIDDLEWARE ?
 * 
 * Un middleware est une fonction qui s'exécute ENTRE la réception
 * d'une requête et l'envoi de la réponse.
 * 
 * Ordre d'exécution :
 * 1. Requête du client (frontend)
 * 2. Middleware 1 (ex: CORS)
 * 3. Middleware 2 (ex: JSON parser)
 * 4. Route handler (notre code)
 * 5. Réponse au client
 */

/**
 * CORS Middleware
 * Autorise les requêtes depuis le frontend (port 5173)
 * Sans ça, le navigateur bloque les appels API
 */
app.use(cors());

/**
 * JSON Parser Middleware
 * Transforme les données JSON reçues en objets JavaScript
 * Exemple : '{"nom": "Margherita"}' devient {nom: "Margherita"}
 */
app.use(express.json());

/**
 * URL Encoded Parser Middleware
 * Gère les données de formulaires HTML
 * extended: true permet les objets complexes
 */
app.use(express.urlencoded({ extended: true }));

// ========================================
// SERVEUR DE FICHIERS STATIQUES
// ========================================

/**
 * Sert les images depuis le dossier parent /images
 * URL d'accès : http://localhost:3001/images/pizza1.jpg
 * Chemin réel : ../images/pizza1.jpg
 */
app.use('/images', express.static(path.join(__dirname, '../images')));

/**
 * Sert les images uploadées depuis /uploads
 * URL d'accès : http://localhost:3001/uploads/pizza-123456.jpg
 * Chemin réel : ./uploads/pizza-123456.jpg
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================================
// CONFIGURATION MULTER - UPLOAD D'IMAGES
// ========================================

/**
 * QU'EST-CE QUE MULTER ?
 * 
 * Multer gère l'upload de fichiers depuis le frontend.
 * Il permet de :
 * - Recevoir des images
 * - Les sauvegarder sur le serveur
 * - Contrôler leur format et taille
 */

/**
 * Configuration du stockage des fichiers
 * diskStorage : sauvegarde sur le disque dur (pas en mémoire)
 */
const storage = multer.diskStorage({
  /**
   * Dossier de destination des fichiers uploadés
   * cb = callback (fonction de retour)
   */
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'))
  },
  
  /**
   * Génération du nom de fichier
   * On crée un nom unique pour éviter les conflits
   */
  filename: function (req, file, cb) {
    /**
     * Création d'un suffixe unique :
     * - Date.now() : timestamp actuel (millisecondes)
     * - Math.random() : nombre aléatoire
     * - 1E9 = 1000000000 (pour avoir un grand nombre)
     */
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    
    /**
     * Nom final : pizza-1234567890-987654321.jpg
     * path.extname() récupère l'extension (.jpg, .png, etc.)
     */
    cb(null, 'pizza-' + uniqueSuffix + path.extname(file.originalname))
  }
});

/**
 * Filtre pour accepter seulement les images
 * Sécurité : empêche l'upload de fichiers dangereux
 */
const fileFilter = (req, file, cb) => {
  /**
   * file.mimetype contient le type de fichier :
   * - image/jpeg
   * - image/png
   * - image/gif
   * - text/plain (pas une image !)
   */
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accepter le fichier
  } else {
    cb(new Error('Seules les images sont autorisées!'), false); // Rejeter
  }
};

/**
 * Configuration finale de Multer
 */
const upload = multer({ 
  storage: storage,           // Où et comment sauvegarder
  fileFilter: fileFilter,     // Quels fichiers accepter
  limits: {
    fileSize: 50 * 1024 * 1024 // Taille max : 50MB (50 × 1024 × 1024 octets)
  }
});

// ========================================
// CONFIGURATION BASE DE DONNÉES MYSQL
// ========================================

/**
 * QU'EST-CE QU'UNE BASE DE DONNÉES ?
 * 
 * Une base de données est comme un classeur géant qui stocke
 * toutes les informations de notre application :
 * - Les pizzas (nom, prix, ingrédients)
 * - Les catégories (Classiques, Spéciales, etc.)
 * - Les horaires d'ouverture
 * - Les avis clients
 * 
 * MySQL est un système de gestion de base de données très populaire.
 */

/**
 * Configuration de connexion à MySQL
 * Ces informations permettent de se connecter à la base de données
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',     // Adresse du serveur MySQL
  user: process.env.DB_USER || 'root',          // Nom d'utilisateur MySQL
  password: process.env.DB_PASSWORD || '',      // Mot de passe MySQL
  database: process.env.DB_NAME || 'ohpizza',   // Nom de la base de données
  charset: 'utf8mb4'                            // Encodage (pour les emojis et accents)
};

/**
 * Connexion à la base de données
 * 
 * CONCEPTS IMPORTANTS :
 * - await : attend que la connexion soit établie
 * - try/catch : gère les erreurs de connexion
 * - process.exit(1) : arrête le serveur si la connexion échoue
 */
let db; // Variable globale pour la connexion
try {
  /**
   * Création de la connexion MySQL
   * mysql.createConnection() établit la liaison avec la base
   */
  db = await mysql.createConnection(dbConfig);
  console.log('✅ Connexion à la base de données MySQL réussie');
} catch (error) {
  /**
   * Si la connexion échoue, on affiche l'erreur et on arrête le serveur
   * Car sans base de données, l'application ne peut pas fonctionner
   */
  console.error('❌ Erreur de connexion à la base de données:', error.message);
  process.exit(1); // Code 1 = erreur
}

// ========================================
// IMPORTATION DES ROUTES MODULAIRES
// ========================================

/**
 * QU'EST-CE QU'UNE ROUTE ?
 * 
 * Une route est un "chemin" que le frontend peut appeler pour obtenir des données.
 * 
 * Exemples :
 * - GET /api/pizzas → Récupère la liste des pizzas
 * - POST /api/pizzas → Crée une nouvelle pizza
 * - PUT /api/pizzas/5 → Modifie la pizza avec l'ID 5
 * - DELETE /api/pizzas/5 → Supprime la pizza avec l'ID 5
 * 
 * On sépare les routes en fichiers pour organiser le code :
 * - routes/pizzas.js → Toutes les routes des pizzas
 * - routes/categories.js → Toutes les routes des catégories
 * etc.
 */

/**
 * Import des fichiers de routes
 * Chaque fichier gère un type de données spécifique
 */
import pizzasRoutes from './routes/pizzas.js';           // Gestion des pizzas
import categoriesRoutes from './routes/categories.js';   // Gestion des catégories
import ingredientsRoutes from './routes/ingredients.js'; // Gestion des ingrédients
import horairesRoutes from './routes/horaires.js';       // Gestion des horaires
import basesRoutes from './routes/bases.js';             // Gestion des pâtes
import avisRoutes from './routes/avis.js';               // Gestion des avis
import googleAvisRoutes from './routes/google-avis.js';  // Avis Google

// ========================================
// ROUTES PRINCIPALES
// ========================================

/**
 * Route racine - Page d'accueil de l'API
 * 
 * Quand on va sur http://localhost:3001/
 * on obtient des informations sur l'API
 */
app.get('/', (req, res) => {
  /**
   * res.json() envoie une réponse au format JSON
   * Le frontend recevra ces informations
   */
  res.json({ 
    message: 'API Oh\'Pizza - Serveur backend opérationnel',
    version: '1.0.0',
    endpoints: {
      pizzas: '/api/pizzas',
      categories: '/api/categories',
      ingredients: '/api/ingredients',
      auth: '/api/auth',
      orders: '/api/orders'
    }
  });
});

// ========================================
// ENREGISTREMENT DES ROUTES MODULAIRES
// ========================================

/**
 * app.use() enregistre les routes avec un préfixe
 * 
 * Exemple : app.use('/api/pizzas', pizzasRoutes)
 * Toutes les routes de pizzasRoutes seront préfixées par '/api/pizzas'
 * 
 * Si pizzasRoutes contient une route GET '/', elle devient GET '/api/pizzas/'
 * Si pizzasRoutes contient une route GET '/:id', elle devient GET '/api/pizzas/:id'
 */
app.use('/api/pizzas', pizzasRoutes);         // Routes : /api/pizzas/*
app.use('/api/categories', categoriesRoutes); // Routes : /api/categories/*
app.use('/api/ingredients', ingredientsRoutes); // Routes : /api/ingredients/*
app.use('/api/horaires', horairesRoutes);     // Routes : /api/horaires/*
app.use('/api/bases', basesRoutes);           // Routes : /api/bases/*
app.use('/api/avis', avisRoutes);             // Routes : /api/avis/*
app.use('/api/google-avis', googleAvisRoutes); // Routes : /api/google-avis/*

// ========================================
// ROUTE D'UPLOAD D'IMAGES
// ========================================

/**
 * Route POST pour uploader une image
 * 
 * FONCTIONNEMENT :
 * 1. Le frontend envoie une image via un formulaire
 * 2. Multer traite le fichier (vérifie le type, génère un nom unique)
 * 3. Le fichier est sauvegardé dans /uploads/
 * 4. On renvoie l'URL de l'image au frontend
 * 
 * upload.single('image') : middleware Multer pour un seul fichier
 * 'image' : nom du champ dans le formulaire HTML
 */
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    /**
     * Vérification : est-ce qu'un fichier a été envoyé ?
     * req.file contient les informations du fichier uploadé
     */
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucune image fournie'
      });
    }

    /**
     * Construction de l'URL publique de l'image
     * Le frontend pourra accéder à l'image via cette URL
     */
    const imageUrl = `/uploads/${req.file.filename}`;
    
    /**
     * Réponse de succès avec les informations de l'image
     */
    res.json({
      success: true,
      message: 'Image uploadée avec succès',
      imageUrl: imageUrl,           // URL pour accéder à l'image
      filename: req.file.filename   // Nom du fichier sur le serveur
    });
  } catch (error) {
    /**
     * Gestion des erreurs d'upload
     */
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload de l\'image'
    });
  }
});

// Route de test pour vérifier la base de données
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('🔍 [TEST] Test de connexion à la base de données');
    
    const [rows] = await db.execute('SELECT * FROM horaire ORDER BY id_horaire');
    
    console.log('🔍 [TEST] Données horaire dans la base:', JSON.stringify(rows, null, 2));
    
    res.json({
      success: true,
      message: 'Test de base de données réussi',
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('❌ [TEST ERROR]:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Route pour les horaires (depuis la base de données)
app.get('/api/horaires', async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Requête GET /api/horaires reçue');
    
    const [rows] = await db.execute('SELECT * FROM horaire ORDER BY id_horaire');
    
    console.log('🔍 [DEBUG] Données récupérées de la base de données:');
    console.log('🔍 [DEBUG] Nombre de lignes:', rows.length);
    console.log('🔍 [DEBUG] Contenu des données:', JSON.stringify(rows, null, 2));
    
    const response = {
      success: true,
      data: rows,
      count: rows.length
    };
    
    console.log('🔍 [DEBUG] Réponse envoyée au client:', JSON.stringify(response, null, 2));
    
    res.json(response);
  } catch (error) {
    console.error('❌ [ERROR] Erreur lors de la récupération des horaires:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération des horaires' 
    });
  }
});

// Route pour mettre à jour les horaires
app.put('/api/horaires/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { jour, heure_debut_mat, heure_fin_mat, heure_debut_ap, heure_fin_ap } = req.body;
    
    const [result] = await db.execute(
      'UPDATE horaire SET jour = ?, heure_debut_mat = ?, heure_fin_mat = ?, heure_debut_ap = ?, heure_fin_ap = ? WHERE id_horaire = ?',
      [jour, heure_debut_mat, heure_fin_mat, heure_debut_ap, heure_fin_ap, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Horaire non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Horaire mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des horaires:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la mise à jour des horaires' 
    });
  }
});

// ========================================
// GESTION DES ERREURS ET DÉMARRAGE
// ========================================

/**
 * Route "catch-all" pour les URLs non trouvées
 * 
 * app.use('*', ...) capture TOUTES les requêtes qui n'ont pas
 * été gérées par les routes précédentes
 * 
 * Exemple : si quelqu'un va sur /api/inexistant
 * cette route renverra une erreur 404
 */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

/**
 * Démarrage du serveur Express
 * 
 * app.listen() démarre le serveur sur le port spécifié
 * Une fois démarré, le serveur écoute les requêtes HTTP
 */
app.listen(PORT, () => {
  /**
   * Messages de confirmation du démarrage
   * Ces logs aident à vérifier que tout fonctionne
   */
  console.log(`🚀 Serveur Oh'Pizza démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🖼️  Images disponibles sur: http://localhost:${PORT}/images/`);
});

// ========================================
// GESTION PROPRE DE L'ARRÊT DU SERVEUR
// ========================================

/**
 * Gestionnaire d'événement pour l'arrêt du serveur
 * 
 * SIGINT : signal envoyé quand on fait Ctrl+C dans le terminal
 * 
 * POURQUOI C'EST IMPORTANT ?
 * - Fermer proprement la connexion à la base de données
 * - Éviter la corruption des données
 * - Libérer les ressources système
 */
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  
  /**
   * Fermeture de la connexion MySQL
   * db.end() ferme proprement la connexion
   */
  if (db) {
    await db.end();
    console.log('✅ Connexion à la base de données fermée');
  }
  
  /**
   * Arrêt du processus Node.js
   * Code 0 = arrêt normal (pas d'erreur)
   */
  process.exit(0);
});