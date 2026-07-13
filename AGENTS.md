# Finance Dashboard — AI Agent Guide

Full-featured personal finance dashboard: Angular 21 (frontend) + Express 5 + Prisma + PostgreSQL/Neon (backend).

## Overview

| Part | Stack | Default Port |
| ------ | ------ | ------------------- |
| Frontend | Angular 21, Tailwind CSS 4, Chart.js / ng2-charts | `4200` |
| Backend | Express 5, Prisma 7, JWT, Zod, bcryptjs, Vitest + Supertest | `3000` |
| Database | PostgreSQL via Neon (`@prisma/adapter-neon`) | — |

The frontend calls the API at `http://localhost:3000/api` in dev (see `src/environment/environment.ts`). Production uses `environment.production.ts` (see `angular.json` → `fileReplacements`).

**Deployed:** Frontend on Render · API at `https://finance-dashboard-api-qqwg.onrender.com/api`

## Project Structure

```text
finance-dashboard/
├── src/                          # Angular application
│   ├── main.ts                   # Entry point
│   ├── styles.css                # Global styles + Tailwind
│   ├── environment/
│   │   ├── environment.ts        # apiUrl (dev)
│   │   └── environment.production.ts
│   └── app/
│       ├── app.ts                # Root component (Header + Footer + RouterOutlet)
│       ├── app.config.ts         # Providers: router, HttpClient, interceptor
│       ├── app.routes.ts         # Routes and guards
│       ├── interceptors/
│       │   └── auth.interceptor.ts
│       ├── services/
│       │   ├── auth.ts           # Register, login, session
│       │   ├── user.ts           # Profile updates
│       │   ├── transaction.ts    # Transaction CRUD
│       │   ├── theme.ts          # Light/dark theme
│       │   ├── locale.ts         # EN / RU localization
│       │   ├── auth-guard.ts     # Protect private pages
│       │   └── guest-guard.ts    # Redirect authenticated users from login/sign-up
│       ├── pages/
│       │   ├── home-page/        # Dashboard, transactions, goals, settings (sidebar views)
│       │   │   └── settings-view/
│       │   ├── login-page/
│       │   └── sign-up-page/
│       └── layout/
│           ├── header/           # Navigation, login/sign-up/logout
│           ├── footer/
│           └── sidebar/          # Side menu (home page only)
│
├── public/                       # Static assets (SPA redirects, theme icons)
│
├── server/                       # Express API
│   ├── server.ts                 # Server bootstrap (PORT from .env)
│   ├── prisma.config.ts          # Prisma config (DIRECT_URL)
│   ├── vitest.config.ts
│   ├── prisma/
│   │   ├── schema.prisma         # User, Transaction models
│   │   └── migrations/
│   └── src/
│       ├── app.ts                # Express app, CORS, routes, request logging
│       ├── lib/prisma.ts         # PrismaClient + Neon adapter
│       ├── controllers/          # auth, transaction, user
│       ├── routes/               # /api/auth, /api/transactions, /api/users + *.routes.test.ts
│       ├── middleware/           # auth, error handling + tests
│       ├── validators/           # Zod schemas + tests
│       ├── test/                 # Vitest setup, Prisma mock, helpers
│       └── types/                # User, Express Request extension
│
├── angular.json                  # Angular CLI configuration
├── package.json                  # Frontend scripts
└── dist/                         # Frontend build output (generated)
```

## Key Modules

### Frontend

**Routing** (`app.routes.ts`):

- `/` — HomePage, protected by `authGuard` (redirects to `/sign-up` if not authenticated)
- `/login`, `/sign-up` — protected by `guestGuard` (redirect to `/` if authenticated)
- `/home` — redirect to `/`

Transactions, Goals, and Settings are **views inside HomePage**, switched via the sidebar — not separate URLs.

**Auth** (`services/auth.ts`):

- JWT stored in `localStorage` (if `enableAutoLogin`) or `sessionStorage`
- `loggedIn` — signal, updated on login/register/logout
- Methods: `register()`, `login()`, `logout()`, `getUserData()`, `isLoggedIn()`

**User profile** (`services/user.ts`):

- `updateProfile()` — `PATCH /users/profile` (name, email, password)

**Transactions** (`services/transaction.ts`):

- `getAll()`, `create()`, `delete(id)` — requests with Bearer token
- Type: `income` | `expense`

**HomePage** (`pages/home-page/home-page.ts`):

- Summary cards: balance, income, expenses, savings
- Line chart — balance by month (Chart.js)
- Doughnut chart — expenses by category
- Transaction form (amount, description, category, type) and search
- Financial goals — create, deposit, withdraw, delete; stored in `localStorage`
- Settings view — profile, theme, locale, avatar (avatar stored locally in the browser)

**UI patterns**:

- Standalone components, lazy loading via `loadComponent`
- Signals + `computed` + OnPush change detection
- Reactive Forms on login/sign-up
- Tailwind CSS 4 (`@import 'tailwindcss'` in `styles.css`)
- Light/dark theme via `Theme` service (`data-theme` on `<html>`)
- EN / RU localization via `Locale` service

### Backend

**API routes** (`server/src/app.ts`):

