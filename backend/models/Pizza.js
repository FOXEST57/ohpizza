import { executeQuery } from './database.js';

class Pizza {
  // Récupérer toutes les pizzas avec leurs ingrédients, catégories et bases
  static async getAll() {
    const query = `
      SELECT p.*, 
      pc.nom_pizza_categories AS category,
      pb.nom_pizza_bases AS base,
      GROUP_CONCAT(i.nom_ingredients SEPARATOR ', ') AS ingredients
      FROM pizza AS p
      LEFT JOIN pizza_ingredients AS pi ON p.id_pizza = pi.id_pizza
      LEFT JOIN ingredients AS i ON pi.id_ingredients = i.id_ingredients
      LEFT JOIN pizza_categories AS pc ON pc.id_pizza_categories = p.id_pizza_categories
      LEFT JOIN bases AS pb ON pb.id_pizza_bases = p.id_pizza_bases
      GROUP BY p.id_pizza
      ORDER BY pc.id_pizza_categories, p.nom_pizza
    `;
    return await executeQuery(query);
  }

  // Récupérer les pizzas par catégorie
  static async getByCategory(categoryId) {
    const query = `
      SELECT p.*, 
      pc.nom_pizza_categories AS category,
      pb.nom_pizza_bases AS base,
      GROUP_CONCAT(i.nom_ingredients SEPARATOR ', ') AS ingredients
      FROM pizza AS p
      LEFT JOIN pizza_ingredients AS pi ON p.id_pizza = pi.id_pizza
      LEFT JOIN ingredients AS i ON pi.id_ingredients = i.id_ingredients
      LEFT JOIN pizza_categories AS pc ON pc.id_pizza_categories = p.id_pizza_categories
      LEFT JOIN bases AS pb ON pb.id_pizza_bases = p.id_pizza_bases
      WHERE p.id_pizza_categories = ?
      GROUP BY p.id_pizza
      ORDER BY p.nom_pizza
    `;
    return await executeQuery(query, [categoryId]);
  }

  // Récupérer une pizza par ID
  static async getById(id) {
    const query = `
      SELECT p.*, 
      pc.nom_pizza_categories AS category,
      pb.nom_pizza_bases AS base,
      GROUP_CONCAT(i.nom_ingredients SEPARATOR ', ') AS ingredients
      FROM pizza AS p
      LEFT JOIN pizza_ingredients AS pi ON p.id_pizza = pi.id_pizza
      LEFT JOIN ingredients AS i ON pi.id_ingredients = i.id_ingredients
      LEFT JOIN pizza_categories AS pc ON pc.id_pizza_categories = p.id_pizza_categories
      LEFT JOIN bases AS pb ON pb.id_pizza_bases = p.id_pizza_bases
      WHERE p.id_pizza = ?
      GROUP BY p.id_pizza
    `;
    const results = await executeQuery(query, [id]);
    return results[0] || null;
  }

  // Créer une nouvelle pizza
  static async create(pizzaData) {
    const { nom_pizza, prix_pizza, id_pizza_categories, id_pizza_bases, ingredients, image_url } = pizzaData;
    
    try {
      // Insérer la pizza
      const insertPizzaQuery = `
        INSERT INTO pizza (nom_pizza, prix_pizza, id_pizza_categories, id_pizza_bases, image_url) 
        VALUES (?, ?, ?, ?, ?)
      `;
      const result = await executeQuery(insertPizzaQuery, [nom_pizza, prix_pizza, id_pizza_categories, id_pizza_bases, image_url]);
      const pizzaId = result.insertId;

      // Ajouter les ingrédients si fournis
      if (ingredients && ingredients.length > 0) {
        for (const ingredientId of ingredients) {
          const insertIngredientQuery = `
            INSERT INTO pizza_ingredients (id_pizza, id_ingredients) 
            VALUES (?, ?)
          `;
          await executeQuery(insertIngredientQuery, [pizzaId, ingredientId]);
        }
      }

      return { id: pizzaId, ...pizzaData };
    } catch (error) {
      console.error('Erreur lors de la création de la pizza:', error);
      throw error;
    }
  }

  // Mettre à jour une pizza
  static async update(id, pizzaData) {
    const { nom_pizza, prix_pizza, id_pizza_categories, id_pizza_bases, ingredients, image_url } = pizzaData;
    
    try {
      // Mettre à jour la pizza
      const updatePizzaQuery = `
        UPDATE pizza 
        SET nom_pizza = ?, prix_pizza = ?, id_pizza_categories = ?, id_pizza_bases = ?, image_url = ?
        WHERE id_pizza = ?
      `;
      await executeQuery(updatePizzaQuery, [nom_pizza, prix_pizza, id_pizza_categories, id_pizza_bases, image_url, id]);

      // Supprimer les anciens ingrédients
      const deleteIngredientsQuery = 'DELETE FROM pizza_ingredients WHERE id_pizza = ?';
      await executeQuery(deleteIngredientsQuery, [id]);

      // Ajouter les nouveaux ingrédients
      if (ingredients && ingredients.length > 0) {
        for (const ingredientId of ingredients) {
          const insertIngredientQuery = `
            INSERT INTO pizza_ingredients (id_pizza, id_ingredients) 
            VALUES (?, ?)
          `;
          await executeQuery(insertIngredientQuery, [id, ingredientId]);
        }
      }

      return { id, ...pizzaData };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la pizza:', error);
      throw error;
    }
  }

  // Supprimer une pizza
  static async delete(id) {
    try {
      // Supprimer d'abord les ingrédients associés
      const deleteIngredientsQuery = 'DELETE FROM pizza_ingredients WHERE id_pizza = ?';
      await executeQuery(deleteIngredientsQuery, [id]);

      // Supprimer la pizza
      const deletePizzaQuery = 'DELETE FROM pizza WHERE id_pizza = ?';
      const result = await executeQuery(deletePizzaQuery, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression de la pizza:', error);
      throw error;
    }
  }

  // Récupérer les ingrédients d'une pizza
  static async getIngredients(pizzaId) {
    const query = `
      SELECT i.* 
      FROM ingredients i
      JOIN pizza_ingredients pi ON i.id_ingredients = pi.id_ingredients
      WHERE pi.id_pizza = ?
      ORDER BY i.nom_ingredients
    `;
    return await executeQuery(query, [pizzaId]);
  }
}

export default Pizza;