'use client'

import { use } from 'react'
import Link from 'next/link'
import { useCourse } from '@/hooks/use-courses'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { formatCourseCode } from '@/lib/utils'

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: course, isLoading, error } = useCourse(id)

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Course Not Found</CardTitle>
            <CardDescription>The requested course could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/graph">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Graph
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const courseCode = formatCourseCode(course.subject, course.catalog_number)

  return (
    <div className="container py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/graph">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Graph
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{courseCode}</CardTitle>
              <CardDescription className="text-xl">{course.title}</CardDescription>
            </div>
            <Badge className="text-lg px-3 py-1">{course.units} units</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{course.description}</p>
          </div>

          {/* Course Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold mb-2">Faculty</h3>
              <Badge variant="outline">{course.faculty}</Badge>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Level</h3>
              <Badge variant="outline">{course.level}</Badge>
            </div>
          </div>

          {/* Terms Offered */}
          {course.terms_offered && course.terms_offered.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Terms Offered</h3>
              <div className="flex gap-2">
                {course.terms_offered.map((term) => (
                  <Badge key={term} variant="secondary">
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t">
            <Button asChild>
              <Link href={`/graph/${course.subject}`}>
                <BookOpen className="mr-2 h-4 w-4" />
                View {course.subject} Graph
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

