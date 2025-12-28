# VPS Deployment Guide - Hostinger

Deploy Sales Quotation Generator to your VPS at `72.61.235.82`

## Quick Deployment (Automated)

### Option 1: Run Deployment Script

1. **Copy the deployment script to your VPS:**
```bash
scp deploy.sh root@72.61.235.82:/root/
```

2. **SSH into your VPS:**
```bash
ssh root@72.61.235.82
```

3. **Run the deployment script:**
```bash
chmod +x /root/deploy.sh
bash /root/deploy.sh
```

The script will automatically:
- Install Node.js, Docker, PM2, Nginx
- Setup MongoDB in Docker
- Clone your GitHub repository
- Install dependencies and build the app
- Configure Nginx as reverse proxy
- Start the app with PM2

**Your app will be live at:** http://72.61.235.82

---

## Manual Deployment (Step by Step)

### Step 1: Connect to VPS
```bash
ssh root@72.61.235.82
```

### Step 2: Update System
```bash
apt-get update && apt-get upgrade -y
```

### Step 3: Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v  # Verify installation
npm -v
```

### Step 4: Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### Step 5: Install Docker
```bash
apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io
systemctl start docker
systemctl enable docker
```

### Step 6: Setup MongoDB with Docker
```bash
docker pull mongo:7.0
docker run -d \
  --name sales-quotation-mongodb \
  --restart always \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=sales-quotation \
  -v mongodb_data:/data/db \
  mongo:7.0

# Verify MongoDB is running
docker ps
```

### Step 7: Clone Your Repository
```bash
mkdir -p /var/www/sales-quotation-generator
cd /var/www/sales-quotation-generator
git clone https://github.com/hipriya1928/Sales_Quote_Pro.git .
```

### Step 8: Create Environment File
```bash
cat > .env.local << 'EOF'
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sales-quotation

# App Configuration
NEXT_PUBLIC_APP_NAME=Sales Quotation Generator
NEXT_PUBLIC_APP_URL=http://72.61.235.82:3000
EOF
```

### Step 9: Install Dependencies and Build
```bash
npm install
npm run build
```

### Step 10: Start App with PM2
```bash
pm2 start npm --name "sales-quotation-app" -- start
pm2 save
pm2 startup
# Copy and run the command that PM2 shows
```

### Step 11: Install and Configure Nginx
```bash
apt-get install -y nginx

# Create Nginx config
cat > /etc/nginx/sites-available/sales-quotation << 'NGINX_EOF'
server {
    listen 80;
    server_name 72.61.235.82;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_EOF

# Enable site
ln -sf /etc/nginx/sites-available/sales-quotation /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### Step 12: Configure Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### Step 13: Verify Deployment
```bash
pm2 status
docker ps
systemctl status nginx
curl http://localhost:3000
```

**Your app is now live at:** http://72.61.235.82

---

## Post-Deployment

### Monitor Application
```bash
# View PM2 status
pm2 status

# View logs
pm2 logs sales-quotation-app

# Restart app
pm2 restart sales-quotation-app

# Stop app
pm2 stop sales-quotation-app
```

### Monitor MongoDB
```bash
# Check MongoDB status
docker ps

# View MongoDB logs
docker logs sales-quotation-mongodb

# Access MongoDB shell
docker exec -it sales-quotation-mongodb mongosh sales-quotation
```

### Update Application
```bash
cd /var/www/sales-quotation-generator
git pull origin main
npm install
npm run build
pm2 restart sales-quotation-app
```

---

## Setup Custom Domain (Optional)

### Step 1: Update DNS
Point your domain to: `72.61.235.82`
- A record: `@` → `72.61.235.82`
- A record: `www` → `72.61.235.82`

### Step 2: Update Nginx Config
```bash
nano /etc/nginx/sites-available/sales-quotation
# Change: server_name 72.61.235.82;
# To:     server_name yourdomain.com www.yourdomain.com;

nginx -t
systemctl reload nginx
```

### Step 3: Install SSL Certificate (Let's Encrypt)
```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Follow the prompts
# Auto-renewal is enabled
```

---

## Troubleshooting

### App won't start
```bash
pm2 logs sales-quotation-app
pm2 restart sales-quotation-app
```

### MongoDB issues
```bash
docker logs sales-quotation-mongodb
docker restart sales-quotation-mongodb
```

### Nginx issues
```bash
systemctl status nginx
nginx -t
tail -f /var/log/nginx/error.log
```

### Port conflicts
```bash
netstat -tlnp | grep :3000
netstat -tlnp | grep :27017
```

---

## Security Recommendations

1. **Change SSH port** (from 22 to something else)
2. **Disable root login** (create sudo user)
3. **Setup SSH keys** (disable password login)
4. **Regular updates**:
   ```bash
   apt-get update && apt-get upgrade -y
   ```
5. **Setup automatic backups** for MongoDB

---

## Backup MongoDB

### Manual Backup
```bash
docker exec sales-quotation-mongodb mongodump --out /backup
docker cp sales-quotation-mongodb:/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Restore Backup
```bash
docker cp ./mongodb-backup-YYYYMMDD sales-quotation-mongodb:/backup
docker exec sales-quotation-mongodb mongorestore /backup
```

---

## Performance Optimization

1. **Enable Nginx caching**
2. **Setup CDN** for static assets
3. **Compress responses** (gzip)
4. **Monitor resources**:
   ```bash
   htop
   df -h
   free -m
   ```

---

## Support

For issues, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/error.log`
- System logs: `journalctl -xe`
