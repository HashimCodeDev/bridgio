# Deployment Guide

Production deployment guide for Sign Language Translator.

---

## 📋 Prerequisites

- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)
- Server with:
  - 2+ CPU cores
  - 4GB+ RAM
  - 20GB+ storage
  - Ubuntu 20.04+ / Debian 11+

---

## 🚀 Quick Deploy (Single Server)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install Python 3.13
sudo apt install -y python3 python3-pip python3-venv

# Install uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install system dependencies for OpenCV
sudo apt install -y libgl1-mesa-glx libglib2.0-0

# Install nginx
sudo apt install -y nginx

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Install PM2 for process management
npm install -g pm2
```

### 2. Clone Repository

```bash
cd /var/www
sudo git clone <repository-url> sign-language-translator
sudo chown -R $USER:$USER sign-language-translator
cd sign-language-translator
```

### 3. Build Frontend

```bash
cd frontend
pnpm install
pnpm build
# Output: dist/
```

### 4. Setup Backend

```bash
cd ../backend
pnpm install --production

# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=production
EOF

# Start with PM2
pm2 start server.js --name sign-backend
pm2 save
pm2 startup
```

### 5. Setup ML Server

```bash
cd ../ML

# Install dependencies
uv sync --no-dev

# Create systemd service
sudo tee /etc/systemd/system/sign-ml.service << EOF
[Unit]
Description=Sign Language ML Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/var/www/sign-language-translator/ML
ExecStart=/home/$USER/.local/bin/uv run uvicorn app:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl daemon-reload
sudo systemctl enable sign-ml
sudo systemctl start sign-ml
```

### 6. Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/sign-translator << 'EOF'
# Frontend
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/sign-language-translator/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/sign-translator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Setup SSL

```bash
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

### 8. Update Frontend Config

```bash
# Edit frontend/dist/assets/index-*.js
# Replace http://localhost:3000 with https://api.your-domain.com
```

### 9. Verify Deployment

```bash
# Check services
pm2 status
sudo systemctl status sign-ml

# Check logs
pm2 logs sign-backend
sudo journalctl -u sign-ml -f

# Test endpoints
curl https://api.your-domain.com/health
curl http://localhost:8000/health

# Open browser
# Navigate to https://your-domain.com
```

---

## 🐳 Docker Deployment

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - ML_SERVER_URL=http://ml:8000
    depends_on:
      - ml

  ml:
    build: ./ML
    ports:
      - "8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]  # Optional: for GPU
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm && pnpm install --production
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

### ML Server Dockerfile

```dockerfile
# ML/Dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## ☁️ Cloud Deployment

### AWS (Elastic Beanstalk + SageMaker)

#### Frontend (S3 + CloudFront)

```bash
# Build
cd frontend
pnpm build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name your-bucket-name.s3.amazonaws.com
```

#### Backend (Elastic Beanstalk)

```bash
cd backend
eb init -p node.js-18 sign-backend
eb create sign-backend-env
eb deploy
```

#### ML Server (SageMaker)

```python
# deploy_sagemaker.py
from sagemaker.pytorch import PyTorchModel

model = PyTorchModel(
    model_data='s3://your-bucket/model.tar.gz',
    role='SageMakerRole',
    entry_point='inference.py',
    framework_version='2.0',
    py_version='py310'
)

predictor = model.deploy(
    instance_type='ml.m5.xlarge',
    initial_instance_count=1
)
```

### Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "https://api.your-domain.com"
  }
}
```

### Heroku (Backend)

```bash
cd backend
heroku create sign-backend
git push heroku main
```

```json
// package.json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

---

## 📊 Monitoring Setup

### PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Enable monitoring
pm2 link <secret> <public>
```

### System Monitoring

```bash
# Install Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.0/node_exporter-1.6.0.linux-amd64.tar.gz
tar xvfz node_exporter-*.tar.gz
cd node_exporter-*/
./node_exporter &

# Install Prometheus
# Configure to scrape localhost:9100
```

### Application Monitoring

```javascript
// backend: Add metrics endpoint
import prometheus from 'prom-client';

const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({ register });

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

---

## 🔒 Security Checklist

- [ ] SSL/TLS enabled (HTTPS)
- [ ] Environment variables secured
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Firewall rules set
- [ ] Regular security updates
- [ ] Secrets in environment, not code
- [ ] Database credentials secured (if added)
- [ ] Logs sanitized (no PII)
- [ ] CSP headers configured

### Security Headers (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd frontend && pnpm install && pnpm build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: |
          ssh user@server 'cd /var/www/sign-translator/backend && git pull && pnpm install && pm2 restart sign-backend'

  deploy-ml:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: |
          ssh user@server 'cd /var/www/sign-translator/ML && git pull && sudo systemctl restart sign-ml'
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs sign-backend --lines 100

# Check port
sudo lsof -i :3000

# Restart
pm2 restart sign-backend
```

### ML Server errors
```bash
# Check logs
sudo journalctl -u sign-ml -n 50

# Check Python environment
/home/$USER/.local/bin/uv run python -c "import torch, mediapipe; print('OK')"

# Restart
sudo systemctl restart sign-ml
```

### Nginx errors
```bash
# Test config
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Reload
sudo systemctl reload nginx
```

---

## 📈 Scaling Guide

### Horizontal Scaling

#### Backend (Multiple Instances)

```javascript
// Use Redis for Socket.IO
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

#### ML Server (Load Balancer)

```nginx
upstream ml_backend {
    server localhost:8000;
    server localhost:8001;
    server localhost:8002;
}

server {
    location / {
        proxy_pass http://ml_backend;
    }
}
```

### Vertical Scaling

- Upgrade CPU/RAM
- Add GPU for ML inference
- Use faster storage (SSD)

---

**Last Updated:** January 2026  
**Tested On:** Ubuntu 22.04, Debian 11, Amazon Linux 2
