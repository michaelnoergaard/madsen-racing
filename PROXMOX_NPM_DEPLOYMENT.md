# Proxmox Deployment with Nginx Proxy Manager

**Simplified deployment guide for use with existing Nginx Proxy Manager setup.**

---

## 🎯 Architecture

```
Internet → Nginx Proxy Manager (LXC #1) → Madsen Racing App (LXC #2)
           ↓                                 ↓
           SSL termination                   Static files (HTTP)
           Reverse proxy                     Nginx
           Let's Encrypt
```

**Benefits:**
- ✅ Centralized SSL management via NPM web UI
- ✅ Easy certificate renewal
- ✅ Clean separation: proxy vs application
- ✅ Simple application container (just HTTP)
- ✅ Can manage multiple sites from one NPM instance

---

## 📋 Prerequisites

- ✅ Nginx Proxy Manager already running in an LXC container
- ✅ NPM accessible via web UI (typically http://npm-ip:81)
- ✅ DNS A records pointing to your Proxmox server IP
  - `madsenracing.dk` → Your server IP
  - `www.madsenracing.dk` → Your server IP

---

## 🚀 Part 1: Create Application LXC

### Step 1: Create Container in Proxmox

**Via Proxmox Web UI:**

```
General:
  - CT ID: 101 (or next available)
  - Hostname: madsen-racing-app
  - Password: [set root password]

Template:
  - debian-12-standard

Root Disk:
  - 8 GB

CPU:
  - 1 core

Memory:
  - 512 MB
  - Swap: 512 MB

Network:
  - Bridge: vmbr0
  - IPv4: Static (recommended for NPM)
    Example: 192.168.1.100/24
    Gateway: 192.168.1.1
  - Or use DHCP and note the IP address

Options:
  - ✅ Start at boot
```

**Note the IP address** - you'll need it for NPM configuration.

### Step 2: Start Container

```bash
pct start 101
```

---

## 📋 Part 2: Deploy Application

### Option A: Automated Script (Recommended)

```bash
# Connect to container
pct enter 101  # From Proxmox host
# or
ssh root@192.168.1.100

# Run deployment script
cd /tmp
curl -O https://raw.githubusercontent.com/michaelnoergaard/madsen-racing/main/scripts/deploy-initial-npm.sh
chmod +x deploy-initial-npm.sh
./deploy-initial-npm.sh
```

### Option B: Manual Deployment

```bash
# Update system
apt update && apt upgrade -y

# Install packages
apt install -y nginx git curl nodejs npm

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Clone repository
cd /var/www
git clone https://github.com/michaelnoergaard/madsen-racing.git madsen-racing
cd madsen-racing

# Setup environment
cp .env.example .env
nano .env  # Add Contentful credentials

# Build
npm ci
npm run build

# Configure Nginx (HTTP only)
cat > /etc/nginx/sites-available/madsen-racing << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;

    root /var/www/madsen-racing/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript;

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|webp|avif)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ $uri.html =404;
    }
}
EOF

# Enable site
rm /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/madsen-racing /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
systemctl enable nginx

# Install update script
cp scripts/update-website.sh /usr/local/bin/
chmod +x /usr/local/bin/update-website.sh
```

### Verify Application is Running

```bash
# From the application container
curl http://localhost

# From Proxmox host or another machine
curl http://192.168.1.100

# Should return HTML of the website
```

---

## 📋 Part 3: Configure Nginx Proxy Manager

### Step 1: Access NPM Web UI

Open your browser: `http://your-npm-ip:81`

Default login (if fresh install):
- Email: `admin@example.com`
- Password: `changeme`

### Step 2: Add Proxy Host

1. Click **Hosts** → **Proxy Hosts**
2. Click **Add Proxy Host**

#### Details Tab

```
Domain Names:
  madsenracing.dk
  www.madsenracing.dk

Scheme: http
Forward Hostname / IP: 192.168.1.100  (your app container IP)
Forward Port: 80

☑ Cache Assets
☑ Block Common Exploits
☐ Websockets Support (not needed)
```

#### SSL Tab

```
SSL Certificate: Request a new SSL Certificate

☑ Force SSL
☑ HTTP/2 Support
☑ HSTS Enabled
☑ HSTS Subdomains (if you want)

Email Address for Let's Encrypt: your-email@example.com

☑ I Agree to the Let's Encrypt Terms of Service
```

#### Advanced Tab (Optional but Recommended)

Add security headers:

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;

# Optional: Additional caching for static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|webp|avif)$ {
    proxy_cache_valid 200 1y;
    add_header Cache-Control "public, immutable";
}
```

### Step 3: Save and Test

1. Click **Save**
2. NPM will:
   - Configure the reverse proxy
   - Request SSL certificate from Let's Encrypt
   - Enable auto-renewal

3. Test:
   - `http://madsenracing.dk` → Should redirect to HTTPS
   - `https://madsenracing.dk` → Should load the site with valid SSL
   - `https://www.madsenracing.dk` → Should also work

---

## 📋 Part 4: Updates and Maintenance

### Update Website Content

```bash
# SSH into application container
ssh root@192.168.1.100

# Run update script
/usr/local/bin/update-website.sh
```

