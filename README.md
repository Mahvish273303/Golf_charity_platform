# Golf Charity Subscription Platform

Modern full-stack platform for golf subscriptions, score tracking, monthly draws, and charity contribution management with separate user/admin experiences.

## Features

- JWT authentication (signup/login) with bcrypt password hashing
- Role-based access control (`USER`, `ADMIN`)
- User dashboard with profile, selected charity, contribution %, scores, subscription, and draw result
- Admin dashboard with user/charity/subscription/draw/winner-verification management
- Charity selection in signup and dashboard
- Subscription workflow with active/inactive states
- Last-5 score retention logic

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs
- **Database:** MongoDB

## Setup

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure environment

`backend/.env`

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
```

`frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:4000
```

### 3) Seed admin and charities

```bash
cd backend
npm run create:admin
npm run seed:charities
```

### 4) Run app

```bash
cd backend && npm run dev
cd ../frontend && npm run dev
```

## Admin Credentials

- **Email:** `mahvishpathan354@gmail.com`
- **Password:** `123456`

## Key APIs

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/users/select-charity`
- `POST /api/subscription/subscribe`
- `GET /api/subscription/status`
- `POST /api/subscription/cancel`

## Health Check

- `GET /api/test` → `{ "message": "API working" }`
