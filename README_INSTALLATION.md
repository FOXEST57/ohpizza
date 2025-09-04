# Installation automatisée Oh'Pizza sur VPS Hostinger

Ce guide vous explique comment déployer automatiquement l'application Oh'Pizza sur votre VPS Hostinger en utilisant le script d'installation fourni.

## Prérequis

- Un VPS Hostinger avec Ubuntu 20.04 ou 22.04
- Accès root ou sudo au serveur
- Connexion Internet stable
- Repository GitHub de votre application Oh'Pizza

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
- ✅ Mise à jour du système Ubuntu
- ✅ Installation de Node.js (version LTS)
- ✅ Installation de Git
- ✅ Installation de Nginx
- ✅ Installation de MySQL Server
- ✅ Installation de PM2 (gestionnaire de processus)

### Configuration de la base de données
- ✅ Création de la base de données `ohpizza_db`
- ✅ Création de l'utilisateur `ohpizza_user`
- ✅ Attribution des privilèges nécessaires
- ✅ Initialisation des tables et données

### Déploiement de l'application
- ✅ Clonage du repository GitHub
- ✅ Installation des dépendances (frontend et backend)
- ✅ Configuration des fichiers `.env`
- ✅ Build du frontend
- ✅ Configuration de Nginx
- ✅ Démarrage du backend avec PM2

### Sécurité
- ✅ Configuration du firewall UFW
- ✅ Headers de sécurité Nginx
- ✅ Permissions des fichiers

## Après l'installation

### Accès à l'application

Votre application sera accessible à :
- **IP du serveur** : `http://VOTRE_IP_VPS`
- **Domaine** (si configuré) : `http://VOTRE_DOMAINE.com`

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

### Gestion MySQL
```bash
sudo systemctl status mysql    # Statut
sudo mysql -u root -p          # Connexion root
mysql -u ohpizza_user -p ohpizza_db  # Connexion utilisateur app
```

### Logs
```bash
# Logs de l'application
tail -f /var/log/pm2/ohpizza-combined.log

# Logs Nginx
tail -f /var/log/nginx/ohpizza_access.log
tail -f /var/log/nginx/ohpizza_error.log

# Logs système
journalctl -u nginx -f
journalctl -u mysql -f
```

## Installation SSL (optionnel)

Pour sécuriser votre site avec HTTPS :

```bash
# Installation de Certbot
sudo apt install certbot python3-certbot-nginx

# Obtention du certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique (déjà configuré)
sudo crontab -l  # Vérifier la tâche cron
```

## Dépannage

### Problèmes courants

#### 1. Application inaccessible
```bash
# Vérifier les services
sudo systemctl status nginx
pm2 status
sudo systemctl status mysql

# Vérifier les ports
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :5000
```

#### 2. Erreur de base de données
```bash
# Tester la connexion
mysql -u ohpizza_user -p ohpizza_db

# Réinitialiser si nécessaire
cd /var/www/ohpizza/backend
node setup_database.js
```

#### 3. Erreur 502 Bad Gateway
```bash
# Vérifier que le backend fonctionne
pm2 logs ohpizza-backend
curl http://localhost:5000/api/health

# Redémarrer si nécessaire
pm2 restart ohpizza-backend
```

### Mise à jour de l'application

```bash
# Aller dans le dossier de l'app
cd /var/www/ohpizza

# Sauvegarder les fichiers .env
cp .env .env.backup
cp backend/.env backend/.env.backup

# Mettre à jour le code
git pull origin main

# Réinstaller les dépendances si nécessaire
npm install
cd backend && npm install && cd ..

# Rebuild le frontend
npm run build

# Redémarrer le backend
pm2 restart ohpizza-backend

# Recharger Nginx
sudo systemctl reload nginx
```

## Support

En cas de problème :

1. Vérifiez les logs mentionnés ci-dessus
2. Consultez la documentation de chaque service
3. Vérifiez que tous les services sont actifs
4. Assurez-vous que les ports ne sont pas bloqués

---

**Note** : Ce script est conçu pour Ubuntu 20.04/22.04. Pour d'autres distributions, des modifications peuvent être nécessaires.