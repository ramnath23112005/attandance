# Attandance — Production-Grade Attendance Management System

A full-stack attendance management application built with **React 19**, **TypeScript**, **Node.js**, **Express**, **MongoDB**, and **Material UI**. Features JWT authentication with role-based access control (Admin/Faculty/Student), dynamic timetable management, advanced analytics with prediction engine, and modern frontend patterns.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Material UI 5, TanStack Query 5, React Router 7, Recharts, React Hook Form, Zod |
| **Backend** | Node.js 20, Express 4, TypeScript, Mongoose 8, JWT, bcrypt, Zod validation |
| **Database** | MongoDB 7 (via Mongoose ODM) |
| **Infrastructure** | Docker, Docker Compose, GitHub Actions CI/CD |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Frontend (Vite + React)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  Pages    │ │Components│ │  Hooks   │ │Services│ │
│  │(lazy load)│ │  (MUI)   │ │(useQuery)│ │(axios) │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │
│       └────────────┴────────────┴────────────┘      │
│                         │                            │
│              AuthContext (JWT tokens)                 │
└─────────────────────────┬────────────────────────────┘
                          │ HTTP (REST API)
┌─────────────────────────┴────────────────────────────┐
│              Backend (Express + TypeScript)           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  Routes  │ │Controllers│ │ Services │ │ Models │ │
│  │(RESTful) │ │ (thin)   │ │(business)│ │(Mongo) │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │
│       └────────────┴────────────┴────────────┘      │
│                         │                            │
│              Middleware: Auth, RBAC, Validation       │
└─────────────────────────┬────────────────────────────┘
                          │
                   ┌──────┴──────┐
                   │   MongoDB   │
                   │  (Atlas)    │
                   └─────────────┘
```

### Design Decisions

| Decision | Rationale |
|---|---|
| **Service Layer** | Business logic separated from HTTP layer — controllers are thin delegates |
| **Repository Pattern** | Mongoose models wrapped in services for testability |
| **Zod Validation** | Shared validation schemas on both frontend and backend |
| **TanStack Query** | Automatic caching, background refetching, and request deduplication |
| **Vite** | Faster cold starts, HMR, and build times vs Create React App |
| **TypeScript strict mode** | Catches type errors at compile time — no `any` types |

---

## Features

### Authentication & Authorization
- JWT access + refresh token flow
- Role-based access: Admin, Faculty, Student
- Protected routes with lazy loading
- Auto-refresh on token expiry

### Timetable Management
- Admin creates/edits/deletes timetable entries
- Weekly view with color-coded days
- Faculty assignment per slot
- Room and section mapping

### Attendance Marking
- Mark single or bulk attendance
- Link to specific timetable slot
- Prevent duplicate marking
- Edit status after marking
- Calendar date picker

### Analytics Engine
- Overall attendance %
- Subject-wise breakdown
- Weekly / Monthly / Semester stats
- 12-month trend analysis
- Attendance heatmap
- Radar chart for subject comparison

### Prediction System
- Current vs target %
- Lectures required to reach target
- Maximum skippable lectures
- On-track status with warnings
- Projected final percentage

### Dashboard
- Summary cards (Present/Absent/Leave)
- Pie chart distribution
- Monthly trend area chart
- Subject-wise bar chart
- Prediction widget
- Weekly snapshot

### Export
- CSV export of attendance records
- HTML report generation (printable as PDF)
- Formatted with summary cards and subject tables

---

## API Contracts

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| POST | `/api/auth/refresh-token` | — | Refresh access token |
| GET | `/api/auth/profile` | JWT | Get current user profile |
| GET | `/api/auth/users` | Admin | List all users |

### Attendance

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/attendance` | Faculty/Admin | Mark attendance |
| POST | `/api/attendance/bulk` | Faculty/Admin | Bulk mark attendance |
| PUT | `/api/attendance/:id` | Faculty/Admin | Update status |
| DELETE | `/api/attendance/:id` | Admin | Delete record |
| GET | `/api/attendance` | All | Get own records (paginated) |
| GET | `/api/attendance/student/:userId` | All | Get student records |
| GET | `/api/attendance/date` | All | Get records by date |
| GET | `/api/attendance/stats/overall` | All | Overall percentage |
| GET | `/api/attendance/stats/subject` | All | Subject-wise stats |
| GET | `/api/attendance/stats/weekly` | All | Weekly stats |
| GET | `/api/attendance/stats/monthly` | All | Monthly stats |
| GET | `/api/attendance/stats/semester` | All | Semester stats |
| GET | `/api/attendance/stats/trend` | All | Monthly trend (6-12 mo) |
| GET | `/api/attendance/stats/heatmap` | All | Monthly heatmap |
| GET | `/api/attendance/stats/prediction` | All | Attendance prediction |

### Timetable

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/timetable` | All | List (paginated, filterable) |
| GET | `/api/timetable/weekly` | All | Full weekly timetable |
| GET | `/api/timetable/day/:day` | All | Get by day |
| GET | `/api/timetable/:id` | All | Get single entry |
| POST | `/api/timetable` | Admin | Create entry |
| PUT | `/api/timetable/:id` | Admin | Update entry |
| DELETE | `/api/timetable/:id` | Admin | Soft-delete entry |

### Subjects

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/subjects` | All | List subjects (paginated) |
| GET | `/api/subjects/:id` | All | Get single subject |
| POST | `/api/subjects` | Admin | Create subject |
| PUT | `/api/subjects/:id` | Admin | Update subject |
| DELETE | `/api/subjects/:id` | Admin | Soft-delete |

