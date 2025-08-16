import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ohpizza',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Création du pool de connexions
const pool = mysql.createPool(dbConfig);

// Test de connexion
try {
  const connection = await pool.getConnection();
  console.log('✅ Pool de connexions MySQL créé avec succès');
  connection.release();
} catch (error) {
  console.error('❌ Erreur lors de la création du pool de connexions:', error.message);
}

export default pool;

// Fonction utilitaire pour exécuter des requêtes
export const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête:', error);
    throw error;
  }
};

// Fonction pour fermer le pool de connexions
export const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Pool de connexions fermé');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture du pool:', error);
  }
};