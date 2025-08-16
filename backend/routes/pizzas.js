/**
 * ========================================
 * ROUTES API POUR LES PIZZAS - CRUD COMPLET
 * ========================================
 * 
 * Ce fichier gère toutes les opérations sur les pizzas :
 * 
 * CRUD = Create, Read, Update, Delete
 * - CREATE : POST /api/pizzas (créer une pizza)
 * - READ : GET /api/pizzas (lire toutes les pizzas)
 * - READ : GET /api/pizzas/:id (lire une pizza spécifique)
 * - UPDATE : PUT /api/pizzas/:id (modifier une pizza)
 * - DELETE : DELETE /api/pizzas/:id (supprimer une pizza)
 * 
 * CONCEPTS POUR DÉBUTANTS :
 * - Router Express : permet de grouper les routes
 * - Middleware : fonctions qui s'exécutent avant les routes
 * - Validation : vérifier que les données reçues sont correctes
 * - Modèle : classe qui gère les interactions avec la base de données
 */

// ========================================
// IMPORTATION DES MODULES
// ========================================

/**
 * Express : pour créer le routeur
 */
import express from 'express';

/**
 * Modèle Pizza : classe qui gère les opérations en base de données
 * Contient les méthodes : getAll(), getById(), create(), update(), delete()
 */
import Pizza from '../models/Pizza.js';

/**
 * Express-validator : pour valider les données reçues
 * body : valide les champs du body de la requête
 * validationResult : récupère les erreurs de validation
 */
import { body, validationResult } from 'express-validator';

/**
 * Multer : pour gérer l'upload d'images
 */
import multer from 'multer';

/**
 * Path et fileURLToPath : pour gérer les chemins de fichiers
 */
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Fonction pour exécuter des requêtes SQL personnalisées
 */
import { executeQuery } from '../models/database.js';

/**
 * Configuration des chemins (nécessaire avec les modules ES6)
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// CONFIGURATION MULTER POUR UPLOAD D'IMAGES
// ========================================

/**
 * Configuration identique à server.js mais spécifique aux pizzas
 * Permet d'uploader des images lors de la création/modification de pizzas
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'pizza-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

// ========================================
// CRÉATION DU ROUTEUR EXPRESS
// ========================================

/**
 * Création d'un routeur Express
 * 
 * QU'EST-CE QU'UN ROUTEUR ?
 * Un routeur est comme un "sous-serveur" qui gère un groupe de routes.
 * 
 * Avantages :
 * - Organisation du code (toutes les routes pizzas dans un fichier)
 * - Réutilisabilité
 * - Maintenance plus facile
 * 
 * Ce routeur sera "monté" sur /api/pizzas dans server.js
 */
const router = express.Router();

// ========================================
// MIDDLEWARE DE VALIDATION
// ========================================

/**
 * Middleware pour gérer les erreurs de validation
 * 
 * QU'EST-CE QU'UN MIDDLEWARE ?
 * Une fonction qui s'exécute AVANT la route principale.
 * 
 * PARAMÈTRES :
 * - req : requête (données envoyées par le client)
 * - res : réponse (ce qu'on va renvoyer au client)
 * - next : fonction pour passer au middleware/route suivant
 * 
 * FONCTIONNEMENT :
 * 1. Vérifie s'il y a des erreurs de validation
 * 2. Si oui : renvoie une erreur 400 avec les détails
 * 3. Si non : appelle next() pour continuer vers la route
 */
const handleValidationErrors = (req, res, next) => {
  /**
   * validationResult() récupère les erreurs de validation
   * (définies avec express-validator)
   */
  const errors = validationResult(req);
  
  /**
   * S'il y a des erreurs, on arrête et on renvoie une erreur 400
   */
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Données invalides', 
      details: errors.array() // Détails des erreurs pour le développeur
    });
  }
  
  /**
   * Pas d'erreur : on continue vers la route suivante
   */
  next();
};

// ========================================
// ROUTES DE LECTURE (READ) - MÉTHODE GET
// ========================================

/**
 * GET /api/pizzas - Récupérer toutes les pizzas
 * 
 * MÉTHODE HTTP : GET
 * URL COMPLÈTE : http://localhost:3001/api/pizzas
 * 
 * QU'EST-CE QUE GET ?
 * - Méthode pour LIRE des données (pas les modifier)
 * - Pas de body dans la requête
 * - Données renvoyées au format JSON
 * 
 * FONCTIONNEMENT :
 * 1. Le frontend fait un appel GET /api/pizzas
 * 2. Cette route s'exécute
 * 3. On récupère toutes les pizzas depuis la base de données
 * 4. On renvoie les données au frontend
 */
