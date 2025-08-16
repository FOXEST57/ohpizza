import { executeQuery } from './database.js';

class Ingredient {
  // Récupérer tous les ingrédients
  static async getAll() {
    const query = 'SELECT * FROM ingredients ORDER BY nom_ingredients';
    return await executeQuery(query);
  }

  // Récupérer un ingrédient par ID
  static async getById(id) {
    const query = 'SELECT * FROM ingredients WHERE id_ingredients = ?';
    const results = await executeQuery(query, [id]);
    return results[0] || null;
  }

  // Créer un nouvel ingrédient
  static async create(ingredientData) {
    const { nom_ingredients, prix_ingredients } = ingredientData;
    const query = 'INSERT INTO ingredients (nom_ingredients, prix_ingredients) VALUES (?, ?)';
    const result = await executeQuery(query, [nom_ingredients, prix_ingredients || 0]);
    return { id: result.insertId, ...ingredientData };
  }

  // Mettre à jour un ingrédient
  static async update(id, ingredientData) {
    const { nom_ingredients, prix_ingredients } = ingredientData;
    const query = 'UPDATE ingredients SET nom_ingredients = ?, prix_ingredients = ? WHERE id_ingredients = ?';
    await executeQuery(query, [nom_ingredients, prix_ingredients, id]);
    return { id, ...ingredientData };
  }

  // Supprimer un ingrédient
  static async delete(id) {
    try {
      // Vérifier si l'ingrédient est utilisé dans des pizzas
      const checkQuery = 'SELECT COUNT(*) as count FROM pizza_ingredients WHERE id_ingredients = ?';
      const checkResult = await executeQuery(checkQuery, [id]);
      
      if (checkResult[0].count > 0) {
        throw new Error('Impossible de supprimer cet ingrédient car il est utilisé dans des pizzas');
      }

      // Supprimer l'ingrédient
      const deleteQuery = 'DELETE FROM ingredients WHERE id_ingredients = ?';
      const result = await executeQuery(deleteQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'ingrédient:', error);
      throw error;
    }
  }

  // Récupérer les ingrédients par type (méthode désactivée car le champ type_ingredients n'existe pas)
  static async getByType(type) {
    // Cette méthode est désactivée car le champ type_ingredients n'existe pas dans la table
    console.warn('getByType() désactivée : le champ type_ingredients n\'existe pas');
    return await this.getAll();
  }

  // Récupérer les pizzas utilisant un ingrédient
  static async getPizzas(ingredientId) {
    const query = `
      SELECT p.* 
      FROM pizza p
      JOIN pizza_ingredients pi ON p.id_pizza = pi.id_pizza
      WHERE pi.id_ingredients = ?
      ORDER BY p.nom_pizza
    `;
    return await executeQuery(query, [ingredientId]);
  }

  // Rechercher des ingrédients par nom
  static async search(searchTerm) {
    const query = 'SELECT * FROM ingredients WHERE nom_ingredients LIKE ? ORDER BY nom_ingredients';
    return await executeQuery(query, [`%${searchTerm}%`]);
  }
}

export default Ingredient;