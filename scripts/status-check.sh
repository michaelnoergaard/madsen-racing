#!/bin/bash

#############################################
# Madsen Racing - System Status Checker
# Quick overview of deployment status
#############################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Symbols
CHECK="✓"
CROSS="✗"
WARN="⚠"

echo "=========================================="
echo "Madsen Racing - System Status"
echo "=========================================="
echo ""

# Function to check service status
check_service() {
    local service=$1
    local name=$2
    if systemctl is-active --quiet $service; then
        echo -e "${GREEN}${CHECK} ${name} is running${NC}"
        return 0
    else
        echo -e "${RED}${CROSS} ${name} is not running${NC}"
        return 1
    fi
}

# Function to check if file/directory exists
check_path() {
    local path=$1
    local name=$2
    if [ -e "$path" ]; then
        echo -e "${GREEN}${CHECK} ${name} exists${NC}"
        return 0
    else
        echo -e "${RED}${CROSS} ${name} not found${NC}"
        return 1
    fi
}

# === System Information ===
echo -e "${BLUE}=== System Information ===${NC}"
echo "Hostname: $(hostname)"
echo "IP Address: $(hostname -I | awk '{print $1}')"
echo "Uptime: $(uptime -p)"
echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
echo ""

# === Resource Usage ===
echo -e "${BLUE}=== Resource Usage ===${NC}"
echo "Memory:"
free -h | grep -v "Swap:" | awk '{if(NR==1) print "  Total: "$2", Used: "$3", Free: "$4; else if(NR==2) print "  Available: "$7}'
echo "Disk:"
df -h / | awk 'NR==2 {print "  Total: "$2", Used: "$3" ("$5"), Free: "$4}'
df -h /var/www/madsen-racing 2>/dev/null | awk 'NR==2 {print "  Website: "$3" used"}'
echo ""

# === Services Status ===
echo -e "${BLUE}=== Services Status ===${NC}"
check_service nginx "Nginx"
check_service madsen-racing-update.timer "Auto-update timer" 2>/dev/null || echo -e "${YELLOW}${WARN} Auto-update timer not configured${NC}"
check_service webhook "Webhook receiver" 2>/dev/null || echo -e "${YELLOW}${WARN} Webhook not configured${NC}"
echo ""

# === Installation Paths ===
echo -e "${BLUE}=== Installation Paths ===${NC}"
check_path "/var/www/madsen-racing" "Website directory"
check_path "/var/www/madsen-racing/dist" "Build directory"
check_path "/var/www/madsen-racing/dist/index.html" "Index page"
check_path "/etc/nginx/sites-enabled/madsen-racing" "Nginx config"
check_path "/usr/local/bin/update-website.sh" "Update script"
echo ""

# === Git Status ===
if [ -d "/var/www/madsen-racing/.git" ]; then
    echo -e "${BLUE}=== Git Status ===${NC}"
    cd /var/www/madsen-racing
    echo "Branch: $(git branch --show-current)"
    echo "Latest commit: $(git log -1 --pretty=format:'%h - %s (%ar)')"

    # Check if up to date
    git fetch origin --quiet
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$(git branch --show-current))

    if [ "$LOCAL" = "$REMOTE" ]; then
        echo -e "${GREEN}${CHECK} Up to date with remote${NC}"
    else
        echo -e "${YELLOW}${WARN} Updates available on remote${NC}"
        echo "  Commits behind: $(git rev-list --count HEAD..origin/$(git branch --show-current))"
    fi
    echo ""
fi

# === Build Information ===
if [ -d "/var/www/madsen-racing/dist" ]; then
    echo -e "${BLUE}=== Build Information ===${NC}"
    BUILD_DATE=$(stat -c %y /var/www/madsen-racing/dist/index.html 2>/dev/null | cut -d'.' -f1)
    echo "Last build: $BUILD_DATE"
    echo "Build size: $(du -sh /var/www/madsen-racing/dist 2>/dev/null | cut -f1)"
    echo "Files: $(find /var/www/madsen-racing/dist -type f 2>/dev/null | wc -l)"
    echo ""
fi

# === SSL Certificate Status ===
echo -e "${BLUE}=== SSL Certificate ===${NC}"
if [ -d "/etc/letsencrypt/live/madsenracing.dk" ]; then
    CERT_FILE="/etc/letsencrypt/live/madsenracing.dk/cert.pem"
    if [ -f "$CERT_FILE" ]; then
        EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
        EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
        NOW_EPOCH=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

        if [ $DAYS_LEFT -gt 30 ]; then
            echo -e "${GREEN}${CHECK} Certificate valid for $DAYS_LEFT days${NC}"
        elif [ $DAYS_LEFT -gt 7 ]; then
            echo -e "${YELLOW}${WARN} Certificate expires in $DAYS_LEFT days${NC}"
        else
            echo -e "${RED}${CROSS} Certificate expires in $DAYS_LEFT days!${NC}"
        fi
        echo "  Expires: $EXPIRY"
    else
        echo -e "${RED}${CROSS} Certificate file not found${NC}"
    fi
else
    echo -e "${YELLOW}${WARN} SSL not configured (HTTP only)${NC}"
fi
echo ""

# === Recent Logs ===
echo -e "${BLUE}=== Recent Activity ===${NC}"
if [ -f "/var/log/madsen-racing-deploy.log" ]; then
    echo "Recent deployments:"
    grep "Deployment completed" /var/log/madsen-racing-deploy.log 2>/dev/null | tail -3 | sed 's/^/  /'
else
    echo "No deployment logs found"
fi

if [ -f "/var/log/nginx/madsen-racing-access.log" ]; then
    REQUESTS_TODAY=$(grep "$(date +%d/%b/%Y)" /var/log/nginx/madsen-racing-access.log 2>/dev/null | wc -l)
    echo "Requests today: $REQUESTS_TODAY"
fi
echo ""

# === Automation Status ===
echo -e "${BLUE}=== Automation Status ===${NC}"
if systemctl is-active --quiet madsen-racing-update.timer 2>/dev/null; then
    NEXT_RUN=$(systemctl list-timers madsen-racing-update.timer 2>/dev/null | grep madsen | awk '{print $1" "$2}')
    echo -e "${GREEN}${CHECK} Auto-updates enabled${NC}"
    echo "  Next check: $NEXT_RUN"
    LAST_RUN=$(journalctl -u madsen-racing-update.service -n 1 --output=short-iso 2>/dev/null | grep "Started" | awk '{print $1" "$2}')
    if [ ! -z "$LAST_RUN" ]; then
        echo "  Last check: $LAST_RUN"
    fi
else
    echo -e "${YELLOW}${WARN} Auto-updates not configured${NC}"
    echo "  Run manual updates: /usr/local/bin/update-website.sh"
fi
echo ""

# === Quick Actions ===
echo -e "${BLUE}=== Quick Actions ===${NC}"
echo "View access logs:  tail -f /var/log/nginx/madsen-racing-access.log"
echo "View error logs:   tail -f /var/log/nginx/madsen-racing-error.log"
echo "Manual update:     /usr/local/bin/update-website.sh"
echo "Reload Nginx:      systemctl reload nginx"
echo "View auto-update:  journalctl -u madsen-racing-update.service -f"
echo ""

echo "=========================================="
echo "Status check completed at $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