| Prefix | File | Description |
| -------- | ------ | ---------- |
| `/api/auth` | `authRoutes.ts` | POST `/register`, POST `/login` |
| `/api/transactions` | `transactionRoutes.ts` | GET `/`, POST `/`, DELETE `/:id` (JWT required) |
| `/api/users` | `userRoutes.ts` | PATCH `/profile`, GET `/`, GET `/:id`, DELETE `/:id` (JWT required) |

**Authentication**:

- JWT payload: `{ userId: number }`, 7-day expiry
- `auth.middleware.ts` — extracts `userId` into `req.userId`
- Passwords hashed with bcrypt (10 rounds)

**Validation** (Zod):

- `auth.validator.ts` — register (name, email, password, confirmPassword, enableAutoLogin), login
- `transaction.validator.ts` — amount > 0, type: `income` | `expense`
- `user.validator.ts` — profile update (name, email, currentPassword, newPassword)

**Database** (`prisma/schema.prisma`):

- `User`: id, name, email (unique), password, enableAutoLogin
- `Transaction`: id, amount, description, category, type, date, userId → User

**Errors** (`error.middleware.ts`):

- `AppError` — controlled errors with statusCode
- Prisma errors → 400
- Dev mode returns `details` in 500 responses

## Commands

### Frontend (project root)

```bash
npm install          # Install dependencies
npm start            # ng serve → http://localhost:4200
npm run build        # Production build to dist/
npm run watch        # Dev build with watch
npm test             # Unit tests (Vitest via ng test)
ng generate component <name>   # Generate a component
```

### Backend (`server/`)

```bash
cd server
npm install          # Install dependencies
npm run dev          # nodemon + ts-node (hot reload)
npm run build        # prisma generate && tsc
npm run render:build # Render deploy: install, migrate deploy, tsc
npm start            # node dist/server.js
npm test             # Unit and integration tests (Vitest)
npm run test:watch   # Tests in watch mode
```

### Prisma (from `server/`)

```bash
npx prisma generate              # Generate client
npx prisma migrate dev           # Apply migrations (dev)
npx prisma migrate deploy        # Apply migrations (prod)
npx prisma studio                # Database GUI
```

### Full stack

Terminal 1 (backend):

```bash
cd server && npm run dev
```

Terminal 2 (frontend):

```bash
npm start
```

## Environment Variables

File `server/.env` (not committed):

| Variable | Purpose |
| ------------ | ------------ |
| `DATABASE_URL` | Connection string for Prisma Neon adapter (runtime) |
| `DIRECT_URL` | Direct connection for migrations (`prisma.config.ts`) |
| `JWT_SECRET` | Secret for signing JWT |
| `PORT` | Server port (default `3000`) |
| `FRONTEND_URL` | CORS origin (default `http://localhost:4200`) |
| `NODE_ENV` | `production` hides error details |

On deploy, update `apiUrl` in `environment.production.ts` and `FRONTEND_URL` in the backend environment.

## Testing

### Frontend

```bash
npm test
```

Unit tests (`*.spec.ts`) next to source: app, guards, auth, transaction services, layout components, login/sign-up/home pages.

### Backend

```bash
cd server
npm test
npm run test:watch
```

Tests live next to source as `*.test.ts`. Prisma is mocked via `server/src/test/prisma-mock.ts` — no database required.

| Area | Files |
|------|-------|
| Routes | `auth.routes.test.ts`, `transaction.routes.test.ts`, `user.routes.test.ts` |
| Middleware | `auth.middleware.test.ts`, `error.middleware.test.ts` |
| Validators | `auth.validator.test.ts`, `transaction.validator.test.ts`, `user.validator.test.ts` |

## Agent Conventions

1. **Minimal diff** — do not touch unrelated code; frontend and backend have separate `package.json` files.
2. **Angular style** — standalone components, `inject()`, signals, OnPush, lazy routes.
3. **Backend style** — controllers as static methods, errors via `AppError` + `next(err)`, validation via Zod middleware.
4. **CORS** — configured via `FRONTEND_URL` in `server/src/app.ts` (default `http://localhost:4200`); update when changing the frontend port or deploy URL.
5. **API URL** — update `src/environment/environment.ts` (dev) and `environment.production.ts` (prod) on deploy.
6. **Tests** — frontend: `*.spec.ts` next to files; backend: `*.test.ts` next to files, use existing Prisma mock.
7. **Do not commit** — `server/.env`, `node_modules/`, `dist/`, `.angular/cache/`.

## Known Quirks

- `authGuard` redirects unauthenticated users to `/sign-up`, not `/login`.
- OAuth buttons (Google, Apple, Facebook) are stubs (`console.log`).
- Expense categories are hardcoded in `home-page.ts`: Labour, Legal, Production, License, Facilities, Taxes, Insurance.
- Financial goals are client-side only (`localStorage`); not persisted to the API.
- User avatar is stored locally in the browser, not on the server.

## Writing Code

Before adding code:

1. Skip anything not required by the task.
2. Reuse existing project code before creating new code.
3. Prefer the standard library, platform APIs, and existing dependencies.
4. Make the smallest clear change that works.
5. Do not add abstractions, dependencies, refactors, or features unless required.
6. Inspect and edit only relevant files.
7. Stop after the requested result is verified.
