#!/bin/bash

# Script d'installation automatisé pour Oh'Pizza sur VPS Hostinger
# Auteur: Assistant IA
# Version: 1.0

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Fonction pour demander une confirmation
confirm() {
    while true; do
        read -p "$1 (o/n): " yn
        case $yn in
            [Oo]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Veuillez répondre par o (oui) ou n (non).";;
        esac
    done
}

# Fonction pour générer un mot de passe aléatoire
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

echo -e "${GREEN}"
echo "================================================"
echo "    INSTALLATION AUTOMATISÉE OH'PIZZA"
echo "================================================"
echo -e "${NC}"

# Vérification des privilèges root
if [[ $EUID -ne 0 ]]; then
   print_error "Ce script doit être exécuté en tant que root (sudo)"
   exit 1
fi

# Collecte des informations utilisateur
print_status "Collecte des informations nécessaires..."
echo

# URL du repository GitHub
read -p "URL du repository GitHub (ex: https://github.com/username/ohpizza.git): " GITHUB_URL
if [[ -z "$GITHUB_URL" ]]; then
    print_error "L'URL du repository est obligatoire"
    exit 1
fi

# Mot de passe MySQL root
while true; do
    read -s -p "Mot de passe pour l'utilisateur root MySQL: " MYSQL_ROOT_PASSWORD
    echo
    if [[ -n "$MYSQL_ROOT_PASSWORD" ]]; then
        break
    fi
    print_warning "Le mot de passe root MySQL ne peut pas être vide"
done

# Mot de passe pour ohpizza_user
read -s -p "Mot de passe pour l'utilisateur ohpizza_user (laissez vide pour générer automatiquement): " OHPIZZA_PASSWORD
echo
if [[ -z "$OHPIZZA_PASSWORD" ]]; then
    OHPIZZA_PASSWORD=$(generate_password)
    print_status "Mot de passe généré automatiquement: $OHPIZZA_PASSWORD"
fi

# Nom de domaine (optionnel)
read -p "Nom de domaine (optionnel, ex: monsite.com): " DOMAIN_NAME

# Confirmation avant installation
echo
print_status "Résumé de l'installation:"
echo "- Repository: $GITHUB_URL"
echo "- Mot de passe ohpizza_user: $OHPIZZA_PASSWORD"
if [[ -n "$DOMAIN_NAME" ]]; then
    echo "- Domaine: $DOMAIN_NAME"
else
    echo "- Domaine: Non configuré (utilisation de l'IP)"
fi
echo

if ! confirm "Voulez-vous continuer l'installation?"; then
    print_status "Installation annulée"
    exit 0
fi

echo
print_status "Début de l'installation..."

# 1. Mise à jour du système
print_status "Mise à jour du système..."
apt update && apt upgrade -y

# 2. Installation des paquets nécessaires
print_status "Installation des paquets de base..."
apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release

# 3. Installation de Node.js (version LTS)
print_status "Installation de Node.js..."
if ! command_exists node; then
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt install -y nodejs
else
    print_success "Node.js est déjà installé"
fi

# Vérification de la version Node.js
NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# 4. Installation de Git
print_status "Installation de Git..."
if ! command_exists git; then
    apt install -y git
else
    print_success "Git est déjà installé"
fi

# 5. Installation de Nginx
print_status "Installation de Nginx..."
if ! command_exists nginx; then
    apt install -y nginx
    systemctl enable nginx
else
    print_success "Nginx est déjà installé"
fi

# 6. Installation de MySQL Server
print_status "Installation de MySQL Server..."
if ! command_exists mysql; then
    # Pré-configuration pour éviter les prompts interactifs
    debconf-set-selections <<< "mysql-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD"
    debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD"
    
    apt install -y mysql-server
    systemctl enable mysql
    systemctl start mysql
else
    print_success "MySQL est déjà installé"
fi

# 7. Configuration de MySQL
print_status "Configuration de la base de données MySQL..."

