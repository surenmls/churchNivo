# Production Deployment Guide

## Phase 0 — What's included

- Image upload API (`POST /api/upload`)
- Contact forms with DB storage + optional SMTP email
- Mobile navigation
- SEO meta tags (title, description, Open Graph)
- Production mode: backend serves built frontend + security headers

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Domain + SSL (Let's Encrypt or Cloudflare)
- SMTP credentials (optional but recommended for contact forms)

---

## 1. Environment variables

Copy and edit `backend/.env`:

```env
PORT=1990
NODE_ENV=production

DATABASE_URL=postgresql://USER:PASS@HOST:5432/church_platform

JWT_SECRET=generate-a-long-random-string-min-32-chars
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://yourdomain.com
API_PUBLIC_URL=https://yourdomain.com

BASE_DOMAIN=yourdomain.com

# Email (recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="ChurchNivo <noreply@yourdomain.com>"
PLATFORM_CONTACT_EMAIL=support@yourdomain.com

UPLOAD_MAX_MB=5
UPLOAD_DIR=uploads
```

For multiple frontend origins (staging + prod):

```env
FRONTEND_URL=https://yourdomain.com,https://staging.yourdomain.com
```

---

## 2. Database setup

```bash
npm install
npm run db:migrate
npm run db:seed   # optional — dev/demo only
```

---

## 3. Build & run (single-server mode)

The backend serves the React app in production:

```bash
npm run build
npm run start:prod
```

Or manually:

```bash
npm run build
set NODE_ENV=production   # Windows
# export NODE_ENV=production  # Linux/Mac
npm run start --workspace=backend
```

App available at `http://localhost:1990` (or your configured PORT).

---

## 4. Reverse proxy (recommended)

Use Nginx or Caddy in front of Node:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:1990;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. PM2 process manager

```bash
npm install -g pm2
npm run build
pm2 start backend/src/index.js --name church-platform --env production
pm2 save
pm2 startup
```

---

## 6. Uploads persistence

Uploaded images are stored in `backend/uploads/`. In production:

- Mount a persistent volume at `backend/uploads/`
- Or migrate to S3/Cloudinary in Phase 1+

---

## 7. Health check

```bash
curl https://yourdomain.com/api/health
```

Expected: `{ "status": "ok", "environment": "production", ... }`

---

## 8. Security checklist

- [ ] Strong `JWT_SECRET` (32+ random characters)
- [ ] PostgreSQL not exposed to public internet
- [ ] HTTPS enabled
- [ ] SMTP configured for contact forms
- [ ] `backend/uploads/` backed up
- [ ] `.env` never committed to git

---

## Dev vs Production

| | Development | Production |
|---|-------------|------------|
| Frontend | Vite `:1989` | Served by Express from `frontend/dist` |
| Backend | `:1990` | Same port behind proxy |
| Uploads | `backend/uploads/` | Same — ensure persistence |
| Email | Saved to DB only (unless SMTP set) | DB + email when SMTP configured |
