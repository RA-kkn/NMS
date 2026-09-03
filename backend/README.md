# ISP Monitor Backend

This is the NestJS REST API foundation for the ISP/NOC monitoring system. It owns the application database, authentication, monitoring records, and future integration boundaries.

## Setup

1. Create a new PostgreSQL database for this application only. Do not use an existing TACACS or NOC database.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and a long random `JWT_SECRET`.
3. Install packages: `npm install`.
4. Generate Prisma Client: `npm run prisma:generate`.
5. Create the first migration against the new database: `npm run prisma:migrate`.
6. Add demo records: `npm run prisma:seed`.
7. Start development mode: `npm run start:dev`.

The demo seed creates the login `admin` with password `DemoPass123!`. Change or remove this demo account before any real deployment.

## API

- Health: `GET http://localhost:3000/api/health`
- Swagger: `http://localhost:3000/api/docs`
- Login: `POST /api/auth/login` with `{ "username": "admin", "password": "DemoPass123!" }`
- Devices: `/api/devices`
- Clients: `/api/clients`
- Interfaces: `/api/interfaces`

Successful responses use `{ success: true, data: ... }`. Validation and request errors use Nest's standard HTTP status codes and safe messages. Global validation strips unknown fields and rejects non-whitelisted input.

## Security boundaries

Passwords are stored as bcrypt hashes. Device credentials have a separate model and are intentionally not returned by device queries. Secrets belong in encrypted secret storage later, not settings or audit logs. CORS is limited to `FRONTEND_URL`, and Helmet is enabled.

SNMP polling, Syslog receivers, WhatsApp delivery, TACACS+ authentication, NOC integration, queues, and timers are not connected yet. The new PostgreSQL database is application-only and this backend never connects directly to an existing TACACS database or production NOC system.
