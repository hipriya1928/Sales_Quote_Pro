#!/bin/bash

# Sales Quotation Generator - VPS Deployment Script
# Server: root@72.61.235.82

set -e

echo "================================"
echo "Sales Quotation Generator Deployment"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Install Node.js 20.x
echo -e "${YELLOW}Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installations
echo -e "${GREEN}Node version: $(node -v)${NC}"
echo -e "${GREEN}NPM version: $(npm -v)${NC}"

# Install PM2 globally
echo -e "${YELLOW}Installing PM2...${NC}"
npm install -g pm2

# Install Docker
echo -e "${YELLOW}Installing Docker...${NC}"
apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Start Docker service
systemctl start docker
systemctl enable docker

# Pull and run MongoDB
echo -e "${YELLOW}Setting up MongoDB with Docker...${NC}"
docker pull mongo:7.0
docker run -d \
  --name sales-quotation-mongodb \
  --restart always \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=sales-quotation \
  -v mongodb_data:/data/db \
  mongo:7.0

# Create app directory
echo -e "${YELLOW}Setting up application directory...${NC}"
mkdir -p /var/www/sales-quotation-generator
cd /var/www/sales-quotation-generator

# Clone repository
echo -e "${YELLOW}Cloning repository...${NC}"
if [ -d ".git" ]; then
  git pull origin main
else
  git clone https://github.com/hipriya1928/Sales_Quote_Pro.git .
fi

# Create .env.local file
echo -e "${YELLOW}Creating environment file...${NC}"
cat > .env.local << 'EOF'
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sales-quotation

# App Configuration
NEXT_PUBLIC_APP_NAME=Sales Quotation Generator
NEXT_PUBLIC_APP_URL=http://72.61.235.82:3000
EOF

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build the application
echo -e "${YELLOW}Building application...${NC}"
npm run build

# Start application with PM2
echo -e "${YELLOW}Starting application with PM2...${NC}"
pm2 delete sales-quotation-app 2>/dev/null || true
pm2 start npm --name "sales-quotation-app" -- start
pm2 save
pm2 startup

# Install and configure Nginx
echo -e "${YELLOW}Installing Nginx...${NC}"
apt-get install -y nginx

# Create Nginx configuration
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

# Test and reload Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "Application is running at: ${GREEN}http://72.61.235.82${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check app status"
echo "  pm2 logs                - View app logs"
echo "  pm2 restart all         - Restart app"
echo "  docker ps               - Check MongoDB status"
echo "  systemctl status nginx  - Check Nginx status"
echo ""
echo -e "${YELLOW}Note: Update your domain DNS to point to 72.61.235.82${NC}"
