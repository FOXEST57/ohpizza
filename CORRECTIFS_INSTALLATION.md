# Correctifs Appliqués au Script d'Installation Oh'Pizza

## Résumé des Améliorations

Ce document détaille tous les correctifs appliqués au script `install_ohpizza.sh` pour automatiser complètement l'installation sur un VPS vierge.

## 1. Remplacement de MySQL par MariaDB

✅ **Correctif appliqué**
- Remplacement de `mysql-server` par `mariadb-server`
- Adaptation des commandes `systemctl` pour `mariadb`
- Configuration automatique de MariaDB avec sécurisation

## 2. Gestion des Conflits de Ports

✅ **Correctif appliqué**
- Fonction `stop_conflicting_processes()` ajoutée
- Vérification et arrêt automatique des processus sur les ports :
  - 3000 (Backend API)
  - 5000 (Ancien port backend)
  - 5173 (Dev server Vite)
  - 80 (HTTP)
  - 443 (HTTPS)

## 3. Installation de TypeScript

✅ **Correctif appliqué**
- Installation globale de TypeScript : `npm install -g typescript @types/node`
- Gestion des erreurs de compilation avec fallback `npx tsc`
- Installation des types React manquants

## 4. Correction du Port Backend

✅ **Correctif appliqué**
- Port backend changé de 5000 à **3000**
- Configuration Nginx mise à jour pour proxy vers `localhost:3000`
- Configuration PM2 mise à jour avec le bon port

## 5. Installation des Dépendances React

✅ **Correctif appliqué**
- Installation automatique des dépendances manquantes :
  ```bash
  npm install react react-dom react-router-dom axios clsx tailwind-merge
  npm install --save-dev @types/react @types/react-dom @types/node
  ```

## 6. Amélioration de la Gestion des Erreurs

✅ **Correctif appliqué**
- Messages colorés avec fonctions `log_info()`, `log_success()`, `log_warning()`, `log_error()`
- Vérifications de prérequis avec `check_prerequisites()`
- Gestion des erreurs avec `set -e`
- Vérifications post-installation complètes

## 7. Configuration Automatique des Fichiers .env

✅ **Correctif appliqué**
- **Backend .env** :
  - Port 3000
  - `NODE_ENV=production`
  - Génération automatique des secrets JWT et Session
  - Configuration base de données avec le bon mot de passe

- **Frontend .env** :
  - `VITE_API_URL` configuré automatiquement
  - Support domaine ou IP publique

## 8. Configuration Nginx Améliorée

✅ **Correctif appliqué**
- Headers de sécurité ajoutés
- Configuration proxy pour backend sur port 3000
- Gestion du cache pour fichiers statiques
- Timeouts configurés pour le proxy
- Test automatique de la configuration avec `nginx -t`

## 9. Configuration PM2 Robuste

✅ **Correctif appliqué**
- Arrêt des processus existants avant redémarrage
- Configuration `ecosystem.config.js` avec :
  - Port 3000
  - Mode production
  - Logs structurés
  - Auto-restart configuré
  - Limite mémoire définie

## 10. Vérifications de Prérequis

✅ **Correctif appliqué**
- Vérification des privilèges root/sudo
- Vérification de la distribution (Debian/Ubuntu)
- Vérification de l'existence des commandes avant installation
- Éviter les installations redondantes

## 11. Script setup_database.js

✅ **Vérifié et confirmé**
- Utilise déjà `process.env.DB_NAME`
- Table `horaire` déjà incluse
- Gestion des erreurs présente

## 12. Vérifications Finales

✅ **Correctif appliqué**
- Test de connectivité base de données
- Vérification du statut des services (Nginx, MariaDB, PM2)
- Vérification de la présence des fichiers frontend
- Création du fichier `INSTALLATION_INFO.txt`

## 13. Configuration Firewall

✅ **Correctif appliqué**
- Installation et configuration automatique d'UFW
- Ouverture des ports nécessaires (22, 80, 443)
- Configuration conditionnelle si UFW n'est pas installé

## 14. Informations Post-Installation

✅ **Correctif appliqué**
- Affichage de l'IP publique du serveur
- Informations de connexion base de données
- Commandes utiles pour la maintenance
- Instructions pour SSL et configuration PayPal/Email

## Ports Utilisés

- **Frontend** : Port 80 (HTTP)
- **Backend API** : Port 3000
- **Base de données** : Port 3306 (MariaDB)
- **SSH** : Port 22

## Commandes de Test

Pour tester l'installation :

```bash
# Vérifier les services
sudo systemctl status nginx mariadb
pm2 status

# Tester la connectivité
curl http://localhost
curl http://localhost/api/health

# Vérifier les logs
pm2 logs ohpizza-backend
sudo tail -f /var/log/nginx/ohpizza_error.log
```

## Résultat

🎉 **Installation 100% automatisée** pour un déploiement sur VPS vierge avec tous les correctifs intégrés.

Le script gère maintenant :
- ✅ Tous les conflits de ports
- ✅ Les dépendances manquantes
- ✅ La configuration complète
- ✅ Les vérifications de sécurité
- ✅ La gestion d'erreurs robuste
- ✅ Les informations post-installation