import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Course, CourseFilters, GraphElements } from '@/types'

export function useCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => apiClient.get<Course[]>('/courses', { params: filters as Record<string, string> }),
  })
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => apiClient.get<Course>(`/courses/${courseId}`),
    enabled: !!courseId,
  })
}

export function useGlobalGraph() {
  return useQuery({
    queryKey: ['graph', 'global'],
    queryFn: () => apiClient.get<GraphElements>('/graph/global'),
    staleTime: 1000 * 60 * 30, // 30 minutes - graph data changes infrequently
  })
}

export function useSubjectGraph(subject: string) {
  return useQuery({
    queryKey: ['graph', 'subject', subject],
    queryFn: () => apiClient.get<GraphElements>(`/graph/subject/${subject}`),
    enabled: !!subject,
    staleTime: 1000 * 60 * 30,
  })
}

