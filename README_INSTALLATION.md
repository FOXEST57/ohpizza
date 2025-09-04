# Installation automatisée Oh'Pizza sur VPS

Ce guide vous explique comment déployer automatiquement l'application Oh'Pizza sur votre VPS en utilisant le script d'installation amélioré qui intègre tous les correctifs nécessaires.

## Prérequis

- Un VPS avec Ubuntu 20.04, 22.04 ou Debian 10/11
- Accès root ou sudo au serveur
- Connexion Internet stable
- Au moins 2GB de RAM et 20GB d'espace disque
- Repository GitHub de votre application Oh'Pizza

## ⚠️ Corrections intégrées dans cette version

Cette version du script d'installation corrige automatiquement :
- ✅ Remplacement de MySQL par MariaDB (plus stable)
- ✅ Gestion des conflits de ports (3000, 5173, 80, 443)
- ✅ Installation automatique de TypeScript et des dépendances React
- ✅ Correction du script de base de données (utilisation de DB_NAME)
- ✅ Ajout de la table 'horaire' manquante
- ✅ Amélioration de la gestion des erreurs
- ✅ Vérifications de prérequis renforcées
- ✅ Configuration automatique optimisée

## Étapes d'installation

### 1. Connexion au VPS

Connectez-vous à votre VPS Hostinger via SSH :

```bash
ssh root@VOTRE_IP_VPS
```

### 2. Téléchargement du script

Téléchargez le script d'installation sur votre VPS :

```bash
# Option 1: Si vous avez git installé
git clone VOTRE_REPO_GITHUB
cd ohpizza

# Option 2: Téléchargement direct (remplacez par votre URL)
wget https://raw.githubusercontent.com/VOTRE_USERNAME/ohpizza/main/install_ohpizza.sh

# Option 3: Copier-coller le contenu
nano install_ohpizza.sh
# Collez le contenu du script et sauvegardez (Ctrl+X, Y, Enter)
```

### 3. Rendre le script exécutable

```bash
chmod +x install_ohpizza.sh
```

### 4. Exécution du script

Lancez le script d'installation :

```bash
sudo ./install_ohpizza.sh
```

### 5. Informations demandées

Le script vous demandera :

1. **URL du repository GitHub** : L'URL complète de votre repository (ex: https://github.com/username/ohpizza.git)
2. **Mot de passe MySQL root** : Un mot de passe sécurisé pour l'utilisateur root MySQL
3. **Mot de passe ohpizza_user** : Laissez vide pour génération automatique ou saisissez votre propre mot de passe
4. **Nom de domaine** (optionnel) : Si vous avez un domaine pointant vers votre VPS

## Ce que fait le script

Le script automatise les étapes suivantes :

### Installation des dépendances
- ✅ Mise à jour du système (Ubuntu/Debian)
- ✅ Installation de Node.js (version LTS)
- ✅ Installation de Git
- ✅ Installation de Nginx avec configuration optimisée
- ✅ Installation de MariaDB Server (remplace MySQL)
- ✅ Installation de PM2 (gestionnaire de processus)
- ✅ Installation de TypeScript globalement
- ✅ Installation des dépendances React manquantes
- ✅ Gestion automatique des conflits de ports

### Configuration de la base de données
- ✅ Installation et sécurisation de MariaDB
- ✅ Création de la base de données `ohpizza_db`
- ✅ Création de l'utilisateur `ohpizza_user`
- ✅ Attribution des privilèges nécessaires
- ✅ Initialisation des tables et données (avec table horaire)
- ✅ Vérification de la connectivité de la base de données

### Déploiement de l'application
- ✅ Arrêt des processus utilisant les ports requis
- ✅ Clonage du repository GitHub avec vérifications
- ✅ Installation des dépendances backend et frontend
- ✅ Installation automatique des types TypeScript (@types/react, etc.)
- ✅ Configuration des fichiers `.env` (backend port 3000)
- ✅ Build du frontend avec gestion d'erreurs TypeScript
- ✅ Configuration de Nginx avec headers de sécurité
- ✅ Démarrage du backend avec PM2 en mode production

