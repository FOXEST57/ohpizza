import express from 'express';
import Category from '../models/Category.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Middleware de validation des erreurs
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Données invalides', 
      details: errors.array() 
    });
  }
  next();
};

// GET /api/categories - Récupérer toutes les catégories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération des catégories' 
    });
  }
});

// GET /api/categories/:id - Récupérer une catégorie par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.getById(id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Catégorie non trouvée' 
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération de la catégorie' 
    });
  }
});

// POST /api/categories - Créer une nouvelle catégorie (Admin uniquement)
router.post('/', [
  body('nom_pizza_categories').notEmpty().withMessage('Le nom de la catégorie est requis')
], handleValidationErrors, async (req, res) => {
  try {
    const categoryData = req.body;
    const newCategory = await Category.create(categoryData);
    
    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: newCategory
    });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la création de la catégorie' 
    });
  }
});

// PUT /api/categories/:id - Mettre à jour une catégorie (Admin uniquement)
router.put('/:id', [
  body('nom_pizza_categories').notEmpty().withMessage('Le nom de la catégorie est requis')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = req.body;
    
    // Vérifier si la catégorie existe
    const existingCategory = await Category.getById(id);
    if (!existingCategory) {
      return res.status(404).json({ 
        success: false,
        error: 'Catégorie non trouvée' 
      });
    }
    
    const updatedCategory = await Category.update(id, categoryData);
    
    res.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la mise à jour de la catégorie' 
    });
  }
});

// DELETE /api/categories/:id - Supprimer une catégorie (Admin uniquement)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si la catégorie existe
    const existingCategory = await Category.getById(id);
    if (!existingCategory) {
      return res.status(404).json({ 
        success: false,
        error: 'Catégorie non trouvée' 
      });
    }
    
    // Vérifier si la catégorie contient des pizzas
    const pizzas = await Category.getPizzas(id);
    if (pizzas.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Impossible de supprimer cette catégorie car elle contient des pizzas' 
      });
    }
    
    const deleted = await Category.delete(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Catégorie supprimée avec succès'
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Erreur lors de la suppression de la catégorie' 
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la suppression de la catégorie' 
    });
  }
});

// GET /api/categories/:id/pizzas - Récupérer les pizzas d'une catégorie
router.get('/:id/pizzas', async (req, res) => {
  try {
    const { id } = req.params;
    const pizzas = await Category.getPizzas(id);
    
    res.json({
      success: true,
      data: pizzas,
      count: pizzas.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des pizzas de la catégorie:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération des pizzas' 
    });
  }
});

export default router;