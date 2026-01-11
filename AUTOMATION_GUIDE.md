# Automation Guide - Madsen Racing Website

This guide covers automated deployment and update strategies for your Proxmox-hosted website.

---

## 📋 Available Automation Options

### Option 1: Manual Updates (Simplest)
**Best for:** Low-frequency updates, full control

```bash
ssh root@your-server
/usr/local/bin/update-website.sh
```

**Pros:**
- ✅ Complete control over deployment timing
- ✅ No additional services needed
- ✅ Easy to troubleshoot

**Cons:**
- ❌ Requires manual SSH access
- ❌ Must remember to update after pushing code

---

### Option 2: Scheduled Auto-Updates (Recommended)
**Best for:** Regular updates without manual intervention

Uses systemd timer to check for updates every 15 minutes (configurable).

#### Setup Instructions

```bash
# 1. Copy systemd files
cp /var/www/madsen-racing/scripts/systemd/*.service /etc/systemd/system/
cp /var/www/madsen-racing/scripts/systemd/*.timer /etc/systemd/system/

# 2. Copy webhook script
cp /var/www/madsen-racing/scripts/webhook-deploy.sh /usr/local/bin/
chmod +x /usr/local/bin/webhook-deploy.sh

# 3. Reload systemd
systemctl daemon-reload

# 4. Enable and start timer
systemctl enable madsen-racing-update.timer
systemctl start madsen-racing-update.timer

# 5. Check status
systemctl status madsen-racing-update.timer
systemctl list-timers | grep madsen
```

#### Verify It's Working

```bash
# View logs
journalctl -u madsen-racing-update.service -f

# Or check the log file
tail -f /var/log/madsen-racing-deploy.log

# Manually trigger (for testing)
systemctl start madsen-racing-update.service
```

#### Adjust Schedule

Edit the timer file to change frequency:

```bash
nano /etc/systemd/system/madsen-racing-update.timer
```

**Common schedules:**

```ini
# Every 15 minutes (default)
OnUnitActiveSec=15min

# Every hour
OnCalendar=hourly

# Every 6 hours
OnCalendar=*-*-* 00,06,12,18:00:00

# Once daily at 3 AM
OnCalendar=03:00

# Twice daily (8am and 8pm)
OnCalendar=08,20:00
```

After editing:

```bash
systemctl daemon-reload
systemctl restart madsen-racing-update.timer
```

**Pros:**
- ✅ Fully automated
- ✅ No external dependencies
- ✅ Runs in background
- ✅ Easy to configure

**Cons:**
- ❌ Not instant (delay based on schedule)
- ❌ Updates even if no changes detected (minimal overhead)

---

### Option 3: GitHub Webhook (Instant Updates)
**Best for:** Immediate updates after pushing to GitHub

Requires a simple webhook listener service.

#### Setup with webhook-receiver (Simple Go Binary)

```bash
# 1. Install webhook-receiver
wget https://github.com/adnanh/webhook/releases/download/2.8.1/webhook-linux-amd64.tar.gz
tar -xzf webhook-linux-amd64.tar.gz
mv webhook-linux-amd64/webhook /usr/local/bin/
chmod +x /usr/local/bin/webhook

# 2. Create webhook configuration
mkdir -p /etc/webhook
nano /etc/webhook/hooks.json
```

**Webhook configuration:**

```json
[
  {
    "id": "madsen-racing-deploy",
    "execute-command": "/usr/local/bin/webhook-deploy.sh",
    "command-working-directory": "/var/www/madsen-racing",
    "response-message": "Deployment triggered",
    "trigger-rule": {
      "match": {
        "type": "payload-hmac-sha256",
        "secret": "your-secret-key-here",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature-256"
        }
      }
    }
  }
]
```

**Create systemd service for webhook:**

```bash
nano /etc/systemd/system/webhook.service
```

```ini
[Unit]
Description=Webhook Receiver for Madsen Racing
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/webhook -hooks /etc/webhook/hooks.json -verbose -port 9000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start:**

```bash
systemctl daemon-reload
systemctl enable webhook
systemctl start webhook
systemctl status webhook
```

#### Configure GitHub Webhook

1. Go to your GitHub repository: https://github.com/michaelnoergaard/madsen-racing
2. Navigate to **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL:** `http://your-server-ip:9000/hooks/madsen-racing-deploy`
   - **Content type:** `application/json`
   - **Secret:** Same as in hooks.json
   - **Events:** Just the push event
   - **Active:** ✅

#### Security: Use Nginx Reverse Proxy with SSL

```bash
nano /etc/nginx/sites-available/webhook
```

```nginx
server {
    listen 443 ssl http2;
    server_name webhook.madsenracing.dk;

    ssl_certificate /etc/letsencrypt/live/madsenracing.dk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/madsenracing.dk/privkey.pem;

    location /hooks/ {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/webhook /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Then use `https://webhook.madsenracing.dk/hooks/madsen-racing-deploy` in GitHub.

**Pros:**
- ✅ Instant updates on push
- ✅ No polling/checking needed
- ✅ GitHub-native integration

**Cons:**
- ❌ Requires open port (or reverse proxy)
- ❌ More complex setup
- ❌ Potential security considerations

---

### Option 4: GitHub Actions with SSH Deploy
**Best for:** Complex CI/CD pipelines, testing before deploy

