# Opera ERP

Web ERP-система с бухгалтерским учетом.

## Технологии

- **Backend**: Node.js + NestJS + Prisma + PostgreSQL
- **Frontend**: Vue 3 + TypeScript + Pinia + Vue Router
- **Database**: PostgreSQL (Docker)
- **Auth**: JWT (access + refresh tokens)

## Быстрый старт

### 1. Запуск PostgreSQL

```bash
docker-compose up -d
```

Проверка, что контейнер запущен:
```bash
docker ps
```

### 2. Запуск Backend

```bash
cd opera-backend
pnpm install
pnpm run start:dev
```

Backend будет доступен на `http://localhost:3000`

**Примечание:** Используется `nest start --watch` для запуска с автоматической перезагрузкой.

### 3. Запуск Frontend

В новом терминале:

```bash
cd opera-frontend
pnpm install
pnpm run dev
```

Frontend будет доступен на `http://localhost:5173` (или другой порт, который укажет Vite)

## Первый запуск

1. Откройте `http://localhost:5173` в браузере
2. Зарегистрируйте нового пользователя
3. После регистрации автоматически создастся организация (вы будете OWNER)
4. Начните работу с системой!

## Структура проекта

```
Opera/
├── opera-backend/     # NestJS backend
├── opera-frontend/    # Vue 3 frontend
├── prisma/           # Prisma schema и миграции
├── docker-compose.yml
└── .env              # Переменные окружения (backend)
```

## API Endpoints

### Auth
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход

### Organizations
- `GET /organizations` - Список организаций
- `POST /organizations` - Создать организацию
- `GET /organizations/:id` - Получить организацию
- `PATCH /organizations/:id` - Обновить (OWNER)
- `DELETE /organizations/:id` - Удалить (OWNER)

### Accounts
- `GET /organizations/:orgId/accounts` - Список счетов
- `POST /organizations/:orgId/accounts` - Создать счет
- `GET /organizations/:orgId/accounts/:id` - Получить счет
- `PATCH /organizations/:orgId/accounts/:id` - Обновить счет
- `DELETE /organizations/:orgId/accounts/:id` - Удалить счет

### Transactions
- `GET /organizations/:orgId/transactions` - Список проводок
- `POST /organizations/:orgId/transactions` - Создать проводку
- `GET /organizations/:orgId/transactions/:id` - Получить проводку
- `PATCH /organizations/:orgId/transactions/:id` - Обновить проводку
- `DELETE /organizations/:orgId/transactions/:id` - Удалить проводку

## Переменные окружения

### Backend (.env в корне проекта)
```
DATABASE_URL="postgresql://opera_user:opera_pass@localhost:5432/opera?schema=public"
JWT_ACCESS_SECRET="change-me-in-production"
JWT_REFRESH_SECRET="change-me-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

### Frontend (opera-frontend/.env)
```
VITE_API_BASE_URL=http://localhost:3000
```

## Разработка

### Backend
```bash
cd opera-backend
pnpm run start:dev    # Запуск в режиме разработки
pnpm run build        # Сборка
pnpm run lint         # Линтинг
```

### Frontend
```bash
cd opera-frontend
pnpm run dev          # Запуск dev сервера
pnpm run build        # Сборка для production
pnpm run preview      # Предпросмотр production сборки
```

## База данных

Миграции уже применены. Если нужно применить заново:

```bash
cd opera-backend
pnpm prisma migrate dev
```

Генерация Prisma Client:
```bash
pnpm prisma generate
```

Prisma Studio (GUI для БД):
```bash
pnpm prisma studio
```
