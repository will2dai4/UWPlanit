# UWPlanit API

Express.js backend API for the UWPlanit course planning application.

## Features

- **Course Data**: Search and retrieve University of Waterloo course information
- **Graph API**: Generate course prerequisite/corequisite graphs in Cytoscape format
- **Plan Management**: Create, update, and manage course plans
- **Checklist**: Manage course checklists with nested items
- **ETL**: Automated data ingestion from UW Open Data API
- **Authentication**: Supabase JWT verification
- **Rate Limiting**: In-memory rate limiting per IP

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase JWT
- **Logging**: Pino
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Supabase account)
- UW Open Data API key (optional for development)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
```

### Development

```bash
# Run with hot reload
npm run dev

# Run database migrations
npm run migrate

# Type check
npm run type-check

# Lint
npm run lint
```

### Docker

```bash
# Build and run with Docker Compose (from project root)
docker-compose up

# Run migrations in Docker
docker-compose exec api npm run migrate
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Health & Info

- `GET /` - API information
- `GET /api/v1/health` - Health check

### Courses

- `GET /api/v1/courses` - Search courses
- `GET /api/v1/courses/:course_id` - Get course details

### Graph

- `GET /api/v1/graph/global` - Get global course graph
- `GET /api/v1/graph/subject/:subject` - Get subject-specific graph

### Plans (Auth Required)

- `GET /api/v1/plans/mine` - Get user's plans
- `POST /api/v1/plans` - Create new plan
- `GET /api/v1/plans/:plan_id` - Get plan details
- `PATCH /api/v1/plans/:plan_id` - Update plan
- `DELETE /api/v1/plans/:plan_id` - Delete plan

### Plan Items (Auth Required)

- `POST /api/v1/plans/:plan_id/items` - Add course to plan
- `PATCH /api/v1/plans/:plan_id/items/:item_id` - Update plan item
- `DELETE /api/v1/plans/:plan_id/items/:item_id` - Remove from plan

### Import/Export (Auth Required)

- `GET /api/v1/plans/:plan_id/export` - Export plan as JSON
- `POST /api/v1/plans/import` - Import plan from JSON

### Checklist (Auth Required)

- `GET /api/v1/plans/:plan_id/checklist` - Get checklist items
- `POST /api/v1/plans/:plan_id/checklist` - Create checklist item
- `PATCH /api/v1/plans/:plan_id/checklist/:item_id` - Update item
- `DELETE /api/v1/plans/:plan_id/checklist/:item_id` - Delete item
- `POST /api/v1/plans/:plan_id/checklist/parse-text` - Parse text to checklist

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_JWT_SECRET` - Supabase JWT secret for auth
- `UW_API_KEY` - University of Waterloo API key
- `CORS_ORIGIN` - Allowed CORS origins

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration (env, database, logger)
│   ├── db/             # Database schemas and migrations
│   ├── jobs/           # Background jobs (ETL, scheduler)
│   ├── middleware/     # Express middleware (auth, rate-limit, errors)
│   ├── routes/         # API route handlers
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── Dockerfile
├── package.json
└── tsconfig.json
```

## License

MIT

