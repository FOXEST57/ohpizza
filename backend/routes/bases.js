import express from 'express';
import Base from '../models/Base.js';

const router = express.Router();

// GET /api/bases - Récupérer toutes les bases
router.get('/', async (req, res) => {
  try {
    const bases = await Base.getAll();
    res.json({
      success: true,
      data: bases
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des bases:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des bases'
    });
  }
});

// POST /api/bases - Créer une nouvelle base
router.post('/', async (req, res) => {
  try {
    const { nom_pizza_bases } = req.body;
    
    if (!nom_pizza_bases || nom_pizza_bases.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le nom de la base est requis'
      });
    }

    const baseId = await Base.create({ nom_pizza_bases: nom_pizza_bases.trim() });
    
    res.status(201).json({
      success: true,
      data: { id_pizza_bases: baseId, nom_pizza_bases: nom_pizza_bases.trim() }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la base:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la création de la base'
    });
  }
});

// PUT /api/bases/:id - Mettre à jour une base
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom_pizza_bases } = req.body;
    
    if (!nom_pizza_bases || nom_pizza_bases.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le nom de la base est requis'
      });
    }

    const updated = await Base.update(id, { nom_pizza_bases: nom_pizza_bases.trim() });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Base non trouvée'
      });
    }

    res.json({
      success: true,
      data: { id_pizza_bases: parseInt(id), nom_pizza_bases: nom_pizza_bases.trim() }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la base:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la mise à jour de la base'
    });
  }
});

// DELETE /api/bases/:id - Supprimer une base
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Base.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Base non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Base supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la base:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la suppression de la base'
    });
  }
});

export default router;