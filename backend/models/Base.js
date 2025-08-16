import { executeQuery } from './database.js';

class Base {
  // Récupérer toutes les bases
  static async getAll() {
    const query = 'SELECT * FROM bases ORDER BY id_pizza_bases';
    return await executeQuery(query);
  }

  // Récupérer une base par ID
  static async getById(id) {
    const query = 'SELECT * FROM bases WHERE id_pizza_bases = ?';
    const results = await executeQuery(query, [id]);
    return results[0] || null;
  }

  // Créer une nouvelle base
  static async create(baseData) {
    const { nom_pizza_bases } = baseData;
    const query = 'INSERT INTO bases (nom_pizza_bases) VALUES (?)';
    const result = await executeQuery(query, [nom_pizza_bases]);
    return result.insertId;
  }

  // Mettre à jour une base
  static async update(id, baseData) {
    const { nom_pizza_bases } = baseData;
    const query = 'UPDATE bases SET nom_pizza_bases = ? WHERE id_pizza_bases = ?';
    const result = await executeQuery(query, [nom_pizza_bases, id]);
    return result.affectedRows > 0;
  }

  // Supprimer une base
  static async delete(id) {
    const query = 'DELETE FROM bases WHERE id_pizza_bases = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }
}

export default Base;