Update your `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Proxmox

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build website
        env:
          CONTENTFUL_SPACE_ID: ${{ secrets.CONTENTFUL_SPACE_ID }}
          CONTENTFUL_ACCESS_TOKEN: ${{ secrets.CONTENTFUL_ACCESS_TOKEN }}
          CONTENTFUL_PREVIEW_TOKEN: ${{ secrets.CONTENTFUL_PREVIEW_TOKEN }}
          SITE_URL: https://madsenracing.dk
        run: npm run build

      - name: Deploy to Proxmox via SSH
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.PROXMOX_HOST }}
          username: ${{ secrets.PROXMOX_USER }}
          key: ${{ secrets.PROXMOX_SSH_KEY }}
          source: "dist/*"
          target: "/var/www/madsen-racing/"
          strip_components: 0

      - name: Reload Nginx
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROXMOX_HOST }}
          username: ${{ secrets.PROXMOX_USER }}
          key: ${{ secrets.PROXMOX_SSH_KEY }}
          script: |
            systemctl reload nginx
```

**Required GitHub Secrets:**
- `PROXMOX_HOST` - Your server IP
- `PROXMOX_USER` - SSH user (root or deploy)
- `PROXMOX_SSH_KEY` - Private SSH key

**Pros:**
- ✅ Build happens in GitHub (saves server resources)
- ✅ Can add tests before deployment
- ✅ Deployment history in GitHub Actions

**Cons:**
- ❌ Requires SSH key setup
- ❌ Uses GitHub Actions minutes
- ❌ More complex configuration

---

## 🎯 Recommendation Matrix

| Scenario | Best Option | Setup Time |
|----------|-------------|------------|
| Personal site, infrequent updates | Manual (Option 1) | 0 min |
| Regular updates, prefer automated | Scheduled (Option 2) | 5 min |
| Want instant updates, tech-savvy | Webhook (Option 3) | 15 min |
| Complex pipeline, testing needed | GitHub Actions (Option 4) | 20 min |

---

## 📊 Comparison

| Feature | Manual | Scheduled | Webhook | GitHub Actions |
|---------|--------|-----------|---------|----------------|
| Setup Complexity | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Update Speed | Manual | 1-15 min | Instant | 2-5 min |
| Server Load | None | Minimal | Minimal | None (builds remotely) |
| Reliability | 100% | 99.9% | 95% | 98% |
| Troubleshooting | Easy | Easy | Medium | Medium |
| Security | High | High | Medium | High |

---

## 🔧 Maintenance Commands

### Check Auto-Update Status

```bash
# If using systemd timer
systemctl status madsen-racing-update.timer
journalctl -u madsen-racing-update.service -n 50

# If using webhook
systemctl status webhook
journalctl -u webhook -f

# Check deployment logs
tail -f /var/log/madsen-racing-deploy.log
```

### Disable Auto-Updates

```bash
# Stop and disable timer
systemctl stop madsen-racing-update.timer
systemctl disable madsen-racing-update.timer

# Or stop webhook
systemctl stop webhook
systemctl disable webhook
```

### Re-enable Auto-Updates

```bash
# Enable timer
systemctl enable madsen-racing-update.timer
systemctl start madsen-racing-update.timer

# Or webhook
systemctl enable webhook
systemctl start webhook
```

### Manual Deployment Override

```bash
# Force update regardless of automation
/usr/local/bin/update-website.sh
```

---

## 🚨 Troubleshooting

### Updates Not Triggering

```bash
# Check timer status
systemctl list-timers | grep madsen
systemctl status madsen-racing-update.timer

# Check service logs
journalctl -u madsen-racing-update.service --since "1 hour ago"

# Check deployment log
tail -50 /var/log/madsen-racing-deploy.log
```

### Webhook Not Receiving Requests

```bash
# Check webhook is running
systemctl status webhook

# Check if port is open
netstat -tlnp | grep 9000

# Test locally
curl -X POST http://localhost:9000/hooks/madsen-racing-deploy
```

### Deployment Fails

```bash
# Check disk space
df -h

# Check build logs
cd /var/www/madsen-racing
npm run build

# Check Nginx config
nginx -t

# Check file permissions
ls -la /var/www/madsen-racing/dist
```

---

## 📝 Rollback Procedure

If an automated deployment breaks the site:

```bash
# 1. Check available backups
ls -lh /var/backups/madsen-racing/

# 2. Restore from latest backup
cd /var/www/madsen-racing
tar -xzf /var/backups/madsen-racing/backup-YYYYMMDD-HHMMSS.tar.gz

# 3. Reload Nginx
systemctl reload nginx

# 4. Investigate what went wrong
git log -n 5
journalctl -u madsen-racing-update.service -n 50
```

---

## 🎯 Recommended Setup

For most users, I recommend **Option 2 (Scheduled Auto-Updates)**:

```bash
# Quick setup (5 minutes):
cp /var/www/madsen-racing/scripts/systemd/*.{service,timer} /etc/systemd/system/
cp /var/www/madsen-racing/scripts/webhook-deploy.sh /usr/local/bin/
chmod +x /usr/local/bin/webhook-deploy.sh
systemctl daemon-reload
systemctl enable --now madsen-racing-update.timer
```

**Result:** Website automatically checks for updates every 15 minutes and deploys when changes are detected. Zero maintenance required.

---

## 📚 Related Documentation

- **PROXMOX_DEPLOYMENT.md** - Initial server setup
- **scripts/update-website.sh** - Manual update script
- **scripts/webhook-deploy.sh** - Automation wrapper
- **.github/workflows/deploy.yml** - GitHub Actions workflow

---

**Questions?** Check the troubleshooting section or review the deployment logs.
