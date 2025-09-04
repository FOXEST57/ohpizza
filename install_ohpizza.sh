#!/bin/bash

# Script d'installation automatique pour Oh'Pizza sur VPS Hostinger
# Ce script configure automatiquement l'environnement complet avec tous les correctifs

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier si on est root ou si sudo est disponible
    if [[ $EUID -eq 0 ]]; then
        SUDO_CMD=""
    elif command -v sudo &> /dev/null; then
        SUDO_CMD="sudo"
    else
        log_error "Ce script nécessite les privilèges root ou sudo"
        exit 1
    fi
    
    # Vérifier la distribution
    if ! command -v apt &> /dev/null; then
        log_error "Ce script est conçu pour les distributions basées sur Debian/Ubuntu"
        exit 1
    fi
    
    log_success "Prérequis vérifiés"
}

# Fonction pour arrêter les processus sur les ports utilisés
stop_conflicting_processes() {
    log_info "Vérification des conflits de ports..."
    
    # Ports à vérifier
    PORTS=(3000 5000 5173 80 443)
    
    for port in "${PORTS[@]}"; do
        if $SUDO_CMD lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warning "Port $port occupé, arrêt du processus..."
            $SUDO_CMD lsof -ti:$port | xargs $SUDO_CMD kill -9 2>/dev/null || true
            sleep 2
        fi
    done
    
    log_success "Conflits de ports résolus"
}

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

echo "🍕 Début de l'installation d'Oh'Pizza..."
echo "======================================="

# Vérification des prérequis
check_prerequisites

# Arrêt des processus conflictuels
stop_conflicting_processes

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

# Mot de passe MariaDB root
while true; do
    read -s -p "Mot de passe pour l'utilisateur root MariaDB: " MYSQL_ROOT_PASSWORD
    echo
    if [[ -n "$MYSQL_ROOT_PASSWORD" ]]; then
        break
    fi
    print_warning "Le mot de passe root MariaDB ne peut pas être vide"
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

# Mise à jour du système
log_info "Mise à jour du système..."
$SUDO_CMD apt update && $SUDO_CMD apt upgrade -y

# Installation de Node.js (version LTS)
log_info "Installation de Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_lts.x | $SUDO_CMD -E bash -
    $SUDO_CMD apt-get install -y nodejs
else
    log_success "Node.js déjà installé ($(node --version))"
fi

# Installation de TypeScript globalement
log_info "Installation de TypeScript..."
npm install -g typescript @types/node

# Installation de Git
log_info "Installation de Git..."
if ! command -v git &> /dev/null; then
    $SUDO_CMD apt-get install -y git
else
    log_success "Git déjà installé"
fi

# Installation de Nginx
log_info "Installation de Nginx..."
if ! command -v nginx &> /dev/null; then
    $SUDO_CMD apt-get install -y nginx
else
    log_success "Nginx déjà installé"
fi

# Installation de MariaDB Server (remplace MySQL)
log_info "Installation de MariaDB Server..."
if ! command -v mysql &> /dev/null; then
    $SUDO_CMD apt-get install -y mariadb-server mariadb-client
else
    log_success "MariaDB déjà installé"
fi

# Sécurisation de MariaDB
log_info "Configuration de MariaDB..."

# Démarrage et activation de MariaDB
$SUDO_CMD systemctl start mariadb
$SUDO_CMD systemctl enable mariadb

# Configuration sécurisée de MariaDB
$SUDO_CMD mysql_secure_installation --use-default

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

# 6. Installation de MariaDB Server
print_status "Installation de MariaDB Server..."
if ! command_exists mysql; then
    # Pré-configuration pour éviter les prompts interactifs
    debconf-set-selections <<< "mariadb-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD"
    debconf-set-selections <<< "mariadb-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD"
    
    apt install -y mariadb-server
    systemctl enable mariadb
    systemctl start mariadb
else
    print_success "MariaDB est déjà installé"
fi

# 7. Configuration de MariaDB
print_status "Configuration de la base de données MariaDB..."

# Création du fichier de configuration MariaDB temporaire
cat > /tmp/mysql_setup.sql << EOF
CREATE DATABASE IF NOT EXISTS ohpizza_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'ohpizza_user'@'localhost' IDENTIFIED BY '$OHPIZZA_PASSWORD';
GRANT ALL PRIVILEGES ON ohpizza_db.* TO 'ohpizza_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Exécution des commandes MariaDB
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
if [ -f "package.json" ]; then
    npm install
    print_success "Dépendances backend installées"