router.get('/', async (req, res) => {
  try {
    /**
     * Pizza.getAll() : méthode du modèle Pizza
     * - Exécute une requête SQL : SELECT * FROM pizzas
     * - Retourne un tableau de toutes les pizzas
     * 
     * await : attend que la requête se termine
     * (car c'est une opération asynchrone)
     */
    const pizzas = await Pizza.getAll();
    
    /**
     * Réponse de succès au format JSON
     * 
     * Structure standardisée :
     * - success: true/false (pour indiquer si ça a marché)
     * - data: les données demandées
     * - count: nombre d'éléments (utile pour le frontend)
     */
    res.json({
      success: true,
      data: pizzas,
      count: pizzas.length
    });
  } catch (error) {
    /**
     * Gestion des erreurs
     * 
     * Si quelque chose se passe mal (base de données inaccessible, etc.)
     * on renvoie une erreur 500 (erreur serveur)
     */
    console.error('Erreur lors de la récupération des pizzas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération des pizzas' 
    });
  }
});

/**
 * GET /api/pizzas/category/:categoryId - Récupérer les pizzas par catégorie
 * 
 * PARAMÈTRES D'URL :
 * :categoryId est un paramètre dynamique
 * 
 * Exemples d'URLs :
 * - GET /api/pizzas/category/1 → pizzas de la catégorie 1
 * - GET /api/pizzas/category/2 → pizzas de la catégorie 2
 * 
 * Le :categoryId sera accessible dans req.params.categoryId
 */
router.get('/category/:categoryId', async (req, res) => {
  try {
    /**
     * Extraction du paramètre categoryId depuis l'URL
     * 
     * req.params contient tous les paramètres de l'URL
     * Exemple : si URL = /api/pizzas/category/3
     * alors req.params.categoryId = "3"
     * 
     * Destructuring : const { categoryId } = req.params
     * équivaut à : const categoryId = req.params.categoryId
     */
    const { categoryId } = req.params;
    
    /**
     * Récupération des pizzas de cette catégorie
     * Pizza.getByCategory() exécute une requête comme :
     * SELECT * FROM pizzas WHERE id_pizza_categories = ?
     */
    const pizzas = await Pizza.getByCategory(categoryId);
    
    res.json({
      success: true,
      data: pizzas,
      count: pizzas.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des pizzas par catégorie:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération des pizzas' 
    });
  }
});

/**
 * GET /api/pizzas/:id - Récupérer une pizza spécifique par son ID
 * 
 * DIFFÉRENCE AVEC LA ROUTE PRÉCÉDENTE :
 * Cette route doit être APRÈS /category/:categoryId
 * sinon Express confondrait "category" avec un ID
 * 
 * Exemples :
 * - GET /api/pizzas/5 → pizza avec l'ID 5
 * - GET /api/pizzas/abc → erreur (abc n'est pas un ID valide)
 */
router.get('/:id', async (req, res) => {
  try {
    /**
     * Extraction de l'ID depuis l'URL
     */
    const { id } = req.params;
    
    /**
     * Recherche de la pizza par ID
     * Pizza.getById() exécute : SELECT * FROM pizzas WHERE id_pizza = ?
     */
    const pizza = await Pizza.getById(id);
    
    /**
     * Vérification : est-ce que la pizza existe ?
     * 
     * Si pizza = null ou undefined, c'est qu'elle n'existe pas
     * On renvoie alors une erreur 404 (Not Found)
     */
    if (!pizza) {
      return res.status(404).json({ 
        success: false,
        error: 'Pizza non trouvée' 
      });
    }
    
    /**
     * Pizza trouvée : on la renvoie
     * Pas besoin de count ici car c'est un seul élément
     */
    res.json({
      success: true,
      data: pizza
    });
  } catch (error) {
    /**
     * Erreur 500 : problème serveur (base de données, etc.)
     */
    console.error('Erreur lors de la récupération de la pizza:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération de la pizza' 
    });
  }
});

