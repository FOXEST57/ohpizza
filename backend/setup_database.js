import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connexion à MySQL...');
    
    // Connexion sans spécifier de base de données
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connecté à MySQL');
    
    const dbName = process.env.DB_NAME || 'ohpizza';
    
    // Supprimer la base de données existante
    console.log('🗑️ Suppression de la base de données existante...');
    await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
    
    // Créer la nouvelle base de données
    console.log('🔄 Création de la nouvelle base de données...');
    await connection.query(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE ${dbName}`);
    
    console.log(`✅ Base de données ${dbName} créée`);
    
    // Créer les tables
    console.log('🔄 Création des tables...');
    
    // Table des catégories
    await connection.query(`
      CREATE TABLE pizza_categories (
        id_pizza_categories INT AUTO_INCREMENT PRIMARY KEY,
        nom_pizza_categories VARCHAR(100) NOT NULL UNIQUE,
        description_categories TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table pizza_categories créée');
    
    // Table des ingrédients
    await connection.query(`
      CREATE TABLE ingredients (
        id_ingredients INT AUTO_INCREMENT PRIMARY KEY,
        nom_ingredients VARCHAR(100) NOT NULL UNIQUE,
        prix_ingredients DECIMAL(5,2) DEFAULT 0.00,
        disponible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table ingredients créée');
    
    // Table des pizzas (SANS id_pizza_bases)
    await connection.query(`
      CREATE TABLE pizza (
        id_pizza INT AUTO_INCREMENT PRIMARY KEY,
        nom_pizza VARCHAR(100) NOT NULL,
        prix_pizza DECIMAL(6,2) NOT NULL,
        id_pizza_categories INT NOT NULL,
        description_pizza TEXT,
        disponible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id_pizza_categories) REFERENCES pizza_categories(id_pizza_categories) ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    console.log('✅ Table pizza créée (sans id_pizza_bases)');
    
    // Table de liaison pizza-ingrédients
    await connection.query(`
      CREATE TABLE pizza_ingredients (
        id_pizza_ingredients INT AUTO_INCREMENT PRIMARY KEY,
        id_pizza INT NOT NULL,
        id_ingredients INT NOT NULL,
        quantite DECIMAL(5,2) DEFAULT 1.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_pizza) REFERENCES pizza(id_pizza) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_ingredients) REFERENCES ingredients(id_ingredients) ON DELETE RESTRICT ON UPDATE CASCADE,
        UNIQUE KEY unique_pizza_ingredient (id_pizza, id_ingredients)
      )
    `);
    console.log('✅ Table pizza_ingredients créée');
    
    // Insertion des données
    console.log('🔄 Insertion des données...');
    
    // Catégories
    await connection.query(`
      INSERT INTO pizza_categories (nom_pizza_categories, description_categories) VALUES
      ('Classiques', 'Nos pizzas traditionnelles et incontournables'),
      ('Spécialités', 'Nos créations originales et signatures'),
      ('Végétariennes', 'Pizzas sans viande pour les amateurs de légumes'),
      ('Épicées', 'Pour les amateurs de sensations fortes'),
      ('Gourmandes', 'Nos pizzas les plus riches et savoureuses')
    `);
    console.log('✅ Catégories insérées');
    
    // Ingrédients
    await connection.query(`
      INSERT INTO ingredients (nom_ingredients, prix_ingredients) VALUES
      ('Mozzarella', 1.50),
      ('Tomate', 0.50),
      ('Jambon', 2.00),
      ('Champignons', 1.00),
      ('Olives noires', 1.20),
      ('Olives vertes', 1.20),
      ('Poivrons', 1.00),
      ('Oignons', 0.80),
      ('Pepperoni', 2.50),
      ('Chorizo', 2.80),
      ('Anchois', 2.20),
      ('Câpres', 1.50),
      ('Roquette', 1.30),
      ('Tomates cerises', 1.40),
      ('Parmesan', 2.00),
      ('Gorgonzola', 2.50),
      ('Chèvre', 2.30),
      ('Basilic', 1.00),
      ('Origan', 0.50),
      ('Thym', 0.50),
      ('Ail', 0.60),
      ('Huile d''olive', 0.80),
      ('Piment', 0.70),
      ('Aubergines', 1.60),
      ('Courgettes', 1.40),
      ('Artichauts', 2.00),
      ('Épinards', 1.50),
      ('Poulet', 2.80),
      ('Bœuf haché', 3.00),
      ('Saumon fumé', 4.50),
      ('Thon', 2.60),
      ('Crevettes', 4.00),
      ('Ananas', 1.80),
      ('Poires', 2.00),
      ('Noix', 2.20)
    `);
    console.log('✅ Ingrédients insérés');
    
    // Pizzas
    await connection.query(`
      INSERT INTO pizza (nom_pizza, prix_pizza, id_pizza_categories, description_pizza) VALUES
      ('Margherita', 9.50, 1, 'La classique : tomate, mozzarella, basilic'),
      ('Regina', 12.50, 1, 'Tomate, mozzarella, jambon, champignons'),
      ('Napolitaine', 11.50, 1, 'Tomate, mozzarella, anchois, olives, câpres'),
      ('Quatre Saisons', 14.50, 1, 'Tomate, mozzarella, jambon, champignons, artichauts, olives'),
      ('Calzone', 13.50, 2, 'Pizza fermée : tomate, mozzarella, jambon, champignons, œuf'),
      ('Végétarienne', 12.00, 3, 'Tomate, mozzarella, poivrons, courgettes, aubergines, champignons'),
      ('Chèvre Miel', 13.50, 3, 'Crème, mozzarella, chèvre, miel, noix, roquette'),
      ('Diavola', 13.00, 4, 'Tomate, mozzarella, pepperoni, piment, olives'),
      ('Chorizo', 14.00, 4, 'Tomate, mozzarella, chorizo, poivrons, oignons'),
      ('Saumon', 16.50, 5, 'Crème, mozzarella, saumon fumé, câpres, aneth'),
      ('Fruits de Mer', 17.50, 5, 'Tomate, mozzarella, crevettes, moules, ail'),
      ('Hawaïenne', 13.50, 2, 'Tomate, mozzarella, jambon, ananas')
    `);
    console.log('✅ Pizzas insérées');
    
    // Relations pizza-ingrédients pour quelques pizzas
    await connection.query(`
      INSERT INTO pizza_ingredients (id_pizza, id_ingredients) VALUES
      (1, 2), (1, 1), (1, 18),
      (2, 2), (2, 1), (2, 3), (2, 4),
      (3, 2), (3, 1), (3, 11), (3, 5), (3, 12),
      (6, 2), (6, 1), (6, 7), (6, 25), (6, 24), (6, 4),
      (8, 2), (8, 1), (8, 9), (8, 23), (8, 5)
    `);
    console.log('✅ Relations pizza-ingrédients insérées');
    
    // Table des horaires
    await connection.query(`
      CREATE TABLE horaire (
        id_horaire INT AUTO_INCREMENT PRIMARY KEY,
        jour VARCHAR(20) NOT NULL UNIQUE,
        heure_debut_mat TIME NULL,
        heure_fin_mat TIME NULL,
        heure_debut_ap TIME NULL,
        heure_fin_ap TIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table horaire créée');
    
    // Insertion des horaires par défaut
    await connection.query(`
      INSERT INTO horaire (jour, heure_debut_mat, heure_fin_mat, heure_debut_ap, heure_fin_ap) VALUES
      ('Lundi', '11:30:00', '14:00:00', '18:00:00', '22:00:00'),
      ('Mardi', '11:30:00', '14:00:00', '18:00:00', '22:00:00'),
      ('Mercredi', '11:30:00', '14:00:00', '18:00:00', '22:00:00'),
      ('Jeudi', '11:30:00', '14:00:00', '18:00:00', '22:00:00'),
      ('Vendredi', '11:30:00', '14:00:00', '18:00:00', '23:00:00'),
      ('Samedi', '11:30:00', '14:00:00', '18:00:00', '23:00:00'),
      ('Dimanche', '18:00:00', NULL, NULL, '22:00:00')
    `);
    console.log('✅ Horaires par défaut insérés');
    
    // Vérification finale
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📊 Tables créées:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    const [categories] = await connection.query('SELECT COUNT(*) as count FROM pizza_categories');
    const [ingredients] = await connection.query('SELECT COUNT(*) as count FROM ingredients');
    const [pizzas] = await connection.query('SELECT COUNT(*) as count FROM pizza');
    const [relations] = await connection.query('SELECT COUNT(*) as count FROM pizza_ingredients');
    const [horaires] = await connection.query('SELECT COUNT(*) as count FROM horaire');
    
    console.log('\n📈 Données insérées:');
    console.log(`  - ${categories[0].count} catégories`);
    console.log(`  - ${ingredients[0].count} ingrédients`);
    console.log(`  - ${pizzas[0].count} pizzas`);
    console.log(`  - ${relations[0].count} relations pizza-ingrédients`);
    console.log(`  - ${horaires[0].count} horaires d'ouverture`);
    
    console.log('\n🎉 Base de données recréée avec succès!');
    console.log('🚀 Vous pouvez maintenant redémarrer le serveur backend.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le script
setupDatabase();