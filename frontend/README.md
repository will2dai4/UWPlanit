# UWPlanit Frontend

Modern Next.js frontend for the UWPlanit course planning application.

## Features

- **Interactive Course Graph**: Visualize course prerequisites and relationships with Cytoscape.js
- **Course Planner**: Drag-and-drop planner with freeform canvas and grid snapping
- **Smart Filters**: Filter courses by subject, level, term, and faculty
- **Checklist Management**: Track course requirements with nested checklists
- **Import/Export**: Save and share course plans as JSON
- **Authentication**: Secure authentication with Supabase Auth (magic links)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand + TanStack Query
- **Graph Visualization**: Cytoscape.js
- **Authentication**: Supabase
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase project (for authentication)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_BASE=http://localhost:4000/api/v1
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GRAPH_PAGE_SIZE=200
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── course/[id]/       # Course detail page
│   ├── graph/             # Graph visualization pages
│   ├── plans/             # Course planner pages
│   ├── login/             # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── courses/           # Course-related components
│   ├── filters/           # Filter components
│   ├── graph/             # Graph visualization
│   ├── layout/            # Layout components
│   ├── planner/           # Course planner components
│   ├── search/            # Search components
│   └── ui/                # Base UI components (Radix)
├── hooks/                 # React Query hooks
├── lib/                   # Utilities and configurations
├── store/                 # Zustand stores
└── types/                 # TypeScript type definitions
```

## Key Components

### GraphCanvas
Cytoscape.js wrapper with:
- Multiple layout algorithms (cose-bilkent, dagre, concentric, grid)
- Zoom and pan controls
- Node selection and highlighting
- Edge styling based on relationship type

### PlannerBoard
Drag-and-drop course planner with:
- Freeform canvas positioning
- Grid snapping
- Multi-select
- Auto-save

### ChecklistPanel
Requirement tracking with:
- Nested checklist items
- Progress tracking
- Text parser for bulk import
- Group organization

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE` | Backend API URL | `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Required |
| `NEXT_PUBLIC_GRAPH_PAGE_SIZE` | Graph pagination size | `200` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking | Optional |

## Development Tips

### Adding New UI Components

Use the Radix UI primitives in `src/components/ui/`. These are pre-styled with Tailwind and follow the design system.

### State Management

- **Server State**: Use TanStack Query hooks in `src/hooks/`
- **Client State**: Use Zustand stores in `src/store/`
- **Local State**: Use React hooks

### API Integration

All API calls go through the `apiClient` in `src/lib/api-client.ts`. It automatically injects authentication headers from Supabase.

## Production Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Docker

```bash
docker build -t uwplanit-frontend .
docker run -p 3000:3000 uwplanit-frontend
```

## License

MIT

