<p align="center">
  <img src="https://uwplanit.com/assets/uwplanit-colour-logo.svg" />
</p>

# [UWPlanit](https://uwplanit.com)

A modern, interactive web application for University of Waterloo students to visualize course dependencies and plan their academic journey with confidence.

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

</div>

## Features

### Interactive Course Graph
- **Force-directed graph visualization** powered by D3.js and Visx
- Visual representation of course dependencies (prerequisites, corequisites, antirequisites)
- Department filtering with fuzzy search (Fuse.js)
- Smooth animations and transitions with Framer Motion
- Responsive zoom and pan controls

### Course Catalog
- Comprehensive UW course database
- Advanced search with fuzzy matching
- Detailed course information including:
  - Prerequisites, corequisites, and antirequisites
  - Course descriptions
  - Term offerings
  - Department and subject classification

### Course Planner
- Drag-and-drop interface for planning terms
- Visual prerequisite validation
- Multi-term planning support
- Save and manage multiple plans
- Position persistence for custom graph layouts

### User Authentication
- Secure authentication with Auth0
- User profile management
- Personalized course plans
- Multi-device sync

### Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- Accessible components from Radix UI and Shadcn UI
- Dark mode support (via next-themes)
- Smooth animations and micro-interactions
- Mobile-optimized with floating action buttons

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router) with React Server Components
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS with custom design tokens
- **UI Components:** Radix UI, Shadcn UI
- **Animations:** Framer Motion
- **State Management:** Zustand, TanStack Query (React Query)

### Backend & API
- **API Layer:** tRPC for end-to-end type safety
- **Authentication:** Auth0 (@auth0/nextjs-auth0)
- **Database:** Supabase (PostgreSQL)
- **ORM:** Supabase JS Client

### Visualization & Search
- **Graph Rendering:** Force Graph, D3.js, Visx
- **Search:** Fuse.js (fuzzy search)
- **Graph Library:** Graphology

### PWA & Performance
- **PWA:** @ducanh2912/next-pwa
- **Optimization:** Dynamic imports, code splitting, lazy loading

### Development Tools
- **Linting:** ESLint with TypeScript support
- **Formatting:** Prettier
- **Package Manager:** npm
- **Build Tool:** Next.js with Turbopack

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ and npm
- **Git** for version control

