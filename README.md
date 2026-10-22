# ResolveHub

A role-based **payment dispute management platform** built with the MERN stack (MongoDB, Express, React, Node.js).

A customer raises a dispute about a failed, duplicate or unrefunded payment and attaches evidence. The merchant, bank and payment gateway involved review the case, assign it to an employee, update its status and talk to the customer, all in one shared workflow with notifications and a full audit timeline.

## 🚀 Live demo

**https://resolve-hub-gold.vercel.app**

Open the login page and click one of the **"Try the live demo"** buttons. There's no sign-up, and each role sees a different view of the app:

| Button | Logs in as | What to try |
|---|---|---|
| Customer | Demo Customer | Track the sample disputes, raise a new one with a screenshot attached |
| Org Admin | ShopKart admin | See every ShopKart case, assign the open one to an employee |
| Employee | ShopKart agent | Update a case's status, reply to the customer |
| Platform Admin | Admin | Manage organizations, view platform-wide reports |

> The free backend sleeps when idle, so the first click can take up to a minute.
> Demo account passwords can't be changed, so the demo keeps working for everyone.

![Dispute details](docs/screenshots/orgadmin-dispute.png)

## Features

**Customers**
- Sign up with email OTP verification (or Google sign-in), and log in
- Raise a dispute: transaction details, merchant / bank / gateway, issue type, priority, description, plus up to 5 evidence files (JPG, PNG, WEBP or PDF, 5 MB each)
- Track status, see a stage progress bar and SLA deadline, message the case team, and add more evidence
- Withdraw a dispute while it is still open and unassigned

**Organization admins** (merchant, bank or gateway)
- See every dispute that involves their organization
- Assign cases to employees in their own organization
- Update status and stage with remarks, and post timeline updates
- Manage their team: add employees, deactivate or reactivate them, and see each person's active case load

**Employees**
- See and work only the cases assigned to them

**Platform admin**
- See all disputes; create, edit, deactivate or delete organizations; add organization admins and employees
- Reopen closed disputes

**Everyone**
- Role-specific dashboards built from live data
- Notifications with an unread badge, mark as read / read all, and links back to the dispute; customers are also emailed when their dispute's status changes
- Reports: monthly trend, breakdown by status and issue type, resolution rate, average resolution time, CSV export and print/PDF, all limited to the data the user is allowed to see
- Profile editing and password change
- Responsive layout that works on mobile

## Security and authorization

- JWT authentication; passwords hashed with bcrypt
- Every dispute endpoint checks per-dispute access: a customer sees only their own disputes, an employee only assigned ones, an org admin only those involving their organization. Unauthorized IDs return `404`, so dispute IDs can't be probed.
- Dispute creation accepts only whitelisted fields. Status, customer and assignment can't be injected through the request body.
- Organization admins can only assign employees from their own organization.
- Evidence files are validated by type and size. Local files are **not** served publicly; they stream through an authorized endpoint.
- Rate limiting on login, signup, OTP and password-reset routes; `helmet` security headers
- Password reset doesn't reveal whether an email is registered
- CSV export protects against spreadsheet formula injection

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS 4, lucide-react, Recharts, Sonner (toasts), Axios, Vite |
| Backend | Node.js 22, Express 5 (ES modules), Mongoose 9, JWT, bcrypt, Multer, Nodemailer, google-auth-library |
| Database | MongoDB |
| Storage | Cloudinary when configured, otherwise local disk |
| DevOps | Docker, Docker Compose, Nginx, GitHub Actions |

## Project structure

```
backend/
  config/         MongoDB + Cloudinary setup
  controllers/    auth, disputes, organizations, notifications, reports, OTP, password reset, Google
  middleware/     JWT auth + role guard, evidence upload
  models/         User, Organization, Dispute, Notification, OTP
  routes/
  utils/          access rules (disputeAccess.js), notifications, email, tokens
  tests/          end-to-end API tests (node:test)
  seed.js         demo admin, organizations and staff
frontend/
  src/components/ layout (sidebar, navbar) and shared UI
  src/pages/      auth, dashboard, disputes, organizations, team, reports, notifications, settings, support
  src/services/   Axios API client
```

## Getting started

### Prerequisites
- Node.js 20 or newer
- A MongoDB database (local or MongoDB Atlas)

### 1. Backend

```bash
cd backend
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm install
npm run seed              # optional: demo accounts (see below)
npm run dev               # http://localhost:5000
```

In development, if `EMAIL_USER` / `EMAIL_PASS` are empty, OTP emails are **printed to the backend console** instead of being sent.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

### Demo accounts (after `npm run seed`)

`npm run seed` creates these accounts plus 5 sample disputes for the demo customer (skip them with `SEED_SAMPLE_DATA=false`).
All demo accounts use the password `Demo@1234` (change it with `SEED_PASSWORD`, and set the same value as `VITE_DEMO_PASSWORD` in the frontend).
The login page shows one-click buttons for them; hide the buttons by building the frontend with `VITE_DEMO_MODE=false`.

