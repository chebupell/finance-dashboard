# Finance Dashboard — руководство для AI-агентов

Полнофункциональный личный финансовый дашборд: Angular 21 (frontend) + Express 5 + Prisma + PostgreSQL/Neon (backend).

## Обзор

| Часть | Стек | Порт по умолчанию |
|-------|------|-------------------|
| Frontend | Angular 21, Tailwind CSS 4, Chart.js / ng2-charts | `4200` |
| Backend | Express 5, Prisma 7, JWT, Zod, bcryptjs | `3000` |
| БД | PostgreSQL через Neon (`@prisma/adapter-neon`) | — |

Frontend обращается к API по адресу `http://localhost:3000/api` (см. `src/environment/environment.ts`).

## Структура проекта

```
finance-dashboard/
├── src/                          # Angular-приложение
│   ├── main.ts                   # Точка входа
│   ├── styles.css                # Глобальные стили + Tailwind
│   ├── environment/
│   │   └── environment.ts        # apiUrl
│   └── app/
│       ├── app.ts                # Корневой компонент (Header + Footer + RouterOutlet)
│       ├── app.config.ts         # Провайдеры: router, HttpClient, interceptor
│       ├── app.routes.ts         # Маршруты и guards
│       ├── interceptors/
│       │   └── auth.interceptor.ts
│       ├── services/
│       │   ├── auth.ts           # Регистрация, логин, сессия
│       │   ├── auth-guard.ts     # Защита приватных страниц
│       │   ├── guest-guard.ts    # Редирект авторизованных с login/sign-up
│       │   └── transaction.ts    # CRUD транзакций
│       ├── pages/
│       │   ├── home-page/        # Дашборд: графики, таблица, добавление транзакций
│       │   ├── login-page/
│       │   └── sign-up-page/
│       └── layout/
│           ├── header/           # Навигация, login/sign-up/logout
│           ├── footer/
│           └── sidebar/          # Боковое меню (только на home)
│
├── server/                       # Express API
│   ├── server.ts                 # Запуск сервера (PORT из .env)
│   ├── prisma.config.ts          # Prisma config (DIRECT_URL)
│   ├── prisma/
│   │   ├── schema.prisma         # Модели User, Transaction
│   │   └── migrations/
│   └── src/
│       ├── app.ts                # Express app, CORS, маршруты
│       ├── lib/prisma.ts         # PrismaClient + Neon adapter
│       ├── controllers/          # auth, transaction, user
│       ├── routes/               # /api/auth, /api/transactions, /api/users
│       ├── middleware/           # auth, error handling
│       ├── validators/           # Zod-схемы
│       └── types/                # User, расширение Express Request
│
├── angular.json                  # Конфигурация Angular CLI
├── package.json                  # Скрипты frontend
└── dist/                         # Сборка frontend (генерируется)
```

## Ключевые модули

### Frontend

**Маршрутизация** (`app.routes.ts`):
- `/` — HomePage, защищён `authGuard` (редирект на `/sign-up` если не авторизован)
- `/login`, `/sign-up` — защищены `guestGuard` (редирект на `/` если авторизован)
- `/home` — редирект на `/`

**Auth** (`services/auth.ts`):
- JWT хранится в `localStorage` (если `enableAutoLogin`) или `sessionStorage`
- `loggedIn` — signal, обновляется при login/register/logout
- Методы: `register()`, `login()`, `logout()`, `getUserData()`, `isLoggedIn()`

**Транзакции** (`services/transaction.ts`):
- `getAll()`, `create()`, `delete(id)` — запросы с Bearer-токеном
- Тип: `income` | `expense`

**HomePage** (`pages/home-page/home-page.ts`):
- Загрузка транзакций, summary-карточки (balance, income, expenses, savings)
- Line chart — баланс по месяцам (Chart.js)
- Doughnut chart — расходы по категориям
- Форма добавления транзакции (amount, description, category, type)

