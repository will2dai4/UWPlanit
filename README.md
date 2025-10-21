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

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/            # UI components
│   ├── course-graph.tsx
│   ├── course-search.tsx
│   ├── course-drawer.tsx
│   └── course-plan.tsx
├── lib/               # Utility functions
│   └── utils.ts
└── types/             # TypeScript types
    └── course.ts
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
