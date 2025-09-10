# 🚂 Railway Deployment Guide

## Quick Setup

### 1. Create Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init
```

### 2. Configure Environment Variables
In Railway Dashboard → Settings → Environment Variables:

```bash
# Required Variables
NODE_ENV=production
PORT=8080
SESSION_SECRET=your-super-secret-railway-session-key-here

# Database (Railway will provide)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

### 3. Deployment Options

#### Option A: Using railway.json (Recommended)
```bash
# Railway will automatically detect railway.json and use the config
railway up
```

#### Option B: Manual Build Commands
Set in Railway Dashboard → Settings → Build & Deploy:
```bash
# Build Command
npm install --include=dev && npm run build

# Start Command  
npm run start
```

### 4. Database Migration
After deployment, run migration:
```bash
# Option 1: Automatic (via Procfile)
# Railway will auto-run migrations on release

# Option 2: Manual via CLI
railway run npx drizzle-kit push --config=drizzle.railway.config.ts
```

### 5. Admin User Setup
After migration, admin user should be available:
```
Username: admin
Password: admin123
```
Access at: `https://your-app.railway.app/admin/login`

## Configuration Files

### railway.json
- **Build Command**: Installs dev deps + builds
- **Start Command**: Runs production server  
- **Health Check**: Monitors app status

### drizzle.railway.config.ts
- **Clean PostgreSQL config** for Railway
- **No SSL complications** 
- **Simple DATABASE_URL** usage

### Procfile
- **Web Process**: Starts server
- **Release Process**: Runs migrations automatically

## Environment Variables Detail

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Yes | Railway provides (usually 8080) |
| `DATABASE_URL` | Yes | Railway PostgreSQL connection |
| `SESSION_SECRET` | Yes | Secure random string for sessions |

## Troubleshooting

### Build Failures
1. **Vite not found**: Railway.json includes dev deps
2. **Port binding**: Railway sets PORT automatically
3. **Database connection**: Check DATABASE_URL format

### Migration Issues
```bash
# Force migration if needed
railway run npx drizzle-kit push --config=drizzle.railway.config.ts --force
```

### Health Check Failures
- Check PORT environment variable
- Verify server starts on 0.0.0.0:PORT
- Test /health endpoint

## Production URLs

- **Main App**: `https://your-app.railway.app`
- **Admin Panel**: `https://your-app.railway.app/admin/login`
- **API Health**: `https://your-app.railway.app/api/health`