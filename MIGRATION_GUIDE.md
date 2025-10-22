# Database Migration Guide

This guide explains the database migration to support user profiles and course planning features.

## Overview

The migration adds three new tables to support user management and course planning:

1. **`users`** - Stores user profile information synced with Auth0
2. **`course_plans`** - Stores user course plans
3. **`plan_courses`** - Junction table linking courses to plans with scheduling information

## Database Schema

### Users Table
Stores user profiles synced with Auth0:
- `id` (TEXT, PK) - Auth0 user ID (sub claim)
- `email` (TEXT, NOT NULL, UNIQUE) - User email
- `name` (TEXT) - Full name
- `program` (TEXT) - Academic program (e.g., "Computer Science")
- `current_term` (TEXT) - Current or upcoming term (e.g., "1A", "2B")
- `avatar_url` (TEXT) - Profile picture URL
- `created_at`, `updated_at` - Timestamps

### Course Plans Table
Stores individual course plans:
- `id` (UUID, PK) - Plan identifier
- `user_id` (TEXT, FK → users.id) - Owner of the plan
- `name` (TEXT, NOT NULL) - Plan name (e.g., "My 4-Year Plan")
- `description` (TEXT) - Optional description
- `is_active` (BOOLEAN) - Whether this is the user's active plan
- `start_term` (TEXT) - Starting term (e.g., "1A")
- `start_year` (INTEGER) - Starting year (e.g., 2024)
- `created_at`, `updated_at` - Timestamps

### Plan Courses Table
Junction table linking courses to plans:
- `id` (UUID, PK) - Record identifier
- `plan_id` (UUID, FK → course_plans.id) - Reference to plan
- `course_id` (TEXT, FK → courses.id) - Reference to course
- `term` (TEXT, NOT NULL) - Term when course is planned (e.g., "2A")
- `year` (INTEGER) - Year when course is planned (e.g., 2025)
- `term_order` (INTEGER) - Order within term for display
- `notes` (TEXT) - Optional notes
- `is_completed` (BOOLEAN) - Whether completed
- `grade` (TEXT) - Final grade if completed
- `created_at`, `updated_at` - Timestamps
- UNIQUE constraint on (plan_id, course_id)

## Security (Row Level Security)

All tables have RLS enabled with policies that:
- Users can only read/write their own profile
- Users can only read/write their own course plans
- Users can only read/write courses in their own plans

## Running the Migration

### Option 1: Supabase CLI (Recommended)

If you have the Supabase CLI installed:

```bash
# Link your project (first time only)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Option 2: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **SQL Editor**
3. Open `supabase/migrations/0002_create_users_and_plans.sql`
4. Copy and paste the entire SQL file
5. Click **Run** to execute the migration

### Option 3: Using psql

```bash
psql "your-database-connection-string" < supabase/migrations/0002_create_users_and_plans.sql
```

## API Changes

### New tRPC Routers

#### User Router (`trpc.user`)
- `getProfile()` - Get current user profile
- `upsertProfile({ name, program, current_term, avatar_url })` - Create/update profile
- `updateProfile({ name, program, current_term, avatar_url })` - Update profile

#### Plan Router (`trpc.plan`)
- `getAll()` - Get all course plans for current user
- `getById({ id })` - Get specific plan with courses
- `getActive()` - Get active plan with courses
- `create({ name, description, start_term, start_year, is_active })` - Create new plan
- `update({ id, ...fields })` - Update plan
- `delete({ id })` - Delete plan
- `addCourse({ plan_id, course_id, term, year, term_order, notes })` - Add course to plan
- `updateCourse({ id, ...fields })` - Update course in plan
- `removeCourse({ id })` - Remove course from plan

### Updated API Routes

The `/api/profile` endpoint now syncs user data to both Auth0 and Supabase.

## TypeScript Types

New types are available in `src/types/user.ts`:
- `User`
- `CoursePlan`
- `PlanCourse`
- `CoursePlanWithCourses`
- `PlanCourseWithDetails`
- Various input types for creating/updating

Database types are auto-generated in `src/lib/supabase.types.ts`.

## Usage Examples

### Creating a User Profile (tRPC)

```typescript
const { mutate } = trpc.user.upsertProfile.useMutation();

mutate({
  name: "John Doe",
  program: "Computer Science",
  current_term: "2A",
});
```

### Creating a Course Plan

```typescript
const { mutate } = trpc.plan.create.useMutation();

mutate({
  name: "My 4-Year Plan",
  description: "Standard CS program plan",
  start_term: "1A",
  start_year: 2024,
  is_active: true,
});
```

### Adding Courses to a Plan

```typescript
const { mutate } = trpc.plan.addCourse.useMutation();

mutate({
  plan_id: "plan-uuid",
  course_id: "CS136",
  term: "1B",
  year: 2024,
  term_order: 1,
});
```

### Getting Active Plan with Courses

```typescript
const { data: activePlan } = trpc.plan.getActive.useQuery();

// activePlan includes all courses with full course details
console.log(activePlan?.courses);
```

## Next Steps

After running the migration:

1. **Test the migration** - Verify tables are created correctly
2. **Update UI components** - Integrate new tRPC hooks for saving/loading plans
3. **Add plan management UI** - Create interfaces for users to manage multiple plans
4. **Implement auto-save** - Save course plans automatically as users build them
5. **Add sharing features** (future) - Allow users to share plans with others

## Rollback

If you need to rollback this migration:

```sql
-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS public.plan_courses;
DROP TABLE IF EXISTS public.course_plans;
DROP TABLE IF EXISTS public.users;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Support

For issues or questions about the migration:
1. Check Supabase logs for error details
2. Verify RLS policies are correctly applied
3. Ensure Auth0 is properly configured with user `sub` claim
4. Check that environment variables are set correctly

