# UWPlanit Frontend

This is the frontend application for UWPlanit, a course planning and visualization tool for University of Washington students.

## Features

- **Course Search & Discovery**: Search and filter courses by department, keywords, and requirements
- **Interactive Course Graph**: Visualize course prerequisites and relationships
- **Course Planning**: Plan your academic journey with drag-and-drop course scheduling
- **User Authentication**: Secure login with Auth0 integration
- **Responsive Design**: Mobile-first design with modern UI components

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query (React Query)
- **Authentication**: Auth0 Next.js SDK
- **Visualization**: D3.js with Force Graph for course relationships
- **UI Components**: Radix UI primitives with custom styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Environment variables configured (see `.env.local.example`)

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
# Auth0 Configuration
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages
│   ├── account/           # User account management
│   ├── courses/           # Course browsing and details
│   ├── graph/             # Course relationship visualization
│   ├── planner/           # Course planning interface
│   └── globals.css        # Global styles
├── components/             # Reusable React components
│   ├── ui/                # Base UI components (buttons, cards, etc.)
│   ├── auth/              # Authentication components
│   └── ...                # Feature-specific components
├── lib/                   # Utility functions and configurations
│   ├── utils.ts           # General utilities
│   ├── supabase.ts        # Supabase client configuration
│   └── trpc.ts            # tRPC client setup
└── types/                 # TypeScript type definitions
```

## Key Components

- **CourseSearch**: Advanced course filtering and search interface
- **CourseGraph**: Interactive D3.js visualization of course relationships
- **CoursePlan**: Drag-and-drop course planning interface
- **HeroSection**: Landing page with feature highlights
- **AccountMenu**: User profile and authentication controls

## Backend Integration

This frontend communicates with the UWPlanit backend API through:

- **tRPC**: Type-safe API calls for course data and user management
- **Supabase**: Real-time database updates and user profiles
- **Auth0**: Secure authentication and user session management

## Development

### Code Style

- Use TypeScript for all components and utilities
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement responsive design patterns
- Write clean, maintainable component code

### Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript interfaces for component props
3. Implement proper error handling and loading states
4. Write accessible components following WCAG guidelines
5. Test components across different screen sizes

## Deployment

The frontend is designed to be deployed as a static site or serverless application:

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative static site hosting
- **AWS Amplify**: Cloud-based deployment platform

Make sure to configure environment variables in your deployment platform.