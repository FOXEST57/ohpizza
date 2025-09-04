#!/bin/bash

# Commandes de maintenance pour Oh'Pizza
# Utilisez ce script pour les tâches de maintenance courantes

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Fonction d'aide
show_help() {
    echo "Commandes de maintenance Oh'Pizza"
    echo ""
    echo "Usage: $0 [COMMANDE]"
    echo ""
    echo "Commandes disponibles:"
    echo "  status      - Afficher le statut de tous les services"
    echo "  restart     - Redémarrer tous les services"
    echo "  logs        - Afficher les logs en temps réel"
    echo "  update      - Mettre à jour l'application depuis Git"
    echo "  backup      - Sauvegarder la base de données"
    echo "  restore     - Restaurer la base de données"
    echo "  ssl         - Renouveler le certificat SSL"
    echo "  cleanup     - Nettoyer les logs et fichiers temporaires"
    echo "  monitor     - Surveillance en temps réel"
    echo "  help        - Afficher cette aide"
    echo ""
}

# Vérifier le statut des services
check_status() {
    print_header "STATUT DES SERVICES"
    
    echo "🔍 Nginx:"
    systemctl is-active nginx && echo "✅ Actif" || echo "❌ Inactif"
    
    echo "🔍 MySQL:"
    systemctl is-active mysql && echo "✅ Actif" || echo "❌ Inactif"
    
    echo "🔍 Application PM2:"
    pm2 list | grep ohpizza-backend
    
    echo "🔍 Ports:"
    echo "Port 80 (Nginx): $(netstat -tlnp 2>/dev/null | grep ':80 ' && echo '✅ Ouvert' || echo '❌ Fermé')"
    echo "Port 5000 (Backend): $(netstat -tlnp 2>/dev/null | grep ':5000 ' && echo '✅ Ouvert' || echo '❌ Fermé')"
    echo "Port 3306 (MySQL): $(netstat -tlnp 2>/dev/null | grep ':3306 ' && echo '✅ Ouvert' || echo '❌ Fermé')"
    
    echo "🔍 Test de connectivité:"
    curl -s http://localhost/api/health >/dev/null && echo "✅ API accessible" || echo "❌ API inaccessible"
}

# Redémarrer tous les services
restart_services() {
    print_header "REDÉMARRAGE DES SERVICES"
    
    print_info "Redémarrage de l'application PM2..."
    pm2 restart ohpizza-backend
    
    print_info "Redémarrage de Nginx..."
    systemctl restart nginx
    
    print_info "Vérification du statut MySQL..."
    systemctl status mysql --no-pager -l
    
    sleep 3
    print_info "Vérification post-redémarrage..."
    curl -s http://localhost/api/health >/dev/null && echo "✅ Services redémarrés avec succès" || echo "❌ Problème détecté"
}

# Afficher les logs
show_logs() {
    print_header "LOGS EN TEMPS RÉEL"
    
    echo "Choisissez les logs à afficher:"
    echo "1) Application (PM2)"
    echo "2) Nginx (erreurs)"
    echo "3) Nginx (accès)"
    echo "4) MySQL"
    echo "5) Tous (multitail requis)"
    
    read -p "Votre choix (1-5): " choice
    
    case $choice in
        1)
            print_info "Logs de l'application (Ctrl+C pour quitter):"
            pm2 logs ohpizza-backend
            ;;
        2)
            print_info "Logs d'erreur Nginx (Ctrl+C pour quitter):"
            tail -f /var/log/nginx/ohpizza_error.log
            ;;
        3)
            print_info "Logs d'accès Nginx (Ctrl+C pour quitter):"
            tail -f /var/log/nginx/ohpizza_access.log
            ;;
        4)
            print_info "Logs MySQL (Ctrl+C pour quitter):"
            journalctl -u mysql -f
            ;;
        5)
            if command -v multitail >/dev/null; then
                multitail /var/log/pm2/ohpizza-combined.log /var/log/nginx/ohpizza_error.log /var/log/nginx/ohpizza_access.log
            else
                print_warning "multitail non installé. Installation: apt install multitail"
                print_info "Affichage des logs PM2:"
                pm2 logs ohpizza-backend
            fi
            ;;
        *)
            echo "Choix invalide"
            ;;
    esac
}

# Mettre à jour l'application
update_app() {
    print_header "MISE À JOUR DE L'APPLICATION"
    
    cd /var/www/ohpizza || exit 1
    
    print_info "Sauvegarde des fichiers .env..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
    
    print_info "Récupération des dernières modifications..."
    git stash
    git pull origin main
    
    print_info "Mise à jour des dépendances..."
    npm install
    cd backend && npm install && cd ..
    
    print_info "Build du frontend..."
    npm run build
    
    print_info "Redémarrage de l'application..."
    pm2 restart ohpizza-backend
    systemctl reload nginx
    
    print_info "Vérification..."
    sleep 5
    curl -s http://localhost/api/health >/dev/null && echo "✅ Mise à jour réussie" || echo "❌ Problème détecté"
}