### Sécurité
- ✅ Configuration du firewall UFW
- ✅ Headers de sécurité Nginx
- ✅ Permissions des fichiers

## Après l'installation

### Accès à l'application

Votre application sera accessible à :
- **IP du serveur** : `http://VOTRE_IP_VPS`
- **Domaine** (si configuré) : `http://VOTRE_DOMAINE.com`

### Ports utilisés

- **Frontend** : Port 80 (Nginx)
- **Backend API** : Port 3000 (PM2)
- **Base de données** : Port 3306 (MariaDB)
- **SSH** : Port 22

> ⚠️ **Important** : Le script gère automatiquement les conflits de ports en arrêtant les processus existants.

### Informations importantes

Le script affichera à la fin :
- L'URL d'accès à votre application
- Le mot de passe de l'utilisateur `ohpizza_user`
- Les emplacements des logs
- Les commandes utiles pour la maintenance

### Configuration supplémentaire requise

#### 1. Configuration PayPal

Modifiez les fichiers `.env` pour ajouter vos clés PayPal :

```bash
# Backend
sudo nano /var/www/ohpizza/backend/.env
# Modifiez :
PAYPAL_CLIENT_ID=votre_client_id_paypal
PAYPAL_CLIENT_SECRET=votre_client_secret_paypal
PAYPAL_MODE=sandbox  # ou 'live' pour la production

# Frontend
sudo nano /var/www/ohpizza/.env
# Modifiez :
VITE_PAYPAL_CLIENT_ID=votre_client_id_paypal
```

#### 2. Configuration Email

Modifiez le fichier backend `.env` :

```bash
sudo nano /var/www/ohpizza/backend/.env
# Modifiez :
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
```

#### 3. Redémarrage après modifications

```bash
# Redémarrer le backend
pm2 restart ohpizza-backend

# Rebuild le frontend si nécessaire
cd /var/www/ohpizza
npm run build
sudo systemctl reload nginx
```

## Commandes de maintenance

### Gestion PM2
```bash
pm2 status                    # Voir le statut
pm2 logs ohpizza-backend      # Voir les logs
pm2 restart ohpizza-backend   # Redémarrer
pm2 stop ohpizza-backend      # Arrêter
pm2 start ohpizza-backend     # Démarrer
```

### Gestion Nginx
```bash
sudo systemctl status nginx    # Statut
sudo systemctl restart nginx   # Redémarrer
sudo systemctl reload nginx    # Recharger la config
sudo nginx -t                  # Tester la configuration
```

### Gestion MariaDB
```bash
sudo systemctl status mariadb    # Statut
sudo systemctl restart mariadb   # Redémarrer
sudo mysql -u root -p            # Connexion root
mysql -u ohpizza_user -p ohpizza_db  # Connexion utilisateur app
```

### Logs
```bash
# Logs de l'application
pm2 logs ohpizza-backend
tail -f /var/log/pm2/ohpizza-error.log
tail -f /var/log/pm2/ohpizza-out.log

# Logs Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs système
journalctl -u nginx -f
journalctl -u mariadb -f
```

## Dépannage

### Erreurs courantes et solutions

#### 1. Erreur "EADDRINUSE" (port déjà utilisé)
```bash
# Vérifier les processus utilisant les ports
sudo lsof -i :3000
sudo lsof -i :80

# Arrêter les processus si nécessaire
sudo kill -9 PID_DU_PROCESSUS

# Ou relancer le script qui gère automatiquement les conflits
sudo ./install_ohpizza.sh
```

#### 2. Erreur "tsc: not found" (TypeScript)
```bash
# Installation manuelle de TypeScript
sudo npm install -g typescript
sudo npm install -g @types/node

# Puis rebuild
cd /var/www/ohpizza
npm run build
```

