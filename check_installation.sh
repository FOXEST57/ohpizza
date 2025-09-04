#!/bin/bash

# Script de vérification post-installation Oh'Pizza
# Ce script vérifie que tous les composants sont correctement installés et fonctionnels

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Fonction pour vérifier un service systemd
check_service() {
    local service=$1
    if systemctl is-active --quiet "$service"; then
        print_success "Service $service est actif"
        return 0
    else
        print_error "Service $service n'est pas actif"
        return 1
    fi
}

# Fonction pour vérifier un port
check_port() {
    local port=$1
    local service=$2
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        print_success "Port $port ($service) est ouvert"
        return 0
    else
        print_error "Port $port ($service) n'est pas ouvert"
        return 1
    fi
}

echo -e "${GREEN}"
echo "================================================"
echo "    VÉRIFICATION INSTALLATION OH'PIZZA"
echo "================================================"
echo -e "${NC}"

# Variables de comptage
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Fonction pour incrémenter les compteurs
increment_check() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ $1 -eq 0 ]; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# 1. Vérification des commandes de base
print_status "Vérification des outils installés..."
echo

commands=("node" "npm" "git" "nginx" "mysql" "pm2")
for cmd in "${commands[@]}"; do
    if command_exists "$cmd"; then
        if [ "$cmd" = "node" ]; then
            version=$(node --version)
            print_success "$cmd est installé (version: $version)"
        elif [ "$cmd" = "npm" ]; then
            version=$(npm --version)
            print_success "$cmd est installé (version: $version)"
        else
            print_success "$cmd est installé"
        fi
        increment_check 0
    else
        print_error "$cmd n'est pas installé"
        increment_check 1
    fi
done

echo

# 2. Vérification des services
print_status "Vérification des services..."
echo

services=("nginx" "mysql")
for service in "${services[@]}"; do
    check_service "$service"
    increment_check $?
done

# Vérification spéciale pour PM2
if pm2 list 2>/dev/null | grep -q "ohpizza-backend"; then
    if pm2 list 2>/dev/null | grep "ohpizza-backend" | grep -q "online"; then
        print_success "Application PM2 ohpizza-backend est en ligne"
        increment_check 0
    else
        print_error "Application PM2 ohpizza-backend n'est pas en ligne"
        increment_check 1
    fi
else
    print_error "Application PM2 ohpizza-backend non trouvée"
    increment_check 1
fi

echo

# 3. Vérification des ports
print_status "Vérification des ports..."
echo

ports=("80:Nginx" "3306:MySQL" "5000:Backend")
for port_info in "${ports[@]}"; do
    port=$(echo $port_info | cut -d':' -f1)
    service=$(echo $port_info | cut -d':' -f2)
    check_port "$port" "$service"
    increment_check $?
done

echo

# 4. Vérification des fichiers de l'application
print_status "Vérification des fichiers de l'application..."
echo

files=(
    "/var/www/ohpizza:Dossier principal"
    "/var/www/ohpizza/backend:Dossier backend"
    "/var/www/ohpizza/dist:Dossier frontend buildé"
    "/var/www/ohpizza/backend/.env:Configuration backend"
    "/var/www/ohpizza/.env:Configuration frontend"
    "/var/www/ohpizza/backend/server.js:Serveur backend"
    "/var/www/ohpizza/dist/index.html:Frontend buildé"
)

for file_info in "${files[@]}"; do
    file_path=$(echo $file_info | cut -d':' -f1)
    description=$(echo $file_info | cut -d':' -f2)
    
    if [ -e "$file_path" ]; then
        print_success "$description existe"
        increment_check 0
    else
        print_error "$description manquant: $file_path"
        increment_check 1
    fi
done

echo

# 5. Vérification de la configuration Nginx
print_status "Vérification de la configuration Nginx..."
echo

if [ -f "/etc/nginx/sites-available/ohpizza" ]; then
    print_success "Configuration Nginx ohpizza existe"
    increment_check 0
else
    print_error "Configuration Nginx ohpizza manquante"
    increment_check 1
fi

if [ -L "/etc/nginx/sites-enabled/ohpizza" ]; then
    print_success "Site Nginx ohpizza est activé"
    increment_check 0
else
    print_error "Site Nginx ohpizza n'est pas activé"
    increment_check 1
fi

# Test de la configuration Nginx
if nginx -t >/dev/null 2>&1; then
    print_success "Configuration Nginx est valide"
    increment_check 0
else
    print_error "Configuration Nginx contient des erreurs"
    increment_check 1
fi

echo

# 6. Vérification de la base de données
print_status "Vérification de la base de données..."
echo

# Lecture du fichier .env pour obtenir les informations de connexion
if [ -f "/var/www/ohpizza/backend/.env" ]; then
    DB_USER=$(grep "^DB_USER=" /var/www/ohpizza/backend/.env | cut -d'=' -f2)
    DB_PASSWORD=$(grep "^DB_PASSWORD=" /var/www/ohpizza/backend/.env | cut -d'=' -f2)
    DB_NAME=$(grep "^DB_NAME=" /var/www/ohpizza/backend/.env | cut -d'=' -f2)
    
    # Test de connexion à la base de données
    if mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SHOW TABLES;" >/dev/null 2>&1; then
        print_success "Connexion à la base de données réussie"
        
        # Vérification des tables principales
        tables=$(mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null | tail -n +2)
        if echo "$tables" | grep -q "pizzas\|categories\|ingredients"; then
            print_success "Tables principales trouvées dans la base de données"
            increment_check 0
        else
            print_warning "Tables principales manquantes dans la base de données"
            increment_check 1
        fi
        increment_check 0
    else
        print_error "Impossible de se connecter à la base de données"
        increment_check 1
        increment_check 1
    fi
