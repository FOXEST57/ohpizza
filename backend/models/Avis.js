const db = require('./database');

class Avis {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS avis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom VARCHAR(100) NOT NULL,
        note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
        commentaire TEXT NOT NULL,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await db.run(query);
      console.log('Table avis créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la table avis:', error);
      throw error;
    }
  }

  static async getAll() {
    const query = 'SELECT * FROM avis ORDER BY date_creation DESC';
    try {
      const rows = await db.all(query);
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      throw error;
    }
  }

  static async getById(id) {
    const query = 'SELECT * FROM avis WHERE id = ?';
    try {
      const row = await db.get(query, [id]);
      return row;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'avis:', error);
      throw error;
    }
  }

  static async create(avisData) {
    const { nom, note, commentaire } = avisData;
    const query = `
      INSERT INTO avis (nom, note, commentaire)
      VALUES (?, ?, ?)
    `;
    
    try {
      const result = await db.run(query, [nom, note, commentaire]);
      return { id: result.lastID, ...avisData };
    } catch (error) {
      console.error('Erreur lors de la création de l\'avis:', error);
      throw error;
    }
  }

  static async update(id, avisData) {
    const { nom, note, commentaire } = avisData;
    const query = `
      UPDATE avis 
      SET nom = ?, note = ?, commentaire = ?
      WHERE id = ?
    `;
    
    try {
      const result = await db.run(query, [nom, note, commentaire, id]);
      if (result.changes === 0) {
        throw new Error('Avis non trouvé');
      }
      return { id, ...avisData };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avis:', error);
      throw error;
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM avis WHERE id = ?';
    try {
      const result = await db.run(query, [id]);
      if (result.changes === 0) {
        throw new Error('Avis non trouvé');
      }
      return { message: 'Avis supprimé avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'avis:', error);
      throw error;
    }
  }

  static async getStats() {
    const queries = {
      total: 'SELECT COUNT(*) as total FROM avis',
      average: 'SELECT AVG(note) as moyenne FROM avis',
      byRating: 'SELECT note, COUNT(*) as count FROM avis GROUP BY note ORDER BY note DESC'
    };
    
    try {
      const [totalResult, averageResult, byRatingResult] = await Promise.all([
        db.get(queries.total),
        db.get(queries.average),
        db.all(queries.byRating)
      ]);
      
      return {
        total: totalResult.total,
        moyenne: averageResult.moyenne || 0,
        repartition: byRatingResult
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

module.exports = Avis;