# Création du fichier de configuration MySQL temporaire
cat > /tmp/mysql_setup.sql << EOF
CREATE DATABASE IF NOT EXISTS ohpizza_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'ohpizza_user'@'localhost' IDENTIFIED BY '$OHPIZZA_PASSWORD';
GRANT ALL PRIVILEGES ON ohpizza_db.* TO 'ohpizza_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Exécution des commandes MySQL
mysql -u root -p"$MYSQL_ROOT_PASSWORD" < /tmp/mysql_setup.sql
rm /tmp/mysql_setup.sql

print_success "Base de données configurée avec succès"

# 8. Installation de PM2
print_status "Installation de PM2..."
if ! command_exists pm2; then
    npm install -g pm2
    pm2 startup
else
    print_success "PM2 est déjà installé"
fi

# 9. Clonage du repository
print_status "Clonage du repository GitHub..."
cd /var/www
if [[ -d "ohpizza" ]]; then
    print_warning "Le dossier ohpizza existe déjà, suppression..."
    rm -rf ohpizza
fi

git clone "$GITHUB_URL" ohpizza
cd ohpizza

# Changement des permissions
chown -R www-data:www-data /var/www/ohpizza
chmod -R 755 /var/www/ohpizza

# 10. Installation des dépendances backend
print_status "Installation des dépendances backend..."
cd /var/www/ohpizza/backend
npm install

# 11. Configuration du fichier .env backend
print_status "Configuration du fichier .env backend..."
cat > .env << EOF
# Configuration de la base de données
DB_HOST=localhost
DB_USER=ohpizza_user
DB_PASSWORD=$OHPIZZA_PASSWORD
DB_NAME=ohpizza_db

# Configuration du serveur
PORT=5000
NODE_ENV=production

# Clés de sécurité (générez vos propres clés en production)
JWT_SECRET=$(generate_password)
SESSION_SECRET=$(generate_password)

# Configuration PayPal (à configurer selon vos besoins)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Configuration Email (à configurer selon vos besoins)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EOF

print_success "Fichier .env backend configuré"

# 12. Initialisation de la base de données
print_status "Initialisation de la base de données..."
if [[ -f "setup_database.js" ]]; then
    node setup_database.js
    print_success "Base de données initialisée avec succès"
else
    print_warning "Fichier setup_database.js non trouvé, initialisation manuelle nécessaire"
fi

# 13. Installation des dépendances frontend
print_status "Installation des dépendances frontend..."
cd /var/www/ohpizza
npm install

# 14. Configuration du fichier .env frontend
print_status "Configuration du fichier .env frontend..."
if [[ -n "$DOMAIN_NAME" ]]; then
    API_URL="https://$DOMAIN_NAME/api"
else
    API_URL="http://$(curl -s ifconfig.me)/api"
fi

cat > .env << EOF
VITE_API_URL=$API_URL
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
EOF

print_success "Fichier .env frontend configuré"

# 15. Build du frontend
print_status "Build du frontend..."
npm run build

print_success "Frontend buildé avec succès"

# 16. Configuration de Nginx
print_status "Configuration de Nginx..."

# Sauvegarde de la configuration par défaut
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Création de la configuration Nginx
if [[ -n "$DOMAIN_NAME" ]]; then
    SERVER_NAME="$DOMAIN_NAME"
else
    SERVER_NAME="_"
fi