# Sauvegarder la base de données
backup_database() {
    print_header "SAUVEGARDE DE LA BASE DE DONNÉES"
    
    BACKUP_DIR="/var/backups/ohpizza"
    mkdir -p "$BACKUP_DIR"
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/ohpizza_backup_$TIMESTAMP.sql"
    
    # Lecture des informations de connexion
    if [ -f "/var/www/ohpizza/backend/.env" ]; then
        DB_USER=$(grep "^DB_USER=" /var/www/ohpizza/backend/.env | cut -d'=' -f2)
        DB_PASSWORD=$(grep "^DB_PASSWORD=" /var/www/ohpizza/backend/.env | cut -d'=' -f2)
        DB_NAME=$(grep "^DB_NAME=" /var/www/ohpizza/backend/.env | cut -d'=' -f2)
        
        print_info "Création de la sauvegarde..."
        mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE"
        
        if [ $? -eq 0 ]; then
            print_info "✅ Sauvegarde créée: $BACKUP_FILE"
            
            # Compression
            gzip "$BACKUP_FILE"
            print_info "✅ Sauvegarde compressée: $BACKUP_FILE.gz"
            
            # Nettoyage des anciennes sauvegardes (garde les 7 dernières)
            find "$BACKUP_DIR" -name "ohpizza_backup_*.sql.gz" -mtime +7 -delete
            print_info "🧹 Anciennes sauvegardes nettoyées"
        else
            echo "❌ Erreur lors de la sauvegarde"
        fi
    else
        echo "❌ Fichier .env non trouvé"
    fi
}

# Restaurer la base de données
restore_database() {
    print_header "RESTAURATION DE LA BASE DE DONNÉES"
    
    BACKUP_DIR="/var/backups/ohpizza"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "❌ Aucune sauvegarde trouvée dans $BACKUP_DIR"
        return 1
    fi
    
    echo "Sauvegardes disponibles:"
    ls -la "$BACKUP_DIR"/*.sql.gz 2>/dev/null | nl
    
    read -p "Entrez le nom complet du fichier de sauvegarde: " backup_file
    
    if [ ! -f "$backup_file" ]; then
        echo "❌ Fichier non trouvé: $backup_file"
        return 1
    fi
    
    print_warning "⚠️  Cette opération va écraser la base de données actuelle!"
    read -p "Êtes-vous sûr? (oui/non): " confirm
    
    if [ "$confirm" = "oui" ]; then
        # Lecture des informations de connexion
        DB_USER=$(grep "^DB_USER=" /var/www/ohpizza/backend/.env | cut -d'=' -f2)
        DB_PASSWORD=$(grep "^DB_PASSWORD=" /var/www/ohpizza/backend/.env | cut -d'=' -f2)
        DB_NAME=$(grep "^DB_NAME=" /var/www/ohpizza/backend/.env | cut -d'=' -f2)
        
        print_info "Restauration en cours..."
        zcat "$backup_file" | mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
        
        if [ $? -eq 0 ]; then
            print_info "✅ Restauration réussie"
            pm2 restart ohpizza-backend
        else
            echo "❌ Erreur lors de la restauration"
        fi
    else
        print_info "Restauration annulée"
    fi
}

# Renouveler SSL
renew_ssl() {
    print_header "RENOUVELLEMENT SSL"
    
    if command -v certbot >/dev/null; then
        print_info "Renouvellement des certificats..."
        certbot renew --nginx
        
        if [ $? -eq 0 ]; then
            print_info "✅ Certificats renouvelés"
            systemctl reload nginx
        else
            echo "❌ Erreur lors du renouvellement"
        fi
    else
        echo "❌ Certbot non installé"
        echo "Installation: apt install certbot python3-certbot-nginx"
    fi
}

# Nettoyage
cleanup() {
    print_header "NETTOYAGE DU SYSTÈME"
    
    print_info "Nettoyage des logs PM2..."
    pm2 flush
    
    print_info "Rotation des logs Nginx..."
    logrotate -f /etc/logrotate.d/nginx
    
    print_info "Nettoyage des paquets..."
    apt autoremove -y
    apt autoclean
    
    print_info "Nettoyage des fichiers temporaires..."
    find /tmp -type f -atime +7 -delete 2>/dev/null
    
    print_info "✅ Nettoyage terminé"
}

# Surveillance
monitor() {
    print_header "SURVEILLANCE EN TEMPS RÉEL"
    
    while true; do
        clear
        echo "🕐 $(date)"
        echo ""
        
        # CPU et mémoire
        echo "💻 Ressources système:"
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
        echo "RAM: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
        echo "Disque: $(df / | tail -1 | awk '{print $5}')"
        echo ""
        
        # Services
        echo "🔧 Services:"
        systemctl is-active nginx >/dev/null && echo "✅ Nginx" || echo "❌ Nginx"
        systemctl is-active mysql >/dev/null && echo "✅ MySQL" || echo "❌ MySQL"
        pm2 list | grep -q "ohpizza-backend.*online" && echo "✅ App" || echo "❌ App"
        echo ""
        
        # Connectivité
        echo "🌐 Connectivité:"
        curl -s --max-time 5 http://localhost/api/health >/dev/null && echo "✅ API" || echo "❌ API"
        curl -s --max-time 5 http://localhost/ >/dev/null && echo "✅ Frontend" || echo "❌ Frontend"
        echo ""
        
        # Dernières erreurs
        echo "🚨 Dernières erreurs (5 min):"
        find /var/log/nginx/ -name "*error.log" -mmin -5 -exec tail -3 {} \; 2>/dev/null | head -5
        
        echo ""
        echo "Appuyez sur Ctrl+C pour quitter"
        sleep 30
    done
}

# Menu principal
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

case "$1" in
    status)
        check_status
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    update)
        update_app
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database
        ;;
    ssl)
        renew_ssl
        ;;
    cleanup)
        cleanup
        ;;
    monitor)
        monitor
        ;;
    help)
        show_help
        ;;
    *)
        echo "Commande inconnue: $1"
        show_help
        exit 1
        ;;
es