# UWPlanit - Course Planning Platform

UWPlanit is a comprehensive course planning and visualization platform designed specifically for University of Washington students. This repository contains both the frontend and backend components of the application.

## 🏗️ Repository Structure

This repository has been split into two main components:

```
UWPlanit/
├── frontend/          # React/Next.js UI application
├── backend/           # API server and data processing
├── frontend/          # Original full-stack application (preserved)
└── README.md         # This file
```

### 📱 Frontend (`/frontend`)
- **Technology**: Next.js 14, React 18, TypeScript
- **Purpose**: User interface, course visualization, planning tools
- **Features**: Course search, interactive graphs, drag-and-drop planning
- **Port**: Runs on `http://localhost:3000`

### 🔧 Backend (`/backend`)
- **Technology**: Next.js API Routes, tRPC, Supabase
- **Purpose**: Data processing, API endpoints, database operations
- **Features**: Course data management, user authentication, data scraping
- **Port**: Runs on `http://localhost:3000` (API routes)

### 🏠 Original Application (Root)
- **Technology**: Full-stack Next.js application
- **Purpose**: Complete integrated application
- **Features**: All frontend and backend functionality in one codebase

## 🚀 Quick Start

### Option 1: Run Split Applications

1. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start the Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Option 2: Run Original Application

```bash
npm install
npm run dev
```

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Auth0 account

### Environment Variables

Each application needs its own environment configuration:

#### Frontend (`.env.local`)
```env
# Auth0 Configuration
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

#### Backend (`.env.local`)
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
```

## 📋 Features

### Course Management
- **Search & Discovery**: Advanced filtering by department, keywords, requirements
- **Course Details**: Comprehensive course information and descriptions
- **Prerequisites**: Visual representation of course dependencies

### Planning Tools
- **Interactive Graph**: D3.js visualization of course relationships
- **Drag & Drop Planner**: Intuitive course scheduling interface
- **Academic Planning**: Multi-year course planning support

### User Experience
- **Authentication**: Secure login with Auth0
- **Responsive Design**: Mobile-first approach with modern UI
- **Real-time Updates**: Live data synchronization

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI**: React 18, TypeScript, Tailwind CSS
- **State**: Zustand, TanStack Query
- **Visualization**: D3.js, Force Graph
- **Components**: Radix UI primitives

### Backend
- **API**: Next.js API Routes, tRPC
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Auth0
- **Validation**: Zod schemas
- **Processing**: Custom data scraping scripts

## 📁 Project Architecture

### Data Flow
```
Frontend (React) ←→ Backend API (tRPC) ←→ Database (Supabase)
     ↓                    ↓                    ↓
User Interface    Data Processing    Course Data Storage
```

### Key Components
- **Course Search**: Advanced filtering and search capabilities
- **Course Graph**: Interactive visualization of prerequisites
- **Course Planner**: Drag-and-drop scheduling interface
- **User Management**: Authentication and profile management
- **Data Pipeline**: Course scraping and database seeding

## 🚀 Deployment

### Frontend Deployment
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative static site hosting
- **AWS Amplify**: Cloud-based deployment

### Backend Deployment
- **Vercel**: Serverless API functions
- **Railway**: Full-stack deployment platform
- **AWS Lambda**: Serverless backend services

### Database
- **Supabase**: Managed PostgreSQL with real-time features
- **Auth0**: Managed authentication service

## 🤝 Contributing

1. **Choose your development approach**:
   - Work on the split applications for modular development
   - Work on the original application for integrated development

2. **Follow the coding standards**:
   - Use TypeScript for all new code
   - Follow Next.js best practices
   - Implement proper error handling
   - Write accessible components

3. **Testing**:
   - Test both frontend and backend functionality
   - Verify API endpoints work correctly
   - Check responsive design across devices

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [API Documentation](./backend/README.md#api-endpoints)

## 🔒 Security

- **Authentication**: Auth0 integration for secure user management
- **Data Protection**: Supabase RLS (Row Level Security)
- **API Security**: Protected routes and input validation
- **Environment Variables**: Secure configuration management

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions or issues:
1. Check the individual README files in `/frontend` and `/backend`
2. Review the API documentation
3. Check existing issues in the repository
4. Create a new issue with detailed information

---

**Note**: This repository contains both the original full-stack application and the newly split frontend/backend applications. Choose the approach that best fits your development needs.