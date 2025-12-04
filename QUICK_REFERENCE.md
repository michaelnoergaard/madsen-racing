# Quick Reference - Madsen Racing Proxmox Deployment

One-page reference for common tasks and commands.

---

## 🚀 Initial Setup (One-Time)

```bash
# 1. Create Debian 12 LXC in Proxmox UI
#    - 1 CPU core, 512MB RAM, 8GB disk
#    - Enable "Start at boot"

# 2. Connect to container
pct enter 100  # From Proxmox host
# or
ssh root@<container-ip>

# 3. Run initial deployment
cd /tmp
git clone https://github.com/michaelnoergaard/madsen-racing.git
cd madsen-racing
chmod +x scripts/*.sh
./scripts/deploy-initial.sh

# 4. Edit environment variables
nano /var/www/madsen-racing/.env
# Add your Contentful credentials

# 5. Rebuild with credentials
cd /var/www/madsen-racing
npm run build
systemctl reload nginx

# 6. Setup SSL (after DNS points to server)
certbot --nginx -d madsenracing.dk -d www.madsenracing.dk

# 7. Setup auto-updates (optional)
cp /var/www/madsen-racing/scripts/systemd/*.{service,timer} /etc/systemd/system/
cp /var/www/madsen-racing/scripts/webhook-deploy.sh /usr/local/bin/
chmod +x /usr/local/bin/webhook-deploy.sh
systemctl daemon-reload
systemctl enable --now madsen-racing-update.timer
```

---

## 🔄 Regular Operations

### Update Website Manually

```bash
ssh root@<your-server>
/usr/local/bin/update-website.sh
```

### Check System Status

```bash
/var/www/madsen-racing/scripts/status-check.sh
```

### View Logs

```bash
# Access logs
tail -f /var/log/nginx/madsen-racing-access.log

# Error logs
tail -f /var/log/nginx/madsen-racing-error.log

# Deployment logs
tail -f /var/log/madsen-racing-deploy.log

# Auto-update service logs
journalctl -u madsen-racing-update.service -f
```

### Control Services

```bash
# Nginx
systemctl status nginx
systemctl reload nginx
systemctl restart nginx

# Auto-updates
systemctl status madsen-racing-update.timer
systemctl start madsen-racing-update.service  # Manual trigger
systemctl stop madsen-racing-update.timer     # Disable
systemctl start madsen-racing-update.timer    # Enable

# Test Nginx config before reload
nginx -t
```

---

## 🛠️ Maintenance Tasks

### Update System Packages (Monthly)

```bash
apt update && apt upgrade -y
```

### Renew SSL Certificate (Automatic)

```bash
# Test renewal
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal

# Check certificate status
certbot certificates
```

### Check Disk Space

```bash
df -h
du -sh /var/www/madsen-racing/*
```

### Check Memory Usage

```bash
free -h
htop  # Interactive view
```

### Clean Old Backups

```bash
# Keep last 5 backups
ls -t /var/backups/madsen-racing/backup-*.tar.gz | tail -n +6 | xargs -r rm
```

---

## 🔧 Troubleshooting

### Website Not Loading

```bash
# 1. Check Nginx is running
systemctl status nginx

# 2. Test configuration
nginx -t

# 3. Check logs for errors
tail -50 /var/log/nginx/madsen-racing-error.log

# 4. Verify files exist
ls -la /var/www/madsen-racing/dist/

# 5. Check permissions
ls -la /var/www/madsen-racing/
```

### Build Fails

```bash
cd /var/www/madsen-racing

# Check Node version
node --version  # Should be 20+

# Check .env file
cat .env

# Try manual build
npm run build

# Check disk space
df -h
```

### Updates Not Working

```bash
# Check timer status
systemctl status madsen-racing-update.timer
systemctl list-timers | grep madsen

# Check service logs
journalctl -u madsen-racing-update.service -n 50

# Try manual update
/usr/local/bin/update-website.sh
```

