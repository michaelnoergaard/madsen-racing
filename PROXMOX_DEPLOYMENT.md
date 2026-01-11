# Proxmox Deployment Guide - Madsen Racing Website

This guide covers deploying the Madsen Racing static website on Proxmox with optimal resource usage and easy maintenance.

---

## 🎯 Recommendation: LXC Container + Debian + Nginx

**Why LXC over VM?**
- ✅ **10-20x less memory** (50-100MB vs 512MB+ for VM)
- ✅ **Near-zero overhead** (shares host kernel)
- ✅ **Instant boot** (1-2 seconds vs 20-30 seconds)
- ✅ **Perfect for static sites** (no need for full virtualization)
- ✅ **Easy snapshots & backups**
- ❌ Only downside: Linux-only (not an issue here)

**Why Debian over Alpine?**
- ✅ **More familiar** for system administration
- ✅ **Better documentation** and community support
- ✅ **APT package manager** (easier than apk)
- ✅ **Still very lightweight** (Debian 12 minimal ~150MB RAM)
- ✅ **Long-term stability** (5 years support)
- Alpine is 30MB lighter but can have glibc compatibility issues

**Why Direct Nginx over Docker?**
- ✅ **Simpler architecture** (no Docker daemon overhead)
- ✅ **Less memory** (~5MB vs ~100MB with Docker)
- ✅ **Easier troubleshooting** (direct file access)
- ✅ **Faster cold starts**
- ✅ **Easier log management**
- Docker makes sense for complex apps, but overkill for static files

---

## 📋 Part 1: Create LXC Container in Proxmox

### Step 1: Download Debian Template

In Proxmox web UI:
1. Select your storage node → **local** → **CT Templates**
2. Click **Templates** button
3. Download: **debian-12-standard**

### Step 2: Create LXC Container

```bash
# Via Proxmox UI (recommended):
# 1. Click "Create CT" button
# 2. Configure:

General:
  - Node: [your node]
  - CT ID: 100 (or next available)
  - Hostname: madsen-racing
  - Password: [set root password]
  - SSH public key: [optional, recommended]

Template:
  - Storage: local
  - Template: debian-12-standard

Root Disk:
  - Storage: local-lvm
  - Disk size: 8 GB (plenty for static site)

CPU:
  - Cores: 1 (sufficient for static site)

Memory:
  - Memory (MiB): 512
  - Swap (MiB): 512

Network:
  - Bridge: vmbr0
  - IPv4: DHCP or Static (your choice)
  - IPv6: auto (or disable)
  - Firewall: yes

DNS:
  - Use host settings: yes
```

**Important LXC Settings:**
- ✅ **Enable "Nesting"** if you want Docker later: Container → Options → Features → Nesting
- ✅ **Enable "Start at boot"**: Options → Start at boot

### Step 3: Start Container

```bash
# Via UI: Select container → Start
# Or via shell:
pct start 100
```

---

## 📋 Part 2: Initial Container Setup

### Connect to Container

```bash
# From Proxmox host:
pct enter 100

# Or via SSH (after setting up):
ssh root@<container-ip>
```

### Update System

```bash
apt update && apt upgrade -y
```

### Install Required Packages

```bash
# Essential packages
apt install -y \
  nginx \
  git \
  curl \
  wget \
  unzip \
  nano \
  htop \
  certbot \
  python3-certbot-nginx

# Optional but useful
apt install -y \
  sudo \
  ufw \
  fail2ban \
  logrotate
```

### Install Node.js (for building)

```bash
# Install Node.js 20 LTS (required for building Astro)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x
npm --version
```

### Create Non-Root User (Optional but Recommended)

```bash
# Create deployment user
useradd -m -s /bin/bash deploy
passwd deploy

# Add to sudo group
usermod -aG sudo deploy

# Set up SSH for deploy user (optional)
su - deploy
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# Add your public key to ~/.ssh/authorized_keys
```

---

## 📋 Part 3: Set Up the Website

### Option A: Manual Deployment (Simple)

```bash
# Create web directory
mkdir -p /var/www/madsen-racing
cd /var/www/madsen-racing

# Clone repository
git clone https://github.com/michaelnoergaard/madsen-racing.git .

# Install dependencies
npm ci --production=false

# Create .env file with Contentful credentials
cat > .env << 'EOF'
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_token
CONTENTFUL_PREVIEW_TOKEN=your_preview_token
SITE_URL=https://madsenracing.dk
EOF

# Build the site
npm run build

# The static files are now in /var/www/madsen-racing/dist
```

### Option B: Automated Deployment Script

I'll create this script in the next step.

---

## 📋 Part 4: Configure Nginx

### Basic Nginx Configuration

```bash
# Remove default site
rm /etc/nginx/sites-enabled/default

# Create new site configuration
nano /etc/nginx/sites-available/madsen-racing
```

**Paste this configuration:**

```nginx
# /etc/nginx/sites-available/madsen-racing

server {
    listen 80;
    listen [::]:80;
    server_name madsenracing.dk www.madsenracing.dk;

    # Root directory (Astro build output)
    root /var/www/madsen-racing/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

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

    # Main location block
    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Custom error pages (optional)
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    # Logging
    access_log /var/log/nginx/madsen-racing-access.log;
    error_log /var/log/nginx/madsen-racing-error.log;
}
```

