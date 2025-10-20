# UWPlanit Backend

This is the backend API server for UWPlanit, providing data processing, database operations, and API endpoints for the course planning application.

## Features

- **Course Data Management**: CRUD operations for course information and prerequisites
- **User Authentication**: Auth0 integration for secure user management
- **Database Operations**: Supabase integration for data persistence
- **API Endpoints**: RESTful and tRPC APIs for frontend communication
- **Data Processing**: Course scraping, seeding, and relationship mapping
- **Profile Management**: User profile and account management

## Tech Stack

- **Framework**: Next.js 14 with API Routes
- **Runtime**: Node.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Auth0 Next.js SDK
- **API Layer**: tRPC for type-safe APIs
- **Data Processing**: Custom scripts for course data management
- **Validation**: Zod for schema validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project
- Auth0 account and application
- Environment variables configured

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Auth0 Configuration
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Database Configuration
DATABASE_URL=your-postgres-connection-string
```

### Database Setup

1. **Initialize Supabase**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Start local Supabase (optional)
   supabase start

   # Run migrations
   supabase db push
   ```

2. **Seed Course Data**:
   ```bash
   npm run seed
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with course data
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── auth/               # Auth0 authentication routes
│   │   ├── profile/            # User profile management
│   │   ├── env/                # Environment configuration
│   │   └── trpc/               # tRPC API endpoints
│   ├── globals.css             # Global styles (minimal)
│   ├── layout.tsx              # Root layout
│   └── providers.tsx            # Context providers
├── server/                      # Server-side logic
│   ├── routers/                # tRPC routers
│   │   ├── _app.ts             # Main app router
│   │   └── course.ts           # Course-related procedures
│   └── trpc.ts                 # tRPC configuration
├── lib/                        # Utility functions
│   ├── supabase.ts             # Supabase client
│   ├── supabase.types.ts       # Database type definitions
│   ├── trpc.ts                 # tRPC client setup
│   └── utils.ts                # General utilities
├── types/                      # TypeScript definitions
│   └── course.ts               # Course type definitions
├── scripts/                    # Data processing scripts
│   ├── fetch-courses.ts        # Course data fetching
│   ├── seed-courses.ts         # Database seeding
│   └── tsconfig.json           # Script-specific TypeScript config
└── supabase/                   # Database configuration
    └── migrations/             # SQL migration files
```

## API Endpoints

### REST API Routes

- `GET /api/env` - Environment configuration
- `POST /api/profile` - User profile management
- `GET/POST /api/auth/*` - Auth0 authentication

### tRPC Procedures

- `course.getAll` - Get all courses
- `course.getById` - Get course by ID
- `course.search` - Search courses with filters
- `course.getPrerequisites` - Get course prerequisites
- `course.getDependents` - Get courses that depend on this course

## Database Schema

### Tables

- **courses**: Course information and metadata
- **auth.users**: User authentication and profiles (via Supabase Auth)

### Key Fields

- **courses**: id, title, description, credits, department, prerequisites, etc.
- **users**: id, email, name, profile data, etc.

## Data Processing

### Course Data Pipeline

1. **Fetching**: Scripts fetch course data from UW's course catalog
2. **Processing**: Data is cleaned, validated, and structured
3. **Storage**: Processed data is stored in Supabase
4. **Relationships**: Prerequisites and dependencies are mapped

### Scripts

- **fetch-courses.ts**: Downloads course data from UW API
- **seed-courses.ts**: Populates database with course information
- **scrapeCourses.ts**: Alternative scraping method

## Authentication & Authorization

- **Auth0 Integration**: Secure user authentication
- **Session Management**: JWT-based session handling
- **User Profiles**: Extended user data in Supabase
- **API Security**: Protected routes and data access

## Development

### Code Style

- Use TypeScript for all server-side code
- Follow Next.js API route conventions
- Implement proper error handling
- Use Zod for input validation
- Write clean, maintainable server logic

### Database Management

- Use Supabase migrations for schema changes
- Follow PostgreSQL best practices
- Implement proper indexing for performance
- Use transactions for data consistency

## Deployment

The backend is designed to be deployed as a serverless application:

- **Vercel**: Recommended for Next.js API routes
- **AWS Lambda**: Serverless function deployment
- **Railway**: Alternative deployment platform
- **Docker**: Containerized deployment option

### Environment Configuration

Make sure to configure all environment variables in your deployment platform, including:

- Supabase credentials
- Auth0 configuration
- Database connection strings
- API keys and secrets

## Monitoring & Logging

- **Sentry Integration**: Error tracking and monitoring
- **Console Logging**: Development and debugging
- **Performance Monitoring**: API response times and usage

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript interfaces for API responses
3. Implement proper error handling and validation
4. Write tests for new API endpoints
5. Update documentation for API changes
6. Follow security best practices for data handling