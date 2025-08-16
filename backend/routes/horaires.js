import express from 'express';
import { executeQuery } from '../models/database.js';
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

// GET /api/horaires - Récupérer tous les horaires
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM horaire ORDER BY FIELD(jour, "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche")';
    const horaires = await executeQuery(query);
    
    res.json({
      success: true,
      data: horaires
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des horaires:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération des horaires' 
    });
  }
});

// PUT /api/horaires/:id - Mettre à jour un horaire
router.put('/:id', [
  body('heure_debut_mat').optional({ nullable: true, checkFalsy: true }).custom((value) => {
    if (value === null || value === '' || value === undefined) return true;
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(value);
  }).withMessage('Format d\'heure invalide pour heure_debut_mat'),
  body('heure_fin_mat').optional({ nullable: true, checkFalsy: true }).custom((value) => {
    if (value === null || value === '' || value === undefined) return true;
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(value);
  }).withMessage('Format d\'heure invalide pour heure_fin_mat'),
  body('heure_debut_ap').optional({ nullable: true, checkFalsy: true }).custom((value) => {
    if (value === null || value === '' || value === undefined) return true;
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(value);
  }).withMessage('Format d\'heure invalide pour heure_debut_ap'),
  body('heure_fin_ap').optional({ nullable: true, checkFalsy: true }).custom((value) => {
    if (value === null || value === '' || value === undefined) return true;
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(value);
  }).withMessage('Format d\'heure invalide pour heure_fin_ap')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    let { heure_debut_mat, heure_fin_mat, heure_debut_ap, heure_fin_ap } = req.body;
    
    // Convertir les chaînes vides en null pour permettre la fermeture
    heure_debut_mat = heure_debut_mat === '' ? null : heure_debut_mat;
    heure_fin_mat = heure_fin_mat === '' ? null : heure_fin_mat;
    heure_debut_ap = heure_debut_ap === '' ? null : heure_debut_ap;
    heure_fin_ap = heure_fin_ap === '' ? null : heure_fin_ap;
    
    // Vérifier si l'horaire existe
    const checkQuery = 'SELECT * FROM horaire WHERE id_horaire = ?';
    const existingHoraire = await executeQuery(checkQuery, [id]);
    
    if (existingHoraire.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Horaire non trouvé' 
      });
    }
    
    // Mettre à jour l'horaire
    const updateQuery = `
      UPDATE horaire 
      SET heure_debut_mat = ?, heure_fin_mat = ?, heure_debut_ap = ?, heure_fin_ap = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id_horaire = ?
    `;
    
    await executeQuery(updateQuery, [heure_debut_mat, heure_fin_mat, heure_debut_ap, heure_fin_ap, id]);
    
    // Récupérer l'horaire mis à jour
    const updatedHoraire = await executeQuery(checkQuery, [id]);
    
    res.json({
      success: true,
      message: 'Horaire mis à jour avec succès',
      data: updatedHoraire[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'horaire:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la mise à jour de l\'horaire' 
    });
  }
});

export default router;