### Enable Site

```bash
# Create symlink to enable site
ln -s /etc/nginx/sites-available/madsen-racing /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Enable Nginx to start on boot
systemctl enable nginx
```

---

## 📋 Part 5: Set Up SSL with Let's Encrypt

```bash
# Make sure your domain points to your Proxmox IP
# Then run Certbot:
certbot --nginx -d madsenracing.dk -d www.madsenracing.dk

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect HTTP to HTTPS (recommended)

# Certbot will automatically modify your Nginx config and set up auto-renewal
```

**Verify Auto-Renewal:**

```bash
# Test renewal process
certbot renew --dry-run

# Check renewal timer
systemctl status certbot.timer
```

---

## 📋 Part 6: Deployment Automation

### Create Deployment Script

```bash
nano /usr/local/bin/deploy-madsen-racing.sh
```

**Script content (see next section for the actual script)**

### Create Update Script

For easy updates when you push changes to GitHub.

---

## 📋 Part 7: Security Hardening (Optional)

### Configure Firewall (UFW)

```bash
# Enable UFW
ufw default deny incoming
ufw default allow outgoing

# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
```

### Configure Fail2Ban (Optional)

```bash
# Fail2ban is already installed
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 📋 Part 8: Monitoring & Maintenance

### Check Website Status

```bash
# Test Nginx configuration
nginx -t

# Check Nginx status
systemctl status nginx

# View access logs
tail -f /var/log/nginx/madsen-racing-access.log

# View error logs
tail -f /var/log/nginx/madsen-racing-error.log

# Check disk usage
df -h

# Check memory usage
free -h

# Monitor processes
htop
```

### Regular Maintenance Tasks

```bash
# Update system packages (monthly)
apt update && apt upgrade -y

# Renew SSL certificates (automatic via certbot.timer)
certbot renew

# Clean up old logs (handled by logrotate)
logrotate -f /etc/logrotate.conf
```

---

## 📋 Part 9: Backup Strategy

### LXC Container Backup (via Proxmox)

```bash
# From Proxmox host, create backup:
vzdump 100 --compress zstd --mode snapshot --storage local

# Or via UI: Datacenter → Backup → Create backup job
# Schedule: Daily at 2 AM
# Retention: Keep last 7 backups
```

### Manual Website Backup

```bash
# Backup script for website files
tar -czf /root/madsen-racing-backup-$(date +%Y%m%d).tar.gz \
  /var/www/madsen-racing/dist \
  /etc/nginx/sites-available/madsen-racing \
  /var/www/madsen-racing/.env

# Copy to external storage
# scp to NAS or backup server
```

---

## 🚀 Part 10: Deployment Workflow

### Initial Deployment

1. Create LXC container in Proxmox
2. Install packages (Nginx, Node.js, Git)
3. Clone repository and build site
4. Configure Nginx
5. Set up SSL with Certbot
6. Configure firewall (optional)

### Regular Updates

**When you make changes to the website:**

```bash
# SSH into container
ssh root@<container-ip>

# Run update script (we'll create this)
/usr/local/bin/update-website.sh
```

**The update script will:**
1. Pull latest changes from GitHub
2. Install any new dependencies
3. Rebuild the site
4. Reload Nginx if needed

---

## 📊 Resource Usage (Expected)

**LXC Container with Nginx:**
- **RAM:** 50-150 MB (idle)
- **CPU:** <1% (idle)
- **Disk:** ~500 MB (including Node.js & dependencies)
- **Boot time:** 2-3 seconds

**For comparison, Docker approach would use:**
- RAM: 150-250 MB (with Docker daemon)
- Disk: ~800 MB (with Docker layers)

---

## 🔧 Troubleshooting

### Website Not Loading

```bash
# Check Nginx is running
systemctl status nginx

# Check for errors
nginx -t
journalctl -u nginx -n 50

# Check permissions
ls -la /var/www/madsen-racing/dist
```

### SSL Certificate Issues

```bash
# Check certificate status
certbot certificates

# Force renewal
certbot renew --force-renewal

# Check Nginx SSL config
cat /etc/nginx/sites-available/madsen-racing | grep ssl
```

### Build Failures

```bash
# Check Node.js version
node --version  # Should be 18+

# Check disk space
df -h

# Check build logs
cd /var/www/madsen-racing
npm run build
```

---

## 📝 Quick Reference Commands

```bash
# Start/stop Nginx
systemctl start nginx
systemctl stop nginx
systemctl reload nginx

# Update website
cd /var/www/madsen-racing
git pull
npm ci
npm run build
systemctl reload nginx

# View logs
tail -f /var/log/nginx/madsen-racing-access.log
tail -f /var/log/nginx/madsen-racing-error.log

# Check resource usage
htop
free -h
df -h

# LXC management (from Proxmox host)
pct start 100
pct stop 100
pct enter 100
pct snapshot 100 pre-update
```

---

## 🎯 Next Steps

After completing this guide, you'll have:
- ✅ Lightweight LXC container (~100MB RAM)
- ✅ Nginx serving optimized static files
- ✅ SSL/HTTPS with auto-renewal
- ✅ Simple update workflow
- ✅ Production-ready setup

**Total setup time:** 30-45 minutes

Would you like me to create the automation scripts for deployment and updates?
