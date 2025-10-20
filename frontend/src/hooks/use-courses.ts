import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Course, CourseFilters, GraphElements } from '@/types'

interface ApiResponse<T> {
  data: T
  meta?: Record<string, unknown>
}

export function useCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      const response: any = await apiClient.get('/courses', { params: filters as Record<string, string> })
      return response.data as Course[]
    },
  })
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response: any = await apiClient.get(`/courses/${courseId}`)
      return response.data as Course
    },
    enabled: !!courseId,
  })
}

export function useGlobalGraph() {
  return useQuery({
    queryKey: ['graph', 'global'],
    queryFn: async () => {
      const response: any = await apiClient.get('/graph/global')
      return response.data as GraphElements
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - graph data changes infrequently
  })
}

export function useSubjectGraph(subject: string) {
  return useQuery({
    queryKey: ['graph', 'subject', subject],
    queryFn: async () => {
      const response: any = await apiClient.get(`/graph/subject/${subject}`)
      return response.data as GraphElements
    },
    enabled: !!subject,
    staleTime: 1000 * 60 * 30,
  })
}

