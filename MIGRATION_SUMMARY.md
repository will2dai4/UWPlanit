# Database Migration Summary

## What Was Done

This migration adds comprehensive user management and course planning functionality to UWPlanit by extending the Supabase database schema.

### Files Created

#### Database Migrations
1. **`supabase/migrations/0002_create_users_and_plans.sql`**
   - Creates `users` table for user profiles
   - Creates `course_plans` table for user course plans
   - Creates `plan_courses` table for courses within plans
   - Adds Row Level Security (RLS) policies
   - Includes auto-updating timestamps

#### TypeScript Type Definitions
2. **`src/types/user.ts`**
   - `User`, `CoursePlan`, `PlanCourse` interfaces
   - Extended types with joined data
   - Input types for creating/updating entities

#### tRPC API Routers
3. **`src/server/routers/user.ts`**
   - User profile management endpoints
   - `getProfile()`, `upsertProfile()`, `updateProfile()`

4. **`src/server/routers/plan.ts`**
   - Course planning endpoints
   - CRUD operations for plans and plan courses
   - `getAll()`, `getActive()`, `getById()`, `create()`, `update()`, `delete()`
   - `addCourse()`, `updateCourse()`, `removeCourse()`

#### Utility Functions
5. **`src/lib/plans.ts`**
   - Helper functions for working with course plans
   - `groupCoursesByTerm()`, `calculateTotalUnits()`, `getPrerequisiteViolations()`, etc.

#### Documentation
6. **`MIGRATION_GUIDE.md`** - Comprehensive migration guide
7. **`MIGRATION_SUMMARY.md`** - This file
8. **`supabase/example_queries.sql`** - Example SQL queries

### Files Modified

1. **`src/lib/supabase.types.ts`**
   - Added types for `users`, `course_plans`, `plan_courses` tables
   - Removed obsolete `auth` schema types

2. **`src/server/trpc.ts`**
   - Updated context to include Auth0 user information
   - User context now available in all tRPC procedures

3. **`src/server/routers/_app.ts`**
   - Added `user` and `plan` routers to main router

4. **`src/app/api/profile/route.ts`**
   - Now syncs user profile updates to Supabase
   - Updates both Auth0 metadata and Supabase database

5. **`README.md`**
   - Added database schema documentation
   - Added API documentation for new tRPC routers
   - Updated project structure
   - Added migration instructions

## Database Schema

### Tables Created

```sql
-- User profiles
public.users (
  id TEXT PRIMARY KEY,           -- Auth0 user ID
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  program TEXT,
  current_term TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Course plans
public.course_plans (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN,
  start_term TEXT,
  start_year INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Courses in plans
public.plan_courses (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES course_plans(id),
  course_id TEXT REFERENCES courses(id),
  term TEXT NOT NULL,
  year INTEGER,
  term_order INTEGER,
  notes TEXT,
  is_completed BOOLEAN,
  grade TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(plan_id, course_id)
)
```

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only access their own profile
- Users can only access their own course plans
- Users can only access courses in their own plans

## How to Apply the Migration

### Option 1: Supabase Dashboard (Easiest)
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `supabase/migrations/0002_create_users_and_plans.sql`
4. Paste and run the SQL

### Option 2: Supabase CLI
```bash
supabase link --project-ref your-project-ref
supabase db push
```

### Option 3: Direct psql
```bash
psql "your-connection-string" < supabase/migrations/0002_create_users_and_plans.sql
```

## Next Steps

### 1. Run the Migration
Apply the database migration using one of the methods above.

### 2. Test the Migration
Verify tables were created:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'course_plans', 'plan_courses');
```

### 3. Update UI Components

You can now integrate the new tRPC hooks into your components:

#### Example: Creating a User Profile
```typescript
import { trpc } from "@/lib/trpc";

