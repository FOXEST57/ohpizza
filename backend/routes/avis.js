import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../models/database.js';

const router = express.Router();

// Middleware de validation pour les avis
const validateAvis = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('note')
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit être un entier entre 1 et 5'),
  body('commentaire')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Le commentaire ne peut pas dépasser 1000 caractères')
];

// GET /api/avis - Récupérer tous les avis publiés (locaux et Google)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, nom, note, commentaire, date_creation, statut, source,
        date_google, google_review_id, reviewer_profile_photo, reviewer_total_reviews
      FROM avis 
      WHERE statut = "publie" 
      ORDER BY date_creation DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des avis' });
  }
});

// GET /api/avis/pending - Récupérer tous les avis en attente (pour l'admin)
router.get('/pending', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM avis WHERE statut = "en_attente" ORDER BY date_creation DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des avis en attente:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des avis en attente' });
  }
});

// PUT /api/avis/:id/status - Changer le statut d'un avis (publier/bannir)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    
    if (!['publie', 'banni'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide. Utilisez "publie" ou "banni"' });
    }
    
    const [result] = await pool.execute(
      'UPDATE avis SET statut = ? WHERE id = ?',
      [statut, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }
    
    res.json({ 
      message: `Avis ${statut === 'publie' ? 'publié' : 'banni'} avec succès`,
      statut 
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ error: 'Erreur serveur lors du changement de statut' });
  }
});

// GET /api/avis/stats - Récupérer les statistiques des avis
router.get('/stats', async (req, res) => {
  try {
    const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM avis');
    const [averageResult] = await pool.execute('SELECT AVG(note) as moyenne FROM avis');
    const [byRatingResult] = await pool.execute('SELECT note, COUNT(*) as count FROM avis GROUP BY note ORDER BY note DESC');
    
    const stats = {
      total: totalResult[0].total,
      moyenne: averageResult[0].moyenne || 0,
      repartition: byRatingResult
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des statistiques' });
  }
});

// GET /api/avis/:id - Récupérer un avis par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM avis WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'avis:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de l\'avis' });
  }
});

// POST /api/avis - Créer un nouvel avis
router.post('/', validateAvis, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const { nom, note, commentaire } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO avis (nom, note, commentaire) VALUES (?, ?, ?)',
      [nom.trim(), parseInt(note), commentaire.trim()]
    );
    
    const nouvelAvis = {
      id: result.insertId,
      nom: nom.trim(),
      note: parseInt(note),
      commentaire: commentaire.trim()
    };
    
    res.status(201).json({
      message: 'Avis créé avec succès',
      avis: nouvelAvis
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création de l\'avis' });
  }
});

// PUT /api/avis/:id - Mettre à jour un avis
router.put('/:id', validateAvis, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { nom, note, commentaire } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE avis SET nom = ?, note = ?, commentaire = ? WHERE id = ?',
      [nom.trim(), parseInt(note), commentaire.trim(), id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }
    
    const avisModifie = {
      id: parseInt(id),
      nom: nom.trim(),
      note: parseInt(note),
      commentaire: commentaire.trim()
    };
    
    res.json({
      message: 'Avis modifié avec succès',
      avis: avisModifie
    });
  } catch (error) {
    console.error('Erreur lors de la modification de l\'avis:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la modification de l\'avis' });
  }
});

// DELETE /api/avis/:id - Supprimer un avis
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute('DELETE FROM avis WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }
    
    res.json({ message: 'Avis supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'avis' });
  }
});

export default router;