"use client";

import { useState, useEffect, startTransition, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Course, CourseData } from "@/types/course";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/account-menu";
import { useRouter } from "next/navigation";

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
  // Remove sidebar UI – planner now always shows a fixed right panel with search & list.
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [plannedCourses, setPlannedCourses] = useState<Course[]>([]);
  // sidebarOpen state removed

  /* ------------------------------------------------------------
   *  Load dataset once (identical to /graph)
   * ---------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const courseModule = await import("@/data/courses.json");
      const data = courseModule.default as CourseData;
      setCourses(data.courses);
    })();
  }, []);

  const handleAddCourse = (course: Course) => {
    setPlannedCourses((prev) => {
      if (prev.find((c) => c.id === course.id)) return prev;
      return [...prev, course];
    });
  };

  const handleRemoveCourse = (course: Course) => {
    setPlannedCourses((prev) => prev.filter((c) => c.id !== course.id));
  };

  const handleSelectCourse = (course: Course | null) => {
    // Selecting a node should only focus the drawer, not auto-add to plan.
    startTransition(() => setSelectedCourse(course));
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

  if (!courses.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        Loading…
      </div>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-slate-50">
      {/* Top nav – removed sidebar toggle */}
      <header className="border-b bg-white/80 backdrop-blur-sm px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Course Planner
          </h1>
          <nav className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>Home</Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/graph")}>Graph</Button>
            <AccountMenu />
          </nav>
        </div>
      </header>

      {/* Main layout: graph left, planner sidebar right */}
      <div className="flex flex-1">
        {/* Graph */}
        <div className="flex-1 relative">
          <CourseGraph
            courses={graphCourses}
            selectedCourse={selectedCourse}
            onSelectCourse={(c) => {
              if (c) handleAddCourse(c);
              handleSelectCourse(c);
            }}
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