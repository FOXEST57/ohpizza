import { executeQuery } from './database.js';

class Category {
  // Récupérer toutes les catégories
  static async getAll() {
    const query = 'SELECT * FROM pizza_categories ORDER BY id_pizza_categories';
    return await executeQuery(query);
  }

  // Récupérer une catégorie par ID
  static async getById(id) {
    const query = 'SELECT * FROM pizza_categories WHERE id_pizza_categories = ?';
    const results = await executeQuery(query, [id]);
    return results[0] || null;
  }

  // Créer une nouvelle catégorie
  static async create(categoryData) {
    const { nom_pizza_categories } = categoryData;
    const query = 'INSERT INTO pizza_categories (nom_pizza_categories) VALUES (?)';
    const result = await executeQuery(query, [nom_pizza_categories]);
    return { id: result.insertId, nom_pizza_categories };
  }

  // Mettre à jour une catégorie
  static async update(id, categoryData) {
    const { nom_pizza_categories } = categoryData;
    const query = 'UPDATE pizza_categories SET nom_pizza_categories = ? WHERE id_pizza_categories = ?';
    await executeQuery(query, [nom_pizza_categories, id]);
    return { id, nom_pizza_categories };
  }

  // Supprimer une catégorie
  static async delete(id) {
    const query = 'DELETE FROM pizza_categories WHERE id_pizza_categories = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Récupérer les pizzas d'une catégorie
  static async getPizzas(categoryId) {
    const query = `
      SELECT p.*, 
      GROUP_CONCAT(i.nom_ingredients SEPARATOR ', ') AS ingredients
      FROM pizza p
      LEFT JOIN pizza_ingredients pi ON p.id_pizza = pi.id_pizza
      LEFT JOIN ingredients i ON pi.id_ingredients = i.id_ingredients
      WHERE p.id_pizza_categories = ?
      GROUP BY p.id_pizza
      ORDER BY p.nom_pizza
    `;
    return await executeQuery(query, [categoryId]);
  }
}

export default Category;