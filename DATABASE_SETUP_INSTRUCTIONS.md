# Instructions de Configuration de la Base de Données Oh'Pizza

## Étapes pour recréer la base de données

### 1. Sauvegarde (optionnel)
Si vous souhaitez sauvegarder vos données actuelles :
```sql
mysqldump -u root -p ohpizza > backup_ohpizza.sql
```

### 2. Exécution du script de création

#### Option A : Via MySQL Command Line
```bash
mysql -u root -p < database_setup.sql
```

#### Option B : Via phpMyAdmin ou MySQL Workbench
1. Ouvrez phpMyAdmin ou MySQL Workbench
2. Importez le fichier `database_setup.sql`
3. Exécutez le script

#### Option C : Via ligne de commande MySQL
```sql
mysql -u root -p
source /path/to/database_setup.sql
```

### 3. Vérification de la configuration

Après l'exécution du script, vérifiez que :
- La base de données `ohpizza` a été créée
- Toutes les tables sont présentes :
  - `pizza_categories`
  - `ingredients` 
  - `pizza`
  - `pizza_ingredients`
- Les données de test ont été insérées

### 4. Configuration de l'application

Assurez-vous que le fichier `backend/.env` contient les bonnes informations :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=ohpizza
DB_PORT=3306
```

### 5. Redémarrage de l'application

1. Arrêtez le serveur backend (Ctrl+C)
2. Redémarrez-le :
   ```bash
   cd backend
   npm run dev
   ```
3. Le frontend devrait déjà fonctionner sur http://localhost:5173

## Changements apportés

### Structure de la base de données
- ✅ Suppression de la table `pizza_bases` (non utilisée)
- ✅ Suppression du champ `id_pizza_bases` de la table `pizza`
- ✅ Structure simplifiée et cohérente
- ✅ Contraintes de clés étrangères correctes
- ✅ Données de test incluses

### Code de l'application
- ✅ Suppression de toutes les références à `base_pizza`
- ✅ Validation backend mise à jour
- ✅ Interface frontend nettoyée
- ✅ Modèles de données cohérents

## Test de l'application

Après la reconfiguration :
1. Accédez à la page Admin
2. Essayez d'ajouter une nouvelle pizza
3. Modifiez une pizza existante
4. Vérifiez que les ingrédients s'affichent correctement

Tout devrait maintenant fonctionner sans erreurs de contraintes de clés étrangères.

## Dépannage

Si vous rencontrez des problèmes :
1. Vérifiez les logs du serveur backend
2. Assurez-vous que MySQL est démarré
3. Vérifiez les permissions de la base de données
4. Consultez les erreurs dans la console du navigateur

## Structure des tables

### pizza_categories
- `id_pizza_categories` (PK)
- `nom_pizza_categories`
- `description_categories`

### ingredients
- `id_ingredients` (PK)
- `nom_ingredients`
- `prix_ingredients`
- `disponible`

### pizza
- `id_pizza` (PK)
- `nom_pizza`
- `prix_pizza`
- `id_pizza_categories` (FK)
- `description_pizza`
- `disponible`

### pizza_ingredients
- `id_pizza_ingredients` (PK)
- `id_pizza` (FK)
- `id_ingredients` (FK)
- `quantite`