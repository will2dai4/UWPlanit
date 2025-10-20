import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Course } from '@/types'
import { formatCourseCode } from '@/lib/utils'

interface CourseCardProps {
  course: Course
  onDragStart?: (courseId: string) => void
}

export function CourseCard({ course, onDragStart }: CourseCardProps) {
  const courseCode = formatCourseCode(course.subject, course.catalog_number)

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      draggable={!!onDragStart}
      onDragStart={() => onDragStart?.(course.course_id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              <Link href={`/course/${course.course_id}`} className="hover:text-primary">
                {courseCode}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1">{course.title}</CardDescription>
          </div>
          <Badge variant="secondary">{course.units} units</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{course.faculty}</Badge>
            <Badge variant="outline">Level {course.level}</Badge>
            {course.terms_offered && course.terms_offered.length > 0 && (
              <Badge variant="outline">{course.terms_offered.join(', ')}</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