#### 3. Erreurs de dépendances React
```bash
cd /var/www/ohpizza
# Réinstaller les dépendances
npm install react react-dom react-router-dom axios clsx tailwind-merge
npm install --save-dev @types/react @types/react-dom
npm run build
```

#### 4. Problème de base de données
```bash
# Vérifier le statut de MariaDB
sudo systemctl status mariadb

# Redémarrer MariaDB
sudo systemctl restart mariadb

# Recréer la base de données
cd /var/www/ohpizza/backend
node setup_database.js
```

#### 5. Problème de permissions
```bash
# Corriger les permissions
sudo chown -R www-data:www-data /var/www/ohpizza
sudo chmod -R 755 /var/www/ohpizza
```

### Vérifications post-installation

```bash
# Vérifier tous les services
sudo systemctl status nginx mariadb
pm2 status

# Tester la connectivité
curl http://localhost
curl http://localhost/api/health

# Vérifier les logs en cas de problème
pm2 logs ohpizza-backend
sudo tail -f /var/log/nginx/error.log
```

## Installation SSL (optionnel)

Pour sécuriser votre site avec HTTPS :

```bash
# Installation de Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

## Sauvegarde et restauration

### Sauvegarde de la base de données
```bash
# Sauvegarde complète
mysqldump -u ohpizza_user -p ohpizza_db > backup_$(date +%Y%m%d).sql

# Sauvegarde automatique (crontab)
0 2 * * * mysqldump -u ohpizza_user -p[PASSWORD] ohpizza_db > /var/backups/ohpizza_$(date +\%Y\%m\%d).sql
```

### Restauration
```bash
# Restaurer la base de données
mysql -u ohpizza_user -p ohpizza_db < backup_20240101.sql
```
## Mise à jour de l'application

### Mise à jour du code

```bash
cd /var/www/ohpizza
git pull origin main

# Backend
cd backend
npm install
pm2 restart ohpizza-backend

# Frontend
cd ..
npm install
npm run build
sudo systemctl reload nginx
```

### Mise à jour de la base de données

```bash
cd /var/www/ohpizza/backend
node setup_database.js
```

## Surveillance et monitoring

### Monitoring avec PM2

```bash
# Interface web PM2 (optionnel)
pm2 install pm2-web
pm2-web
# Accessible sur http://votre-ip:9615
```

### Logs centralisés

```bash
# Configuration de logrotate pour les logs PM2
sudo nano /etc/logrotate.d/pm2
# Contenu :
/var/log/pm2/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Fichiers de configuration importants

- **Script d'installation** : `install_ohpizza.sh`
- **Configuration Nginx** : `/etc/nginx/sites-available/ohpizza`
- **Configuration PM2** : `/var/www/ohpizza/backend/ecosystem.config.js`
- **Variables backend** : `/var/www/ohpizza/backend/.env`
- **Variables frontend** : `/var/www/ohpizza/.env`
- **Informations d'installation** : `/var/www/ohpizza/INSTALLATION_INFO.txt`

## Notes importantes

- ✅ **MariaDB** remplace MySQL pour une meilleure stabilité
- ✅ **Port 3000** pour le backend (au lieu de 5000)
- ✅ **TypeScript** installé automatiquement
- ✅ **Gestion automatique** des conflits de ports
- ✅ **Table horaire** incluse dans la base de données
- ✅ **Vérifications complètes** post-installation

---

**🎉 Félicitations ! Votre application Oh'Pizza est maintenant déployée avec tous les correctifs intégrés.**

Pour toute question, consultez le fichier `INSTALLATION_INFO.txt` créé automatiquement ou les logs des services.

---

**Note** : Ce script est conçu pour Ubuntu 20.04/22.04. Pour d'autres distributions, des modifications peuvent être nécessaires.