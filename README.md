# Finance Dashboard

Личный финансовый дашборд для учёта доходов и расходов с визуализацией, финансовыми целями и JWT-аутентификацией.

| Frontend | Backend | База данных |
|----------|---------|-------------|
| Angular 21 · Tailwind CSS 4 · Chart.js | Express 5 · Prisma 7 · JWT · Zod | PostgreSQL (Neon) |

**Локальные адреса:** [http://localhost:4200](http://localhost:4200) (UI) · [http://localhost:3000/api](http://localhost:3000/api) (API)

---

## Deploy

| Сервис | URL |
|--------|-----|
| Frontend (Render) | [https://finance-dashboard-jmlf.onrender.com](https://finance-dashboard-jmlf.onrender.com) |
| API (Render) | [https://finance-dashboard-api-qqwg.onrender.com/api](https://finance-dashboard-api-qqwg.onrender.com/api) |

Production-сборка frontend подставляет `environment.production.ts` (см. `angular.json` → `fileReplacements`). CORS на backend настраивается через переменную `FRONTEND_URL`.

---

## Возможности

### Аутентификация и профиль

- Регистрация и вход с JWT-сессией (`localStorage` / `sessionStorage`)
- Обновление профиля: имя, email, пароль (`PATCH /users/profile`)
- Аватар пользователя (хранится локально в браузере)
- Защита маршрутов через `authGuard` и `guestGuard`

### Дашборд и транзакции

- Карточки сводки: баланс, доходы, расходы, сбережения
- Графики: динамика баланса по месяцам (line) и структура расходов по категориям (doughnut)
- CRUD транзакций: просмотр, добавление, удаление
- Поиск по транзакциям
- Боковая навигация: Dashboard · Transactions · Goals · Settings

### Финансовые цели

- Создание, пополнение, снятие и удаление целей
- Прогресс-бары и сводные карточки по целям
- Данные целей хранятся в `localStorage` (клиентская часть)

### Интерфейс

- Светлая и тёмная тема (`Theme` service, `data-theme` на `<html>`)
- Локализация EN / RU (`Locale` service)
- Валидация на клиенте (Reactive Forms) и сервере (Zod)

---

## Быстрый старт

### Требования

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/) 11+
- PostgreSQL-база (рекомендуется [Neon](https://neon.tech/))

### 1. Клонирование и установка

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Настройка окружения

Создайте файл `server/.env`:

```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
DIRECT_URL="postgresql://user:password@host/db?sslmode=require"
JWT_SECRET="your-secret-key"
PORT=3000
FRONTEND_URL="http://localhost:4200"
NODE_ENV="development"
```

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | Подключение для runtime (Prisma Neon adapter) |
| `DIRECT_URL` | Прямое подключение для миграций Prisma |
| `JWT_SECRET` | Секрет для подписи JWT |
| `PORT` | Порт API (по умолчанию `3000`) |
| `FRONTEND_URL` | Origin для CORS (по умолчанию `http://localhost:4200`) |
| `NODE_ENV` | `production` скрывает детали ошибок в ответах 500 |

### 3. Миграции базы данных

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 4. Запуск

Откройте два терминала:

```bash
# Терминал 1 — API
cd server
npm run dev
```

```bash
# Терминал 2 — UI
npm start
```

Откройте [http://localhost:4200](http://localhost:4200).

---

## Скрипты

### Frontend (корень проекта)

| Команда | Описание |
|---------|----------|
| `npm start` | Dev-сервер на порту 4200 |
| `npm run build` | Production-сборка в `dist/` |
| `npm run watch` | Сборка в dev-режиме с watch |
| `npm test` | Unit-тесты (Vitest) |
| `ng generate component <name>` | Генерация компонента |

### Backend (`server/`)

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер с hot reload (nodemon + ts-node) |
| `npm run build` | `prisma generate` + компиляция TypeScript |
| `npm run render:build` | Сборка для Render: install, migrate deploy, tsc |
| `npm start` | Запуск `dist/server.js` |

### Prisma (`server/`)

| Команда | Описание |
|---------|----------|
| `npx prisma generate` | Генерация Prisma Client |
| `npx prisma migrate dev` | Создание и применение миграций (dev) |
| `npx prisma migrate deploy` | Применение миграций (prod) |
| `npx prisma studio` | Веб-интерфейс для просмотра БД |

---

## Структура проекта

```
finance-dashboard/
├── src/                          # Angular-приложение
│   ├── app/
│   │   ├── pages/
│   │   │   ├── home-page/        # Дашборд, транзакции, цели, настройки
│   │   │   │   └── settings-view/
│   │   │   ├── login-page/
│   │   │   └── sign-up-page/
│   │   ├── layout/               # header, footer, sidebar
│   │   ├── services/             # auth, transaction, user, theme, locale, guards
│   │   └── interceptors/         # JWT interceptor
│   └── environment/
│       ├── environment.ts        # apiUrl для dev
│       └── environment.production.ts
│
├── public/                       # Статика (SPA redirects, иконки темы)
│
├── server/                       # Express API
│   ├── src/
│   │   ├── controllers/          # auth, transaction, user
│   │   ├── routes/               # REST-маршруты
│   │   ├── middleware/           # JWT, обработка ошибок
│   │   └── validators/           # Zod-схемы
│   └── prisma/                   # schema + migrations
│
├── AGENTS.md                     # Контекст для AI-агентов (Cursor)
└── README.md
```

---

## API

Базовый URL: `http://localhost:3000/api` (dev) · `https://finance-dashboard-api-qqwg.onrender.com/api` (prod)

### Аутентификация

| Метод | Endpoint | Auth | Описание |
|-------|----------|------|----------|
| `POST` | `/auth/register` | — | Регистрация |
| `POST` | `/auth/login` | — | Вход |

**Ответ:** `{ token: string, user: { id, name, email } }`

### Транзакции

| Метод | Endpoint | Auth | Описание |
|-------|----------|------|----------|
| `GET` | `/transactions` | JWT | Список транзакций пользователя |
| `POST` | `/transactions` | JWT | Создание транзакции |
| `DELETE` | `/transactions/:id` | JWT | Удаление транзакции |

**Тело POST:**

```json
{
  "amount": 1500,
  "description": "Salary",
  "category": "Labour",
  "type": "income"
}
```

`type`: `"income"` | `"expense"`

### Пользователи

| Метод | Endpoint | Auth | Описание |
|-------|----------|------|----------|
| `PATCH` | `/users/profile` | JWT | Обновление профиля (имя, email, пароль) |
| `GET` | `/users` | JWT | Список пользователей |
| `GET` | `/users/:id` | JWT | Пользователь по ID |
| `DELETE` | `/users/:id` | JWT | Удаление пользователя |

---

## Маршруты приложения

| Путь | Страница | Доступ |
|------|----------|--------|
| `/` | Дашборд (sidebar: dashboard / transactions / goals / settings) | Только авторизованные |
| `/login` | Вход | Только гости |
| `/sign-up` | Регистрация | Только гости |
| `/home` | → редирект на `/` | — |

> Разделы Transactions, Goals и Settings — это представления внутри `HomePage`, переключаемые через боковое меню, а не отдельные URL.

---

## Стек технологий

**Frontend**

- [Angular 21](https://angular.dev/) — standalone-компоненты, signals, lazy routes, OnPush
- [Tailwind CSS 4](https://tailwindcss.com/) — CSS-переменные для светлой/тёмной темы
- [Chart.js](https://www.chartjs.org/) + [ng2-charts](https://github.com/valor-software/ng2-charts)
- [RxJS](https://rxjs.dev/)

**Backend**

- [Express 5](https://expressjs.com/)
- [Prisma 7](https://www.prisma.io/) + [@prisma/adapter-neon](https://www.npmjs.com/package/@prisma/adapter-neon)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — JWT
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — хеширование паролей
- [Zod](https://zod.dev/) — валидация запросов

---

## Конфигурация

| Файл | Назначение |
|------|------------|
| `src/environment/environment.ts` | URL API для dev |
| `src/environment/environment.production.ts` | URL API для production-сборки |
| `server/.env` | Секреты, БД, CORS (`FRONTEND_URL`) |
| `server/src/app.ts` | CORS, логирование запросов |
| `server/prisma/schema.prisma` | Модели `User` и `Transaction` |
| `public/_redirects` | SPA fallback для статического хостинга |

При деплое обновите `apiUrl` в `environment.production.ts` и `FRONTEND_URL` в переменных окружения backend.

---

## Тестирование

```bash
# Frontend (Vitest)
npm test
```

Покрыты unit-тестами: `app`, guards, auth, transaction, layout-компоненты, login/sign-up/home pages.

Backend-тесты пока не настроены.

---

## Для AI-агентов

Подробное описание архитектуры, соглашений и известных особенностей — в [AGENTS.md](./AGENTS.md).

---

## Полезные ссылки

- [Angular CLI](https://angular.dev/tools/cli)
- [Prisma Docs](https://www.prisma.io/docs)
- [Neon Serverless Postgres](https://neon.tech/docs)
