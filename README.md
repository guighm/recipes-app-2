# 🍴 Recipes App - Fullstack Project

Recipes App built with React on the frontend and NestJS on the backend.

## 🛠️ Technologies Used

- Front-end: React 19 + TypeScript + Vite
  - React Router (routes)
  - TanStack Query (requests and cache)
  - Zustand (authentication state)
  - React Hook Form + Zod (forms and validation)
- Back-end: NestJS (Node.js + TypeScript)
  - Drizzle ORM + migrations
  - JWT authentication
  - Swagger (API documentation)
- Database: PostgreSQL
- Containerization: Docker + Docker Compose

## ✨ Features

- Sign in (JWT authentication)

![Sign in](./assets/image-1.gif)

> When the back-end runs, a default user is created. It is used to sign in. After a successful sign-in, the JWT is stored in localStorage and managed through the Zustand store.

```bash
# Created user
E-mail: admin@email.com
Password: 123
```

- Register a new user

- Create a new recipe

![Create a new recipe](./assets/image-2.gif)

- Create ingredients and steps

![Create ingredients and steps](./assets/image-3.gif)

- Delete a recipe and log out

![Delete a recipe and log out](./assets/image-4.gif)

## ⚙️ Installation

### 1. Prerequisites

- Node.js 24
- pnpm
- Docker

### 2. Setting up the database (PostgreSQL)

In the `backend/` folder, bring up the database with Docker:

```bash
cd backend
docker compose up -d
cp .env.example .env
```

This starts PostgreSQL on `localhost:5432` (and an ephemeral test database on `localhost:5433`).

### 3. Setting up the back-end (NestJS)

Still in the `backend/` folder, install the dependencies and start the server:

```bash
pnpm install
pnpm start:dev
```

The back-end will be available at:

```
http://localhost:3000
```

On startup, the application automatically runs the migrations (`drizzle/`) and the admin user seed.

The interactive API documentation (Swagger) is at [`http://localhost:3000/docs`](http://localhost:3000/docs).

### 4. Setting up the front-end (React + Vite)

In another terminal, go to the `frontend/` folder:

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

The front-end will be available at:

```
http://localhost:5173
```

## 📁 Project structure

```
├── backend/       # REST API (NestJS + Drizzle ORM + PostgreSQL)
├── frontend/      # SPA (React 19 + Vite)
├── old-backend/   # Original backend in Spring Boot (Java)
├── old-frontend/  # Original frontend in Angular
└── assets/        # Demo GIFs
```

## 👨‍💻 Author

<table>
  <tr>
    <td align="center">
    <a href="https://github.com/guighm">
        <img src="https://avatars.githubusercontent.com/guighm" width="100px;" alt="Guilherme Moraes's photo"/><br />
        <sub><b>Guilherme Moraes</b></sub>
        </a>
    </td>
  </tr>
</table>