function ProfileSetup() {
  const { mutate } = trpc.user.upsertProfile.useMutation();
  
  const handleSubmit = (data) => {
    mutate({
      name: data.name,
      program: data.program,
      current_term: data.term,
    });
  };
}
```

#### Example: Creating a Course Plan
```typescript
import { trpc } from "@/lib/trpc";

function PlanCreator() {
  const { mutate } = trpc.plan.create.useMutation();
  
  const createPlan = () => {
    mutate({
      name: "My 4-Year Plan",
      start_term: "1A",
      start_year: 2024,
      is_active: true,
    });
  };
}
```

#### Example: Adding Courses to a Plan
```typescript
import { trpc } from "@/lib/trpc";

function CoursePlanner() {
  const { data: activePlan } = trpc.plan.getActive.useQuery();
  const { mutate: addCourse } = trpc.plan.addCourse.useMutation();
  
  const handleAddCourse = (courseId: string) => {
    if (!activePlan) return;
    
    addCourse({
      plan_id: activePlan.id,
      course_id: courseId,
      term: "2A",
      year: 2025,
    });
  };
}
```

### 4. Enhance the Planner UI

Current planner component (`src/app/planner/planner-client.tsx`) stores plans in client state only. Update it to:

- Fetch and display saved plans using `trpc.plan.getActive.useQuery()`
- Auto-save changes using `trpc.plan.addCourse.useMutation()`
- Allow users to create/manage multiple plans
- Add term/year selection when adding courses
- Show prerequisite warnings using `src/lib/plans.ts` utilities

### 5. Add Plan Management Page

Create a new page for managing multiple plans:
- List all user plans
- Create/edit/delete plans
- Switch active plan
- Clone existing plans

### 6. Optional Enhancements

- **Plan Sharing**: Add sharing functionality between users
- **Plan Templates**: Pre-built plans for different programs
- **Prerequisite Validation**: Warn users about missing prerequisites
- **Progress Tracking**: Mark courses as completed and track GPA
- **Export/Import**: Export plans to PDF or JSON
- **Calendar View**: Show courses in a timeline/calendar format

## Useful Utilities

The `src/lib/plans.ts` file includes helpful utilities:

```typescript
import { 
  groupCoursesByTerm,
  calculateTotalUnits,
  getPrerequisiteViolations,
  suggestNextTerm,
  getCompletionPercentage
} from "@/lib/plans";

// Group courses by term
const groupedCourses = groupCoursesByTerm(plan.courses);

// Calculate total units
const totalUnits = calculateTotalUnits(plan);

// Check for prerequisite violations
const violations = getPrerequisiteViolations(planCourse, allPlanCourses, allCourses);

// Suggest next term to plan for
const nextTerm = suggestNextTerm(plan);

// Get completion percentage
const progress = getCompletionPercentage(plan);
```

## Example SQL Queries

See `supabase/example_queries.sql` for:
- Common data queries
- Reporting queries
- Data cleanup operations
- Prerequisite violation detection

## Rollback Instructions

If you need to rollback the migration:

```sql
DROP TABLE IF EXISTS public.plan_courses;
DROP TABLE IF EXISTS public.course_plans;
DROP TABLE IF EXISTS public.users;
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Support & Troubleshooting

### Common Issues

1. **RLS Policies Not Working**
   - Ensure `auth.uid()` returns the Auth0 user ID
   - Check that user is authenticated
   - Verify JWT contains the `sub` claim

2. **Foreign Key Violations**
   - Ensure user profile exists before creating plans
   - User profile should be created on first login/signup

3. **Type Errors**
   - Regenerate Supabase types if schema changes
   - Run TypeScript type checking: `npm run type-check`

### Verification Queries

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public';

-- Verify indexes
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public';
```

## Additional Resources

- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Detailed migration guide
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [tRPC Documentation](https://trpc.io/docs)
- [Auth0 Documentation](https://auth0.com/docs)

---

**Migration Created:** October 2025  
**Database Version:** 0002  
**Status:** ✅ Ready to Apply

