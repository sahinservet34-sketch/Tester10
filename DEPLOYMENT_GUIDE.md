# Digital Ocean App Platform Deployment Guide

## 🚀 Supano's Sports Bar - Deployment Rehberi

### Ön Gereksinimler

1. **Digital Ocean Hesabı**
2. **GitHub Repository** (public veya private)
3. **PostgreSQL Database** (Digital Ocean Managed Database)

---

## 📋 Gerekli Environment Variables

### Zorunlu Değişkenler:

| Variable Name | Açıklama | Örnek Değer |
|---------------|----------|-------------|
| `DATABASE_URL` | PostgreSQL bağlantı string'i | `postgresql://user:pass@host:5432/dbname` |
| `SESSION_SECRET` | Express session için güvenlik anahtarı | `your-super-secret-key-here` |
| `NODE_ENV` | Çalışma ortamı | `production` |
| `PORT` | Uygulama port numarası | `8080` |

---

## 🔧 Deployment Adımları

### 1. GitHub Repository Hazırlama

```bash
# Repository'yi klonla
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Değişiklikleri commit et
git add .
git commit -m "Deploy için hazırlandı"
git push origin main
```

### 2. Digital Ocean App Platform'da App Oluşturma

1. **Digital Ocean Dashboard** → **Apps** → **Create App**
2. **Source**: GitHub repository seç
3. **Repository**: Proje repository'sini seç
4. **Branch**: `main` seç
5. **Autodeploy**: Aktif et

### 3. App Configuration

#### Build & Run Settings:
- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **Output Directory**: `dist`
- **Environment**: Node.js
- **HTTP Port**: `8080`

#### Environment Variables:
```
NODE_ENV=production
PORT=8080
SESSION_SECRET=your-super-secret-session-key
DATABASE_URL=${db.DATABASE_URL}
```

### 4. Database Setup

#### Option 1: Digital Ocean Managed Database
1. **Create Database** → **PostgreSQL 15**
2. **Name**: `supanos-db`
3. **Plan**: Development ($15/month) veya Production
4. **Region**: App ile aynı region

#### Option 2: External Database (Supabase, Neon, vs.)
```bash
# Example Supabase URL format:
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### 5. Database Migration

App deploy edildikten sonra, console'dan migration çalıştır:

```bash
# Digital Ocean App Console'dan
npm run db:push
```

---

## 📁 Gerekli Dosya Yapısı

Deploy öncesi proje yapısı şöyle olmalı:

```
├── .do/
│   └── app.yaml              # Digital Ocean config
├── client/                   # React frontend
├── server/                   # Express backend  
├── shared/                   # Shared types/schemas
├── public/                   # Static files
├── package.json              # Dependencies & scripts
├── Dockerfile               # Container config (optional)
├── scripts/
│   └── migrate.js           # Migration script
└── DEPLOYMENT_GUIDE.md      # Bu rehber
```

---

## 🔍 Deployment Sonrası Kontroller

### 1. Health Check
```bash
curl https://your-app-name.ondigitalocean.app/api/health
```

### 2. Database Connection
```bash
curl https://your-app-name.ondigitalocean.app/api/settings
```

### 3. Frontend Loading
Browser'da ana sayfayı ziyaret et: `https://your-app-name.ondigitalocean.app`

---

## 🚨 Troubleshooting

### Problem: Build Fails
```bash
# Solution: Check build logs
# Ensure all dependencies are in package.json dependencies (not devDependencies)
```

### Problem: Database Connection Error
```bash
# Check DATABASE_URL format
# Ensure database is accessible from Digital Ocean
# Verify firewall rules
```

### Problem: App Crashes
```bash
# Check runtime logs in Digital Ocean console
# Verify all environment variables are set
# Check memory/CPU limits
```

---

## 💰 Maliyet Tahmini

### Digital Ocean App Platform:
- **Basic Plan**: $5/month (Starter)
- **Professional Plan**: $12/month (Production)

### Database:
- **Development DB**: $15/month
- **Production DB**: $60/month

### Total: ~$17-72/month

---

## 🔒 Güvenlik Notları

1. **Session Secret**: Güçlü bir secret key kullan
2. **Database**: Güçlü şifre ve restricted access
3. **HTTPS**: Digital Ocean otomatik SSL sağlıyor
4. **Admin Credentials**: Production'da mutlaka değiştir

---

## 📞 Deploy Sonrası

### Admin Panel Erişimi:
- URL: `https://your-app-name.ondigitalocean.app/admin/login`
- Username: `admin`
- Password: `admin123` (⚠️ ÜRETİMDE DEĞİŞTİR!)

### First Time Setup:
1. Admin panele giriş yap
2. Menu kategorileri ve öğeleri ekle
3. Event'ler oluştur
4. Ayarları yapılandır

---

## 🔄 Güncelleme Süreci

```bash
# Code değişikliği yap
git add .
git commit -m "Update: açıklama"
git push origin main

# Digital Ocean otomatik deploy edecek
```

Bu rehber ile Supano's Sports Bar uygulamanızı Digital Ocean'da başarıyla deploy edebilirsiniz! 🎉