# VPMS — Visitor Pass Management System (MERN)

MERN stack app for visitor badges (QR + PDF), appointments, role-based access by site, audit logs, basic analytics, and Socket.IO updates on the dashboard.

## Features

- **Roles**: Admin, Security, Employee, Visitor (`backend/utils/constants.js`, `frontend/src/utils/constants.js`)
- **Visitors**: Photo upload → Cloudinary, approvals, RBAC listings, pagination + CSV export (`/api/dashboard/export`)
- **Appointments + pre-registration**: JWT appointment token → `/pre-register/:token` uploads photo + notifies host (`/api/appointments/:token/pre-register`)
- **Passes**: UUID pass codes, QR PNG (base64), PDF badge generation + Cloudinary hosting, verification endpoint (`/api/passes/verify/:passCode`)
- **Check-in/out**: Immutable check logs filtered by Security location (`/api/checks/*`)
- **Dashboard**: KPIs + recent activity (`/api/dashboard/*`)
- **Bonus**
  - **Multi-location**: `User.location`, `Visitor.location`, `Pass.location`, `CheckLog.location`
  - **Audit viewer**: `/api/audit-logs` + admin UI `/audit-logs`
  - **Emails/SMS hooks**: Gmail SMTP + Twilio (safe no-ops when creds absent)
  - **Realtime**: Socket.IO emits `check-event` → frontend toasts/dashboard refresh signal
  - **Analytics**: `/api/analytics/*` + `/analytics`
  - **Dark mode**: Tailwind `dark` class toggle persisted in localStorage (`ThemeContext`)

## Tech stack

| Layer    | Technologies |
|---------|---------------|
| API     | Node.js + Express 5 + Mongoose |
| Auth    | JWT (`jsonwebtoken`) + bcryptjs |
| Media   | Multer memory + Cloudinary uploads |
| Realtime| Socket.IO |
| Web     | Vite + React + React Router + TanStack Query |
| Forms   | React Hook Form + Zod |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |

## Screenshots

> Add PNGs under `screenshots/` and update paths as needed.

- ![Dashboard](./screenshots/dashboard.png)
- ![Security Check-In](./screenshots/check-in.png)

## Repo layout

```
vpms/
├─ backend/                 # Express API
│  ├─ config/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ utils/
│  ├─ server.js
│  └─ package.json
├─ frontend/                # Vite React SPA
│  ├─ src/api/
│  ├─ src/components/
│  ├─ src/pages/
│  ├─ src/hooks/
│  ├─ src/context/
│  └─ package.json
├─ package.json             # Workspace scripts (`dev`, `install:all`)
└─ README.md
```

## Setup (local)

### Prereqs

- Node.js 20+ recommended
- MongoDB running locally (default `mongodb://localhost:27017/vpms`)

### Install

From `vpms/`:

```bash
npm run install:all
```

### Environment

Backend template: `backend/.env`  
Frontend template: `frontend/.env`

At minimum configure:

- `MONGO_URI`, `JWT_SECRET`
- Gmail SMTP + Twilio if you want notifications
- Cloudinary if you want PDF/photo uploads to succeed (otherwise uploads may be skipped)
- Add multiple origins comma-separated if needed: `CLIENT_URL=http://localhost:5173`

### Bootstrap first admin

On a fresh DB, create the first admin user:

```bash
curl -X POST http://localhost:5000/api/bootstrap/admin ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Admin\",\"email\":\"admin@example.com\",\"password\":\"ChangeMe123456\",\"location\":\"hq\"}"
```

Then sign in via the SPA and use **Admin → Users** to invite other roles.

### Run

Terminal 1+2 manually:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

Or from `vpms/`:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API health: `GET http://localhost:5000/health`
- Socket.IO shares the API origin (connect to `http://localhost:5000` from the SPA)

## API documentation (overview)

Legend:

- **Auth**: `Bearer <JWT>` unless marked public  
- Roles: matches `ROLES.*` enums

