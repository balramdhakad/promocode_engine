# PromocodeEngine - Setup Guide

Before you start, make sure you have **Node.js 20+**, **Docker Desktop**, and **Git** installed on your machine.

## 1. Clone the repo

```bash
git clone https://github.com/balramdhakad/promocode_engine
cd promocode_engine
```

## 2. Create your `.env` file

Create a `.env` file in the root of the project and paste this in, changing the password and JWT secret to something only you know:

## note - take .env.sample as reference

```env

PORT=8080
NODE_ENV=development

POSTGRES_USER=admin
POSTGRES_PORT = 5432
POSTGRES_PASSWORD=admin123
POSTGRES_DB=promocode_engine
DATABASE_URL=postgresql://admin:admin123@localhost:5432/promocode_engine

REDIS_HOST=localhost
REDIS_PORT=6379
TIME_ZONE = "Asia/Kolkata"
JWT_SECRET = nbptihrio4390yt5uyh430t34ti9gii94feoirjveoikvgvdf
JWT_EXPIRES_IN = '1d'
```

<!-- create DATABASE_URL from values like POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT
`postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/
${POSTGRES_DB}`
-->

## 3. Start the database

```bash
docker-compose up -d
```

Give it a few seconds, then run `docker ps` to confirm `postgres-promocode` and `redis-promocode` shows as `healthy`. If something looks off, `docker logs postgres-promocode` will tell you why.

## 4. Install packages

```bash
npm install
```

## 5. Run the server

```bash
npm run dev
```

That's it. The server starts at **http://localhost:8080** and runs all database migrations automatically on first boot, so you don't need to do anything extra.

## Quick sanity check

Open a new terminal and hit the health endpoint:

```bash
curl http://localhost:8080/health
```

If you see `"status": "OK"` and `"postgres": "connected"` `"redis": "connected"` you're good to go.
