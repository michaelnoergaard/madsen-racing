#!/bin/bash

#############################################
# Webhook Handler for Automatic Deployments
# Optional: Set up GitHub webhook to trigger
# automatic deployments on push
#############################################

# This script can be called via a simple webhook listener
# or cron job to check for updates periodically

set -e

# Configuration
INSTALL_DIR="/var/www/madsen-racing"
LOG_FILE="/var/log/madsen-racing-deploy.log"
LOCK_FILE="/tmp/madsen-racing-deploy.lock"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Prevent concurrent deployments
if [ -f "$LOCK_FILE" ]; then
    log "ERROR: Another deployment is already running"
    exit 1
fi

# Create lock file
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

log "=========================================="
log "Automatic deployment triggered"
log "=========================================="

cd "$INSTALL_DIR"

# Check for updates
git fetch origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "No updates available, skipping deployment"
    exit 0
fi

log "Updates detected, starting deployment..."

# Run the update script
/usr/local/bin/update-website.sh >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    log "Deployment completed successfully"

    # Optional: Send notification (uncomment if you have a notification system)
    # curl -X POST https://your-notification-webhook.com \
    #   -d '{"text":"Madsen Racing website updated successfully"}'
else
    log "ERROR: Deployment failed"

    # Optional: Send error notification
    # curl -X POST https://your-notification-webhook.com \
    #   -d '{"text":"ERROR: Madsen Racing deployment failed"}'

    exit 1
fi

log "=========================================="
