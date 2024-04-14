# HMIF App Backend

## How to run

1. Install PNPM

```bash
npm install -g pnpm
```

2. Install dependencies

```bash
pnpm install
```

3. Copy `.env.example` to `.env` and fill the required environment variables
4. Run database migration

```bash
pnpm db:migrate
```

5. Run the app

```bash
pnpm dev
```

6. You can access the swagger api documentation at `http://localhost:5000/swagger`

## Run database migrations

```bash
pnpm db:migrate
```