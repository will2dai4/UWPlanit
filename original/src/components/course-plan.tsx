"use client";

import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock, BookOpen, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CoursePlanProps {
  courses: Course[];
  onRemoveCourse: (course: Course) => void;
}

export function CoursePlan({ courses, onRemoveCourse }: CoursePlanProps) {
  const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);

  // Group courses by level
  const coursesByLevel = courses.reduce(
    (acc, course) => {
      const level = course.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(course);
      return acc;
    },
    {} as Record<number, Course[]>
  );

  const levels = Object.keys(coursesByLevel).map(Number).sort();

  if (courses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses planned</h3>
          <p className="text-gray-600 mb-4">
            Start building your academic plan by selecting courses from the graph.
          </p>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Click on any course to add it
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Plan Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Courses:</span>
              <span className="ml-2 font-semibold">{courses.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Units:</span>
              <span className="ml-2 font-semibold">{totalUnits}</span>
            </div>
            <div>
              <span className="text-gray-600">Levels:</span>
              <span className="ml-2 font-semibold">{levels.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Departments:</span>
              <span className="ml-2 font-semibold">
                {new Set(courses.map((c) => c.department)).size}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses by Level */}
      <div className="space-y-4">
        <AnimatePresence>
          {levels.map((level) => (
            <motion.div
              key={level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Level {level}</span>
                    <Badge variant="secondary">
                      {coursesByLevel[level].length} course
                      {coursesByLevel[level].length !== 1 ? "s" : ""}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AnimatePresence>
                    {coursesByLevel[level].map((course) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{course.code}</span>
                            <Badge variant="outline" className="text-xs">
                              {course.department}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{course.name}</p>
                          {(course.prerequisites.length > 0 || course.corequisites.length > 0) && (
                            <div className="flex items-center gap-1 mt-2">
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                              <span className="text-xs text-amber-600">Has prerequisites</span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveCourse(course)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Prerequisites Warning */}
      {courses.some((course) => course.prerequisites.length > 0) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Prerequisites Required</h4>
                  <p className="text-sm text-amber-700">
                    Some courses in your plan have prerequisites. Make sure to complete them first.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
