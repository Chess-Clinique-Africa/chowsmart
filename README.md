# ChowSmart

Restaurant discovery and thoughtful menus by **Products and Consumers Technologies Limited (PCTL)**.

Stack: **React (Vite)** · **Node.js (Express)** · **PostgreSQL**

Inspired by the [ChowSmart concept site](https://chowsmart-pctl.chessclinique.chatgpt.site).

## Features

- **Bread collection** — five ChowSmart loaves with recipe, nutrition, pairings and reference tabs
- **Restaurants** — discover Nigerian venues with search and city filters
- **Recipe lab** — kitchen ideas paired with the bread range
- **Menu studio** — AI-assisted menu suggestions saved to PostgreSQL
- **Our story** — brand context for ChowSmart by PCTL

## Quick start

### Prerequisites

- Node.js 20+
- Docker optional (full PostgreSQL). Without Docker, the API uses embedded PostgreSQL via [PGlite](https://pglite.dev/).

### Setup

```bash
cp .env.example .env
npm install
npm install --prefix server
npm install --prefix client
npm run db:seed
```

With Docker Desktop running, set `DATABASE_URL=postgresql://chowsmart:chowsmart@localhost:5432/chowsmart` and `USE_PGLITE=false`, then:

```bash
npm run db:up
npm run db:seed
```

### Run

```bash
npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:4000/api/health  

### Useful scripts

| Command | Description |
|---|---|
| `npm run db:up` | Start PostgreSQL (Docker) |
| `npm run db:seed` | Re-run schema + seed data |
| `npm run db:down` | Stop PostgreSQL (Docker) |
| `npm run dev:client` | Vite only |
| `npm run dev:server` | API only |
## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/breads` | List breads |
| GET | `/api/breads/:slug` | Bread detail (ingredients, steps, nutrition, pairings) |
| GET | `/api/restaurants` | List / search restaurants (`q`, `city`) |
| GET | `/api/recipes` | List recipes |
| GET | `/api/recipes/:slug` | Recipe detail |
| GET | `/api/menus/suggest` | Suggest a menu (`occasion`, `guests`) |
| GET | `/api/menus` | Saved menu plans |
| POST | `/api/menus` | Save a menu plan |

## Project layout

```
client/     React frontend
server/     Express API + seed
server/sql/ PostgreSQL schema
```
