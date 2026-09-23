# ChurchNivo

A production-ready MVP for a multi-tenant church platform — **Find your church. Grow your faith.** Churches share one PostgreSQL database, separated by `church_id`, with domain/subdomain-based church resolution.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, React Router, Tailwind CSS |
| Backend | Node.js, Express, PostgreSQL |
| Auth | JWT + bcrypt |
| UI | Landinger-inspired public pages, Gull-inspired admin panels |

## Project Structure

```
project-root/
├── frontend/          # React + Vite SPA
├── backend/           # Express REST API
├── package.json       # Monorepo root scripts
└── README.md
```

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+

## Phase 0 Features (Current)

- **Mobile navigation** — hamburger menu on public site
- **Image upload** — church logos, banners, pastor photos (`POST /api/upload`)
- **Contact forms** — platform + church pages, saved to DB + optional SMTP email
- **SEO meta tags** — dynamic title, description, Open Graph per page
- **Production mode** — `npm run build && npm run start:prod` serves frontend from backend

See [DEPLOY.md](./DEPLOY.md) for full production deployment guide.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend (optional — defaults work with Vite proxy)
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` and set your PostgreSQL connection:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/church_platform
JWT_SECRET=your-long-random-secret
```

### 3. Create database

```bash
createdb church_platform
```

Or via psql:

```sql
CREATE DATABASE church_platform;
```

### 4. Run migrations and seed data

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start development servers

```bash
npm run dev
```

- **Frontend:** http://localhost:1989
- **Backend API:** http://localhost:1990/api
- **Health check:** http://localhost:1990/api/health

## Test Accounts

All accounts use password: `password123`

| Role | Email | Access |
|------|-------|--------|
| Super Admin | admin@churchplatform.com | `/admin/login` |
| Church Admin | admin@gracecommunity.org | `/church-admin/login` |
| Church Admin | admin@newlifefellowship.org | `/church-admin/login` |

## Routes

### Public
- `/` — Homepage (promotions, events, featured churches)
- `/churches` — Church directory
- `/events` — Approved platform events
- `/media` — Approved media library
- `/contact` — Contact form
- `/login` — User login

### Church Pages
- `/church/:slug` — Church home
- `/church/:slug/about`
- `/church/:slug/events`
- `/church/:slug/media`
- `/church/:slug/contact`

### Super Admin
- `/admin/login`
- `/admin/dashboard`
- `/admin/churches`
- `/admin/promotions`
- `/admin/events`

### Church Admin
- `/church-admin/login`
- `/church-admin/dashboard`
- `/church-admin/events`
- `/church-admin/media`
- `/church-admin/settings`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/register` | — | Register user |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/churches` | — | List churches |
| GET | `/api/churches/featured` | — | Featured churches |
| GET | `/api/churches/:slug` | — | Church by slug |
| POST | `/api/churches` | super_admin | Create church |
| PUT | `/api/churches/:id` | admin | Update church |
| GET | `/api/events/approved` | — | Approved events |
| GET | `/api/events/church/:id` | — | Church events |
| POST | `/api/events` | admin | Create event |
| PATCH | `/api/events/:id/approve` | super_admin | Approve event |
| GET | `/api/media/approved` | — | Approved media |
| GET | `/api/media/church/:id` | — | Church media |
| POST | `/api/media` | admin | Create media |
| PATCH | `/api/media/:id/approve` | super_admin | Approve media |
| GET | `/api/promotions` | — | List promotions |
| POST | `/api/promotions` | admin | Create promotion |
| PATCH | `/api/promotions/:id/approve` | super_admin | Approve promotion |
| POST | `/api/contact/platform` | — | Platform contact form |
| POST | `/api/contact/church/:slug` | — | Church contact form |
| POST | `/api/upload` | admin | Upload image (logo, banner, pastor) |

## Multi-Tenant Architecture

- Single PostgreSQL database
- All tenant data scoped by `church_id`
- Church resolution via:
  - URL slug (`/church/grace-community`)
  - Subdomain (`grace-community.yourdomain.com`)
  - `X-Church-Slug` header (development)

## Security

- Password hashing with bcrypt (12 rounds)
- JWT authentication with role-based access
- Parameterized SQL queries (SQL injection prevention)
- Input validation via express-validator
- Protected admin routes on frontend and backend

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend |
| `npm run dev:frontend` | Frontend only |
| `npm run dev:backend` | Backend only |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed sample data |

## Sample Churches (after seed)

| Church | Slug | URL |
|--------|------|-----|
| Grace Community Church | grace-community | `/church/grace-community` |
| New Life Fellowship | new-life-fellowship | `/church/new-life-fellowship` |
| St. Mark Cathedral | st-mark-cathedral | `/church/st-mark-cathedral` |

## Production Notes

1. Set strong `JWT_SECRET` in production
2. Configure `FRONTEND_URL` for CORS
3. Set `BASE_DOMAIN` for subdomain resolution
4. Use SSL for PostgreSQL in production
5. Replace ThemeForest template placeholders with licensed Landinger/Gull assets when ready

## License

Private — MVP starter scaffold.
