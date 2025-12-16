# Deployment Guide

This document describes how to deploy the JEE Timetable web application to various platforms.

## Prerequisites

- Node.js 18+ installed
- Built application (`npm run build --workspace apps/web`)
- Backend API server deployed and accessible

## Environment Configuration

### Development

The app runs with mock data by default in development:

```bash
npm run dev --workspace apps/web
```

### Production with Backend

Set the `VITE_API_URL` environment variable:

```bash
VITE_API_URL=https://your-api.com npm run build --workspace apps/web
```

Or create a `.env.production` file in `apps/web/`:

```env
VITE_API_URL=https://your-api.com
```

## GitHub Pages Deployment

### Step 1: Build the Application

```bash
cd /path/to/project
npm run build --workspace apps/web
```

### Step 2: Configure Base Path (if not at root)

If deploying to `https://username.github.io/repo-name/`, update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/repo-name/',
  // ...rest of config
});
```

### Step 3: Deploy

#### Option A: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Web App

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build --workspace apps/web
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./apps/web/dist
```

Add `API_URL` to repository secrets in Settings → Secrets and variables → Actions.

#### Option B: Manual Deployment

```bash
cd apps/web/dist
git init
git add -A
git commit -m 'Deploy'
git push -f git@github.com:username/repo.git main:gh-pages
```

### Step 4: Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` / `root`
4. Save

The site will be available at `https://username.github.io/repo-name/`

## Cloudflare Pages Deployment

### Step 1: Connect Repository

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to Pages → Create a project
3. Connect your Git repository
4. Select your repository and branch

### Step 2: Configure Build Settings

- **Framework preset**: None (or Vite)
- **Build command**: `npm run build --workspace apps/web`
- **Build output directory**: `apps/web/dist`
- **Root directory**: `/` (leave empty)
- **Node version**: 18

### Step 3: Environment Variables

Add in Cloudflare Pages Settings → Environment variables:

```
VITE_API_URL=https://your-api.com
```

### Step 4: Deploy

1. Save settings
2. Cloudflare will automatically build and deploy
3. Site will be available at `https://your-project.pages.dev`

### Custom Domain

1. Go to Pages → your project → Custom domains
2. Add your domain
3. Configure DNS records as instructed

## Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Deploy

```bash
cd /path/to/project/apps/web
vercel
```

Follow the prompts to link/create project.

### Step 3: Configure

Create `vercel.json` in `apps/web/`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api_url"
  }
}
```

Add environment variable:

```bash
vercel env add VITE_API_URL production
```

Enter your API URL when prompted.

### Step 4: Production Deploy

```bash
vercel --prod
```

## Netlify Deployment

### Step 1: Install Netlify CLI

```bash
npm i -g netlify-cli
```

### Step 2: Deploy

```bash
cd /path/to/project/apps/web
netlify deploy
```

Follow the prompts.

### Step 3: Configure

Create `netlify.toml` in `apps/web/`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 4: Production Deploy

```bash
netlify deploy --prod
```

Or connect via Netlify dashboard for automatic deployments.

## Docker Deployment

### Step 1: Create Dockerfile

Create `apps/web/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY apps/web/package.json apps/web/
COPY packages/timetable-sdk/package.json packages/timetable-sdk/

RUN npm install

COPY . .

RUN npm run build --workspace packages/timetable-sdk
RUN npm run build --workspace apps/web

FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create nginx.conf

Create `apps/web/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Step 3: Build and Run

```bash
docker build -t timetable-web -f apps/web/Dockerfile .
docker run -p 80:80 timetable-web
```

### Step 4: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: your-backend-image
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
```

Run:

```bash
docker-compose up -d
```

## AWS S3 + CloudFront

### Step 1: Create S3 Bucket

```bash
aws s3 mb s3://your-bucket-name
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
```

### Step 2: Configure Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### Step 3: Upload Build

```bash
npm run build --workspace apps/web
aws s3 sync apps/web/dist s3://your-bucket-name --delete
```

### Step 4: Create CloudFront Distribution

1. Create distribution pointing to S3 bucket
2. Configure custom domain and SSL certificate
3. Set default root object to `index.html`
4. Create custom error response for 404 → `/index.html` (SPA routing)

## Backend Configuration

Ensure your backend API:

1. **Enables CORS** for your web app domain:
   ```javascript
   app.use(cors({
     origin: 'https://your-app.com',
     credentials: true
   }));
   ```

2. **Configures Socket.IO CORS**:
   ```javascript
   const io = new Server(server, {
     cors: {
       origin: 'https://your-app.com',
       credentials: true
     }
   });
   ```

3. **Serves over HTTPS** (required for PWA features)

## SSL/HTTPS

PWA features (Service Worker, notifications, etc.) require HTTPS in production.

### Free SSL Options

- **Let's Encrypt**: Free, automated SSL certificates
- **Cloudflare**: Free SSL with CDN
- **Netlify/Vercel**: Automatic HTTPS on custom domains
- **GitHub Pages**: Automatic HTTPS

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Login/registration works
- [ ] Schedule data loads
- [ ] Real-time updates work (if backend is connected)
- [ ] Offline mode works (test by going offline after first load)
- [ ] PWA install prompt appears
- [ ] Theme toggle works
- [ ] Sound effects work (after user interaction)
- [ ] Mobile responsive design looks correct
- [ ] Performance is acceptable (check Lighthouse score)

## Monitoring

### Recommended Tools

- **Sentry**: Error tracking
- **Google Analytics**: Usage analytics
- **Lighthouse CI**: Performance monitoring
- **Uptime Robot**: Uptime monitoring

### Example: Adding Sentry

```bash
npm install @sentry/react --workspace apps/web
```

In `main.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});
```

## Troubleshooting

### Build Fails

- Check Node.js version (18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build --workspace apps/web`

### App Won't Connect to Backend

- Verify `VITE_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend is accessible from browser
- Test API directly with curl/Postman

### PWA Not Installing

- Ensure site is served over HTTPS
- Check manifest.json is accessible
- Verify Service Worker registration in DevTools
- Check browser console for errors

### Socket.IO Not Connecting

- Verify WebSocket support in proxy/load balancer
- Check Socket.IO server CORS configuration
- Inspect WebSocket connection in Network tab
- Ensure backend Socket.IO is running

## Rollback

### GitHub Pages

```bash
git checkout gh-pages
git reset --hard <previous-commit-hash>
git push -f origin gh-pages
```

### Cloudflare/Netlify/Vercel

Use platform's rollback feature in dashboard.

### Docker

```bash
docker pull your-image:previous-tag
docker-compose up -d
```

## Support

For deployment issues:
- Check browser console for errors
- Review build logs
- Verify environment variables
- Test locally with `npm run preview`