else
    print_error "Fichier package.json introuvable dans le dossier backend"
    exit 1
fi

# 11. Configuration du fichier .env backend
print_status "Configuration du fichier .env backend..."
cat > .env << EOF
# Configuration de la base de données
DB_HOST=localhost
DB_USER=ohpizza_user
DB_PASSWORD=$OHPIZZA_PASSWORD
DB_NAME=ohpizza_db

# Configuration du serveur
PORT=3000
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
if [ -f "package.json" ]; then
    # Installation des dépendances de base
    npm install
    
    # Installation des dépendances React manquantes
    print_status "Installation des dépendances React supplémentaires..."
    npm install react react-dom react-router-dom axios clsx tailwind-merge
    npm install --save-dev @types/react @types/react-dom @types/node
    
    print_success "Dépendances frontend installées"
else
    print_error "Fichier package.json introuvable"
    exit 1
fi

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
if npm run build; then
    print_success "Build du frontend réussi"
    if [ -d "dist" ]; then
        print_success "Dossier dist créé avec succès"
    else
        print_error "Le dossier dist n'a pas été créé"
        exit 1
    fi
else
    print_error "Erreur lors du build du frontend"
    print_status "Tentative avec npx..."
    if npx tsc && npm run build; then
        print_success "Build réussi avec npx"
    else
        print_error "Échec du build même avec npx"
        exit 1
    fi
fi

print_success "Frontend buildé avec succès"

# Configuration de Nginx
log_info "Configuration de Nginx..."

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
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
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
log_info "Activation du site Nginx..."
ln -sf /etc/nginx/sites-available/ohpizza /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test de la configuration Nginx
if nginx -t; then
    log_success "Configuration Nginx valide"
    systemctl reload nginx
    log_success "Nginx redémarré et activé"
else
    log_error "Erreur dans la configuration Nginx"
    exit 1
fi

# Configuration de PM2 pour le backend
log_info "Configuration de PM2..."
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
      PORT: 3000
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

# Arrêt des processus PM2 existants
pm2 delete ohpizza-backend 2>/dev/null || true

# Démarrage de l'application avec PM2
if pm2 start ecosystem.config.js; then
    log_success "Backend démarré avec PM2"
    pm2 startup
    pm2 save
    log_success "PM2 configuré pour le démarrage automatique"
else
    log_error "Erreur lors du démarrage du backend avec PM2"
    exit 1
fi

# Configuration du firewall (UFW)
log_info "Configuration du firewall..."
if command_exists ufw; then
    ufw --force enable
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw allow 22
    ufw allow 80
    ufw allow 443
    log_success "Firewall configuré"
else
    log_warning "UFW non installé, installation..."
    apt install -y ufw
    ufw --force enable
    ufw allow ssh
    ufw allow 'Nginx Full'
    log_success "Firewall installé et configuré"
fi

# Vérifications finales
log_info "Vérifications finales..."

# Fonction de vérification des services
check_service() {
    local service=$1
    local name=$2
    
    if systemctl is-active --quiet $service; then
        log_success "$name est actif"
    else
        log_error "$name n'est pas actif"
        return 1
    fi
}

# Vérifications des services
check_service nginx "Nginx"
check_service mariadb "MariaDB"

# Vérification de PM2
log_info "Vérification de PM2..."
if pm2 status | grep -q "ohpizza-backend"; then
    log_success "Backend PM2 actif"
else
    log_error "Backend PM2 non actif"
fi

# Test de connectivité à la base de données
log_info "Test de connexion à la base de données..."
if mysql -u ohpizza_user -p"$OHPIZZA_PASSWORD" -e "USE ohpizza_db; SHOW TABLES;" &>/dev/null; then
    log_success "Connexion à la base de données réussie"
else
    log_error "Erreur de connexion à la base de données"
fi

# Vérification des fichiers
log_info "Vérification des fichiers..."
if [ -d "/var/www/ohpizza/dist" ] && [ -f "/var/www/ohpizza/dist/index.html" ]; then
    log_success "Fichiers frontend présents"
else
    log_error "Fichiers frontend manquants"
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