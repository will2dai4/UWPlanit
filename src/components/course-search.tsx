"use client";

import { useState, useEffect, useMemo, useDeferredValue, useRef } from "react";
import { createPortal } from "react-dom";
import Fuse from "fuse.js";
import { Search } from "lucide-react";

import { Course } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface CourseSearchProps {
  courses: Course[];
  onSelect: (course: Course) => void;
  /**
   * Emits whenever the department tag selection changes. An empty array means
   * "no filtering" (i.e. show all departments).
   */
  onFiltersChange?: (departments: string[]) => void;
  showDepartments?: boolean; // new prop
}

export function CourseSearch({ courses, onSelect, onFiltersChange, showDepartments = true }: CourseSearchProps) {
  /* ------------------------------------------------------------------
   * Local state
   * ------------------------------------------------------------------ */
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [open, setOpen] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  /* ------------------------------------------------------------------
   * Derived data helpers
   * ------------------------------------------------------------------ */
  const departments = useMemo(
    () => Array.from(new Set(courses.map((c) => c.department))).sort(),
    [courses]
  );

  const fuse = useMemo(() => {
    return new Fuse(courses, {
      keys: ["code", "name"],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [courses]);

  // Result cap applied to both fuzzy search and final display
  const LIMITED_RESULTS = 100;

  // Determine matching courses ordered by relevance: 1) code match, 2) description match, 3) fuzzy
  const filteredCourses = useMemo(() => {
    const term = deferredQuery.trim().toLowerCase();
    if (!term) return courses;

    // 1️⃣ Course code matches (prioritise those starting with the query)
    const codeMatches = courses
      .filter((c) => c.code.toLowerCase().includes(term))
      .sort((a, b) => {
        const aIdx = a.code.toLowerCase().indexOf(term);
        const bIdx = b.code.toLowerCase().indexOf(term);
        return aIdx - bIdx;
      });

    // 2️⃣ Description matches (exclude already‐found codes)
    const codeSet = new Set(codeMatches.map((c) => c.id));
    const descMatches = courses.filter(
      (c) =>
        !codeSet.has(c.id) &&
        (c.description || "").toLowerCase().includes(term)
    );

    // 3️⃣ Fuzzy fallback on remaining courses (code + name)
    const fuzzyResults = term.length >= 3 ? fuse.search(term, { limit: LIMITED_RESULTS }).map((r) => r.item) : [];

    return [...codeMatches, ...descMatches, ...fuzzyResults];
  }, [deferredQuery, courses, fuse]);

  // Limit list to a manageable size to avoid large DOM tree & improve open speed
  const displayCourses = useMemo(() => {
    if (deferredQuery.trim().length < 2) return [] as Course[];
    return filteredCourses.slice(0, LIMITED_RESULTS);
  }, [filteredCourses, deferredQuery]);

  /* ------------------------------------------------------------------
   * Effects – dropdown behaviour & parent filter callback
   * ------------------------------------------------------------------ */
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Outside click closes dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Check if click is outside both container AND dropdown
      if (
        containerRef.current && 
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    // Use mousedown to detect outside clicks
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  // Auto-toggle dropdown based on query length
  useEffect(() => {
    setOpen(deferredQuery.trim().length >= 2);
  }, [deferredQuery]);

  // Update dropdown position when opening
  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  // Notify parent when department chips change
  useEffect(() => {
    onFiltersChange?.(selectedDepartments);
  }, [selectedDepartments, onFiltersChange]);

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */
  return (
    <div className="flex flex-col space-y-4">
      {/* Department filter chips */}
      {showDepartments && (
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => {
            const active = selectedDepartments.includes(dept);
            return (
              <Badge
                key={dept}
                variant={active ? "default" : "outline"}
                className="cursor-pointer select-none"
                onClick={() =>
                  setSelectedDepartments((prev) =>
                    prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
                  )
                }
              >
                {dept}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Search box & suggestions */}
      <div ref={containerRef} className="relative w-full" style={{ zIndex: 10000 }}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses..."
          className="pl-8"
        />
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Render dropdown in a portal to avoid overflow clipping */}
      {open && typeof window !== "undefined" && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] max-h-60 overflow-y-auto overflow-x-hidden rounded-md border bg-white shadow-lg"
          style={{
            top: `${dropdownPosition.top + 4}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          {displayCourses.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">No courses found.</div>
          ) : (
            <div className="py-1">
              {displayCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => {
                    console.log("Course clicked:", course.code);
                    onSelect(course);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="relative flex cursor-pointer select-none items-center px-2 py-2 text-sm outline-none hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{course.code}</span>
                    <span className="text-sm text-gray-500 truncate">{course.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
