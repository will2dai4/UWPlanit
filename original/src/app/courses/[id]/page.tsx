import {
  getCourseById,
  getPrerequisiteCourses,
  getCorequisiteCourses,
  getAntirequisiteCourses,
} from "@/lib/courses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";

interface CoursePageProps {
  params: {
    id: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  const course = getCourseById(params.id);

  if (!course) {
    notFound();
  }

  const prerequisites = getPrerequisiteCourses(course);
  const corequisites = getCorequisiteCourses(course);
  const antirequisites = getAntirequisiteCourses(course);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{course.code}</h1>
          <h2 className="text-2xl text-gray-600">{course.name}</h2>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Description</h3>
                  <p className="text-gray-600">{course.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Units</h3>
                  <p className="text-gray-600">{course.units}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Department</h3>
                  <p className="text-gray-600">{course.department}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Level</h3>
                  <p className="text-gray-600">{course.level}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Terms Offered</h3>
                  <p className="text-gray-600">{course.terms.join(", ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prerequisites.map((prereq) => (
                    <Link key={prereq.id} href={`/courses/${prereq.id}`}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{prereq.code}</CardTitle>
                          <CardDescription>{prereq.name}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {corequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Corequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {corequisites.map((coreq) => (
                    <Link key={coreq.id} href={`/courses/${coreq.id}`}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{coreq.code}</CardTitle>
                          <CardDescription>{coreq.name}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {antirequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Antirequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {antirequisites.map((antireq) => (
                    <Link key={antireq.id} href={`/courses/${antireq.id}`}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{antireq.code}</CardTitle>
                          <CardDescription>{antireq.name}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