else
    print_error "Fichier .env backend non trouvé"
    increment_check 1
    increment_check 1
fi

echo

# 7. Tests de connectivité
print_status "Tests de connectivité..."
echo

# Test de l'API backend
if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
    print_success "API backend répond"
    increment_check 0
else
    print_error "API backend ne répond pas"
    increment_check 1
fi

# Test du frontend via Nginx
if curl -s http://localhost/ >/dev/null 2>&1; then
    print_success "Frontend accessible via Nginx"
    increment_check 0
else
    print_error "Frontend non accessible via Nginx"
    increment_check 1
fi

# Test de l'API via Nginx
if curl -s http://localhost/api/health >/dev/null 2>&1; then
    print_success "API accessible via Nginx"
    increment_check 0
else
    print_error "API non accessible via Nginx"
    increment_check 1
fi

echo

# 8. Vérification des permissions
print_status "Vérification des permissions..."
echo

if [ -r "/var/www/ohpizza/dist/index.html" ]; then
    print_success "Permissions de lecture sur les fichiers frontend OK"
    increment_check 0
else
    print_error "Problème de permissions sur les fichiers frontend"
    increment_check 1
fi

if [ -r "/var/www/ohpizza/backend/server.js" ]; then
    print_success "Permissions de lecture sur les fichiers backend OK"
    increment_check 0
else
    print_error "Problème de permissions sur les fichiers backend"
    increment_check 1
fi

echo

# 9. Vérification des logs
print_status "Vérification des logs..."
echo

log_files=(
    "/var/log/nginx/ohpizza_access.log:Logs d'accès Nginx"
    "/var/log/nginx/ohpizza_error.log:Logs d'erreur Nginx"
    "/var/log/pm2:Dossier logs PM2"
)

for log_info in "${log_files[@]}"; do
    log_path=$(echo $log_info | cut -d':' -f1)
    description=$(echo $log_info | cut -d':' -f2)
    
    if [ -e "$log_path" ]; then
        print_success "$description existe"
        increment_check 0
    else
        print_warning "$description manquant: $log_path"
        increment_check 1
    fi
done

echo

# 10. Résumé final
echo -e "${BLUE}"
echo "================================================"
echo "              RÉSUMÉ DES VÉRIFICATIONS"
echo "================================================"
echo -e "${NC}"

echo "Total des vérifications: $TOTAL_CHECKS"
echo -e "${GREEN}Réussies: $PASSED_CHECKS${NC}"
echo -e "${RED}Échouées: $FAILED_CHECKS${NC}"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo
    print_success "🎉 Toutes les vérifications sont passées! L'installation semble correcte."
    echo
    print_status "Votre application Oh'Pizza devrait être accessible à:"
    
    # Obtenir l'IP publique
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "VOTRE_IP")
    echo "• http://$PUBLIC_IP"
    
    # Vérifier s'il y a un domaine configuré
    if [ -f "/etc/nginx/sites-available/ohpizza" ]; then
        DOMAIN=$(grep "server_name" /etc/nginx/sites-available/ohpizza | grep -v "_" | awk '{print $2}' | tr -d ';' | head -1)
        if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "_" ]; then
            echo "• http://$DOMAIN"
        fi
    fi
    
elif [ $FAILED_CHECKS -le 3 ]; then
    echo
    print_warning "⚠️  Quelques problèmes mineurs détectés. L'application pourrait fonctionner partiellement."
    echo
    print_status "Consultez les erreurs ci-dessus et les logs pour plus de détails."
    
else
    echo
    print_error "❌ Plusieurs problèmes critiques détectés. L'application ne fonctionne probablement pas correctement."
    echo
    print_status "Actions recommandées:"
    echo "1. Vérifiez les logs: tail -f /var/log/nginx/ohpizza_error.log"
    echo "2. Vérifiez PM2: pm2 logs ohpizza-backend"
    echo "3. Redémarrez les services: sudo systemctl restart nginx && pm2 restart ohpizza-backend"
    echo "4. Relancez le script d'installation si nécessaire"
fi

echo
print_status "Commandes utiles pour le dépannage:"
echo "• pm2 status                     # Statut PM2"
echo "• pm2 logs ohpizza-backend       # Logs de l'application"
echo "• sudo systemctl status nginx    # Statut Nginx"
echo "• sudo nginx -t                  # Test config Nginx"
echo "• tail -f /var/log/nginx/ohpizza_error.log  # Logs erreur Nginx"
echo "• mysql -u ohpizza_user -p ohpizza_db       # Test base de données"

echo
print_status "Pour relancer cette vérification: ./check_installation.sh"

exit $FAILED_CHECKS