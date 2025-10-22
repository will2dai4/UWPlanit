# UW Course Graph & Planner

A modern web application for University of Waterloo students to visualize course dependencies and plan their academic journey.

## Features

- Interactive course dependency graph visualization
- Course search with fuzzy matching
- Course details with prerequisites, corequisites, and antirequisites
- Course planning with drag-and-drop functionality
- Responsive design for all devices

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, Shadcn UI
- **Authentication:** Auth0
- **Database:** Supabase (PostgreSQL)
- **State Management:** Zustand, TanStack Query
- **API:** tRPC
- **Visualization:** Force Graph, D3.js, Visx
- **Search:** Fuse.js (fuzzy search)
- **PWA:** @ducanh2912/next-pwa

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- An [Auth0](https://auth0.com/) account (free tier available)
- A [Supabase](https://supabase.com/) project (free tier available)

### Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/uw-graph.git
   cd uw-graph
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Copy `.env.example` to `.env.local` and fill in your credentials:

   ```bash
   cp .env.example .env.local
   ```

   **Required environment variables:**

   **Auth0 Setup:**
   - Go to [Auth0 Dashboard](https://manage.auth0.com/)
   - Create a new application (type: Regular Web Application)
   - Get your credentials from the application settings:
     - `AUTH0_CLIENT_ID` - Your application's Client ID
     - `AUTH0_CLIENT_SECRET` - Your application's Client Secret
     - `AUTH0_ISSUER_BASE_URL` - Your Auth0 domain (e.g., `https://your-tenant.auth0.com`)
   - Set Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Set Allowed Logout URLs: `http://localhost:3000`
   - Generate `AUTH0_SECRET`:
     ```bash
     openssl rand -hex 32
     ```
   - Set `AUTH0_BASE_URL=http://localhost:3000` (for development)

   **Supabase Setup:**
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Create a new project or select an existing one
   - Navigate to Project Settings > API
   - Copy the following values:
     - `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - The `anon` public key
     - `SUPABASE_SERVICE_ROLE_KEY` - The `service_role` secret key (keep this secure!)

4. Run database migrations:

   Navigate to the Supabase SQL Editor and run the migrations in order:
   - `supabase/migrations/0001_create_courses_table.sql`
   - `supabase/migrations/0002_create_users_and_plans.sql`

   Alternatively, if you have the Supabase CLI:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

   See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed migration instructions.

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses three main tables:

- **`courses`** - University course catalog
- **`users`** - User profiles (synced with Auth0)
- **`course_plans`** - User-created course plans
- **`plan_courses`** - Courses in each plan with scheduling info

For detailed schema information and migration instructions, see [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md).

## API Documentation

### tRPC Routers

The application uses tRPC for type-safe API calls:

- **`course`** - Course catalog operations
  - `getAll()` - Get all courses
  - `getById(id)` - Get course by ID
  - `search(query)` - Search courses

- **`user`** - User profile management
  - `getProfile()` - Get current user profile
  - `upsertProfile(data)` - Create/update profile
  - `updateProfile(data)` - Update profile

- **`plan`** - Course planning operations
  - `getAll()` - Get all user plans
  - `getActive()` - Get active plan
  - `getById(id)` - Get plan by ID
  - `create(data)` - Create new plan
  - `update(data)` - Update plan
  - `delete(id)` - Delete plan
  - `addCourse(data)` - Add course to plan
  - `updateCourse(data)` - Update course in plan
  - `removeCourse(id)` - Remove course from plan

## Project Structure

```
src/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # Auth0 authentication
│   │   ├── profile/        # User profile management
│   │   └── trpc/           # tRPC API endpoint
│   ├── account/            # User account page
│   ├── courses/            # Course catalog pages
│   ├── planner/            # Course planner page
│   ├── graph/              # Course graph visualization
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── ui/                 # UI components (Shadcn)
│   ├── auth/               # Authentication components
│   ├── course-graph.tsx    # Course graph visualization
│   ├── course-search.tsx   # Course search component
│   ├── course-drawer.tsx   # Course details drawer
│   └── course-plan.tsx     # Course plan component
├── server/                  # Server-side code
│   ├── routers/            # tRPC routers
│   │   ├── course.ts       # Course operations
│   │   ├── user.ts         # User operations
│   │   ├── plan.ts         # Planning operations
│   │   └── _app.ts         # Router aggregation
│   └── trpc.ts             # tRPC configuration
├── lib/                     # Utility functions
│   ├── auth-server.ts      # Server-side auth utils
│   ├── supabase.ts         # Supabase client
│   ├── supabase.types.ts   # Generated DB types
│   ├── plans.ts            # Planning utilities
│   ├── trpc.ts             # tRPC client setup
│   └── utils.ts            # General utilities
└── types/                   # TypeScript types
    ├── course.ts           # Course types
    └── user.ts             # User and plan types
supabase/
├── migrations/              # Database migrations
│   ├── 0001_create_courses_table.sql
│   └── 0002_create_users_and_plans.sql
└── example_queries.sql      # Example SQL queries
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [University of Waterloo](https://uwaterloo.ca/) for course data
- [Next.js](https://nextjs.org/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Force Graph](https://github.com/vasturiano/force-graph) for graph visualization
- [Fuse.js](https://fusejs.io/) for fuzzy search