| Method | Route | Description | Auth | Roles |
|--------|-------|-------------|------|-------|
| GET | `/health` | Process health ping | Public | Any |
| POST | `/api/bootstrap/admin` | One-time bootstrap admin creation | Public | Fresh DB |
| POST | `/api/auth/register` | Register user (admins choose role) | Yes | Admin |
| POST | `/api/auth/login` | Login | Public | Any |
| GET | `/api/auth/me` | Profile | Yes | Any |
| PUT | `/api/auth/me` | Update profile | Yes | Any |
| POST | `/api/visitors` | Create visitor (+ optional photo multipart) | Yes | Admin, Security, Employee |
| GET | `/api/visitors` | List/search/paginate visitors | Yes | Admin, Security |
| GET | `/api/visitors/:id` | Visitor detail | Yes | Admin, Security |
| PUT | `/api/visitors/:id` | Update visitor | Yes | Admin, Security |
| DELETE | `/api/visitors/:id` | Soft-delete visitor | Yes | Admin |
| PUT | `/api/visitors/:id/approve` | Approve visitor | Yes | Admin, Employee |
| PUT | `/api/visitors/:id/reject` | Reject visitor | Yes | Admin, Employee |
| POST | `/api/appointments` | Create appointment + visitor invite | Yes | Admin, Employee |
| POST | `/api/appointments/:token/pre-register` | Visitor completes registration | Public | Token |
| GET | `/api/appointments` | List/filter appointments | Yes | Any (employee scoped server-side) |
| GET | `/api/appointments/:id` | Appointment detail | Yes | Any |
| PUT | `/api/appointments/:id` | Update appointment | Yes | Admin, Employee |
| DELETE | `/api/appointments/:id` | Cancel appointment | Yes | Admin, Employee |
| POST | `/api/appointments/:id/approve` | Approve appointment + notifications | Yes | Admin, Employee |
| POST | `/api/passes/generate/:visitorId` | Issue pass (QR + PDF) | Yes | Admin, Security |
| GET | `/api/passes` | List passes (security scoped by location) | Yes | Admin, Security |
| GET | `/api/passes/my` | Visitor’s latest pass | Yes | Visitor |
| GET | `/api/passes/verify/:passCode` | Verify pass QR payload | Public | Any |
| GET | `/api/passes/:id` | Pass detail | Yes | Admin, Security |
| PUT | `/api/passes/:id/deactivate` | Deactivate compromised pass | Yes | Admin, Security |
| POST | `/api/checks/check-in` | Scan + check-in | Yes | Admin, Security |
| POST | `/api/checks/check-out` | Scan + check-out | Yes | Admin, Security |
| GET | `/api/checks/logs` | Filterable logs (security scoped) | Yes | Admin, Security |
| GET | `/api/dashboard/stats` | Operational KPI rollup | Yes | Admin, Security, Employee |
| GET | `/api/dashboard/recent` | Recent security events | Yes | Admin, Security, Employee |
| GET | `/api/dashboard/export` | Visitors CSV (`json2csv`) | Yes | Admin, Security |
| GET | `/api/analytics/summary` | Admin analytics summary | Yes | Admin |
| GET | `/api/analytics/peak-hours` | Check-in hourly heat buckets | Yes | Admin |
| GET | `/api/analytics/average-duration` | Avg inferred visit duration | Yes | Admin |
| GET | `/api/audit-logs` | Filterable audit viewer | Yes | Admin |

## Environment variables

| Name | Purpose |
|------|---------|
| `PORT` | API port (`5000`) |
| `MONGO_URI` | Mongo connection string |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | JWT signing settings |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated |
| `CLOUDINARY_*` | Media uploads (photos + raw PDF uploads) |
| `EMAIL_*` | SMTP transport (`nodemailer`) |
| `TWILIO_*` | SMS transport (`twilio`) |
| `VITE_API_URL` | SPA axios base (`http://localhost:5000/api`) |

## Deployment notes

### Backend → Railway

- Provision MongoDB Atlas (recommended over container disk)
- Set env vars in Railway service
- Start command: `npm run start --prefix backend` (or `node server.js`)

### Frontend → Vercel

- Framework: **Vite**
- Set `VITE_API_URL` to your Railway API (`https://.../api`)
- Ensure `CLIENT_URL` on API includes your Vercel domain

## Scripts

Root `vpms/package.json`:

- `npm run install:all` installs root + workspaces
- `npm run dev` runs backend + frontend concurrently

## Security notes

- `helmet`, CORS allowlist (`CLIENT_URL`), `express-rate-limit` on `/api/auth`
- JWT verification middleware attaches `req.user`
- Sensitive actions audited via `AuditLog`

## License

MIT
