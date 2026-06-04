# JobVista – Full Stack Job Portal

JobVista is a production-grade full-stack job portal that allows job seekers to search, apply, and track jobs, while companies can post and manage listings. Built with Spring Boot and React, it includes secure authentication, real-time features, role-based access, and a fully automated CI/CD pipeline.

**Live Demo:** :    https://jobvista-8qk6b12ls-jayswalhimanshu74-4107s-projects.vercel.app/
**Backend API:** https://jobvista-psro.onrender.com  
**GitHub:** https://github.com/jayswalhimanshu74-cmd/JobVista

---

## Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS
- Axios (with interceptors + auto token refresh)
- STOMP.js + SockJS (WebSocket)
- React Router v7
- Lucide React (icons)

### Backend
- Spring Boot 4.x (Java 17)
- Spring Security + JWT (access + refresh tokens)
- Spring WebSocket (STOMP)
- Spring Data JPA + Hibernate
- Flyway (database migrations)
- Caffeine Cache (TTL-based)
- Bucket4j (rate limiting)
- Spring Mail (Gmail SMTP)

### Database
- PostgreSQL (Render hosted)

### DevOps
- Docker
- GitHub Actions CI/CD
- Render (backend hosting)
- Vercel (frontend hosting)

### Integrations
- Adzuna Job API (external job sync)
- Gmail SMTP (email notifications)

---

## Features

### Job Seeker
- Register, login and manage profile
- Browse, search and filter jobs
- Apply to jobs with one click
- Save and unsave jobs
- View application history and status
- Upload and download resume (PDF only)
- Receive email notifications on apply and status change
- Real-time job updates via WebSocket
- AI-powered job recommendations based on skills and location

### Company
- Post, edit and delete job listings
- View and manage applications per job
- Update application status (Applied, Reviewed, Accepted, Rejected)
- Company profile with logo and banner

### Admin
- Full user management (view, activate, deactivate)
- Platform-wide application monitoring
- Company management
- Sync external jobs from Adzuna API

### System
- JWT authentication with httpOnly refresh token cookie
- Role-based access control (USER, COMPANY, ADMIN)
- IP-based rate limiting on login and register (10 req/min)
- File upload validation (type, size, extension whitelist)
- Pagination with server-side size guards (max 50/page)
- Flyway versioned database migrations
- Caffeine cache with 5-minute TTL
- WebSocket authentication via JWT STOMP headers
- React Error Boundaries with 404 fallback page
- Structured SLF4J logging throughout
- Automated CI/CD — every push triggers build verification

---

## Recent Updates (v2.0)

The following improvements were made to bring the project to industry standard:

**Security**
- Purged all credentials from Git history
- Refresh token removed from response body — httpOnly cookie only
- Rate limiting added to `/auth/login` and `/auth/register`
- File upload now validates MIME type and extension whitelist
- CORS restricted to specific production domains only
- Admin-only endpoints properly role-guarded

**Bug Fixes**
- Removed `unique=true` from `Job.title` — was crashing duplicate job titles
- Fixed dual seeder conflict between `AdminSeeder` and `DataInitializer`
- Fixed JWT expiry inconsistency (access: 15min, refresh: 7 days)
- Built `JobDetails.jsx` — was empty, crashing the app
- Fixed logger instantiation in `AuthController`
- Fixed `application/**` endpoints — now require authentication

**Architecture**
- Added Flyway migrations — replaced `ddl-auto=update`
- Switched to Caffeine cache with TTL and size limits
- Eliminated N+1 queries in job listings using `companyName` field
- Added WebSocket JWT authentication at STOMP level
- Added React Error Boundaries on all routes
- Built UI component library (Button, Card, Input, Toast)
- Replaced all `System.out.println` with SLF4J logging
- Added pagination size guards on all endpoints
- Added GitHub Actions CI/CD pipeline

---

## Project Structure

