"use client";

// Home is a client component only because it manages UI state. To minimise the initial bundle
// we defer costly imports (graph + course data) until the user clicks "Get Started".

import { useState, useEffect, startTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { Course, CourseData } from "@/types/course";
import { HeroSection } from "@/components/hero-section";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0/client";
import { LoginButton } from "@/components/auth/login-button";
import { AccountMenu } from "@/components/account-menu";

// Heavy, purely-client components are code-split for faster first paint.
const CourseSearch = dynamic(
  () => import("@/components/course-search").then((m) => m.CourseSearch),
  { ssr: false, loading: () => null }
);
const CourseGraph = dynamic(() => import("@/components/course-graph").then((m) => m.CourseGraph), {
  ssr: false,
  loading: () => null,
});
const CourseDrawer = dynamic(
  () => import("@/components/course-drawer").then((m) => m.CourseDrawer),
  { ssr: false, loading: () => null }
);
const CoursePlan = dynamic(() => import("@/components/course-plan").then((m) => m.CoursePlan), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [plannedCourses, setPlannedCourses] = useState<Course[]>([]);
  const [showApp, setShowApp] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  // When `departments` is empty, no courses will be shown.
  const [filters, setFilters] = useState<{ departments: string[]; search: string }>({
    departments: ["AFM"],
    search: "",
  });

  // Apply filters client-side. Keeps memo stable unless inputs change.
  const filteredCourses = useMemo(() => {
    if (!courses.length) return [] as Course[];

    return courses.filter((c) => {
      const matchesDept =
        filters.departments.length > 0 && filters.departments.includes(c.department);
      const term = filters.search.trim().toLowerCase();
      const matchesSearch =
        !term || c.code.toLowerCase().includes(term) || c.name.toLowerCase().includes(term);
      return matchesDept && matchesSearch;
    });
  }, [courses, filters]);

  // Ensure the currently selected course remains visible even if filtered out.
  const graphCourses = useMemo(() => {
    const combined = selectedCourse ? [...filteredCourses, selectedCourse] : filteredCourses;
    // De-duplicate by id to avoid phantom duplicates after filter toggles.
    const uniqueMap = new Map<string, Course>();
    combined.forEach((c) => uniqueMap.set(c.id, c));
    return Array.from(uniqueMap.values());
  }, [filteredCourses, selectedCourse]);

  // Lazy-load the static courses JSON only after the user enters the app.
  useEffect(() => {
    if (!showApp || courses.length) return;

    let isMounted = true;
    (async () => {
      const courseModule = await import("@/data/courses.json");
      const data = courseModule.default as CourseData;
      if (isMounted) setCourses(data.courses);
    })();

    return () => {
      isMounted = false;
    };
  }, [showApp, courses.length]);

  const handleSelectCourse = (course: Course | null) => {
    // Mark update non-blocking so Graph remains interactive.
    startTransition(() => {
      setSelectedCourse(course);
    });
  };

  const handleAddToPlan = (course: Course) => {
    if (!plannedCourses.find((c) => c.id === course.id)) {
      setPlannedCourses([...plannedCourses, course]);
    }
  };

  const handleRemoveFromPlan = (course: Course) => {
    setPlannedCourses(plannedCourses.filter((c) => c.id !== course.id));
  };

  // Initial landing (no heavy JS loaded yet).
  if (!showApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <HeroSection onGetStarted={() => router.push("/graph")} />
      </div>
    );
  }

  // While courses are streaming down, display a lightweight placeholder.
  if (!courses.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <span className="animate-pulse text-sm text-slate-600">Loading courses…</span>
      </div>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-slate-50">
      {/* Modern Header */}
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
            <Button variant="ghost" size="sm" onClick={() => setShowApp(false)}>
              Home
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/planner")}>Planner</Button>
            <Button variant="ghost" size="sm">About</Button>
            {!authLoading && (user ? <AccountMenu /> : <LoginButton variant="outline" />)}
          </nav>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Overlay Sidebar (permanent element for snappy open) */}
        <motion.aside
          initial={false}
          animate={{ x: sidebarOpen ? 0 : -384 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed inset-y-0 left-0 z-40 w-96 flex flex-col bg-white/90 backdrop-blur-sm shadow-xl overflow-y-auto scrollbar-custom border-r pr-2"
          style={{ pointerEvents: sidebarOpen ? "auto" : "none" }}
        >
          {/* Header with close */}
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

          {/* Search Section */}
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold mb-4">Course Search</h2>
            <CourseSearch
              courses={courses}
              onSelect={handleSelectCourse}
              onFiltersChange={(departments) => setFilters(prev => ({ ...prev, departments }))}
            />
          </div>

          {/* Course Plan Section */}
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

        </motion.aside>

        {/* Main Graph Area */}
        <div className="flex-1 relative">
          <CourseGraph
            courses={graphCourses}
            selectedCourse={selectedCourse}
            onSelectCourse={handleSelectCourse}
          />

          {/* Floating Action Button for Mobile */}
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
