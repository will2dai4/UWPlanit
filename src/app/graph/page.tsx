"use client";

import { useState, useEffect, startTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { Course, CourseData } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0/client";
import { LoginButton } from "@/components/auth/login-button";
import { AccountMenu } from "@/components/account-menu";
import { trpc } from "@/lib/trpc";

const CourseSearch = dynamic(
  () => import("@/components/course-search").then((m) => m.CourseSearch),
  { ssr: false }
);
const CourseGraph = dynamic(() => import("@/components/course-graph").then((m) => m.CourseGraph), {
  ssr: false,
});
const CourseDrawer = dynamic(
  () => import("@/components/course-drawer").then((m) => m.CourseDrawer),
  { ssr: false }
);
const CoursePlan = dynamic(() => import("@/components/course-plan").then((m) => m.CoursePlan), {
  ssr: false,
});

export default function GraphPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [plannedCourses, setPlannedCourses] = useState<Course[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  // Empty `departments` now means show all courses.
  const [departments, setDepartments] = useState<string[]>([]);

  // Load courses from database via tRPC
  const { data: allCourses = [], isLoading: coursesLoading, error: coursesError } = trpc.course.getAll.useQuery();

  useEffect(() => {
    if (allCourses.length > 0) {
      setCourses(allCourses);
    }
    if (coursesError) {
      console.error('Error loading courses:', coursesError);
    }
  }, [allCourses, coursesError]);

  const filteredCourses = useMemo(() => {
    if (!courses.length) return [] as Course[];
    if (departments.length === 0) {
      return courses; // No filters selected → show all courses
    }
    return courses.filter((c) => departments.includes(c.department));
  }, [courses, departments]);

  const graphCourses = useMemo(() => {
    const combined = selectedCourse ? [...filteredCourses, selectedCourse] : filteredCourses;
    const um = new Map<string, Course>();
    combined.forEach((c) => um.set(c.id, c));
    return Array.from(um.values());
  }, [filteredCourses, selectedCourse]);

  const handleSelectCourse = (course: Course | null) => {
    startTransition(() => setSelectedCourse(course));
  };

  const handleAddToPlan = (course: Course) => {
    if (!plannedCourses.find((c) => c.id === course.id))
      setPlannedCourses([...plannedCourses, course]);
  };

  const handleRemoveFromPlan = (course: Course) =>
    setPlannedCourses(plannedCourses.filter((c) => c.id !== course.id));

  if (coursesLoading || !courses.length)
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <span className="animate-pulse text-sm text-slate-600">Loading courses…</span>
      </div>
    );

  return (
    <main className="flex h-screen flex-col bg-slate-50">
      <header className="border-b bg-white/80 backdrop-blur-sm px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-3">
              <Image src="/assets/uwplanit-colour-logo.svg" alt="UWPlanit Logo" width={32} height={32} className="h-8 w-8" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UW Course Graph
              </h1>
            </div>
          </div>
          <nav className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              Home
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/about")}>
              About
            </Button>
            {!authLoading && (user ? <AccountMenu /> : <LoginButton variant="outline" />)}
          </nav>
        </div>
      </header>

      <div className="flex flex-1 relative">
        <motion.aside
          initial={false}
          animate={{ x: sidebarOpen ? 0 : -384 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed inset-y-0 left-0 z-40 w-96 flex flex-col bg-white/90 backdrop-blur-sm shadow-xl overflow-y-auto scrollbar-custom border-r pr-2"
          style={{ pointerEvents: sidebarOpen ? "auto" : "none" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-lg font-semibold">Filters & Search</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="border-b p-6">
            <h2 className="text-lg font-semibold mb-4">Course Search</h2>
            <CourseSearch
              courses={courses}
              onSelect={handleSelectCourse}
              onFiltersChange={setDepartments}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">My Course Plan</h2>
                <Button size="sm" variant="outline">
                  Export PDF
                </Button>
              </div>
              <CoursePlan courses={plannedCourses} onRemoveCourse={handleRemoveFromPlan} />
            </div>
          </div>

          {/* Premium upsell removed */}
        </motion.aside>

        <div className="flex-1 relative">
          <CourseGraph
            courses={graphCourses}
            selectedCourse={selectedCourse}
            onSelectCourse={handleSelectCourse}
          />

          <motion.button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg lg:hidden"
            onClick={() => setSidebarOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="h-6 w-6 mx-auto" />
          </motion.button>
        </div>
      </div>

      <CourseDrawer
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onAddToPlan={handleAddToPlan}
      />
    </main>
  );
}