```
JobVista/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── backend/
│   ├── src/main/java/com/Backend/Jobvista/
│   │   ├── config/             # Security, Cache, WebSocket, RateLimit
│   │   ├── controller/         # REST API controllers
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA entities
│   │   ├── repository/         # Spring Data repositories
│   │   ├── security/           # JWT filter, service, refresh token
│   │   ├── service/            # Business logic
│   │   └── utills/             # PageUtils, EmailService, etc.
│   └── src/main/resources/
│       ├── db/migration/       # Flyway SQL migrations
│       └── application.properties
├── frontend/
│   └── src/
│       ├── api/                # Axios config, services, WebSocket
│       ├── components/
│       │   ├── layouts/        # Navbar, Sidebars
│       │   └── ui/             # Button, Card, Input, Toast, ErrorBoundary
│       ├── context/            # AuthContext
│       ├── pages/
│       │   ├── admin/          # Admin dashboard pages
│       │   ├── company/        # Company dashboard pages
│       │   └── user/           # Job seeker pages
│       └── styles/             # CSS modules
├── Dockerfile
└── README.md
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/jayswalhimanshu74-cmd/JobVista.git
cd JobVista
```

### 2. Backend Setup

```bash
cd backend
```

Create a `.env` file at the project root (never commit this):

```env
DB_URL=jdbc:postgresql://localhost:5432/jobvista
DB_USERNAME=postgres
DB_PASSWORD=your_password

JWT_SECRET_KEY=your_secret_minimum_32_chars

ADMIN_PASSWORD=your_admin_password

MAIL_USERNAME=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key

VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_WS_URL=http://localhost:8080
VITE_IMAGE_BASE_URL=http://localhost:8080
```

Run the backend:

```bash
./mvnw spring-boot:run
```

Backend runs at: `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `DB_URL` | PostgreSQL JDBC connection URL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET_KEY` | JWT signing secret (min 32 chars) — generate with `openssl rand -base64 32` |
| `ADMIN_PASSWORD` | Default admin account password |
| `MAIL_USERNAME` | Gmail address for sending emails |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not your login password) |
| `ADZUNA_APP_ID` | Adzuna API app ID |
| `ADZUNA_APP_KEY` | Adzuna API key |
| `VITE_API_BASE_URL` | Backend API base URL for frontend |
| `VITE_WS_URL` | WebSocket base URL for frontend |
| `VITE_IMAGE_BASE_URL` | Image/upload base URL for frontend |

---

## Docker

```bash
docker build -t jobvista .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=your_db_url \
  -e DB_USERNAME=your_username \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET_KEY=your_secret \
  jobvista
```

---

## CI/CD Pipeline

Every push to `main` triggers GitHub Actions:

- **Backend Build** — Maven compile and package
- **Frontend Build** — npm install and Vite build

Status badge reflects the health of the latest commit.

---

## API Documentation

Swagger UI is available at:
```
http://localhost:8080/swagger-ui.html
```

Key endpoint groups:

| Prefix | Access | Description |
|--------|--------|-------------|
| `/api/v1/auth/**` | Public | Register, login, refresh, logout |
| `/api/v1/job/**` | Public (GET) | Browse and search jobs |
| `/api/v1/company/**` | Public (GET) | Browse companies |
| `/api/v1/application/**` | Authenticated | Apply, withdraw, view applications |
| `/api/v1/users/**` | Authenticated | Profile management |
| `/api/v1/jobSeeker/**` | Authenticated | Job seeker profile and resume |
| `/api/v1/admin/**` | ADMIN only | User and platform management |

---

## Future Enhancements

**High Priority**
- Unit and integration test coverage (currently ~15%)
- AWS S3 or Cloudflare R2 for file storage (replace local filesystem — not persistent on Render free tier)
- Redis cache (replace Caffeine for multi-instance deployments)
- Email verification on registration

**Medium Priority**
- Password reset via email link
- OAuth2 login (Google, LinkedIn)
- Resume parsing with AI (extract skills and experience automatically)
- Advanced job filters (salary range, experience level, remote/onsite)
- Notification preferences (email, in-app)

**Nice to Have**
- Live chat between recruiter and applicant
- Mobile app (React Native)
- Company analytics dashboard (views, applications, conversion rate)
- Job alerts (email digest for saved searches)
- Interview scheduling integration

---

## Screenshots

> Add screenshots here

- Home Page
- Job Listings
- Job Details
- User Profile
- Company Dashboard
- Admin Dashboard

---

## Contributing

Contributions are welcome. Fork the repository, make your changes on a feature branch, and submit a pull request. Please ensure the CI pipeline passes before requesting a review.

---

## License

This project is open-source and available under the MIT License.

---

## Author

**Himanshu Jayswal**

- GitHub: https://github.com/jayswalhimanshu74-cmd
- Live: https://jobvista.

---

If you find this project useful, give it a star on GitHub!