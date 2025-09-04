# 🍕 Guide de Démarrage Rapide - Oh'Pizza sur VPS Hostinger

## 📋 Résumé en 3 étapes

### 1️⃣ Préparation
```bash
# Connectez-vous à votre VPS
ssh root@VOTRE_IP_VPS

# Téléchargez les fichiers d'installation
git clone VOTRE_REPO_GITHUB
cd ohpizza

# Rendez le script exécutable
chmod +x install_ohpizza.sh
```

### 2️⃣ Installation
```bash
# Lancez l'installation automatique
sudo ./install_ohpizza.sh
```

**Informations à préparer :**
- URL de votre repository GitHub
- Mot de passe MySQL root (créez-en un sécurisé)
- Nom de domaine (optionnel)

### 3️⃣ Vérification
```bash
# Vérifiez l'installation
chmod +x check_installation.sh
./check_installation.sh
```

## 🎯 Accès à votre application

Après installation réussie :
- **URL** : `http://VOTRE_IP_VPS`
- **Avec domaine** : `http://votre-domaine.com`

## ⚙️ Configuration post-installation

### PayPal (obligatoire pour les paiements)
```bash
# Backend
sudo nano /var/www/ohpizza/backend/.env
# Modifiez :
PAYPAL_CLIENT_ID=votre_client_id
PAYPAL_CLIENT_SECRET=votre_secret
PAYPAL_MODE=sandbox  # ou 'live'

# Frontend
sudo nano /var/www/ohpizza/.env
# Modifiez :
VITE_PAYPAL_CLIENT_ID=votre_client_id

# Redémarrez
pm2 restart ohpizza-backend
```

### Email (pour les notifications)
```bash
sudo nano /var/www/ohpizza/backend/.env
# Modifiez :
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app

# Redémarrez
pm2 restart ohpizza-backend
```

## 🔧 Commandes essentielles

```bash
# Statut des services
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql

# Redémarrage
pm2 restart ohpizza-backend
sudo systemctl restart nginx

# Logs en temps réel
pm2 logs ohpizza-backend
tail -f /var/log/nginx/ohpizza_error.log

# Mise à jour de l'application
cd /var/www/ohpizza
git pull
npm run build
pm2 restart ohpizza-backend
```

## 🔒 SSL (optionnel mais recommandé)

```bash
# Installation
sudo apt install certbot python3-certbot-nginx

# Configuration SSL
sudo certbot --nginx -d votre-domaine.com
```

## 🆘 Dépannage rapide

### Application inaccessible
```bash
./check_installation.sh  # Diagnostic complet
pm2 restart ohpizza-backend
sudo systemctl restart nginx
```

### Erreur 502 Bad Gateway
```bash
pm2 logs ohpizza-backend  # Voir les erreurs
curl http://localhost:5000/api/health  # Test API
```

### Problème de base de données
```bash
mysql -u ohpizza_user -p ohpizza_db  # Test connexion
cd /var/www/ohpizza/backend && node setup_database.js  # Réinitialiser
```

## 📞 Support

1. **Vérification** : `./check_installation.sh`
2. **Logs** : `pm2 logs ohpizza-backend`
3. **Documentation complète** : `README_INSTALLATION.md`

---

**🎉 Félicitations ! Votre pizzeria en ligne est prête !**

*Temps d'installation estimé : 10-15 minutes*