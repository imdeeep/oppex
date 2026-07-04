# OppexAI — Identity & Access Management System

A full-stack user signup, email verification, login, and session management portal built for an enterprise-style **Backend-for-Frontend (BFF)** assignment.

The browser talks only to a **Node.js BFF** (sessions + cookies). The BFF forwards business requests to a **Quarkus** backend, which owns password hashing, verification logic, and database access via **PostgreSQL**. Email verification codes are sent through **SMTP** (Gmail or Brevo).

---

## Table of contents

- [Assignment requirements](#assignment-requirements)
- [System architecture](#system-architecture)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Setup & run (local)](#setup--run-local)
- [User flows](#user-flows)
- [API reference](#api-reference)
- [Database schema](#database-schema)
- [Running tests](#running-tests)
- [Security](#security)
- [Email configuration](#email-configuration)
- [Troubleshooting](#troubleshooting)
- [Production build](#production-build)
- [Deployment (AWS)](#deployment-aws)

---



## Assignment requirements


| Requirement                               | Implementation                                          |
| ----------------------------------------- | ------------------------------------------------------- |
| Sign up with email + password             | React signup page → BFF → Quarkus                       |
| Password stored as salted hash            | bcrypt via Quarkus `PasswordService`                    |
| Email verification after signup           | 6-digit OTP emailed via SMTP, 10-minute expiry          |
| Login with verified / unverified messages | Exact assignment copy returned from Quarkus             |
| Logout + redirect to login                | Session destroyed in Node BFF                           |
| Backend + frontend tests                  | JUnit (Quarkus), Vitest (React), Node test runner (BFF) |
| Quarkus services + Node session layer     | BFF pattern as specified                                |
| Tech stack                                | Quarkus + PostgreSQL + React + Node + Maven             |
| AWS deployment                            | Planned — see [Deployment](#deployment-aws)             |


---



## System architecture

Oppex system architecture

### How the layers work

```
Browser (React)  →  Node BFF  →  Quarkus API  →  PostgreSQL
                         ↑
                   Session cookie
                   (oppex.sid)

Quarkus  →  SMTP  →  User inbox (verification OTP)
```


| Layer             | Folder        | Default port | Role                                        |
| ----------------- | ------------- | ------------ | ------------------------------------------- |
| **Frontend**      | `client/`     | `5173`       | Login, signup, verify, portal UI            |
| **BFF / Gateway** | `node-proxy/` | `3000`       | Sessions, cookies, CORS, proxy to Quarkus   |
| **Backend**       | `server/`     | `8080`       | User service, bcrypt, OTP, JPA persistence  |
| **Database**      | PostgreSQL    | `5432`       | User records (Neon, RDS, or local Postgres) |


> **Note:** The architecture diagram may show port `4000` for the BFF. This project runs the BFF on port `3000` by default (configurable via `PORT` in `node-proxy/.env`).



### Request flow (signup example)

1. User submits email + password on the React signup page.
2. Browser sends `POST /auth/signup` to the Node BFF with `credentials: include`.
3. BFF forwards the request to Quarkus `POST /api/users/signup`.
4. Quarkus hashes the password, saves the user, generates a 6-digit OTP, and sends the verification email.
5. User enters the OTP on `/verify`; BFF proxies to Quarkus `/api/users/verify`.
6. After verification, user logs in. BFF creates a session **only for verified users** and sets an `HttpOnly` cookie.
7. Protected portal routes call `GET /auth/me` to read the session.

---



## Project structure

```
oppex/
├── client/                 # React frontend (React Router 8 + Vite + Tailwind)
│   ├── app/
│   │   ├── routes/         # login, signup, verify, portal, …
│   │   ├── components/     # Input, AuthLayout, GuestGuard, …
│   │   └── lib/api.ts      # BFF API client
│   └── test/               # Vitest tests
├── node-proxy/             # Node.js BFF (Express + express-session)
│   ├── src/
│   │   ├── routes/         # /auth/* handlers
│   │   ├── clients/        # Quarkus HTTP client
│   │   └── middleware/     # session + requireAuth
│   └── test/               # Node integration tests
├── server/                 # Quarkus backend (Maven)
│   └── src/
│       ├── main/java/com/oppex/
│       │   ├── resource/   # REST endpoints
│       │   ├── service/    # business logic
│       │   ├── entity/     # JPA User model
│       │   └── repository/
│       └── test/java/      # JUnit tests
├── docs/context.md         # Extended architecture notes
├── sysarch.png             # System architecture diagram
└── README.md
```

---



## Tech stack


| Area     | Technology                                                 |
| -------- | ---------------------------------------------------------- |
| Frontend | React 19, React Router 8, TypeScript, Tailwind CSS 4, Vite |
| BFF      | Node.js, Express, express-session, CORS                    |
| Backend  | Quarkus 3.37, Java 17, Hibernate ORM, Panache              |
| Database | PostgreSQL (Neon / AWS RDS / local)                        |
| Email    | Quarkus Mailer (SMTP - Gmail )                             |
| Build    | Maven (`./mvnw`), npm                                      |
| Tests    | JUnit 5, RestAssured, Vitest, Node `--test`                |


---



## Prerequisites

Install the following before running locally:


| Tool                 | Version                     | Used by             |
| -------------------- | --------------------------- | ------------------- |
| **Java JDK**         | 17+                         | Quarkus backend     |
| **Node.js**          | 18+ recommended             | BFF + React         |
| **npm**              | 9+                          | BFF + React         |
| **PostgreSQL**       | 14+ (or Neon cloud)         | User storage        |
| **SMTP credentials** | Gmail App Password or Brevo | Verification emails |


Maven is bundled via `./mvnw` in `server/` — no global Maven install required.

---



## Environment variables

Each service has its own `.env` file. Copy from the `.env.example` in each folder.

### 1. Backend — `server/.env`

Create from `server/.env.example`:

```bash
cp server/.env.example server/.env
```


| Variable        | Description                    | Example                                     |
| --------------- | ------------------------------ | ------------------------------------------- |
| `DB_USERNAME`   | PostgreSQL username            | `neondb_owner`                              |
| `DB_PASSWORD`   | PostgreSQL password            | `your_password`                             |
| `DB_JDBC_URL`   | JDBC connection string         | `jdbc:postgresql://host/db?sslmode=require` |
| `MAIL_FROM`     | Sender address shown in emails | `you@gmail.com`                             |
| `MAIL_HOST`     | SMTP host                      | `smtp.gmail.com`                            |
| `MAIL_PORT`     | SMTP port                      | `587`                                       |
| `MAIL_USERNAME` | SMTP login                     | `you@gmail.com`                             |
| `MAIL_PASSWORD` | SMTP password / app password   | `xxxx xxxx xxxx xxxx`                       |


Quarkus loads these automatically in dev mode when `.env` is present in `server/`.

### 2. BFF — `node-proxy/.env`

Create from `node-proxy/.env.example`:

```bash
cp node-proxy/.env.example node-proxy/.env
```


| Variable         | Description                                              | Default                 |
| ---------------- | -------------------------------------------------------- | ----------------------- |
| `PORT`           | BFF listen port                                          | `3000`                  |
| `QUARKUS_URL`    | Quarkus base URL                                         | `http://localhost:8080` |
| `SESSION_SECRET` | Cookie signing secret (use a long random string in prod) | —                       |
| `CLIENT_URL`     | Allowed frontend origin(s), comma-separated              | `http://localhost:5173` |
| `NODE_ENV`       | `development` or `production`                            | `development`           |


In production, set `NODE_ENV=production` so session cookies use the `Secure` flag (HTTPS required).

### 3. Frontend — `client/.env`

Create from `client/.env.example`:

```bash
cp client/.env.example client/.env
```


| Variable       | Description       | Default                 |
| -------------- | ----------------- | ----------------------- |
| `VITE_API_URL` | Node BFF base URL | `http://localhost:3000` |


---



## Setup & run (local)

You need **three terminals** — one per service. Start them in this order.

### Step 1 — Install dependencies

```bash
# BFF
cd node-proxy && npm install

# Frontend
cd ../client && npm install
```

The Quarkus backend uses the Maven wrapper — no `npm install` needed there.

### Step 2 — Configure environment files

1. Fill in `server/.env` with your PostgreSQL and SMTP credentials.
2. Copy and adjust `node-proxy/.env` (at minimum set `SESSION_SECRET`).
3. Copy `client/.env` (default `VITE_API_URL=http://localhost:3000` is fine for local dev).



### Step 3 — Start Quarkus (Terminal 1)

```bash
cd server
./mvnw quarkus:dev
```

Wait until you see:

```
Listening on: http://localhost:8080
Mail config loaded — host=... port=... username=... from=...
```

Health check: [http://localhost:8080/q/health](http://localhost:8080/q/health)

### Step 4 — Start the BFF (Terminal 2)

```bash
cd node-proxy
npm run dev
```

You should see:

```
BFF listening on http://localhost:3000
Proxying to Quarkus at http://localhost:8080
```

Health check: [http://localhost:3000/health](http://localhost:3000/health)

### Step 5 — Start the frontend (Terminal 3)

```bash
cd client
npm run dev
```

Open the app: [http://localhost:5173](http://localhost:5173)

### Quick verification checklist

- [ ] Sign up with a new email → redirected to `/verify`
- [ ] 6-digit OTP arrives in inbox (check spam/promotions if needed)
- [ ] Enter OTP → redirected to login with success message
- [ ] Login → portal opens for verified users
- [ ] Logout → returned to login; `/portal` redirects away

---



## User flows



### Sign up

1. `/signup` — enter email + password (min 8 characters).
2. Backend creates account with `is_verified = false`.
3. 6-digit OTP emailed; user lands on `/verify?email=...`.



### Email verification

1. User enters the 6-digit code (paste supported).
2. OTP expires after **10 minutes**; use **Resend code** if needed.
3. On success → redirect to `/login?verified=true`.



### Login


| State      | Message shown                                          | Session created? | Portal access? |
| ---------- | ------------------------------------------------------ | ---------------- | -------------- |
| Unverified | *You need to validate your email to access the portal* | No               | No             |
| Verified   | *Your email is validated. You can access the portal*   | Yes              | Yes            |




### Logout

- Destroys server session and clears `oppex.sid` cookie.
- Visiting `/` or `/portal` after logout redirects to login.

---



## API reference

The React app calls the **BFF only**. Quarkus endpoints are internal (BFF → Quarkus).

### BFF — `http://localhost:3000`


| Method | Path                | Auth    | Description                            |
| ------ | ------------------- | ------- | -------------------------------------- |
| `GET`  | `/health`           | —       | Health check                           |
| `POST` | `/auth/signup`      | —       | Register `{ email, password }`         |
| `POST` | `/auth/verify`      | —       | Verify `{ email, otp }`                |
| `POST` | `/auth/resend-code` | —       | Resend OTP `{ email }`                 |
| `POST` | `/auth/login`       | —       | Login `{ email, password }`            |
| `POST` | `/auth/logout`      | Session | Destroy session                        |
| `GET`  | `/auth/me`          | Session | Current user `{ id, email, verified }` |


All auth requests from the browser must include `credentials: "include"` so the session cookie is sent.

### Quarkus — `http://localhost:8080` (internal)


| Method | Path                     | Description                          |
| ------ | ------------------------ | ------------------------------------ |
| `POST` | `/api/users/signup`      | Create user + send OTP               |
| `POST` | `/api/users/verify`      | Validate OTP                         |
| `POST` | `/api/users/resend-code` | Generate + send new OTP              |
| `POST` | `/api/users/login`       | Authenticate + return status message |
| `GET`  | `/q/health`              | Health check                         |


---



## Database schema

Table: `users`


| Column               | Type        | Notes                           |
| -------------------- | ----------- | ------------------------------- |
| `id`                 | BIGINT (PK) | Auto-increment                  |
| `email`              | VARCHAR     | Unique, normalized to lowercase |
| `password_hash`      | VARCHAR     | bcrypt hash (salt embedded)     |
| `is_verified`        | BOOLEAN     | Default `false`                 |
| `verification_token` | VARCHAR     | 6-digit OTP while pending       |
| `otp_expires_at`     | TIMESTAMP   | OTP expiry                      |
| `created_at`         | TIMESTAMP   | Account creation time           |


Hibernate manages schema updates in dev via `quarkus.hibernate-orm.schema-management.strategy=update`.

---



## Running tests



### Backend (Quarkus)

```bash
cd server
./mvnw test
```

Uses in-memory **H2** for tests — no live PostgreSQL required. Covers password hashing, user service, and REST integration.

### BFF (Node)

```bash
cd node-proxy
npm test
```



### Frontend (React)

```bash
cd client
npm test
```

---



## Security


| Feature                | Where                                              |
| ---------------------- | -------------------------------------------------- |
| Password hashing       | Quarkus — bcrypt (`PasswordService`)               |
| Session management     | Node BFF — `express-session`                       |
| Cookie flags           | `HttpOnly`, `SameSite=lax`, `Secure` in production |
| Verified-only sessions | BFF only sets session when `verified: true`        |
| CORS                   | BFF allows `CLIENT_URL` origins only               |
| Email uniqueness       | PostgreSQL unique constraint on `email`            |
| OTP expiry             | 10-minute TTL, cleared after successful verify     |


The browser never receives the password hash or talks to Quarkus directly.

---



## Email configuration

Verification emails are sent by Quarkus through SMTP.

### Option A — Gmail (recommended for Gmail recipients)

1. Enable 2FA on your Google account.
2. Create an [App Password](https://myaccount.google.com/apppasswords).
3. Set in `server/.env`:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-account@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM=your-account@gmail.com
```



### Option B — Brevo (Sendinblue)

See comments in `server/.env.example`. Use the Brevo **SMTP login** as `MAIL_USERNAME`, not your personal email.

### Dev mode: real email delivery

Quarkus mocks the mailer by default in dev mode (logs only, no real send). This project sets:

```properties
%dev.quarkus.mailer.mock=false
```

in `server/src/main/resources/application.properties` so local dev sends real emails.

In dev, OTP codes are also printed in the Quarkus terminal when `app.mailer.log-code-in-dev=true`.

---



## Troubleshooting



### Signup works but no email arrives

- Confirm Quarkus logs show `[mail] START` and `[mail] COMPLETED` (not just mock mailer output).
- Check spam/promotions in Gmail.
- Verify `MAIL_*` values in `server/.env` — wrong app password is the most common cause.
- Restart `./mvnw quarkus:dev` after changing mail config.



### Mock mailer still active

If logs show `quarkus-mailer ... text body: ... html body: <empty>` with the full email body printed, the mock mailer is active. Ensure `%dev.quarkus.mailer.mock=false` is set and restart Quarkus.

### CORS / cookie errors in browser

- `CLIENT_URL` in `node-proxy/.env` must match the frontend origin exactly (`http://localhost:5173`).
- `VITE_API_URL` in `client/.env` must point to the BFF (`http://localhost:3000`).
- Frontend fetch calls use `credentials: "include"`.



### Login succeeds but portal redirects to login

Only **verified** users get a session. Complete email verification first.

### Database connection failed

- Check `DB_JDBC_URL`, `DB_USERNAME`, and `DB_PASSWORD` in `server/.env`.
- For Neon, ensure `?sslmode=require` is in the JDBC URL.

---



## Production build



### Frontend

```bash
cd client
npm run build
npm start    # serves built app (default port from react-router-serve)
```

Set `VITE_API_URL` to your production BFF URL **before** building.

### BFF

```bash
cd node-proxy
NODE_ENV=production npm start
```

Set `SESSION_SECRET`, `CLIENT_URL`, and `QUARKUS_URL` for production.

### Backend

```bash
cd server
./mvnw package -DskipTests
java -jar target/quarkus-app/quarkus-run.jar
```

Or run the packaged app with production env vars exported.

---



## Deployment (AWS)

Target deployment (per assignment): **AWS EC2 free tier** with all services on one VM:


| Service                  | Port                          |
| ------------------------ | ----------------------------- |
| React (static or served) | `80` / `443`                  |
| Node BFF                 | `3000`                        |
| Quarkus                  | `8080`                        |
| PostgreSQL               | `5432` (RDS or external Neon) |


Recommended additions for production:

- HTTPS reverse proxy (Nginx or Caddy)
- Strong `SESSION_SECRET`
- AWS SES or verified SMTP for email
- Environment variables via EC2 user data or parameter store
- Security group rules: expose only 80/443 publicly; keep 8080 and 5432 internal

