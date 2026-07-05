# Oppex - Identity & Access Management System

A full-stack user signup, email verification, login, and session management portal built with an enterprise **Backend-for-Frontend (BFF)** pattern.

The browser talks only to a **Node.js BFF** (sessions + cookies). The BFF forwards business requests to a **Quarkus** backend, which handles password hashing, verification logic, and database access via **PostgreSQL**. Email verification uses **6-digit OTP** codes sent through **SMTP** (Gmail).

---

## Live deployment


| Service                    | URL                                |
| -------------------------- | ---------------------------------- |
| **Portal (single origin)** | `https://oppex.duckdns.org`        |
| **GitHub**                 | `https://github.com/imdeeep/oppex` |

Frontend and backend are served from **one origin** (`oppex.duckdns.org`) via Caddy on EC2.
This keeps the session cookie first-party so login works in every browser. A split setup
(Amplify frontend + separate-domain API) fails in Safari, which blocks cross-site cookies.
See [Deployment](#deployment-aws).

---



## Table of contents

- [Assignment requirements](#assignment-requirements)
- [System architecture](#system-architecture)
- [Production architecture](#production-architecture)
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
- [Deployment (AWS)](#deployment-aws)
- [Troubleshooting](#troubleshooting)

---



## Assignment requirements


| Requirement                               | Implementation                                              |
| ----------------------------------------- | ----------------------------------------------------------- |
| Sign up with email + password             | React signup → BFF → Quarkus                                |
| Password stored as salted hash            | bcrypt via Quarkus `PasswordService`                        |
| Email verification after signup           | 6-digit OTP via SMTP, 10-minute expiry                      |
| Login with verified / unverified messages | Exact assignment copy from Quarkus                          |
| Logout + redirect to login                | Session destroyed in Node BFF                               |
| Backend + frontend tests                  | JUnit, Vitest, Node test runner                             |
| Quarkus services + Node session layer     | BFF pattern as specified                                    |
| Tech stack                                | Quarkus + PostgreSQL + React + Node + Maven                 |
| AWS deployment                            | Amplify (frontend) + EC2 Docker (BFF + Quarkus) + Neon (DB) |


---



## System architecture

Oppex system architecture diagram

> **Note:** The diagram shows port `4000` for the BFF and a separate verification-tokens table. This implementation uses port **3000** for the BFF and stores OTP fields on the `users` table.



### How the layers work (local)

```
Browser (React)  →  Node BFF  →  Quarkus API  →  PostgreSQL
                         ↑
                   Session cookie (oppex.sid)

Quarkus  →  SMTP  →  User inbox (6-digit OTP)
```


| Layer        | Folder        | Port (local) | Role                                      |
| ------------ | ------------- | ------------ | ----------------------------------------- |
| **Frontend** | `client/`     | `5173`       | Login, signup, verify, portal UI          |
| **BFF**      | `node-proxy/` | `3000`       | Sessions, cookies, CORS, proxy to Quarkus |
| **Backend**  | `server/`     | `8080`       | User service, bcrypt, OTP, JPA            |
| **Database** | PostgreSQL    | `5432`       | Neon (cloud) or local Postgres            |




### Request flow (signup)

1. User submits email + password on the React signup page.
2. Browser sends `POST /auth/signup` to the BFF with `credentials: include`.
3. BFF forwards to Quarkus `POST /api/users/signup`.
4. Quarkus hashes the password, saves the user, generates a 6-digit OTP, and sends email.
5. User enters OTP on `/verify`; BFF proxies to Quarkus `/api/users/verify`.
6. After verification, user logs in. BFF creates a session **only for verified users**.
7. Protected portal routes call `GET /auth/me` to read the session.

---



## Production architecture

```
User browser
    │
    ├─► AWS Amplify          https://main.xxxxx.amplifyapp.com   (React SPA)
    │
    └─► DuckDNS + Caddy + EC2  https://oppex.duckdns.org          (Node BFF :3000)
              │
              └─► Docker: Quarkus :8080 (internal only)
                        │
                        ├─► Neon PostgreSQL (external)
                        └─► Gmail SMTP
```


| Component     | Where              | Notes                                      |
| ------------- | ------------------ | ------------------------------------------ |
| Frontend      | **AWS Amplify**    | Monorepo, app root = `client/`             |
| BFF + Quarkus | **AWS EC2**        | Docker Compose (`docker-compose.yml`)      |
| HTTPS for API | **Caddy** on EC2   | Auto Let's Encrypt cert for DuckDNS domain |
| Database      | **Neon**           | PostgreSQL, external - not on EC2          |
| DNS           | **DuckDNS** (free) | Points subdomain to EC2 public IP          |




### Why cross-origin + HTTPS in production

Locally, frontend and BFF share `localhost` - cookies work with `SameSite=Lax`.

In production, Amplify (`amplifyapp.com`) and the BFF (`duckdns.org`) are **different sites**. The fix:

1. **HTTPS** on the BFF via Caddy (Amplify requires HTTPS targets; plain `http://IP:3000` is rejected).
2. `VITE_API_URL=https://oppex.duckdns.org` in Amplify - browser calls BFF directly.
3. `SameSite=None; Secure` cookies in production + `trust proxy` in Express (behind Caddy).

---



## Project structure

```
oppex/
├── client/                 # React frontend (React Router 8 + Vite + Tailwind)
├── node-proxy/             # Node.js BFF (Express + express-session)
├── server/                 # Quarkus backend (Maven)
├── docker-compose.yml      # EC2: server + node-proxy containers
├── amplify.yml             # Amplify build spec (monorepo, appRoot: client)
├── sysarch.png             # Architecture diagram (referenced above)
├── docs/context.md         # Extended architecture notes
└── README.md
```

---



## Tech stack


| Area       | Technology                                                 |
| ---------- | ---------------------------------------------------------- |
| Frontend   | React 19, React Router 8, TypeScript, Tailwind CSS 4, Vite |
| BFF        | Node.js, Express, express-session, CORS                    |
| Backend    | Quarkus 3.37, Java 17, Hibernate ORM, Panache              |
| Database   | PostgreSQL (Neon)                                          |
| Email      | Quarkus Mailer + Gmail SMTP                                |
| Deployment | AWS Amplify, EC2, Docker, Caddy, DuckDNS                   |
| Tests      | JUnit 5, Vitest, Node `--test`                             |


---



## Prerequisites


| Tool                    | Version                         | Used by             |
| ----------------------- | ------------------------------- | ------------------- |
| Java JDK                | 17+                             | Quarkus             |
| Node.js                 | 18+ (22.22+ for Amplify builds) | BFF + React         |
| npm                     | 9+                              | BFF + React         |
| PostgreSQL              | 14+ or Neon                     | User storage        |
| Gmail App Password      | -                               | Verification emails |
| Docker + Docker Compose | -                               | EC2 deployment      |


Maven is bundled via `./mvnw` in `server/`.

---



## Environment variables

Copy from each folder's `.env.example`. **Never commit** `.env` **files** (they are gitignored).

### Backend - `server/.env`


| Variable        | Description                                          |
| --------------- | ---------------------------------------------------- |
| `DB_USERNAME`   | Neon PostgreSQL username                             |
| `DB_PASSWORD`   | Neon password                                        |
| `DB_JDBC_URL`   | `jdbc:postgresql://...neon.tech/...?sslmode=require` |
| `MAIL_FROM`     | Gmail sender address                                 |
| `MAIL_HOST`     | `smtp.gmail.com`                                     |
| `MAIL_PORT`     | `587`                                                |
| `MAIL_USERNAME` | Gmail address                                        |
| `MAIL_PASSWORD` | Gmail app password                                   |




### BFF - `node-proxy/.env`


| Variable         | Local                   | Production (EC2)                    |
| ---------------- | ----------------------- | ----------------------------------- |
| `PORT`           | `3000`                  | `3000`                              |
| `QUARKUS_URL`    | `http://localhost:8080` | `http://server:8080`                |
| `SESSION_SECRET` | any dev string          | long random string (32+ chars)      |
| `CLIENT_URL`     | `http://localhost:5173` | `https://main.xxxxx.amplifyapp.com` |
| `NODE_ENV`       | `development`           | `production`                        |




### Frontend - `client/.env`


| Variable       | Local                   | Production (Amplify console) |
| -------------- | ----------------------- | ---------------------------- |
| `VITE_API_URL` | `http://localhost:3000` | `https://oppex.duckdns.org`  |


Set `VITE_API_URL` in Amplify **before** building - Vite bakes it into the bundle.

---



## Setup & run (local)

Three terminals, in this order:

```bash
# Terminal 1 - Quarkus
cd server && ./mvnw quarkus:dev

# Terminal 2 - BFF
cd node-proxy && npm run dev

# Terminal 3 - Frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Local checklist

- [ ] Sign up → 6-digit OTP email arrives
- [ ] Verify → login → portal (verified users only)
- [ ] Logout → `/portal` redirects to login

---



## User flows



### Login messages (assignment copy)


| State      | Message                                                | Session | Portal |
| ---------- | ------------------------------------------------------ | ------- | ------ |
| Unverified | *You need to validate your email to access the portal* | No      | No     |
| Verified   | *Your email is validated. You can access the portal*   | Yes     | Yes    |




### OTP

- **6-digit numeric** code, expires in **10 minutes**
- Resend available on `/verify`

---



## API reference



### BFF (browser-facing)


| Method | Path                | Auth    | Description  |
| ------ | ------------------- | ------- | ------------ |
| `GET`  | `/health`           | -       | Health check |
| `POST` | `/auth/signup`      | -       | Register     |
| `POST` | `/auth/verify`      | -       | Verify OTP   |
| `POST` | `/auth/resend-code` | -       | Resend OTP   |
| `POST` | `/auth/login`       | -       | Login        |
| `POST` | `/auth/logout`      | Session | Logout       |
| `GET`  | `/auth/me`          | Session | Current user |


All browser requests use `credentials: include`.

### Quarkus (internal, BFF only)


| Method | Path                     |
| ------ | ------------------------ |
| `POST` | `/api/users/signup`      |
| `POST` | `/api/users/verify`      |
| `POST` | `/api/users/resend-code` |
| `POST` | `/api/users/login`       |


---



## Database schema

Table: `users`


| Column               | Notes             |
| -------------------- | ----------------- |
| `id`                 | Primary key       |
| `email`              | Unique, lowercase |
| `password_hash`      | bcrypt            |
| `is_verified`        | boolean           |
| `verification_token` | 6-digit OTP       |
| `otp_expires_at`     | expiry timestamp  |
| `created_at`         | account creation  |


---



## Running tests

```bash
cd server && ./mvnw test
cd node-proxy && npm test
cd client && npm test
```

---



## Security


| Feature                   | Implementation                                    |
| ------------------------- | ------------------------------------------------- |
| Password hashing          | bcrypt (Quarkus)                                  |
| Sessions                  | `express-session`, cookie `oppex.sid`             |
| Cookie flags (local)      | `HttpOnly`, `SameSite=Lax`                        |
| Cookie flags (production) | `HttpOnly`, `SameSite=None`, `Secure`             |
| Verified-only sessions    | BFF sets session only when `verified: true`       |
| CORS                      | `CLIENT_URL` allowlist                            |
| Quarkus not public        | Docker `expose: 8080` only - no host port mapping |


---



## Email configuration

Gmail (recommended for Gmail recipients):

1. Enable 2FA on Google account.
2. Create an [App Password](https://myaccount.google.com/apppasswords).
3. Set `MAIL_*` in `server/.env`.

**Dev mode:** `%dev.quarkus.mailer.mock=false` in `application.properties` forces real SMTP in `quarkus:dev` (Quarkus mocks mail by default in dev).

---



## Deployment (AWS)

Step-by-step for what this project uses in production.

### 1. Push code to GitHub

```bash
git add .
git commit -m "Oppex IAM portal"
git push origin main
```

Ensure `sysarch.png` is committed at the repo root (same folder as `README.md`) so the diagram renders on GitHub.

### 2. Database - Neon PostgreSQL

1. Create a project at [neon.tech](https://neon.tech).
2. Copy connection string into `server/.env` on EC2.



### 3. Frontend - AWS Amplify

1. Amplify Console → **Host web app** → connect GitHub repo.
2. **Monorepo:** enable, **Root directory:** `client`.
3. Build uses root `amplify.yml` (Node 22.22, `npm install`, output `build/client`).
4. Environment variables:


| Key                         | Value                       |
| --------------------------- | --------------------------- |
| `AMPLIFY_MONOREPO_APP_ROOT` | `client`                    |
| `VITE_API_URL`              | `https://oppex.duckdns.org` |


1. Deploy → note your `https://main.xxxxx.amplifyapp.com` URL.



### 4. Backend - AWS EC2 + Docker

**Launch EC2:** Ubuntu 22.04, `t2.micro`, key pair `oppex.pem`.

**Security group inbound:**


| Port | Purpose               |
| ---- | --------------------- |
| 22   | SSH                   |
| 80   | Caddy (Let's Encrypt) |
| 443  | HTTPS API             |


Do **not** expose 8080 (Quarkus) publicly.

**On EC2:**

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker ubuntu
# log out and back in

git clone https://github.com/imdeeep/oppex.git
cd oppex

# Create server/.env and node-proxy/.env (see Environment variables section)
nano server/.env
nano node-proxy/.env

docker compose up -d --build
curl http://localhost:3000/health   # → {"status":"ok"}
```

**Production** `node-proxy/.env` **on EC2:**

```env
PORT=3000
QUARKUS_URL=http://server:8080
SESSION_SECRET=<long-random-string>
CLIENT_URL=https://main.xxxxx.amplifyapp.com
NODE_ENV=production
```



### 5. HTTPS - DuckDNS + Caddy

1. [duckdns.org](https://www.duckdns.org) → create subdomain (e.g. `oppex.duckdns.org`) → point to EC2 public IP.
2. Install Caddy on EC2:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

1. `/etc/caddy/Caddyfile`:

```caddyfile
oppex.duckdns.org {
    reverse_proxy localhost:3000
}
```

```bash
sudo systemctl restart caddy
curl https://oppex.duckdns.org/health   # → {"status":"ok"}
```



### 6. Wire frontend to API

1. Set Amplify env `VITE_API_URL=https://oppex.duckdns.org` → redeploy.
2. Set EC2 `CLIENT_URL` to your exact Amplify URL → `docker compose up -d --force-recreate node-proxy`.



### 7. Verify production

- [ ] `curl https://oppex.duckdns.org/health` returns JSON
- [ ] Signup → OTP email → verify → login → portal
- [ ] DevTools → Cookies → `oppex.sid` with `Secure` + `SameSite=None`
- [ ] Logout works



### Docker files


| File                    | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `server/Dockerfile`     | Multi-stage Quarkus build → `quarkus-run.jar`  |
| `node-proxy/Dockerfile` | Node 20 Alpine BFF                             |
| `docker-compose.yml`    | `server` (internal) + `node-proxy` (port 3000) |


For a real product, i will replace DuckDNS with a purchased domain (`app.mydomain.com` + `api.mydomain.com`), use AWS SES for email, and lock down EC2 to ports 22/443 only.

---



## Troubleshooting



### No verification email in local dev

Quarkus mocks mail in dev by default. This repo sets `%dev.quarkus.mailer.mock=false`. Restart `./mvnw quarkus:dev` after mail config changes.

### Amplify build fails

- Set `AMPLIFY_MONOREPO_APP_ROOT=client`.
- Use Node 22.22+ (`amplify.yml` uses `nvm install 22.22.0`).
- Use `npm install` not `npm ci` (lockfile differs macOS vs Linux).



### Amplify login returns HTML instead of JSON

Amplify cannot proxy to plain `http://IP:3000` - it requires **HTTPS**. Use DuckDNS + Caddy, then set `VITE_API_URL` to the HTTPS BFF URL.

### Login works locally but portal says Unauthorized in production

Cross-origin cookie issue. Ensure:

- `VITE_API_URL=https://oppex.duckdns.org` in Amplify
- `CLIENT_URL=https://your.amplifyapp.com` on EC2 (exact match, no trailing slash)
- `NODE_ENV=production` on EC2
- Caddy running with HTTPS
- BFF has `trust proxy` and `SameSite=None` cookies (already in this repo)



### `git pull` blocked on EC2

```bash
git checkout -- .
git pull origin main
```

Never edit tracked files on EC2 - only `.env` files (gitignored).

### Quarkus not reachable on port 8080 from browser

Expected. Quarkus is internal to Docker. Test via BFF: `curl http://localhost:3000/health` or `curl https://oppex.duckdns.org/health`.