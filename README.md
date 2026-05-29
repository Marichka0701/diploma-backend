# Cleaner Marketplace API

Backend for a cleaner marketplace, built with [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/) and PostgreSQL.

It exposes a REST API (prefixed with `/api`), serves uploaded files from `/uploads`, and ships interactive Swagger documentation at `/api-docs`.

## Tech stack

- **Runtime:** Node.js 22
- **Framework:** NestJS 11
- **Database:** PostgreSQL 16
- **ORM:** TypeORM (`synchronize: true` — schema is auto-created from entities, no manual migrations)
- **Auth:** JWT (`@nestjs/jwt`) + bcrypt
- **Docs:** Swagger / OpenAPI
- **Scheduling:** `@nestjs/schedule` (expiring stale orders/offers)

## Prerequisites

Choose **one** of:

- **Docker route:** [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- **Local route:** Node.js `22.x`, npm, and a running PostgreSQL `16` instance

## Configuration

Copy the example env file and adjust the values if needed:

```bash
cp .env.example .env
```

| Variable      | Description              | Default        |
| ------------- | ------------------------ | -------------- |
| `PORT`        | Port the API listens on  | `3001`         |
| `DB_HOST`     | PostgreSQL host          | `localhost`    |
| `DB_PORT`     | PostgreSQL port          | `5432`         |
| `DB_USERNAME` | PostgreSQL user          | `diploma_user` |
| `DB_PASSWORD` | PostgreSQL password      | `12345`        |
| `DB_NAME`     | PostgreSQL database name | `dev`          |

> **Note:** The application reads these from the process environment. With Docker Compose the values from `.env` are injected automatically. For a bare local run, either export the variables in your shell or rely on the defaults baked into the code (which match `.env.example`).

## Running with Docker (recommended)

Spins up PostgreSQL **and** the API with hot reload. The API container mounts `./src`, so code changes restart the server automatically.

```bash
docker compose up --build
```

- API: http://localhost:3001/api
- Swagger docs: http://localhost:3001/api-docs

Stop and remove the containers:

```bash
docker compose down
```

To also wipe the database volume:

```bash
docker compose down -v
```

### Production image

A multi-stage `Dockerfile` builds a minimal runtime image. To run the production target (compiled `dist/`, no dev dependencies):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

## Running locally (without Docker)

1. Make sure PostgreSQL is running and a database matching your env vars exists. For example:

   ```bash
   createdb -U diploma_user dev
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the API:

   ```bash
   # watch mode (hot reload)
   npm run start:dev

   # plain start
   npm run start

   # debug mode
   npm run start:debug
   ```

On first start, TypeORM creates all tables automatically (`synchronize: true`).

## Production build (local)

```bash
npm run build       # compiles TypeScript into dist/
npm run start:prod  # runs node dist/main
```

## Available scripts

| Script                | Description                       |
| --------------------- | --------------------------------- |
| `npm run start`       | Start the app                     |
| `npm run start:dev`   | Start with hot reload             |
| `npm run start:debug` | Start with debugger + watch       |
| `npm run start:prod`  | Run the compiled production build |
| `npm run build`       | Compile TypeScript to `dist/`     |
| `npm run lint`        | Lint and auto-fix with ESLint     |
| `npm run format`      | Format code with Prettier         |
| `npm run test`        | Run unit tests                    |
| `npm run test:watch`  | Run unit tests in watch mode      |
| `npm run test:cov`    | Run tests with coverage           |
| `npm run test:e2e`    | Run end-to-end tests              |

## API documentation

Once the app is running, open the Swagger UI at:

```
http://localhost:3001/api-docs
```

All endpoints are served under the `/api` prefix. Uploaded files are accessible under `/uploads`.

## Project structure

```
src/
├── main.ts               # App bootstrap (CORS, validation, Swagger, static uploads)
├── app.module.ts         # Root module
├── core/
│   └── database/         # TypeORM / PostgreSQL connection
├── modules/              # Feature modules
│   ├── auth/             # Authentication (JWT)
│   ├── user/
│   ├── order/
│   ├── application/
│   ├── offer/
│   ├── feedback/
│   ├── service-packages/
│   └── additional-services/
└── shared/               # Shared utilities
```