| Role | Email |
|---|---|
| Platform admin | admin@resolvehub.example |
| Customer | customer@resolvehub.example |
| Org admin – ShopKart (e-commerce) | admin@shopkart.example |
| Employee – ShopKart | agent@shopkart.example |
| Org admin – National Bank | admin@nationalbank.example |
| Employee – National Bank | agent@nationalbank.example |
| Org admin – PayFlow Gateway | admin@payflow.example |
| Employee – PayFlow Gateway | agent@payflow.example |

## Environment variables

**backend/.env** (see `backend/.env.example`)

| Name | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing tokens (long random string) |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS, comma separated |
| `EMAIL_USER`, `EMAIL_PASS` | Gmail address and App Password for OTP emails |
| `REQUIRE_EMAIL_VERIFICATION` | `true` (default) requires email OTP at signup |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Optional cloud storage for evidence |

**frontend/.env**: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_SUPPORT_EMAIL`

## API overview

All routes are under `/api`. Everything except auth, OTP and password reset requires `Authorization: Bearer <token>`.

| Method | Route | Who |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | Public |
| GET, PUT | `/auth/profile` · PUT `/auth/change-password` | Logged in |
| POST | `/otp/send-email-otp`, `/otp/verify-email-otp` | Public |
| POST | `/password/send-reset-otp`, `/verify-reset-otp`, `/reset-password` | Public |
| POST | `/google/google` | Public |
| GET | `/disputes` (filters: `status`, `priority`, `search`, `page`) | Role-scoped |
| GET | `/disputes/dashboard-summary` | Role-scoped |
| POST | `/disputes` (multipart, `evidence` files) | Customer |
| GET, DELETE | `/disputes/:id` | Participants / owner / admin |
| POST | `/disputes/:id/comments`, `/disputes/:id/evidence` | Participants |
| GET | `/disputes/:id/evidence/:evidenceId` | Participants |
| PUT | `/disputes/:id/status` · POST `/disputes/:id/timeline` | Org admin, assigned employee, admin |
| GET, PUT | `/disputes/:id/assignable-employees` · `/disputes/:id/assign` | Org admin, admin |
| GET, POST, PUT, DELETE | `/organizations`, `/organizations/:id` | List: all · manage: admin |
| GET, POST | `/organizations/:id/members` · PUT `/members/:userId/status` | Admin, own org admin |
| GET, PUT, DELETE | `/notifications`, `/notifications/unread-count`, `/:id/read`, `/read-all`, `/:id` | Logged in |
| GET | `/reports/summary`, `/reports/export/csv` (`from`, `to`) | Role-scoped |
| GET | `/health` | Public |

## Testing

```bash
cd backend
TEST_MONGO_URI=mongodb://localhost:27017/resolvehub_test npm test
```

The suite starts the server against the test database (which it **drops first**), seeds it, and checks the full workflow across all four roles: signup with OTP, dispute creation and validation, evidence upload and download, access isolation between users and organizations, assignment rules, status changes, comments, notifications, dashboards, reports, CSV export and organization management.

GitHub Actions (`.github/workflows/ci.yml`) runs these tests against a MongoDB service, plus frontend lint and build and both Docker image builds.

## Docker

```bash
cp backend/.env.example backend/.env   # set JWT_SECRET at minimum
docker compose up --build
docker compose exec backend npm run seed
```

The app runs at http://localhost:8080. Nginx serves the React build and proxies `/api` to the backend. MongoDB data and uploaded evidence persist in named volumes.

## Deploying to AWS

Step-by-step guide: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**. It covers MongoDB Atlas, the backend on Elastic Beanstalk (Docker), the frontend on Amplify Hosting with an `/api` proxy, Cloudinary storage, environment variables and an end-to-end checklist.

## Screenshots

### Sign in
| Login | Sign up with email OTP |
|---|---|
| ![Login](docs/screenshots/login.png) | ![Sign up](docs/screenshots/signup.png) |

### Customer
| Dashboard | Raise a dispute |
|---|---|
| ![Customer dashboard](docs/screenshots/customer-dashboard.png) | ![Raise a dispute](docs/screenshots/raise-dispute.png) |
| **My disputes** | **Dispute details & conversation** |
| ![My disputes](docs/screenshots/customer-disputes.png) | ![Customer dispute details](docs/screenshots/customer-dispute-details.png) |
| **Notifications** | **Settings** |
| ![Notifications](docs/screenshots/notifications.png) | ![Settings](docs/screenshots/settings.png) |

### Organization admin & employee
| Org admin dashboard | Assigning a case |
|---|---|
| ![Org admin dashboard](docs/screenshots/orgadmin-dashboard.png) | ![Org admin dispute](docs/screenshots/orgadmin-dispute.png) |
| **Team management** | **Employee resolves the case** |
| ![Team](docs/screenshots/team.png) | ![Employee resolved](docs/screenshots/employee-resolved.png) |

### Platform admin
| Admin dashboard | Organizations |
|---|---|
| ![Admin dashboard](docs/screenshots/admin-dashboard.png) | ![Organizations](docs/screenshots/organizations.png) |
| **Reports & analytics** | |
| ![Reports](docs/screenshots/reports.png) | |

### Mobile
| Dashboard | Menu | Dispute details |
|---|---|---|
| ![Mobile dashboard](docs/screenshots/mobile-dashboard.png) | ![Mobile menu](docs/screenshots/mobile-menu.png) | ![Mobile dispute](docs/screenshots/mobile-dispute.png) |
