# UWPlanit - Course Planning Platform

UWPlanit is a comprehensive course planning and visualization platform designed specifically for University of Washington students. This repository contains three different versions of the application to suit different deployment and development needs.

## 🏗️ Repository Structure

This repository has been organized into three main components:

```
UWPlanit/
├── frontend/          # React/Next.js UI application (standalone)
├── backend/           # API server and data processing (standalone)
├── original/          # Complete full-stack application (monolithic)
└── README.md         # This file
```

### 📱 Frontend (`/frontend`)
- **Technology**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Purpose**: Standalone UI application for course planning and visualization
- **Features**: Course search, interactive graphs, drag-and-drop planning, user authentication
- **Port**: Runs on `http://localhost:3000`
- **Dependencies**: UI-focused (React, Tailwind, D3.js, Auth0 client)
- **Status**: ✅ Builds and runs independently

### 🔧 Backend (`/backend`)
- **Technology**: Next.js API Routes, tRPC, Supabase, TypeScript
- **Purpose**: Standalone API server for data processing and database operations
- **Features**: Course data management, user authentication, database operations, API endpoints
- **Port**: Runs on `http://localhost:3001` (configurable)
- **Dependencies**: Server-focused (tRPC, Supabase, Auth0 server)
- **Status**: ✅ Builds and runs independently

### 🏠 Original (`/original`)
- **Technology**: Complete Next.js full-stack application
- **Purpose**: Monolithic application with both frontend and backend in one codebase
- **Features**: All features combined in a single application
- **Port**: Runs on `http://localhost:3000`
- **Dependencies**: Full-stack dependencies
- **Status**: ✅ Complete working application

## 🚀 Quick Start

### Option 1: Use the Original Monolithic App
```bash
cd original
npm install
npm run dev
```

### Option 2: Use Split Frontend + Backend
```bash
# Terminal 1 - Start Backend
cd backend
npm install
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm install
npm run dev
```

## 📋 Features

- **Course Search & Discovery**: Search and filter courses by department, keywords, and requirements
- **Interactive Course Graph**: Visualize course prerequisites and relationships using D3.js
- **Course Planning**: Plan your academic journey with drag-and-drop course scheduling
- **User Authentication**: Secure login with Auth0 integration
- **Responsive Design**: Mobile-first design with modern UI components
- **Real-time Updates**: Live data synchronization across all components

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)
- Auth0 account (for authentication)

### Environment Setup
Each folder (`frontend`, `backend`, `original`) has its own `.env.example` file. Copy and configure:
```bash
cp .env.example .env.local
```

### Database Setup
The Supabase migrations are located in the `supabase/migrations` folder. Run migrations to set up the database schema.

## 📁 Project Architecture

### Frontend Architecture
- **Pages**: Next.js App Router with server-side rendering
- **Components**: Reusable UI components with Tailwind CSS
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query for server state
- **Authentication**: Auth0 Next.js SDK

### Backend Architecture
- **API Routes**: Next.js API routes for REST endpoints
- **tRPC**: Type-safe API layer for frontend communication
- **Database**: Supabase (PostgreSQL) with type-safe queries
- **Authentication**: Auth0 server-side verification
- **Data Processing**: Course scraping and relationship mapping

### Original Architecture
- **Monolithic**: Combined frontend and backend in single Next.js app
- **Full-Stack**: Server-side rendering with API routes
- **Integrated**: All features working together seamlessly

## 🔧 Configuration

### Frontend Configuration
- Configure API endpoints to point to backend server
- Set up Auth0 client configuration
- Configure Supabase client for direct database access

### Backend Configuration
- Set up Supabase admin client for database operations
- Configure Auth0 server-side verification
- Set up API rate limiting and security

### Original Configuration
- Configure all services in single environment
- Set up integrated Auth0 and Supabase configuration

## 📊 Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:
- `courses`: Course information and metadata
- `auth.users`: User profiles and authentication data
- Course relationships and prerequisites are stored as JSON arrays

## 🚀 Deployment

### Frontend Deployment
- Deploy to Vercel, Netlify, or any static hosting
- Configure environment variables for API endpoints
- Set up Auth0 client configuration

### Backend Deployment
- Deploy to Vercel, Railway, or any Node.js hosting
- Configure Supabase and Auth0 server settings
- Set up database connections and migrations

### Original Deployment
- Deploy as single Next.js application
- Configure all services in production environment
- Set up database and authentication

## 🤝 Contributing

1. Choose the appropriate folder for your changes:
   - `frontend/` for UI-only changes
   - `backend/` for API-only changes  
   - `original/` for full-stack changes

2. Follow the existing code structure and patterns
3. Ensure all applications build successfully
4. Test your changes in the appropriate environment

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the README files in each folder for specific setup instructions
2. Review the environment configuration examples
3. Ensure all dependencies are properly installed
4. Verify database and authentication services are configured correctly
