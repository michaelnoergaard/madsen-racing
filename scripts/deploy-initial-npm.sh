#!/bin/bash

#############################################
# Initial Deployment Script - NPM Version
# For use with Nginx Proxy Manager
#############################################

set -e  # Exit on error

echo "=========================================="
echo "Madsen Racing - Initial Deployment (NPM)"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
REPO_URL="https://github.com/michaelnoergaard/madsen-racing.git"
INSTALL_DIR="/var/www/madsen-racing"
NGINX_CONFIG="/etc/nginx/sites-available/madsen-racing"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1/7: Updating system packages...${NC}"
apt update && apt upgrade -y

echo ""
echo -e "${YELLOW}Step 2/7: Installing required packages...${NC}"
apt install -y nginx git curl wget unzip nano htop

echo ""
echo -e "${YELLOW}Step 3/7: Installing Node.js 20 LTS...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo "Node.js already installed"
fi

node --version
npm --version

echo ""
echo -e "${YELLOW}Step 4/7: Cloning repository...${NC}"
if [ -d "$INSTALL_DIR" ]; then
    echo "Directory already exists. Backing up..."
    mv "$INSTALL_DIR" "${INSTALL_DIR}.backup.$(date +%s)"
fi

mkdir -p /var/www
git clone "$REPO_URL" "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo ""
echo -e "${YELLOW}Step 5/7: Setting up environment variables...${NC}"
if [ ! -f "$INSTALL_DIR/.env" ]; then
    cat > "$INSTALL_DIR/.env" << 'ENVEOF'
# Contentful Configuration
CONTENTFUL_SPACE_ID=
CONTENTFUL_ACCESS_TOKEN=
CONTENTFUL_PREVIEW_TOKEN=
SITE_URL=https://madsenracing.dk
ENVEOF
    echo -e "${RED}IMPORTANT: Edit $INSTALL_DIR/.env with your Contentful credentials!${NC}"
else
    echo ".env file already exists, skipping..."
fi

echo ""
echo -e "${YELLOW}Step 6/7: Installing dependencies and building...${NC}"
npm ci --production=false
echo ""
echo "Building site..."
npm run build

echo ""
echo -e "${YELLOW}Step 7/7: Configuring Nginx (HTTP only for NPM)...${NC}"

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create minimal Nginx configuration (no SSL, NPM handles that)
cat > "$NGINX_CONFIG" << 'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;

    root /var/www/madsen-racing/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|webp|avif)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Main location
    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    # Deny hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    access_log /var/log/nginx/madsen-racing-access.log;
    error_log /var/log/nginx/madsen-racing-error.log;
}
NGINXEOF

# Enable site
ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/

# Test and reload
nginx -t
systemctl reload nginx
systemctl enable nginx

echo ""
echo -e "${YELLOW}Installing update script...${NC}"
cp "$INSTALL_DIR/scripts/update-website.sh" /usr/local/bin/update-website.sh 2>/dev/null || true
chmod +x /usr/local/bin/update-website.sh 2>/dev/null || true

echo ""
echo -e "${GREEN}=========================================="
echo "✓ Initial deployment complete!"
echo "==========================================${NC}"
echo ""
echo "Container IP: $(hostname -I | awk '{print $1}')"
echo ""
echo "Next steps:"
echo "1. Edit environment variables: nano $INSTALL_DIR/.env"
echo "2. Rebuild: cd $INSTALL_DIR && npm run build && systemctl reload nginx"
echo "3. Configure Nginx Proxy Manager:"
echo "   - Add Proxy Host"
echo "   - Domain: madsenracing.dk"
echo "   - Forward to: $(hostname -I | awk '{print $1}'):80"
echo "   - Request SSL certificate"
echo "4. Test: http://$(hostname -I | awk '{print $1}')"
echo "5. Update script: /usr/local/bin/update-website.sh"
echo ""
