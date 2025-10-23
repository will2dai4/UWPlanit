# Course Plan Coordinate Saving Implementation

## Overview
This implementation adds the ability to save course nodes and their coordinates to the Supabase database when users create course plans. The system automatically persists node positions as users drag courses in the visual graph.

## Features Implemented

### 1. Database Schema Updates
**File:** `supabase/migrations/0003_add_coordinates_to_plan_courses.sql`

- Added `position_x` and `position_y` columns to the `plan_courses` table
- Both columns are `DOUBLE PRECISION` and nullable
- Created an index for spatial queries on these coordinates
- Columns store the x,y coordinates of course nodes in the visual graph

### 2. TRPC API Updates
**File:** `src/server/routers/plan.ts`

#### Modified Mutations:
- **`addCourse`**: Now accepts optional `position_x` and `position_y` parameters
- **`updateCourse`**: Now accepts optional `position_x` and `position_y` parameters

#### New Mutation:
- **`updatePositions`**: Bulk update endpoint for efficiently saving multiple course positions
  - Accepts a plan ID and array of course positions
  - Validates plan ownership before updating
  - Returns success status and count of updated positions

### 3. TypeScript Type Updates
**File:** `src/lib/supabase.types.ts`

Updated the `plan_courses` table types to include:
```typescript
position_x: number | null
position_y: number | null
```

This ensures type safety across the application when working with course coordinates.

### 4. Planner Client Updates
**File:** `src/app/planner/planner-client.tsx`

#### New State Management:
- `activePlanId`: Tracks the current active course plan
- `nodePositions`: Map of course IDs to their x,y coordinates
- `planCoursesMapRef`: Maps course IDs to their plan_courses table IDs

#### Key Features:

**Auto-Save with Debouncing:**
- Position changes are automatically saved to the database
- Uses 1-second debounce to avoid excessive API calls
- Efficient bulk update endpoint reduces server load

**Plan Initialization:**
- Automatically loads the active plan on mount
- Creates a new plan if none exists
- Restores saved node positions from the database

**Course Management:**
- `handleAddCourse`: Adds courses to both UI and database with coordinates
- `handleRemoveCourse`: Removes courses from both UI and database
- Optimistic UI updates with error rollback for better UX

**Position Tracking:**
- `handlePositionChange`: Tracks and saves node position changes
- Integrates with the CourseGraph component's drag system

### 5. CourseGraph Component Updates
**File:** `src/components/course-graph.tsx`

#### New Props:
```typescript
initialNodePositions?: Map<string, { x: number; y: number }>
onNodePositionChange?: (courseId: string, x: number, y: number) => void
```

#### Key Changes:
- Initializes node positions from `initialNodePositions` prop
- Syncs with external position changes via `useEffect`
- Emits position changes via `onNodePositionChange` callback when nodes are dragged
- Maintains backward compatibility with existing usage

## Data Flow

### Loading a Plan:
1. User opens planner page
2. System fetches active plan via tRPC
3. Plan courses are loaded with their saved positions
4. CourseGraph receives initial positions and renders nodes accordingly
5. Users see their courses exactly where they left them

### Saving Positions:
1. User drags a course node in the graph
2. CourseGraph emits position change via `onNodePositionChange`
3. PlannerClient updates local `nodePositions` state
4. Debounced save function triggers after 1 second of inactivity
5. Bulk update mutation saves all positions to database
6. User sees visual feedback (no interruption to UX)

### Adding Courses:
1. User selects a course from search or graph
2. `handleAddCourse` adds to local state immediately
3. TRPC mutation saves to database with current/default position
4. If error occurs, UI change is rolled back
5. Toast notification informs user of success/failure

## Benefits

### Performance:
- Debounced saves prevent excessive API calls
- Bulk update endpoint reduces database round-trips
- Optimistic UI updates for instant feedback

### User Experience:
- Positions persist across sessions
- No manual "save" button required
- Automatic plan creation on first use
- Error handling with rollback

### Data Integrity:
- Validates plan ownership before updates
- Uses database transactions for consistency
- Proper error handling and logging

## Migration Guide

### To Apply Changes:

1. **Run the database migration:**
   ```bash
   # If using Supabase CLI
   supabase db reset
   
   # Or apply the migration directly
   psql -d your_database < supabase/migrations/0003_add_coordinates_to_plan_courses.sql
   ```

2. **Update dependencies:**
   ```bash
   npm install
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

### For Existing Users:
- Existing plans continue to work normally
- Positions are null initially and get saved as users interact
- No data migration required

## Technical Notes

### Coordinate System:
- Coordinates are stored in the graph's native coordinate space
- Independent of zoom/pan transformations
- Relative to the center of the graph canvas

### Null Handling:
- Null coordinates fall back to automatic layout algorithms
- Mixed null/non-null positions are handled gracefully
- Reset button clears all saved positions

### Concurrency:
- Debouncing prevents race conditions
- Last write wins for position conflicts
- No locking mechanism needed (single-user plans)

## Future Enhancements

Potential improvements for future iterations:
- Multi-plan support with plan switcher UI
- Export/import plan positions
- Undo/redo for position changes
- Position templates for common degree programs
- Collaborative planning with real-time sync

## Testing Recommendations

1. **Manual Testing:**
   - Create a new plan and add courses
   - Drag nodes to different positions
   - Refresh page and verify positions persist
   - Test with large plans (50+ courses)
   - Test error scenarios (network failures)

2. **Edge Cases:**
   - No active plan (should create one)
   - Plan with no courses
   - Rapid position changes (debouncing)
   - Concurrent plan modifications

3. **Browser Compatibility:**
   - Test on Chrome, Firefox, Safari
   - Verify mobile responsiveness
   - Check touch-based dragging

## Troubleshooting

### Positions Not Saving:
- Check browser console for errors
- Verify user is authenticated
- Ensure plan exists and is active
- Check network tab for failed mutations

### Positions Resetting:
- Verify migration was applied
- Check database columns exist
- Ensure proper plan ownership

### Performance Issues:
- Reduce debounce timeout if needed
- Check for excessive re-renders
- Profile with React DevTools

## Support

For issues or questions:
1. Check browser console for errors
2. Review the migration logs
3. Verify tRPC endpoint connectivity
4. Contact the development team