### SSL Issues

```bash
# Check certificate
certbot certificates

# Check Nginx SSL config
cat /etc/nginx/sites-available/madsen-racing | grep ssl

# Test SSL
curl -I https://madsenracing.dk
```

---

## 📋 File Locations

| Item | Path |
|------|------|
| Website files | `/var/www/madsen-racing/` |
| Built site | `/var/www/madsen-racing/dist/` |
| Nginx config | `/etc/nginx/sites-available/madsen-racing` |
| Environment vars | `/var/www/madsen-racing/.env` |
| Update script | `/usr/local/bin/update-website.sh` |
| Status script | `/var/www/madsen-racing/scripts/status-check.sh` |
| Backups | `/var/backups/madsen-racing/` |
| Access logs | `/var/log/nginx/madsen-racing-access.log` |
| Error logs | `/var/log/nginx/madsen-racing-error.log` |
| Deploy logs | `/var/log/madsen-racing-deploy.log` |
| SSL certs | `/etc/letsencrypt/live/madsenracing.dk/` |

---

## 🔐 Security Checklist

- ✅ SSL certificate installed and auto-renewing
- ✅ Firewall configured (optional with ufw)
- ✅ SSH key authentication (optional but recommended)
- ✅ Nginx security headers enabled
- ✅ Regular system updates
- ✅ Fail2ban installed (optional)

---

## 📊 Resource Usage

**Expected usage for LXC + Nginx setup:**
- **RAM:** 50-150 MB (idle)
- **CPU:** <1% (idle), 10-30% (during build)
- **Disk:** ~500 MB total
- **Network:** Minimal (static site)

---

## 🚨 Emergency Commands

### Rollback to Previous Version

```bash
# List available backups
ls -lh /var/backups/madsen-racing/

# Restore from backup
cd /var/www/madsen-racing
tar -xzf /var/backups/madsen-racing/backup-YYYYMMDD-HHMMSS.tar.gz

# Reload Nginx
systemctl reload nginx
```

### Stop Auto-Updates Immediately

```bash
systemctl stop madsen-racing-update.timer
systemctl disable madsen-racing-update.timer
```

### Force Rebuild

```bash
cd /var/www/madsen-racing
rm -rf dist/ node_modules/
npm ci
npm run build
systemctl reload nginx
```

### Restart Everything

```bash
systemctl restart nginx
systemctl restart madsen-racing-update.timer
# Check if Docker is being used
systemctl restart docker 2>/dev/null || true
```

---

## 📞 Getting Help

### Check System Status

```bash
/var/www/madsen-racing/scripts/status-check.sh
```

### Generate Debug Info

```bash
echo "=== System Info ==="
uname -a
uptime
free -h
df -h

echo -e "\n=== Service Status ==="
systemctl status nginx
systemctl status madsen-racing-update.timer

echo -e "\n=== Recent Logs ==="
journalctl -u nginx -n 20
journalctl -u madsen-racing-update.service -n 20

echo -e "\n=== Git Status ==="
cd /var/www/madsen-racing
git status
git log -n 3
```

---

## 📚 Documentation Files

- **PROXMOX_DEPLOYMENT.md** - Complete deployment guide
- **AUTOMATION_GUIDE.md** - Automation options and setup
- **QUICK_REFERENCE.md** - This file
- **CONTENTFUL_SETUP.md** - Contentful CMS configuration
- **DOCKER_SETUP.md** - Docker deployment (alternative)

---

## ⚡ Most Common Commands

```bash
# Update website
/usr/local/bin/update-website.sh

# Check status
/var/www/madsen-racing/scripts/status-check.sh

# View logs
tail -f /var/log/nginx/madsen-racing-access.log

# Reload Nginx
systemctl reload nginx

# Test Nginx config
nginx -t

# Connect to container (from Proxmox host)
pct enter 100
```

---

**Pro Tip:** Bookmark this page and keep it handy for quick reference!
