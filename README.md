# ChowSmart

Restaurant discovery, recipes, breads and intelligent menu planning by **Products and Consumers Technologies Limited (PCTL)**.

Inspired by the [ChowSmart concept site](https://chowsmart-pctl.chessclinique.chatgpt.site/).

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS, Framer Motion, Axios, React Hook Form, Zod, Lucide, `@dnd-kit` |
| Backend | Node.js, Express, TypeScript, Prisma, JWT, bcrypt, Zod, Helmet, CORS, rate limit, Pino |
| Database | PostgreSQL |

## Features

- Restaurant discovery with search, cuisine/city/price/rating filters
- ChowSmart bread collection (5 loaves) with recipe, nutrition, pairings, reference
- Recipe Lab with filters and detail actions
- Menu Studio with drag-and-drop canvas, calorie/cost summary, save & export
- Auth (register/login), profile, favorites
- Admin dashboard with stats and delete controls
- Global search across restaurants, recipes, breads, menu items, cuisines

## Quick start (local)

### Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL)

### Setup

```bash
cp .env.example .env
npm install
npm install --prefix server
npm install --prefix client

# Start Postgres
npm run db:up

# Migrate + seed
cd server
npx prisma migrate dev --name init
npm run prisma:seed
cd ..

# Run API + Vite
npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:5000/api/health  

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@chowsmart.app` | `Admin123!` |
| User | `user@chowsmart.app` | `User1234!` |

## Docker Compose (full stack)

```bash
docker compose up --build
```

Services: `postgres` (5432), `backend` (5000), `frontend` (5173 → nginx).

## Environment

See [.env.example](.env.example):

```
DATABASE_URL=postgresql://chowsmart:chowsmart@localhost:5432/chowsmart?schema=public
JWT_SECRET=...
PORT=5000
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
```

Set `OPENAI_API_KEY` on the server to enable the ChowSmart AI agent. The key is never exposed to the client; without it, `/api/ai/chat` returns a clear configuration error.

## API overview

All responses use `{ success: true, data }` or `{ success: false, error: { message, code } }`.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `login`, `logout`, `GET /me` |
| Restaurants | `GET/POST /api/restaurants`, `GET /:slug`, `PUT/DELETE /:id` |
| Menu items | CRUD under `/api/menu-items` |
| Breads | CRUD under `/api/breads` |
| Recipes | CRUD under `/api/recipes` |
| Menu plans | CRUD under `/api/menu-plans` (auth) |
| Favorites | `GET/POST /api/favorites`, `DELETE /:id` (auth) |
| Search | `GET /api/search?q=` |
| Admin | `GET /api/admin/stats` (admin) |

Admin mutations require `Authorization: Bearer <token>` with `ADMIN` role.

## Project layout

```
client/   React frontend
server/   Express API + Prisma
docker-compose.yml
```

## Testing

```bash
npm run test --prefix server
npm run test --prefix client
```

## Deployment notes

- **Frontend (Netlify):** repo includes `netlify.toml` (`base = client`, `publish = dist`, SPA redirects). Set env `VITE_API_URL` to your live API (e.g. `https://your-api.example.com/api`), then redeploy. Publish dir must be `client/dist` (built output), not the `client` source folder — serving source `index.html` loads `/src/main.tsx` and shows a blank page.
- **Frontend (other hosts):** build with `VITE_API_URL` pointing at your API; deploy `client/dist`.
- **Backend:** deploy `server` to Render / Railway / Fly.io; set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (your Netlify URL).
- **Database:** Neon, Supabase or Railway PostgreSQL; run `npx prisma migrate deploy` and `npm run prisma:seed` once.

## Auth note

Access tokens are stored in `localStorage` for the demo SPA. Prefer httpOnly cookies for production hardening.
