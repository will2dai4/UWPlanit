"use client";

import { Course } from "@/types/course";
import { getCourseById, getAllCourses } from "@/lib/courses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, BookOpen, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useEffect } from "react";

interface CourseDrawerProps {
  course: Course | null;
  onClose: () => void;
  onAddToPlan: (course: Course) => void;
}

const normalize = (s: string) => s.replace(/\s+/g, "").toUpperCase();
const resolveCourseName = (idOrCode: string): string => {
  const direct = getCourseById(idOrCode);
  if (direct) return direct.name;
  const match = getAllCourses().find((c) => normalize(c.code) === normalize(idOrCode));
  return match?.name || "";
};

export function CourseDrawer({ course, onClose, onAddToPlan: _onAddToPlan }: CourseDrawerProps) {
  // Handle escape key and backdrop click
  useEffect(() => {
    if (!course) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
  }, [course, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = course ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [course]);

  const isOpen = Boolean(course);

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-[420px] bg-white shadow-xl overflow-y-auto border-l transition-transform duration-300 ease-in-out"
      style={{
        pointerEvents: isOpen ? "auto" : "none",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
      }}
    >
      {course && (
        <>
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex flex-col">
              <span className="text-lg font-semibold">{course.code}</span>
              <span className="text-sm text-gray-600 max-w-[280px] truncate">{course.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content wrapper */}
          <div className="p-6 space-y-6">
            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {course.description || "No description available."}
                  </p>
                </div>

                <div className="mt-4">
                  <a
                    href={`https://uwflow.com/course/${course.code.toLowerCase().replace(/\s+/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium inline-flex items-center gap-1"
                  >
                    View on UW Flow
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 7l-10 10m0-10h10v10"
                      />
                    </svg>
                  </a>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-1">Units</h4>
                  <p className="text-gray-600">{course.units}</p>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-amber-800">Important Notice</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Course requirements and information may be outdated. Please consult official University of Waterloo resources 
                    (such as the undergraduate calendar, course catalog, or academic advisors) for the most current and accurate 
                    course requirements and information.
                  </p>
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            {course.prerequisites.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    Prerequisites Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.prerequisites.map((prereq) => (
                      <Badge
                        key={prereq}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                        title={resolveCourseName(prereq)}
                      >
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Corequisites */}
            {course.corequisites.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <Clock className="h-5 w-5" />
                    Corequisites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.corequisites.map((coreq) => (
                      <Badge
                        key={coreq}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        title={resolveCourseName(coreq)}
                      >
                        {coreq}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Antirequisites */}
            {course.antirequisites.length > 0 && (
              <Card className="border-gray-200 bg-gray-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <XCircle className="h-5 w-5" />
                    Antirequisites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.antirequisites.map((antireq) => (
                      <Badge
                        key={antireq}
                        variant="secondary"
                        className="bg-gray-600 text-white hover:bg-gray-700"
                        title={resolveCourseName(antireq)}
                      >
                        {antireq}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Requirements */}
            {course.prerequisites.length === 0 &&
              course.corequisites.length === 0 &&
              course.antirequisites.length === 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-900">No Prerequisites</h4>
                        <p className="text-sm text-green-700">
                          This course has no prerequisites and can be taken at any time.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </>
      )}
    </aside>
  );
}