cat > /etc/nginx/sites-available/ohpizza << EOF
server {
    listen 80;
    server_name $SERVER_NAME;
    
    # Servir les fichiers statiques du frontend
    location / {
        root /var/www/ohpizza/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Headers de sécurité
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
    
    # Proxy pour l'API backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Gestion des fichiers statiques avec cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
        root /var/www/ohpizza/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Logs
    access_log /var/log/nginx/ohpizza_access.log;
    error_log /var/log/nginx/ohpizza_error.log;
}
EOF

# Activation du site
ln -sf /etc/nginx/sites-available/ohpizza /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test de la configuration Nginx
nginx -t
if [[ $? -eq 0 ]]; then
    systemctl reload nginx
    print_success "Configuration Nginx appliquée avec succès"
else
    print_error "Erreur dans la configuration Nginx"
    exit 1
fi

# 17. Configuration de PM2 pour le backend
print_status "Configuration de PM2..."
cd /var/www/ohpizza/backend

# Création du fichier de configuration PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ohpizza-backend',
    script: 'server.js',
    cwd: '/var/www/ohpizza/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/ohpizza-error.log',
    out_file: '/var/log/pm2/ohpizza-out.log',
    log_file: '/var/log/pm2/ohpizza-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G'
  }]
};
EOF

# Création du dossier de logs PM2
mkdir -p /var/log/pm2
chown -R www-data:www-data /var/log/pm2

# Démarrage de l'application avec PM2
pm2 start ecosystem.config.js
pm2 save

print_success "Application démarrée avec PM2"

# 18. Configuration du firewall (UFW)
print_status "Configuration du firewall..."
if command_exists ufw; then
    ufw --force enable
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw allow 22
    ufw allow 80
    ufw allow 443
    print_success "Firewall configuré"
else
    print_warning "UFW non installé, installation..."
    apt install -y ufw
    ufw --force enable
    ufw allow ssh
    ufw allow 'Nginx Full'
    print_success "Firewall installé et configuré"
fi

# 19. Vérifications finales
print_status "Vérifications finales..."

# Vérification des services
services=("nginx" "mysql" "pm2")
for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service" 2>/dev/null || pm2 list | grep -q "ohpizza-backend" 2>/dev/null; then
        print_success "Service $service: ✓ Actif"
    else
        print_warning "Service $service: ✗ Inactif"
    fi
done

# Test de connectivité à la base de données
if mysql -u ohpizza_user -p"$OHPIZZA_PASSWORD" -e "USE ohpizza_db; SHOW TABLES;" >/dev/null 2>&1; then
    print_success "Connexion à la base de données: ✓ OK"
else
    print_warning "Connexion à la base de données: ✗ Problème"
fi

# 20. Instructions finales
echo
echo -e "${GREEN}"
echo "================================================"
echo "         INSTALLATION TERMINÉE!"
echo "================================================"
echo -e "${NC}"

print_success "L'application Oh'Pizza a été installée avec succès!"
echo
print_status "Informations importantes:"
echo "• URL de l'application: http://$(curl -s ifconfig.me)"
if [[ -n "$DOMAIN_NAME" ]]; then
    echo "• Domaine configuré: http://$DOMAIN_NAME"
fi
echo "• Mot de passe ohpizza_user: $OHPIZZA_PASSWORD"
echo "• Logs PM2: /var/log/pm2/"
echo "• Logs Nginx: /var/log/nginx/"
echo
print_status "Commandes utiles:"
echo "• Redémarrer le backend: pm2 restart ohpizza-backend"
echo "• Voir les logs: pm2 logs ohpizza-backend"
echo "• Status PM2: pm2 status"
echo "• Redémarrer Nginx: systemctl restart nginx"
echo "• Voir les logs Nginx: tail -f /var/log/nginx/ohpizza_error.log"
echo
print_warning "N'oubliez pas de:"
echo "• Configurer PayPal dans les fichiers .env"
echo "• Configurer l'email dans le backend/.env"
echo "• Installer un certificat SSL avec Let's Encrypt (optionnel)"
echo
if [[ -n "$DOMAIN_NAME" ]]; then
    print_status "Pour installer SSL avec Let's Encrypt:"
    echo "sudo apt install certbot python3-certbot-nginx"
    echo "sudo certbot --nginx -d $DOMAIN_NAME"
fi

print_success "Installation terminée! Votre application Oh'Pizza est maintenant en ligne."

# Nettoyage
rm -f /tmp/mysql_setup.sql

exit 0