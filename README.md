# Golf Charity Subscription Platform

A full-stack web platform where users subscribe, submit golf scores, participate in monthly draws, and contribute to charities through a transparent donation model. The system includes secure authentication, role-based access control, user/admin dashboards, and deployment-ready configuration for modern cloud hosting.

## Features

- Subscription system with monthly/yearly plans and active status tracking
- Score tracking with automatic last-5-scores logic per user
- Draw system with monthly draw generation, publishing, results, and winnings
- Charity contribution flow with charity selection and contribution percentage controls
- Admin dashboard for users, charities, draws, subscriptions, reports, and winner verification

## Tech Stack

- Frontend: React, Tailwind CSS, Vite, Axios, React Router
- Backend: Node.js, Express, Prisma ORM, JWT authentication
- Database: Supabase PostgreSQL

## Local Setup

### 1) Clone Repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2) Install Dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3) Configure Environment Files

Create the files below from examples:

- `backend/.env` from `backend/.env.example`
- `frontend/.env` from `frontend/.env.example`

### 4) Run Backend

```bash
cd backend
npm run dev
```

Backend runs on:

- `http://localhost:4000`

### 5) Run Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on:

- `http://localhost:5173`

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://<supabase_pooler_connection_string>
DIRECT_URL=postgresql://<supabase_direct_connection_string>
JWT_SECRET=<strong_random_secret>
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Notes:

- `DATABASE_URL` is required for app runtime.
- `DIRECT_URL` is recommended for migrations/deploy operations.
- `FRONTEND_URL` supports comma-separated values in production (multiple allowed origins).

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:4000
```

In production, set `VITE_API_BASE_URL` to your deployed backend API URL.

## Deployment

### Backend (Render)

1. Create a new **Web Service** from the GitHub repository.
2. Configure service:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Set environment variables:
   - `DATABASE_URL`
   - `DIRECT_URL` (optional but recommended)
   - `JWT_SECRET`
   - `PORT`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://<your-frontend-domain>.vercel.app`
4. Deploy.

### Frontend (Vercel)

1. Import the same GitHub repository.
2. Configure project:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-backend-domain>.onrender.com`
4. Deploy.

Routing support for SPA refresh is configured in `frontend/vercel.json`.

## Live Links

- Frontend URL: `https://<your-frontend-app>.vercel.app`
- Backend API URL: `https://<your-backend-service>.onrender.com`
- GitHub Repo: `https://github.com/<your-username>/<your-repo>`

## Testing Instructions

### Signup / Login

1. Open frontend and go to `/signup`.
2. Register a new user account.
3. Go to `/login` and authenticate.
4. Confirm redirect to user dashboard.

### Subscription Flow

1. In user dashboard, subscribe with monthly or yearly plan.
2. Verify subscription status becomes active.
3. Optionally cancel subscription and verify status update.

### Score Entry (Last 5 Logic)

1. Add at least 6 scores from dashboard.
2. Open score history.
3. Confirm only the latest 5 scores remain.

### Draw System

1. Login as admin.
2. Generate draw, preview draw, then publish draw.
3. As user, check draw result and winnings section.

### Charity Selection

1. Open charity directory/profile.
2. Select a charity from dashboard flow.
3. Verify user profile reflects selected charity and contribution percentage.

### Admin Panel

1. Login using admin account.
2. Validate access to:
   - User management
   - Charity management
   - Draw controls
   - Subscription management
   - Winner verification
   - Reports

## API Health Check

- `GET /api/test` on backend base URL should return:

```json
{ "message": "API working" }
```