The update script will:
1. ✅ Create backup
2. ✅ Pull latest changes from GitHub
3. ✅ Rebuild site
4. ✅ Reload Nginx
5. ✅ Rollback on failure

### Enable Auto-Updates (Optional)

```bash
# In application container
cp /var/www/madsen-racing/scripts/systemd/*.{service,timer} /etc/systemd/system/
cp /var/www/madsen-racing/scripts/webhook-deploy.sh /usr/local/bin/
chmod +x /usr/local/bin/webhook-deploy.sh

systemctl daemon-reload
systemctl enable --now madsen-racing-update.timer

# Check status
systemctl status madsen-racing-update.timer
```

Updates will be checked every 15 minutes automatically.

### Renew SSL Certificate

**Automatic:** NPM handles this automatically!

**Manual (if needed):**
1. Go to NPM UI → **SSL Certificates**
2. Find your certificate
3. Click **...** → **Renew Certificate**

---

## 📋 Part 5: Monitoring

### Application Container

```bash
# Check Nginx status
systemctl status nginx

# View logs
tail -f /var/log/nginx/madsen-racing-access.log
tail -f /var/log/nginx/madsen-racing-error.log

# Check resource usage
free -h
df -h
htop

# Run status check
/var/www/madsen-racing/scripts/status-check.sh
```

### Nginx Proxy Manager

- **Access logs:** NPM UI → Hosts → Your host → View logs
- **SSL status:** NPM UI → SSL Certificates
- **System status:** NPM UI → System

---

## 🔧 Troubleshooting

### Website Returns 502 Bad Gateway

**Cause:** NPM can't reach the application container

**Fix:**
```bash
# 1. Check app container is running
pct status 101

# 2. Check Nginx is running in app container
pct enter 101
systemctl status nginx

# 3. Verify app is responding locally
curl http://localhost

# 4. Check IP address is correct in NPM
ip addr show | grep inet

# 5. Test connectivity from NPM container
# From NPM container:
curl http://192.168.1.100
```

### SSL Certificate Not Working

**Cause:** Let's Encrypt can't verify domain ownership

**Fix:**
1. Verify DNS is correct:
   ```bash
   nslookup madsenracing.dk
   dig madsenracing.dk
   ```
2. Ensure ports 80 and 443 are forwarded to NPM container
3. Check NPM error logs in UI
4. Try requesting certificate again

### Site Loads but Styles Missing

**Cause:** Mixed content (HTTPS page loading HTTP resources)

**Fix:** Verify `SITE_URL` in `.env`:
```bash
# In app container
nano /var/www/madsen-racing/.env

# Should be:
SITE_URL=https://madsenracing.dk

# Rebuild
cd /var/www/madsen-racing
npm run build
systemctl reload nginx
```

### Can't Access NPM Web UI

**Fix:**
```bash
# From Proxmox host
pct enter <npm-container-id>

# Check NPM is running
docker ps  # If using NPM Docker
# or
systemctl status npm  # If installed via package

# Restart NPM
docker restart nginx-proxy-manager
# or
systemctl restart npm
```

---

## 📊 Resource Usage

**Application Container:**
- RAM: 50-150 MB (idle)
- CPU: <1% (idle)
- Disk: ~500 MB
- Network: Minimal

**Total with NPM:**
- NPM Container: ~100-200 MB RAM
- App Container: ~100 MB RAM
- **Total: ~200-350 MB RAM** (very efficient!)

---

## 🎯 Quick Reference Commands

### Application Container

```bash
# Update website
/usr/local/bin/update-website.sh

# View status
/var/www/madsen-racing/scripts/status-check.sh

# Reload Nginx
systemctl reload nginx

# View logs
tail -f /var/log/nginx/madsen-racing-access.log
```

### From Proxmox Host

```bash
# Enter app container
pct enter 101

# Start/stop/restart
pct start 101
pct stop 101
pct restart 101

# Check status
pct status 101

# Create snapshot
pct snapshot 101 pre-update
```

---

## 📚 Advanced: Multiple Sites

With NPM, you can easily host multiple sites:

1. Create additional LXC containers for each site
2. Configure each with its own Nginx
3. Add proxy hosts in NPM for each domain
4. All SSL certificates managed from one place!

**Example:**
- LXC 100: NPM (proxy for everything)
- LXC 101: madsenracing.dk (192.168.1.100:80)
- LXC 102: anotherdomain.com (192.168.1.101:80)
- LXC 103: thirddomain.com (192.168.1.102:80)

All managed via NPM web UI with automatic SSL!

---

## 🎉 Summary

You now have:
- ✅ Lightweight LXC container (~100MB RAM)
- ✅ Simple HTTP server (Nginx)
- ✅ SSL/HTTPS managed by NPM
- ✅ Automatic certificate renewal
- ✅ Easy updates via script
- ✅ Optional auto-updates
- ✅ Clean architecture

**Total setup time: 20-30 minutes**

---

## 📝 Related Documentation

- **AUTOMATION_GUIDE.md** - Auto-update options
- **QUICK_REFERENCE.md** - Command reference
- **PROXMOX_DEPLOYMENT.md** - Alternative without NPM
- **scripts/update-website.sh** - Update script

---

**Questions?** The NPM community is very helpful: https://github.com/NginxProxyManager/nginx-proxy-manager