You'll also need accounts for:
- **[Auth0](https://auth0.com/)** (free tier available) - for authentication
- **[Supabase](https://supabase.com/)** (free tier available) - for database

### 1. Clone the Repository

   ```bash
git clone https://github.com/yourusername/uwplanit.git
cd uwplanit
   ```

### 2. Install Dependencies

   ```bash
   npm install
   ```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Auth0 Configuration
AUTH0_SECRET=                    # Generate with: openssl rand -hex 32
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=           # Your Auth0 domain (e.g., https://your-tenant.auth0.com)
AUTH0_CLIENT_ID=                 # From Auth0 Application Settings
AUTH0_CLIENT_SECRET=             # From Auth0 Application Settings

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=        # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (keep secure!)

# Optional: Sentry (Error Monitoring)
NEXT_PUBLIC_SENTRY_DSN=          # Your Sentry DSN
```

#### Setting up Auth0

1. Go to the [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application (type: **Regular Web Application**)
3. In Application Settings, configure:
   - **Allowed Callback URLs:** `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs:** `http://localhost:3000`
   - **Allowed Web Origins:** `http://localhost:3000`
4. Copy the `Client ID`, `Client Secret`, and `Domain` to your `.env.local`
5. Generate `AUTH0_SECRET`:
     ```bash
     openssl rand -hex 32
     ```

#### Setting up Supabase

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project (note down the database password)
3. Navigate to **Project Settings → API**
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Database Setup

Run the database migrations in order using the Supabase SQL Editor:

1. Navigate to **SQL Editor** in your Supabase dashboard
2. Execute each migration file in order:
   - `supabase/migrations/0001_create_courses_table.sql`
   - `supabase/migrations/0002_create_users_and_plans.sql`
   - `supabase/migrations/0003_add_coordinates_to_plan_courses.sql`

Alternatively, if you have the Supabase CLI installed:

   ```bash
# Link your project
   supabase link --project-ref your-project-ref

# Push migrations
   supabase db push
   ```

### 5. Seed Course Data (Optional)

If you want to populate the database with UW course data:

```bash
npm run seed:courses
```

This will fetch and parse course data from the UW API and insert it into your Supabase database.

### 6. Run the Development Server

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 7. Build for Production

```bash
npm run build
npm start
```

## Database Schema

The application uses the following main tables:

### `courses`
Stores the complete UW course catalog with:
- Course code, name, and description
- Department and subject classification
- Prerequisites, corequisites, and antirequisites
- Terms offered and other metadata

### `users`
User profiles synced with Auth0:
- Auth0 user ID (external reference)
- User metadata (name, email, etc.)
- Preferences and settings

### `course_plans`
User-created academic plans:
- Plan name and description
- Active/inactive status
- Creation and modification timestamps
- User ownership

### `plan_courses`
Courses within each plan:
- Course assignments to specific terms/years
- Visual graph coordinates (position_x, position_y)
- Custom notes and metadata



## API Documentation

### tRPC Routers

The application uses tRPC for type-safe API communication between client and server.

#### **Course Router** (`course`)

| Procedure | Type | Parameters | Description |
|-----------|------|------------|-------------|
| `getAll` | Query | - | Fetch all courses from database |
| `getById` | Query | `{ id: string }` | Fetch a single course by ID |
| `search` | Query | `{ query: string }` | Search courses by code or name |

#### **User Router** (`user`)

| Procedure | Type | Parameters | Description |
|-----------|------|------------|-------------|
| `getProfile` | Query | - | Get current user's profile |
| `upsertProfile` | Mutation | `{ name, email, ... }` | Create or update user profile |
| `updateProfile` | Mutation | `{ name, ... }` | Update existing profile |

#### **Plan Router** (`plan`)

| Procedure | Type | Parameters | Description |
|-----------|------|------------|-------------|
| `getAll` | Query | - | Get all plans for current user |
| `getActive` | Query | - | Get the active plan |
| `getById` | Query | `{ id: string }` | Get a specific plan |
| `create` | Mutation | `{ name, description }` | Create a new plan |
| `update` | Mutation | `{ id, name, ... }` | Update an existing plan |
| `delete` | Mutation | `{ id: string }` | Delete a plan |
| `addCourse` | Mutation | `{ planId, courseId, term, ... }` | Add a course to a plan |
| `updateCourse` | Mutation | `{ id, term, position, ... }` | Update course in plan |
| `removeCourse` | Mutation | `{ id: string }` | Remove course from plan |

## Styling & Theming

The application uses a modern design system built with Tailwind CSS and CSS variables for theming:

- **Color Palette:** Customizable via CSS variables in `globals.css`
- **Components:** Built with Radix UI primitives and styled with Tailwind
- **Animations:** Framer Motion for smooth transitions
- **Responsive:** Mobile-first approach with breakpoints at 640px, 768px, 1024px, 1280px
- **Dark Mode:** Built-in support (can be enabled/disabled via next-themes)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run seed:courses` | Seed database with course data |

## Deployment

### Vercel (Recommended)

This application is optimized for deployment on Vercel. Follow these steps:

#### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/uwplanit)

#### Manual Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   
   In the Vercel dashboard, add these environment variables:
   
   **Required:**
   ```
   AUTH0_SECRET=<generate with: openssl rand -hex 32>
   AUTH0_BASE_URL=https://your-domain.vercel.app
   AUTH0_ISSUER_BASE_URL=<your-auth0-domain>
   AUTH0_CLIENT_ID=<from-auth0>
   AUTH0_CLIENT_SECRET=<from-auth0>
   NEXT_PUBLIC_SUPABASE_URL=<from-supabase>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-supabase>
   SUPABASE_URL=<from-supabase>
   SUPABASE_SERVICE_ROLE_KEY=<from-supabase>
   ```
   
   **Optional:**
   ```
   NEXT_PUBLIC_SENTRY_DSN=<for-error-tracking>
   ```

4. **Update Auth0 Settings**
   
   After deployment, update your Auth0 application settings:
   - Allowed Callback URLs: `https://your-domain.vercel.app/api/auth/callback`
   - Allowed Logout URLs: `https://your-domain.vercel.app`
   - Allowed Web Origins: `https://your-domain.vercel.app`

5. **Deploy!**
   
   Click "Deploy" and wait for the build to complete (2-5 minutes).

#### Comprehensive Guide

For a complete step-by-step deployment guide with troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md).

For a production deployment checklist, see [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md).

### Environment Variables Reference

Copy `.env.template` to create your `.env.local`:

```bash
cp .env.template .env.local
```

Then fill in your actual values. **Never commit `.env.local` to version control.**

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- **Railway**
- **Netlify**
- **AWS Amplify**
- **DigitalOcean App Platform**

Make sure to:
1. Set all required environment variables
2. Configure build command: `npm run build`
3. Configure start command: `npm start`
4. Set Node.js version to 18+
5. Configure proper security headers (see `vercel.json` for reference)

## Security Best Practices

- **Never commit** `.env.local` or expose sensitive keys
- Keep `SUPABASE_SERVICE_ROLE_KEY` secure (server-side only)
- Use Auth0's recommended security settings
- Enable Row Level Security (RLS) in Supabase
- Regular dependency updates for security patches

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **[University of Waterloo](https://uwaterloo.ca/)** for course data
- **[Next.js](https://nextjs.org/)** for the incredible framework
- **[Vercel](https://vercel.com/)** for hosting and deployment platform
- **[Tailwind CSS](https://tailwindcss.com/)** for the utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** for accessible component primitives
- **[Shadcn UI](https://ui.shadcn.com/)** for beautiful component designs
- **[Force Graph](https://github.com/vasturiano/force-graph)** for graph visualization
- **[D3.js](https://d3js.org/)** for data visualization primitives
- **[Fuse.js](https://fusejs.io/)** for fuzzy search functionality
- **[Auth0](https://auth0.com/)** for authentication infrastructure
- **[Supabase](https://supabase.com/)** for database and backend services

---

**Built for UW students** | Star this repo if you find it helpful!
