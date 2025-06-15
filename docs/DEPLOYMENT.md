
# PromptVault Deployment Guide

## 🚀 Deployment Options

PromptVault can be deployed on various platforms. This guide covers the most popular options with step-by-step instructions.

## 📋 Prerequisites

Before deploying, ensure you have:
- A Supabase project set up with all required tables and policies
- Environment variables ready
- The application built and tested locally

## 🌐 Vercel Deployment (Recommended)

Vercel provides the best experience for React applications with automatic deployments and excellent performance.

### 1. Prepare Your Repository
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# ? Set up and deploy "~/promptvault"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? promptvault
# ? In which directory is your code located? ./
```

### 3. Environment Variables
In the Vercel dashboard, go to Project Settings > Environment Variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Domain Configuration
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 5. Automatic Deployments
Vercel automatically deploys when you push to your main branch. To deploy other branches:

```bash
# Deploy preview branch
git checkout -b feature/new-feature
git push origin feature/new-feature
# Vercel will create a preview deployment
```

## 🟦 Netlify Deployment

### 1. Netlify Dashboard Deployment
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" > "Import an existing project"
3. Choose your Git provider and repository
4. Configure build settings:
   - **Branch**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 2. Environment Variables
In Site Settings > Environment Variables:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Netlify CLI Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### 4. Custom Headers (Optional)
Create `public/_headers` for security headers:
```
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

## ☁️ DigitalOcean App Platform

### 1. Create App Spec
Create `.do/app.yaml`:
```yaml
name: promptvault
services:
- name: web
  source_dir: /
  github:
    repo: your-username/promptvault
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: VITE_SUPABASE_URL
    value: your_supabase_project_url
  - key: VITE_SUPABASE_ANON_KEY
    value: your_supabase_anon_key
  http_port: 8080
  routes:
  - path: /
static_sites:
- name: web
  source_dir: /dist
  github:
    repo: your-username/promptvault
    branch: main
  build_command: npm run build
```

### 2. Deploy via CLI
```bash
# Install doctl
# Follow: https://docs.digitalocean.com/reference/doctl/how-to/install/

# Create app
doctl apps create .do/app.yaml

# Or deploy via dashboard at cloud.digitalocean.com
```

## 🐳 Docker Deployment

### 1. Create Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. Create nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
}
```

### 3. Build and Run
```bash
# Build Docker image
docker build -t promptvault .

# Run container
docker run -p 80:80 promptvault

# Or with docker-compose
```

### 4. Docker Compose
```yaml
version: '3.8'
services:
  promptvault:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=your_supabase_project_url
      - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔥 Firebase Hosting

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase
```bash
firebase init hosting

# Choose:
# - Use an existing project or create new
# - Public directory: dist
# - Configure as SPA: Yes
# - Automatic builds and deploys with GitHub: Yes (optional)
```

### 3. Configure firebase.json
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 4. Deploy
```bash
# Build the project
npm run build

# Deploy
firebase deploy
```

## 🌊 AWS S3 + CloudFront

### 1. Create S3 Bucket
```bash
# Install AWS CLI
# Configure: aws configure

# Create bucket
aws s3 mb s3://your-promptvault-bucket

# Enable static website hosting
aws s3 website s3://your-promptvault-bucket \
  --index-document index.html \
  --error-document index.html
```

### 2. Build and Upload
```bash
# Build project
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-promptvault-bucket --delete

# Make public
aws s3api put-bucket-policy \
  --bucket your-promptvault-bucket \
  --policy file://bucket-policy.json
```

### 3. Bucket Policy (bucket-policy.json)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-promptvault-bucket/*"
    }
  ]
}
```

### 4. CloudFront Distribution
1. Go to AWS CloudFront console
2. Create distribution
3. Origin domain: your S3 bucket website endpoint
4. Configure caching and security headers

## 🔧 Custom Server Deployment

### 1. VPS Setup (Ubuntu)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 2. Application Setup
```bash
# Clone repository
git clone https://github.com/your-username/promptvault.git
cd promptvault

# Install dependencies
npm install

# Build application
npm run build

# Set up PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### 3. PM2 Configuration (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'promptvault',
    script: 'npx',
    args: 'serve -s dist -l 3000',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      VITE_SUPABASE_URL: 'your_supabase_project_url',
      VITE_SUPABASE_ANON_KEY: 'your_supabase_anon_key'
    }
  }]
};
```

### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔍 Monitoring and Observability

### 1. Application Monitoring
```javascript
// Add to your application
// Error tracking with Sentry
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', navigation.loadEventEnd - navigation.loadEventStart);
  });
}
```

### 2. Uptime Monitoring
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring with alerting
- **StatusPage**: Public status page for users

### 3. Analytics
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit sensitive data to version control
- Use platform-specific secret management
- Rotate keys regularly

### 2. HTTPS Configuration
- Always use HTTPS in production
- Configure security headers
- Use HSTS (HTTP Strict Transport Security)

### 3. Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://supabase.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://supabase.com;">
```

## 📊 Performance Optimization

### 1. Build Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
```

### 2. CDN Configuration
- Use CDN for static assets
- Configure proper cache headers
- Enable compression (gzip/brotli)

### 3. Image Optimization
```typescript
// Optimize images
const optimizedImageUrl = `${imageUrl}?width=400&quality=80&format=webp`;
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🧪 Testing in Production

### 1. Smoke Tests
```bash
# Test critical paths after deployment
curl -f https://your-domain.com/health || exit 1
```

### 2. Database Connectivity
```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('prompts').select('count').limit(1);
    if (error) throw error;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});
```

## 📋 Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Database connectivity confirmed
- [ ] All features functional
- [ ] Performance acceptable
- [ ] SSL certificate valid
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] Domain configured correctly
- [ ] Analytics tracking working

## 🆘 Troubleshooting

### Common Issues
1. **Build Failures**: Check node version and dependencies
2. **Environment Variables**: Verify all required vars are set
3. **Database Connection**: Check Supabase URL and keys
4. **CORS Issues**: Configure allowed origins in Supabase
5. **404 Errors**: Ensure SPA routing is configured

### Rollback Strategy
```bash
# Vercel rollback
vercel --prod rollback

# Manual rollback
git revert HEAD
git push origin main
```

---

**Congratulations!** Your PromptVault application is now deployed and running in production. Monitor the application closely in the first few days to ensure everything is working correctly.
