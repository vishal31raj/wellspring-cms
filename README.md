## Loom Link:
https://www.loom.com/share/1cd1914c719742af911101e70529ca1c

# Wellspring-cms: Take-home Assignment

This project is a CMS platform where creators can manage programs and sessions.
The application consists of:

- Frontend: Next.js
- Backend: Node.js + Express + Sequelize
- Database: PostgreSQL

## Prerequisites

- Node.js 18+
- PostgreSQL installed and running
- npm

## Setup

```bash
git clone https://github.com/vishal31raj/wellspring-cms.git
cd wellspring-cms
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

## Run frontend

```bash
cd frontend
npm run dev

Frontend runs on: http://localhost:3000
```

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

## Run backend

```bash
cd backend
npm run dev

Backend runs on: http://localhost:8000
```

## Database Migration

```bash
cd backend
npm run db:migrate
```

## Seed Database

Running the seed script creates:

- 2 creators
- Each creator has 3 programs
- Each program has ~10 sessions

```bash
cd backend
npm run db:seed
```

## Run Tests

```bash
cd backend
npm test
```

## Recommended First Run Order

1. Setup frontend and backend
2. Run database migrations
3. Seed database
4. Start backend
5. Start frontend