// POST /api/pizzas - Créer une nouvelle pizza (Admin uniquement)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('📝 [DEBUG] Création d\'une nouvelle pizza');
    console.log('📝 [DEBUG] Body reçu:', req.body);
    console.log('📝 [DEBUG] Fichier reçu:', req.file);
    
    const { nom_pizza, prix_pizza, id_pizza_categories, ingredients, base } = req.body;
    
    // Validation des champs requis
    if (!nom_pizza || !prix_pizza || !id_pizza_categories) {
      return res.status(400).json({
        success: false,
        error: 'Les champs nom_pizza, prix_pizza et id_pizza_categories sont requis'
      });
    }
    
    // Gérer la base - convertir le nom en ID
    let id_pizza_bases = 1; // Valeur par défaut (Tomate)
    if (base && base.trim() !== '') {
      try {
        const [baseResult] = await executeQuery('SELECT id_pizza_bases FROM bases WHERE nom_pizza_bases = ?', [base]);
        if (baseResult && baseResult.length > 0) {
          id_pizza_bases = baseResult[0].id_pizza_bases;
        }
      } catch (error) {
        console.log('⚠️ Erreur lors de la recherche de la base, utilisation de la valeur par défaut');
      }
    }
    
    // Préparer les données de la pizza
    const pizzaData = {
      nom_pizza,
      prix_pizza: parseFloat(prix_pizza),
      id_pizza_categories: parseInt(id_pizza_categories),
      id_pizza_bases,
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      image_url: req.file ? `/uploads/${req.file.filename}` : null
    };
    
    console.log('📝 [DEBUG] Données pizza préparées:', pizzaData);
    
    const newPizza = await Pizza.create(pizzaData);
    
    res.status(201).json({
      success: true,
      message: 'Pizza créée avec succès',
      data: newPizza
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création de la pizza:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la création de la pizza' 
    });
  }
});

// PUT /api/pizzas/:id - Mettre à jour une pizza (Admin uniquement)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    console.log('📝 [DEBUG] Mise à jour d\'une pizza');
    console.log('📝 [DEBUG] Body reçu:', req.body);
    console.log('📝 [DEBUG] Fichier reçu:', req.file);
    
    const { id } = req.params;
    const { nom_pizza, prix_pizza, id_pizza_categories, ingredients, base } = req.body;
    
    // Vérifier si la pizza existe
    const existingPizza = await Pizza.getById(id);
    if (!existingPizza) {
      return res.status(404).json({ 
        success: false,
        error: 'Pizza non trouvée' 
      });
    }
    
    // Utiliser les valeurs existantes si les nouvelles ne sont pas fournies
    const finalNomPizza = nom_pizza && nom_pizza.trim() !== '' ? nom_pizza : existingPizza.nom_pizza;
    const finalPrixPizza = prix_pizza ? parseFloat(prix_pizza) : parseFloat(existingPizza.prix_pizza);
    const finalCategoryId = id_pizza_categories ? parseInt(id_pizza_categories) : existingPizza.id_pizza_categories;
    
    // Gérer la base
    let finalBaseId = existingPizza.id_pizza_bases || 1; // Utiliser la base existante par défaut
    
    if (base && base.trim() !== '') {
      try {
        const baseResult = await executeQuery('SELECT id_pizza_bases FROM bases WHERE nom_pizza_bases = ?', [base]);
        
        if (baseResult && baseResult.length > 0) {
          finalBaseId = baseResult[0].id_pizza_bases;
        }
      } catch (error) {
        console.log('⚠️ Erreur lors de la recherche de la base, conservation de la valeur existante');
      }
    }
     
     // Validation des valeurs finales
    if (!finalNomPizza || !finalPrixPizza || finalPrixPizza <= 0 || !finalCategoryId) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides pour la mise à jour'
      });
    }
    
    // Préparer les données de la pizza
    const pizzaData = {
      nom_pizza: finalNomPizza,
      prix_pizza: finalPrixPizza,
      id_pizza_categories: finalCategoryId,
      id_pizza_bases: finalBaseId,
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      image_url: req.file ? `/uploads/${req.file.filename}` : existingPizza.image_url // Garder l'ancienne image si pas de nouvelle
    };
    
    console.log('📝 [DEBUG] Données pizza préparées:', pizzaData);
    
    const updatedPizza = await Pizza.update(id, pizzaData);
    
    res.json({
      success: true,
      message: 'Pizza mise à jour avec succès',
      data: updatedPizza
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la pizza:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la mise à jour de la pizza' 
    });
  }
});

// DELETE /api/pizzas/:id - Supprimer une pizza (Admin uniquement)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si la pizza existe
    const existingPizza = await Pizza.getById(id);
    if (!existingPizza) {
      return res.status(404).json({ 
        success: false,
        error: 'Pizza non trouvée' 
      });
    }
    
    const deleted = await Pizza.delete(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Pizza supprimée avec succès'
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Erreur lors de la suppression de la pizza' 
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la pizza:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la suppression de la pizza' 
    });
  }
});

// GET /api/pizzas/:id/ingredients - Récupérer les ingrédients d'une pizza
router.get('/:id/ingredients', async (req, res) => {
  try {
    const { id } = req.params;
    const ingredients = await Pizza.getIngredients(id);
    
    res.json({
      success: true,
      data: ingredients,
      count: ingredients.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ingrédients:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération des ingrédients' 
    });
  }
});

export default router;