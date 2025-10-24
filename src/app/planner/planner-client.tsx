"use client";

import { useState, useEffect, startTransition, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import type { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/account-menu";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/ui/use-toast";

// Lazy-load heavy components
const CourseSearch = dynamic(
  () => import("@/components/course-search").then((m) => m.CourseSearch),
  { ssr: false }
);
const CourseGraph = dynamic(
  () => import("@/components/course-graph").then((m) => m.CourseGraph),
  { ssr: false }
);
const CourseDrawer = dynamic(
  () => import("@/components/course-drawer").then((m) => m.CourseDrawer),
  { ssr: false }
);
const CoursePlan = dynamic(
  () => import("@/components/course-plan").then((m) => m.CoursePlan),
  { ssr: false }
);

/**
 * PlannerClient — interactive planner page for all users.
 * – Search for courses
 * – Click or search-select to add to personal plan
 * – Visual graph context identical to /graph for familiarity
 */
export function PlannerClient() {
  const router = useRouter();
  const { toast } = useToast();
  
  // State management
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [plannedCourses, setPlannedCourses] = useState<Course[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  
  // Refs for tracking changes
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const planCoursesMapRef = useRef<Map<string, string>>(new Map()); // courseId -> plan_courses.id

  /* ------------------------------------------------------------
   *  Load dataset from database via tRPC
   * ---------------------------------------------------------- */
  const { data: allCourses = [], isLoading: coursesLoading } = trpc.course.getAll.useQuery();
  
  // Load or create active plan
  const { data: activePlan, isLoading: planLoading } = trpc.plan.getActive.useQuery();
  const { data: userProfile } = trpc.user.getProfile.useQuery();
  const createPlan = trpc.plan.create.useMutation();
  const addCourseToPlan = trpc.plan.addCourse.useMutation();
  const removeCourseFromPlan = trpc.plan.removeCourse.useMutation();
  const updatePositions = trpc.plan.updatePositions.useMutation();
  
  // Track if courses have been initialized to prevent infinite loops
  const coursesInitializedRef = useRef(false);
    
  useEffect(() => {
    if (allCourses.length > 0 && !coursesInitializedRef.current) {
      setCourses(allCourses);
      coursesInitializedRef.current = true;
    }
  }, [allCourses]);

  // Track if plan has been initialized to prevent infinite loops
  const planInitializedRef = useRef(false);

  // Initialize or create active plan
  useEffect(() => {
    const initializePlan = async () => {
      if (planLoading) return;
      if (planInitializedRef.current) return; // Already initialized

      if (activePlan) {
        // Load existing plan
        setActivePlanId(activePlan.id);
        
        // Batch all position updates into a single state update
        const positionsMap = new Map<string, { x: number; y: number }>();
        
        // Load courses from plan
        const coursesFromPlan = activePlan.courses?.map((pc) => {
          // Store plan_courses id for later updates
          planCoursesMapRef.current.set(pc.course_id, pc.id);
          
          // Collect saved positions
          if (pc.position_x !== null && pc.position_y !== null) {
            positionsMap.set(pc.course_id, { x: pc.position_x, y: pc.position_y });
          }
          
          return pc.course;
        }).filter((c): c is Course => c !== null && c !== undefined) || [];

        // Update positions only once if we have any
        if (positionsMap.size > 0) {
          setNodePositions(positionsMap);
        }

        setPlannedCourses(coursesFromPlan);
        planInitializedRef.current = true; // Mark as initialized
      } else if (!planLoading) {
        // Check if user has completed their profile before creating a plan
        if (!userProfile || !userProfile.program || !userProfile.current_term) {
          // User hasn't completed their profile, redirect to account page
          toast({
            title: "Complete Your Profile",
            description: "Please complete your profile information to start planning courses.",
            variant: "destructive",
          });
          router.push("/account");
          return;
        }

        // Create a new default plan only if not loading and no plan exists
        try {
          const newPlan = await createPlan.mutateAsync({
            name: "My Course Plan",
            description: "Default course plan",
            is_active: true,
          });
          setActivePlanId(newPlan.id);
          planInitializedRef.current = true; // Mark as initialized
          toast({
            title: "Plan Created",
            description: "A new course plan has been created for you.",
          });
        } catch (error) {
          console.error("Failed to create plan:", error);
          
          // Check if the error might be due to incomplete profile
          if (!userProfile || !userProfile.program || !userProfile.current_term) {
            toast({
              title: "Complete Your Profile",
              description: "Please complete your profile information to start planning courses.",
              variant: "destructive",
            });
            router.push("/account");
          } else {
            toast({
              title: "Error",
              description: "Failed to create a course plan. Please try again.",
              variant: "destructive",
            });
          }
        }
      }
    };

    initializePlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlan, planLoading]);

  // Auto-save positions with debouncing
  const savePositionsToDatabase = useCallback(
    (positions: Map<string, { x: number; y: number }>) => {
      if (!activePlanId) return;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce save for 1 second after last change
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const positionsArray = Array.from(positions.entries()).map(([courseId, pos]) => ({
            course_id: courseId,
            position_x: pos.x,
            position_y: pos.y,
          }));

          if (positionsArray.length > 0) {
            await updatePositions.mutateAsync({
              plan_id: activePlanId,
              positions: positionsArray,
            });
          }
        } catch (error) {
          console.error("Failed to save positions:", error);
        }
      }, 1000);
    },
    [activePlanId, updatePositions]
  );

  // Handle position changes from graph
  const handlePositionChange = useCallback(
    (courseId: string, x: number, y: number) => {
      setNodePositions((prev) => {
        const newMap = new Map(prev);
        newMap.set(courseId, { x, y });
        savePositionsToDatabase(newMap);
        return newMap;
      });
    },
    [savePositionsToDatabase]
  );

  const handleAddCourse = useCallback(
    async (course: Course, position?: { x: number; y: number }) => {
      // Check if already in plan
      if (plannedCourses.find((c) => c.id === course.id)) return;

      // Add to UI immediately for responsiveness
      setPlannedCourses((prev) => [...prev, course]);

      // Save to database
      if (activePlanId) {
        try {
          const result = await addCourseToPlan.mutateAsync({
            plan_id: activePlanId,
            course_id: course.id,
            term: "Unscheduled", // Default term
            position_x: position?.x,
            position_y: position?.y,
          });

          // Store plan_courses id for later updates
          planCoursesMapRef.current.set(course.id, result.id);

          // If position provided, update local state
          if (position) {
            setNodePositions((prev) => {
              const newMap = new Map(prev);
              newMap.set(course.id, position);
              return newMap;
            });
          }
        } catch (error) {
          console.error("Failed to add course to plan:", error);
          // Rollback UI change on error
          setPlannedCourses((prev) => prev.filter((c) => c.id !== course.id));
          
          // Check if the error might be due to incomplete profile
          if (!userProfile || !userProfile.program || !userProfile.current_term) {
            toast({
              title: "Complete Your Profile",
              description: "Please complete your profile information to add courses to your plan.",
              variant: "destructive",
            });
            router.push("/account");
          } else {
            toast({
              title: "Error",
              description: "Failed to add course to plan. Please try again.",
              variant: "destructive",
            });
          }
        }
      }
    },
    [activePlanId, plannedCourses, addCourseToPlan, toast, userProfile, router]
  );

  const handleRemoveCourse = useCallback(
    async (course: Course) => {
      // Remove from UI immediately
      setPlannedCourses((prev) => prev.filter((c) => c.id !== course.id));

      // Remove from database
      const planCourseId = planCoursesMapRef.current.get(course.id);
      if (planCourseId) {
        try {
          await removeCourseFromPlan.mutateAsync({ id: planCourseId });
          planCoursesMapRef.current.delete(course.id);
          
          // Remove position
          setNodePositions((prev) => {
            const newMap = new Map(prev);
            newMap.delete(course.id);
            return newMap;
          });
        } catch (error) {
          console.error("Failed to remove course from plan:", error);
          // Rollback UI change on error
          setPlannedCourses((prev) => [...prev, course]);
          toast({
            title: "Error",
            description: "Failed to remove course from plan. Please try again.",
            variant: "destructive",
          });
        }
      }
    },
    [removeCourseFromPlan, toast]
  );

  const handleSelectCourse = (course: Course | null) => {
    // Selecting a node should only focus the drawer, not auto-add to plan.
    startTransition(() => setSelectedCourse(course));
  };

  const handleToggleNodeSelection = (nodeId: string) => {
    setSelectedNodeIds((prev) => {
      if (prev.includes(nodeId)) {
        return prev.filter((id) => id !== nodeId);
      }
      return [...prev, nodeId];
    });
  };

  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      const course = plannedCourses.find((c) => c.id === nodeId);
      if (course) {
        await handleRemoveCourse(course);
      }
      // Also remove from selection if it was selected
      setSelectedNodeIds((prev) => prev.filter((id) => id !== nodeId));
    },
    [plannedCourses, handleRemoveCourse]
  );

  const handleBulkDelete = useCallback(async () => {
    const coursesToDelete = plannedCourses.filter((c) => selectedNodeIds.includes(c.id));
    
    // Delete all selected courses
    await Promise.all(coursesToDelete.map((course) => handleRemoveCourse(course)));
    
    setSelectedNodeIds([]);
  }, [plannedCourses, selectedNodeIds, handleRemoveCourse]);

  const handleToggleSelectionMode = () => {
    setSelectionMode((prev) => !prev);
    // Clear selection when toggling off
    if (selectionMode) {
      setSelectedNodeIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedNodeIds([]);
  };

  /* ------------------------------------------------------------
   *  Graph subset: only planned courses (always include selected for context).
   * ---------------------------------------------------------- */
  const graphCourses = useMemo(() => {
    const set = new Map<string, Course>();
    plannedCourses.forEach((c) => set.set(c.id, c));
    if (selectedCourse) set.set(selectedCourse.id, selectedCourse);
    return Array.from(set.values());
  }, [plannedCourses, selectedCourse]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (coursesLoading || planLoading || !courses.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <span className="animate-pulse text-sm text-slate-600">Loading courses…</span>
      </div>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-slate-50">
      {/* Top nav – removed sidebar toggle */}
      <header className="relative border-b bg-white/80 backdrop-blur-sm px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push("/")}
          >
            <Image src="/assets/uwplanit-colour-logo.svg" alt="UWPlanit Logo" width={32} height={32} className="h-8 w-8" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              UWPlanit
            </h1>
          </div>
          <nav className="flex items-center space-x-3 relative z-10 pointer-events-auto">
            <Button variant="ghost" size="sm" asChild className="relative z-10 pointer-events-auto">
              <Link href="/">Home</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="relative z-10 pointer-events-auto">
              <Link href="/graph">Graph</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="relative z-10 pointer-events-auto">
              <Link href="/planner">Planner</Link>
            </Button>
            <AccountMenu />
          </nav>
        </div>
      </header>

      {/* Main layout: graph left, planner sidebar right */}
      <div className="flex flex-1 overflow-hidden">
        {/* Graph */}
        <div className="flex-1 relative overflow-hidden">
          <CourseGraph
            courses={graphCourses}
            selectedCourse={selectedCourse}
            onSelectCourse={(c) => {
              if (c) handleAddCourse(c);
              handleSelectCourse(c);
            }}
            selectedNodeIds={selectedNodeIds}
            selectionMode={selectionMode}
            onToggleNodeSelection={handleToggleNodeSelection}
            onDeleteNode={handleDeleteNode}
            onToggleSelectionMode={handleToggleSelectionMode}
            onBulkDelete={handleBulkDelete}
            onClearSelection={handleClearSelection}
            initialNodePositions={nodePositions}
            onNodePositionChange={handlePositionChange}
          />
        </div>

        {/* Planner Sidebar – fixed, no collapse */}
        <aside className="w-96 shrink-0 border-l bg-white/90 backdrop-blur-sm shadow-xl overflow-y-auto scrollbar-custom p-6">
          {/* Search */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Add Courses</h2>
            <CourseSearch courses={courses} onSelect={handleAddCourse} showDepartments={false} />
          </div>
          {/* Planned courses list */}
          <CoursePlan courses={plannedCourses} onRemoveCourse={handleRemoveCourse} />
        </aside>
      </div>

      {/* Course details drawer */}
      <CourseDrawer course={selectedCourse} onClose={() => setSelectedCourse(null)} onAddToPlan={handleAddCourse} />
    </main>
  );
} 