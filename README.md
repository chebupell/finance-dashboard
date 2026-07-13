# Finance Dashboard

A personal finance dashboard for tracking income and expenses with visualizations, financial goals, and JWT authentication.

| Frontend | Backend | Database |
|----------|---------|----------|
| Angular 21 · Tailwind CSS 4 · Chart.js | Express 5 · Prisma 7 · JWT · Zod | PostgreSQL (Neon) |

**Local URLs:** [http://localhost:4200](http://localhost:4200) (UI) · [http://localhost:3000/api](http://localhost:3000/api) (API)

---

## Deploy

| Service | URL |
|---------|-----|
| Frontend (Render) | [https://finance-dashboard-jmlf.onrender.com](https://finance-dashboard-jmlf.onrender.com) |
| API (Render) | [https://finance-dashboard-api-qqwg.onrender.com/api](https://finance-dashboard-api-qqwg.onrender.com/api) |

The production frontend build uses `environment.production.ts` (see `angular.json` → `fileReplacements`). Backend CORS is configured via the `FRONTEND_URL` environment variable.

---

<img width="1907" height="944" alt="{2BAF6834-BA09-4F7A-8631-148E02EEA6A4}" src="https://github.com/user-attachments/assets/905dd1c7-624c-4fef-83c5-48b0ec72ea4c" />
<img width="1920" height="1080" alt="{20B3F542-2327-4C1E-9B57-62F4CC43E3B4}" src="https://github.com/user-attachments/assets/b76f0284-3c85-4508-a1c5-7b96f3141085" />
<img width="1920" height="1080" alt="{8D9AA61F-0F70-40BD-8435-5916BDB4011F}" src="https://github.com/user-attachments/assets/0f8b3df7-f173-4c9d-8bed-40169be29ee2" />
<img width="1920" height="1080" alt="{F8E61B1A-8195-42A3-A0A5-E1B51AF6C1EE}" src="https://github.com/user-attachments/assets/a9431e5c-5dc7-411e-ad98-8cbb0c48ded6" />

## Features

### Authentication & Profile

- Registration and login with JWT session (`localStorage` / `sessionStorage`)
- Profile updates: name, email, password (`PATCH /users/profile`)
- User avatar (stored locally in the browser)
- Route protection via `authGuard` and `guestGuard`

### Dashboard & Transactions

- Summary cards: balance, income, expenses, savings
- Charts: monthly balance trend (line) and expense breakdown by category (doughnut)
- Transaction CRUD: view, add, delete
- Transaction search
- Sidebar navigation: Dashboard · Transactions · Goals · Settings

### Financial Goals

- Create, deposit, withdraw, and delete goals
- Progress bars and summary cards for goals
- Goal data stored in `localStorage` (client-side)

### UI

- Light and dark theme (`Theme` service, `data-theme` on `<html>`)
- EN / RU localization (`Locale` service)
- Client-side validation (Reactive Forms) and server-side validation (Zod)

---

## Quick Start

### Requirements

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/) 11+
- PostgreSQL database (recommended: [Neon](https://neon.tech/))

### 1. Clone & Install

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Environment Setup

Create `server/.env`:

```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
DIRECT_URL="postgresql://user:password@host/db?sslmode=require"
JWT_SECRET="your-secret-key"
PORT=3000
FRONTEND_URL="http://localhost:4200"
NODE_ENV="development"
```

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Runtime connection (Prisma Neon adapter) |
| `DIRECT_URL` | Direct connection for Prisma migrations |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `PORT` | API port (default: `3000`) |
| `FRONTEND_URL` | CORS origin (default: `http://localhost:4200`) |
| `NODE_ENV` | `production` hides error details in 500 responses |

### 3. Database Migrations

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 4. Run

Open two terminals:

```bash
# Terminal 1 — API
cd server
npm run dev
```

```bash
# Terminal 2 — UI
npm start
```

Open [http://localhost:4200](http://localhost:4200).

---

## Scripts

### Frontend (project root)

| Command | Description |
|---------|-------------|
| `npm start` | Dev server on port 4200 |
| `npm run build` | Production build to `dist/` |
| `npm run watch` | Dev build with watch |
| `npm test` | Unit tests (Vitest) |
| `ng generate component <name>` | Generate a component |

### Backend (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload (nodemon + ts-node) |
| `npm run build` | `prisma generate` + TypeScript compilation |
| `npm run render:build` | Render build: install, migrate deploy, tsc |
| `npm start` | Run `dist/server.js` |
| `npm test` | Unit and integration tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

### Prisma (`server/`)

| Command | Description |
|---------|-------------|
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Create and apply migrations (dev) |
| `npx prisma migrate deploy` | Apply migrations (prod) |
| `npx prisma studio` | Web UI for browsing the database |

---

## Project Structure

```
finance-dashboard/
├── src/                          # Angular application
│   ├── app/
│   │   ├── pages/
│   │   │   ├── home-page/        # Dashboard, transactions, goals, settings
│   │   │   │   └── settings-view/
│   │   │   ├── login-page/
│   │   │   └── sign-up-page/
│   │   ├── layout/               # header, footer, sidebar
│   │   ├── services/             # auth, transaction, user, theme, locale, guards
│   │   └── interceptors/         # JWT interceptor
│   └── environment/
│       ├── environment.ts        # apiUrl for dev
│       └── environment.production.ts
│
├── public/                       # Static assets (SPA redirects, theme icons)
│
├── server/                       # Express API
│   ├── src/
│   │   ├── controllers/          # auth, transaction, user
│   │   ├── routes/               # REST routes + *.routes.test.ts
│   │   ├── middleware/           # JWT, error handling + tests
│   │   ├── validators/           # Zod schemas + tests
│   │   └── test/                 # Vitest setup, Prisma mock, helpers
│   ├── vitest.config.ts
│   └── prisma/                   # schema + migrations
│
├── AGENTS.md                     # Context for AI agents (Cursor)
└── README.md
```

---

## API

Base URL: `http://localhost:3000/api` (dev) · `https://finance-dashboard-api-qqwg.onrender.com/api` (prod)

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | — | Register |
| `POST` | `/auth/login` | — | Login |

**Response:** `{ token: string, user: { id, name, email } }`

### Transactions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/transactions` | JWT | List user transactions |
| `POST` | `/transactions` | JWT | Create a transaction |
| `DELETE` | `/transactions/:id` | JWT | Delete a transaction |

**POST body:**

```json
{
  "amount": 1500,
  "description": "Salary",
  "category": "Labour",
  "type": "income"
}
```

`type`: `"income"` | `"expense"`

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PATCH` | `/users/profile` | JWT | Update profile (name, email, password) |
| `GET` | `/users` | JWT | List users |
| `GET` | `/users/:id` | JWT | Get user by ID |
| `DELETE` | `/users/:id` | JWT | Delete user |

---

## Application Routes

| Path | Page | Access |
|------|------|--------|
| `/` | Dashboard (sidebar: dashboard / transactions / goals / settings) | Authenticated only |
| `/login` | Login | Guests only |
| `/sign-up` | Sign up | Guests only |
| `/home` | → redirect to `/` | — |

> Transactions, Goals, and Settings are views inside `HomePage`, switched via the sidebar — not separate URLs.

---

## Tech Stack

**Frontend**

- [Angular 21](https://angular.dev/) — standalone components, signals, lazy routes, OnPush
- [Tailwind CSS 4](https://tailwindcss.com/) — CSS variables for light/dark theme
- [Chart.js](https://www.chartjs.org/) + [ng2-charts](https://github.com/valor-software/ng2-charts)
- [RxJS](https://rxjs.dev/)

**Backend**

- [Express 5](https://expressjs.com/)
- [Prisma 7](https://www.prisma.io/) + [@prisma/adapter-neon](https://www.npmjs.com/package/@prisma/adapter-neon)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — JWT
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — password hashing
- [Zod](https://zod.dev/) — request validation
- [Vitest](https://vitest.dev/) + [Supertest](https://github.com/ladjs/supertest) — API tests

---

## Configuration

| File | Purpose |
|------|---------|
| `src/environment/environment.ts` | API URL for dev |
| `src/environment/environment.production.ts` | API URL for production build |
| `server/.env` | Secrets, database, CORS (`FRONTEND_URL`) |
| `server/src/app.ts` | CORS, request logging |
| `server/prisma/schema.prisma` | `User` and `Transaction` models |
| `public/_redirects` | SPA fallback for static hosting |

On deploy, update `apiUrl` in `environment.production.ts` and `FRONTEND_URL` in the backend environment variables.

---

## Testing

### Frontend (Vitest via Angular CLI)

```bash
npm test
```

Unit tests (`*.spec.ts`) cover: `app`, guards, auth, transaction services, layout components, login/sign-up/home pages.

### Backend (Vitest + Supertest)

```bash
cd server
npm test          # single run
npm run test:watch
```

Tests live next to source as `*.test.ts`. Prisma is mocked via `server/src/test/prisma-mock.ts` — no database required.

| Area | Files |
|------|-------|
| Routes | `auth.routes.test.ts`, `transaction.routes.test.ts`, `user.routes.test.ts` |
| Middleware | `auth.middleware.test.ts`, `error.middleware.test.ts` |
| Validators | `auth.validator.test.ts`, `transaction.validator.test.ts`, `user.validator.test.ts` |

---

## For AI Agents

See [AGENTS.md](./AGENTS.md) for detailed architecture, conventions, and known quirks.

---

## Useful Links

- [Angular CLI](https://angular.dev/tools/cli)
- [Prisma Docs](https://www.prisma.io/docs)
- [Neon Serverless Postgres](https://neon.tech/docs)
