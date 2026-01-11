#!/bin/bash

#############################################
# Website Update Script
# Run this to update the website when you
# push changes to GitHub
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="/var/www/madsen-racing"
BRANCH="main"  # Change if using different branch
BACKUP_DIR="/var/backups/madsen-racing"

echo "=========================================="
echo "Madsen Racing - Website Update"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Check if directory exists
if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${RED}Error: Installation directory not found: $INSTALL_DIR${NC}"
    exit 1
fi

cd "$INSTALL_DIR"

echo -e "${BLUE}Current status:${NC}"
git status --short
echo ""

echo -e "${YELLOW}Step 1/6: Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP_FILE" dist/ .env 2>/dev/null || true
echo "Backup created: $BACKUP_FILE"

# Keep only last 5 backups
echo "Cleaning old backups (keeping last 5)..."
ls -t "$BACKUP_DIR"/backup-*.tar.gz | tail -n +6 | xargs -r rm
echo ""

echo -e "${YELLOW}Step 2/6: Pulling latest changes from GitHub...${NC}"
git fetch origin
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/$BRANCH)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo -e "${GREEN}Already up to date! No changes detected.${NC}"
    echo "Local:  $LOCAL_COMMIT"
    echo "Remote: $REMOTE_COMMIT"
    echo ""
    echo -e "${BLUE}Checking for dependency updates...${NC}"
else
    echo "Changes detected:"
    echo "Local:  $LOCAL_COMMIT"
    echo "Remote: $REMOTE_COMMIT"
    echo ""
    git log --oneline HEAD..origin/$BRANCH
    echo ""

    # Stash any local changes (shouldn't be any, but just in case)
    if ! git diff-index --quiet HEAD --; then
        echo "Stashing local changes..."
        git stash
    fi

    git pull origin $BRANCH
    echo -e "${GREEN}✓ Code updated${NC}"
fi
echo ""

echo -e "${YELLOW}Step 3/6: Checking for dependency changes...${NC}"
if git diff --name-only HEAD@{1} HEAD 2>/dev/null | grep -q "package-lock.json\|package.json"; then
    echo "Dependencies changed, running npm ci..."
    npm ci --production=false
    echo -e "${GREEN}✓ Dependencies updated${NC}"
else
    echo "No dependency changes detected, skipping npm install"
fi
echo ""

echo -e "${YELLOW}Step 4/6: Rebuilding website...${NC}"
BUILD_START=$(date +%s)
npm run build
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))
echo -e "${GREEN}✓ Build completed in ${BUILD_TIME}s${NC}"
echo ""

echo -e "${YELLOW}Step 5/6: Verifying build...${NC}"
if [ ! -d "$INSTALL_DIR/dist" ] || [ -z "$(ls -A $INSTALL_DIR/dist)" ]; then
    echo -e "${RED}Error: Build directory is empty or doesn't exist!${NC}"
    echo "Rolling back from backup..."
    tar -xzf "$BACKUP_FILE" -C "$INSTALL_DIR"
    exit 1
fi

if [ ! -f "$INSTALL_DIR/dist/index.html" ]; then
    echo -e "${RED}Error: index.html not found in build!${NC}"
    echo "Rolling back from backup..."
    tar -xzf "$BACKUP_FILE" -C "$INSTALL_DIR"
    exit 1
fi

echo -e "${GREEN}✓ Build verified${NC}"
echo ""

echo -e "${YELLOW}Step 6/6: Reloading Nginx...${NC}"
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo -e "${RED}Error: Nginx configuration test failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✓ Website updated successfully!"
echo "==========================================${NC}"
echo ""
echo "Deployment summary:"
echo "  • Backup: $BACKUP_FILE"
echo "  • Build time: ${BUILD_TIME}s"
echo "  • Commit: $(git rev-parse --short HEAD)"
echo "  • Branch: $(git branch --show-current)"
echo "  • Updated: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "View logs: tail -f /var/log/nginx/madsen-racing-access.log"
echo ""
