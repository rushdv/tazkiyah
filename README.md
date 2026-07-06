# Tazkiyah

**Build Better Habits. Strengthen Your Deen.**

Tazkiyah is a modern Islamic habit tracker that helps Muslims consistently maintain their daily worship, build positive habits, and monitor their spiritual progress through beautiful analytics and weekly reports.

---

## Features

- ✅ **Morning & Evening Azkar** tracking
- ✅ **Dua** completion tracking
- ✅ **Quran** reading (30 min goal)
- ✅ **Exercise** (25 min goal)
- ✅ **Islamic Learning** (30 min goal)
- ✅ **Daily Dashboard** with progress rings and inspiration
- ✅ **Monthly Calendar** with day-by-day completion
- ✅ **Weekly Reports** with export capability
- ✅ **Monthly Analytics** with charts and trends
- ✅ **Streak Tracking** (current and longest)
- ✅ **Achievement System** (7, 30, 100 day streaks)
- ✅ **History** with search, filter, and edit
- ✅ **Dark Mode** first design
- ✅ **Responsive** mobile-friendly layout

---

## Tech Stack

### Frontend
- React 19, Vite, TypeScript
- Tailwind CSS v4, shadcn/ui, Radix UI
- React Router v7, TanStack Query
- Framer Motion, Recharts
- Lucide React, Sonner, next-themes

### Backend
- Node.js, Express.js, TypeScript
- Prisma ORM, PostgreSQL
- JWT Authentication, bcrypt
- Zod Validation, Helmet, CORS
- Rate Limiter, Morgan Logger

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- Swagger/OpenAPI Documentation

---

## Project Structure

```
tazkiyah/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI and feature components
│   │   │   ├── ui/         # Base UI components
│   │   │   ├── layout/     # Sidebar, AppLayout
│   │   │   └── habits/     # HabitCard, etc.
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities, API client, store
│   │   ├── pages/          # Route pages
│   │   └── styles/         # Global CSS
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # App configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access layer
│   │   ├── middlewares/    # Auth, validation, error handling
│   │   ├── routes/         # API routes
│   │   └── utils/          # Helpers (JWT, response, motivation)
│   ├── prisma/             # Database schema and migrations
│   └── ...
├── shared/                 # Shared types and validation schemas
├── docker/                 # Docker compose files
├── docs/                   # Additional documentation
└── .github/workflows/      # CI/CD pipelines
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL >= 16
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tazkiyah.git
cd tazkiyah

# Install all dependencies
npm run setup

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your configuration

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start development servers
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **API Docs**: http://localhost:4000/api-docs

### Docker Setup

```bash
# Development
docker-compose -f docker/docker-compose.dev.yml up

# Production
docker-compose -f docker/docker-compose.prod.yml up
```

---

## Environment Variables

### Server (`server/.env`)

```
NODE_ENV=development
PORT=4000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tazkiyah

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_REMEMBER_EXPIRES_IN=30d

CORS_ORIGIN=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## API Documentation

Full API documentation is available at `/api-docs` when the server is running.

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/change-password` | Change password |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |

### Habit Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/habits` | Get all habits |

### Record Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/records/today` | Get today's dashboard data |
| POST | `/api/v1/records` | Create/update habit record |
| PATCH | `/api/v1/records/:id` | Update habit record |
| GET | `/api/v1/records/history` | Get paginated history |
| GET | `/api/v1/records/day/:date` | Get day details |
| GET | `/api/v1/records/weekly-report` | Get weekly report |
| GET | `/api/v1/records/analytics/:year/:month` | Get monthly analytics |

---

## Database

### Schema Overview

- **User** - User accounts with authentication
- **Habit** - Predefined habits (morning_azkar, evening_azkar, dua, quran, exercise, islamic_learning)
- **HabitRecord** - Daily habit completion records
- **Streak** - User streak tracking
- **Achievement** - Achievement definitions
- **UserAchievement** - User achievement progress
- **Reminder** - User reminder settings
- **Setting** - User preferences

### Commands

```bash
npm run db:migrate    # Run migrations
npm run db:push       # Push schema to database
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Seed initial data
```

---

## Deployment

### Build

```bash
npm run build
```

This produces:
- `server/dist/` - Compiled server code
- `client/dist/` - Static client assets

### Docker Production

```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

---

## Future Features

- Dhikr Counter
- Tasbeeh Counter
- Prayer Tracker
- Quran Reading Progress
- Memorization Tracker
- Daily Goals
- Journal & Islamic Notes
- Ramadan Mode
- Charity Tracker
- Fasting Tracker
- Multi-language Support
- Push Notifications
- PWA
- Mobile App

---

## License

MIT