**UI-паттерны**:
- Standalone-компоненты, lazy loading через `loadComponent`
- Signals + `computed` + `OnPush` change detection
- Reactive Forms на login/sign-up
- Tailwind CSS 4 (`@import 'tailwindcss'` в `styles.css`)

### Backend

**API-маршруты** (`server/src/app.ts`):
| Prefix | Файл | Описание |
|--------|------|----------|
| `/api/auth` | `authRoutes.ts` | POST `/register`, POST `/login` |
| `/api/transactions` | `transactionRoutes.ts` | GET `/`, POST `/`, DELETE `/:id` (требуют JWT) |
| `/api/users` | `userRoutes.ts` | GET `/`, GET `/:id`, DELETE `/:id` (требуют JWT) |

**Аутентификация**:
- JWT payload: `{ userId: number }`, срок 7 дней
- `auth.middleware.ts` — извлекает `userId` в `req.userId`
- Пароли хешируются bcrypt (10 rounds)

**Валидация** (Zod):
- `auth.validator.ts` — register (name, email, password, confirmPassword, enableAutoLogin), login
- `transaction.validator.ts` — amount > 0, type: `income` | `expense`

**База данных** (`prisma/schema.prisma`):
- `User`: id, name, email (unique), password, enableAutoLogin
- `Transaction`: id, amount, description, category, type, date, userId → User

**Ошибки** (`error.middleware.ts`):
- `AppError` — контролируемые ошибки с statusCode
- Prisma-ошибки → 400
- Dev-режим возвращает `details` в 500-ответах

## Команды

### Frontend (корень проекта)

```bash
npm install          # Установка зависимостей
npm start            # ng serve → http://localhost:4200
npm run build        # Production-сборка в dist/
npm run watch        # Сборка в dev-режиме с watch
npm test             # Unit-тесты (Vitest через ng test)
ng generate component <name>   # Генерация компонента
```

### Backend (`server/`)

```bash
cd server
npm install          # Установка зависимостей
npm run dev          # nodemon + ts-node (hot reload)
npm run build        # prisma generate && tsc
npm start            # build + node dist/server.js
```

### Prisma (из `server/`)

```bash
npx prisma generate              # Генерация клиента
npx prisma migrate dev           # Применить миграции (dev)
npx prisma migrate deploy        # Применить миграции (prod)
npx prisma studio                # GUI для БД
```

### Запуск полного стека

Терминал 1 (backend):
```bash
cd server && npm run dev
```

Терминал 2 (frontend):
```bash
npm start
```

## Переменные окружения

Файл `server/.env` (не коммитится):

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | Connection string для Prisma Neon adapter (runtime) |
| `DIRECT_URL` | Прямое подключение для миграций (`prisma.config.ts`) |
| `JWT_SECRET` | Секрет для подписи JWT |
| `PORT` | Порт сервера (по умолчанию `3000`) |
| `NODE_ENV` | `production` скрывает детали ошибок |

## Соглашения для агентов

1. **Минимальный diff** — не трогать несвязанный код; frontend и backend — отдельные `package.json`.
2. **Стиль Angular** — standalone-компоненты, `inject()`, signals, `OnPush`, lazy routes.
3. **Стиль backend** — контроллеры как static-методы, ошибки через `AppError` + `next(err)`, валидация через Zod middleware.
4. **CORS** — разрешён только `http://localhost:4200`; при смене порта frontend обновить `server/src/app.ts`.
5. **API URL** — при деплое обновить `src/environment/environment.ts`.
6. **Тесты** — frontend: `*.spec.ts` рядом с файлами; backend: тестов пока нет.
7. **Не коммитить** — `server/.env`, `node_modules/`, `dist/`, `.angular/cache/`.

## Известные особенности

- `authGuard` редиректит неавторизованных на `/sign-up`, а не на `/login`.
- OAuth-кнопки (Google, Apple, Facebook) — заглушки (`console.log`).
- `userController.getAll` имеет несоответствие сигнатуры `(res)` вместо `(req, res)` — может вызывать ошибки.
- Категории расходов захардкожены в `home-page.ts`: Labour, Legal, Production, License, Facilities, Taxes, Insurance.
