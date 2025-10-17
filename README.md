# UWPlanit

A production-ready web application for University of Waterloo course planning, featuring interactive course graphs, plan management, and comprehensive course data.

## 🎯 Features

- **Interactive Course Graph**: Visualize courses and their relationships (prerequisites, corequisites, antirequisites) using Cytoscape.js
- **Course Search & Filter**: Search courses by code, subject, level, term, and keywords
- **Course Planning**: Create and manage course plans with a drag-and-drop canvas
- **Checklist Management**: Track course requirements with nested checklists
- **Import/Export**: Save and share plans as JSON
- **Official Data**: Pulls course data from University of Waterloo Open Data API
- **Redis Caching**: Fast performance with intelligent caching
- **Supabase Auth**: Secure authentication with magic links/OTP

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 16 (via Supabase)
- **Cache**: Redis 7
- **Auth**: Supabase JWT
- **Jobs**: BullMQ + node-cron
- **Logging**: Pino

### Frontend (To be implemented)
- **Framework**: Next.js 14 with TypeScript
- **UI**: Tailwind CSS, Shadcn UI, Radix UI
- **Graph**: Cytoscape.js with custom layouts
- **State**: Zustand, TanStack React Query
- **Validation**: Zod

### DevOps
- **Containers**: Docker & Docker Compose
- **Deployment**: Vercel (Frontend) + Fly.io/Render (Backend)

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Supabase account)
- Redis 7+
- Docker & Docker Compose (for local development)
- UW Open Data API key (optional)

## 🚀 Getting Started

### Clone the Repository

```bash
git clone <your-repo-url>
cd UWPlanit
```

### Backend Setup

```bash
# Navigate to API directory
cd apps/api

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Required: DATABASE_URL, REDIS_URL, SUPABASE_JWT_SECRET
```

### Using Docker (Recommended)

```bash
# From project root
docker-compose up

# In another terminal, run migrations
docker-compose exec api npm run migrate

# (Optional) Seed with sample data
docker-compose exec api npm run seed
```

The API will be available at `http://localhost:4000`

### Local Development (Without Docker)

```bash
# Ensure PostgreSQL and Redis are running locally

# Run migrations
cd apps/api
npm run migrate

# (Optional) Seed database
npm run seed

# Start development server
npm run dev
```

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api/v1
```

### Endpoints

#### Public Endpoints

**Health Check**
```http
GET /api/v1/health
```

**Search Courses**
```http
GET /api/v1/courses?search=CS&subject=CS&level=200&limit=50
```

**Get Course Details**
```http
GET /api/v1/courses/:course_id
```

**Get Global Graph**
```http
GET /api/v1/graph/global
```

**Get Subject Graph**
```http
GET /api/v1/graph/subject/:subject
```

#### Authenticated Endpoints

All plan and checklist endpoints require `Authorization: Bearer <token>` header.

**Get User Plans**
```http
GET /api/v1/plans/mine
```

**Create Plan**
```http
POST /api/v1/plans
Content-Type: application/json

{
  "name": "My Plan"
}
```

**Add Course to Plan**
```http
POST /api/v1/plans/:plan_id/items
Content-Type: application/json

{
  "course_id": "uuid",
  "term": "F2024",
  "pos_x": 100,
  "pos_y": 200
}
```

**Export Plan**
```http
GET /api/v1/plans/:plan_id/export
```

**Import Plan**
```http
POST /api/v1/plans/import
Content-Type: application/json

{
  "name": "Imported Plan",
  "items": [...],
  "checklist": [...]
}
```

See `apps/api/README.md` for complete API documentation.

## 🗄 Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - User accounts
- `courses` - Course catalog
- `course_relations` - Prerequisites, corequisites, antirequisites
- `plans` - User course plans
- `plan_items` - Courses in plans with positions
- `checklist_items` - Checklist items with nesting support
- `etl_runs` - ETL job tracking

See `apps/api/src/db/schema.sql` for the complete schema.

## 🔄 ETL Process

The ETL (Extract, Transform, Load) process ingests course data from the UW Open Data API:

- **Frequency**: Weekly (Sundays at 2 AM)
- **Scope**: CS and MATH courses (configurable)
- **Features**: Automatic cache invalidation, error tracking, incremental updates

Manual ETL trigger (requires admin access):
```bash
# Coming soon
```

## 🏗 Project Structure

```
UWPlanit/
├── apps/
│   └── api/                 # Express.js backend
│       ├── src/
│       │   ├── config/      # Configuration (env, db, redis, logger)
│       │   ├── db/          # Database schemas and migrations
│       │   ├── jobs/        # Background jobs (ETL, scheduler)
│       │   ├── middleware/  # Express middleware
│       │   ├── routes/      # API routes
│       │   ├── services/    # Business logic
│       │   ├── types/       # TypeScript types
│       │   ├── utils/       # Utility functions
│       │   └── index.ts     # Entry point
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml
├── instructions.md          # Project blueprint
└── README.md
```

## 🧪 Testing

```bash
cd apps/api
npm test
```

## 📦 Deployment

### Backend (Express API)

**Option 1: Fly.io**
```bash
# Coming soon
```

**Option 2: Render**
```bash
# Coming soon
```

**Option 3: AWS EC2 with Docker**
```bash
# Coming soon
```

### Frontend (Next.js)

**Deploy to Vercel**
```bash
# Coming soon
```

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/uwplanit

# Redis
REDIS_URL=redis://localhost:6379

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_JWT_SECRET=xxx

# UW API
UW_API_BASE=https://api.uwaterloo.ca/v3
UW_API_KEY=xxx

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60
```

See `.env.example` for all options.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- University of Waterloo for the Open Data API
- UWFlow for design inspiration
- The open-source community

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for University of Waterloo students
