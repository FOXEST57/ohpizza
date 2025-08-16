import express from 'express';
import Ingredient from '../models/Ingredient.js';
import { body, validationResult, query } from 'express-validator';

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

// GET /api/ingredients - Récupérer tous les ingrédients
router.get('/', [
  query('type').optional().isString().withMessage('Le type doit être une chaîne'),
  query('search').optional().isString().withMessage('La recherche doit être une chaîne')
], async (req, res) => {
  try {
    const { type, search } = req.query;
    let ingredients;
    
    if (search) {
      ingredients = await Ingredient.search(search);
    } else if (type) {
      ingredients = await Ingredient.getByType(type);
    } else {
      ingredients = await Ingredient.getAll();
    }
    
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

// GET /api/ingredients/:id - Récupérer un ingrédient par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.getById(id);
    
    if (!ingredient) {
      return res.status(404).json({ 
        success: false,
        error: 'Ingrédient non trouvé' 
      });
    }
    
    res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ingrédient:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération de l\'ingrédient' 
    });
  }
});

// POST /api/ingredients - Créer un nouvel ingrédient (Admin uniquement)
router.post('/', [
  body('nom_ingredients').notEmpty().withMessage('Le nom de l\'ingrédient est requis'),
  body('prix_ingredients').optional().isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif')
], handleValidationErrors, async (req, res) => {
  try {
    const ingredientData = req.body;
    const newIngredient = await Ingredient.create(ingredientData);
    
    res.status(201).json({
      success: true,
      message: 'Ingrédient créé avec succès',
      data: newIngredient
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'ingrédient:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la création de l\'ingrédient' 
    });
  }
});

// PUT /api/ingredients/:id - Mettre à jour un ingrédient (Admin uniquement)
router.put('/:id', [
  body('nom_ingredients').notEmpty().withMessage('Le nom de l\'ingrédient est requis'),
  body('prix_ingredients').optional().isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const ingredientData = req.body;
    
    // Vérifier si l'ingrédient existe
    const existingIngredient = await Ingredient.getById(id);
    if (!existingIngredient) {
      return res.status(404).json({ 
        success: false,
        error: 'Ingrédient non trouvé' 
      });
    }
    
    const updatedIngredient = await Ingredient.update(id, ingredientData);
    
    res.json({
      success: true,
      message: 'Ingrédient mis à jour avec succès',
      data: updatedIngredient
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ingrédient:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la mise à jour de l\'ingrédient' 
    });
  }
});

// DELETE /api/ingredients/:id - Supprimer un ingrédient (Admin uniquement)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'ingrédient existe
    const existingIngredient = await Ingredient.getById(id);
    if (!existingIngredient) {
      return res.status(404).json({ 
        success: false,
        error: 'Ingrédient non trouvé' 
      });
    }
    
    const deleted = await Ingredient.delete(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Ingrédient supprimé avec succès'
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Erreur lors de la suppression de l\'ingrédient' 
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'ingrédient:', error);
    if (error.message.includes('utilisé dans des pizzas')) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Erreur serveur lors de la suppression de l\'ingrédient' 
      });
    }
  }
});

// GET /api/ingredients/:id/pizzas - Récupérer les pizzas utilisant un ingrédient
router.get('/:id/pizzas', async (req, res) => {
  try {
    const { id } = req.params;
    const pizzas = await Ingredient.getPizzas(id);
    
    res.json({
      success: true,
      data: pizzas,
      count: pizzas.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des pizzas utilisant l\'ingrédient:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération des pizzas' 
    });
  }
});

export default router;