---

## Database Schema

### User
```
{
  _id: ObjectId,
  name: String [required],
  email: String [unique, required],
  password: String [select: false, required],
  role: enum [admin, faculty, student],
  department: String,
  isActive: Boolean [default: true],
  timestamps: true
}
Indexes: email(1), role(1), department(1)
```

### Subject
```
{
  _id: ObjectId,
  code: String [unique, required],
  name: String [required],
  department: String [required],
  semester: Number [1-8],
  isActive: Boolean [default: true],
  timestamps: true
}
Indexes: code(1), department+semester(1)
```

### Timetable
```
{
  _id: ObjectId,
  day: enum [Monday-Friday],
  period: String,
  periodOrder: Number,
  subject: String,
  subjectId: ref -> Subject,
  faculty: String,
  facultyId: ref -> User,
  room: String,
  section: String,
  startTime: String,
  endTime: String,
  isActive: Boolean [default: true],
  timestamps: true
}
Indexes: day+periodOrder(1), facultyId(1), subjectId(1), section(1)
```

### Attendance
```
{
  _id: ObjectId,
  userId: ref -> User,
  timetableId: ref -> Timetable,
  date: Date,
  day: String,
  period: String,
  subject: String,
  status: enum [Present, Absent, Leave],
  markedBy: ref -> User,
  timestamps: true
}
Indexes: userId+date(1), userId+subject(1), date(1), userId+date+period(unique), timetableId+date(1)
```

---

## Setup & Installation

### Prerequisites
- Node.js 20+
- MongoDB 7+ (local or Atlas)
- npm or yarn

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/ramnath23112005/attandance.git
cd attandance

# 2. Backend setup
cd backend
cp .env.example .env       # Edit .env with your MongoDB URI
npm install
npm run dev                 # Starts on http://localhost:5000

# 3. Frontend setup (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # Starts on http://localhost:3000

# 4. Seed the database (optional)
cd backend
npm run seed
```

### Docker Deployment

```bash
# Set secrets
export JWT_SECRET=your-secret-key
export JWT_REFRESH_SECRET=your-refresh-secret

# Build and start all services
docker-compose up -d --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# MongoDB:  mongodb://localhost:27017
```

### Test Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@attandance.com | Password123 |
| Faculty | sharma@attandance.com | Password123 |
| Student | ramnath@attandance.com | Password123 |

---

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

Test coverage:
- Auth: registration, login, token refresh
- Attendance: marking, validation, duplicate prevention
- Analytics: aggregation pipelines
- API: endpoint response format

---

## Deployment Strategy

### Production Architecture
```
User → Vercel (Frontend) → Render/Railway (Backend) → MongoDB Atlas (Database)
```

### CI/CD Pipeline (GitHub Actions)
1. Push to `main` triggers CI
2. Backend: lint → build → test
3. Frontend: lint → build → test
4. On success: auto-deploy frontend to Vercel

### Environment Variables (Production)

**Backend:**
- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Strong random string (min 32 chars)
- `JWT_REFRESH_SECRET` — Different strong random string
- `CORS_ORIGIN` — Frontend deployment URL
- `BCRYPT_SALT_ROUNDS=12`

**Frontend:**
- `VITE_API_URL` — Backend deployment URL

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with configurable expiry (15m access / 7d refresh)
- HTTP headers secured via Helmet
- CORS restricted to frontend origin
- Input validation via Zod on both client and server
- No sensitive data in client-side bundles
- Role-based access enforced at middleware level

---

## Performance Optimizations

- **Pagination** on all list endpoints (default 20-50 per page)
- **TanStack Query** caching (5-min stale time, automatic background refetch)
- **Lazy loading** via `React.lazy()` and `Suspense`
- **Code splitting** at route level (each page is a separate chunk)
- **MongoDB indexes** on all query patterns
- **Memoization** via React Query's structural sharing

---

## Project Structure

```
attandance/
├── backend/
│   └── src/
│       ├── config/          # Environment config
│       ├── controllers/     # HTTP handlers (thin)
│       ├── database/        # MongoDB connection + seed
│       ├── middleware/       # Auth, RBAC, error handler, validation
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routers
│       ├── services/        # Business logic layer
│       ├── types/           # TypeScript interfaces/enums
│       ├── utils/           # Helpers, ApiError, asyncHandler
│       ├── validators/      # Zod schemas
│       └── server.ts        # Entry point
├── frontend/
│   └── src/
│       ├── api/             # Axios client + endpoints
│       ├── context/         # AuthContext
│       ├── hooks/           # Custom hooks (useAttendance, etc.)
│       ├── layouts/         # DashboardLayout
│       ├── pages/           # Route-level page components
│       ├── routes/          # AppRouter + ProtectedRoute
│       ├── services/        # API service classes
│       ├── styles/          # MUI theme
│       ├── test/            # Test setup
│       └── types/           # Frontend TypeScript types
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
└── .github/workflows/ci.yml
```

---

## License

MIT
