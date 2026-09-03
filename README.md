# ISP Monitor

ISP Monitor is an internal NOC monitoring system with a Vite/React frontend and a NestJS/PostgreSQL backend foundation.

## Folders

- `frontend/` - the existing dashboard MVP with mock data.
- `backend/` - NestJS REST API, Prisma schema, authentication, health checks, and future integration boundaries.

## Start the backend

1. Install PostgreSQL and create a new empty database for this application.
2. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` and a long random `JWT_SECRET`.
3. Run `npm install` in `backend/`.
4. Run `npm run prisma:generate`.
5. Run `npm run prisma:migrate`.
6. Run `npm run prisma:seed` for safe demo data.
7. Run `npm run start:dev`.

The API is at `http://localhost:3000/api`. Swagger is at `http://localhost:3000/api/docs`. Health is at `http://localhost:3000/api/health`.

The demo account is `admin` / `DemoPass123!`; change or remove it before any real deployment.

## Current safety boundary

The backend uses a new application PostgreSQL database only. It does not connect to production NOC data, a TACACS database, network equipment, UDP 514, or WhatsApp. SNMP, Syslog, WhatsApp, TACACS+, timers, queues, and external NOC integration are prepared as module boundaries and will be added later under controlled integration steps. No real secrets are committed.
