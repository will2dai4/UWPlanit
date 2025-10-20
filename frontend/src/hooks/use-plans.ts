import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Plan, PlanItem, ChecklistItem, PlanExport } from '@/types'

interface ApiResponse<T> {
  data: T
  meta?: Record<string, unknown>
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await apiClient.get<{data: Plan[]}>('/plans/mine')
      return response.data
    },
  })
}

export function usePlan(planId: string) {
  return useQuery({
    queryKey: ['plan', planId],
    queryFn: async () => {
      const response = await apiClient.get<{data: Plan}>(`/plans/${planId}`)
      return response.data
    },
    enabled: !!planId,
  })
}

export function usePlanItems(planId: string) {
  return useQuery({
    queryKey: ['plan-items', planId],
    queryFn: async () => {
      const response = await apiClient.get<{data: PlanItem[]}>(`/plans/${planId}/items`)
      return response.data
    },
    enabled: !!planId,
  })
}

export function useChecklistItems(planId: string) {
  return useQuery({
    queryKey: ['checklist-items', planId],
    queryFn: async () => {
      const response = await apiClient.get<{data: ChecklistItem[]}>(`/plans/${planId}/checklist`)
      return response.data
    },
    enabled: !!planId,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await apiClient.post<{data: Plan}>('/plans', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ planId, data }: { planId: string; data: Partial<Plan> }) => {
      const response = await apiClient.patch<{data: Plan}>(`/plans/${planId}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      queryClient.invalidateQueries({ queryKey: ['plan', variables.planId] })
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => apiClient.delete(`/plans/${planId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useCreatePlanItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      planId,
      data,
    }: {
      planId: string
      data: { course_id: string; term?: string; pos_x: number; pos_y: number }
    }) => {
      const response = await apiClient.post<{data: PlanItem}>(`/plans/${planId}/items`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plan-items', variables.planId] })
    },
  })
}

export function useUpdatePlanItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ planId, itemId, data }: { planId: string; itemId: string; data: Partial<PlanItem> }) => {
      const response = await apiClient.patch<{data: PlanItem}>(`/plans/${planId}/items/${itemId}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plan-items', variables.planId] })
    },
  })
}

export function useDeletePlanItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, itemId }: { planId: string; itemId: string }) =>
      apiClient.delete(`/plans/${planId}/items/${itemId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plan-items', variables.planId] })
    },
  })
}

export function useCreateChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      planId,
      data,
    }: {
      planId: string
      data: { label: string; group_key?: string; required_count?: number }
    }) => {
      const response = await apiClient.post<{data: ChecklistItem}>(`/plans/${planId}/checklist`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-items', variables.planId] })
    },
  })
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ planId, itemId, data }: { planId: string; itemId: string; data: Partial<ChecklistItem> }) => {
      const response = await apiClient.patch<{data: ChecklistItem}>(`/plans/${planId}/checklist/${itemId}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-items', variables.planId] })
    },
  })
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, itemId }: { planId: string; itemId: string }) =>
      apiClient.delete(`/plans/${planId}/checklist/${itemId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-items', variables.planId] })
    },
  })
}

export function useExportPlan(planId: string) {
  return useQuery({
    queryKey: ['plan-export', planId],
    queryFn: async () => {
      const response = await apiClient.get<{data: PlanExport}>(`/plans/${planId}/export`)
      return response.data
    },
    enabled: false, // Only run manually
  })
}

export function useImportPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PlanExport) => {
      const response = await apiClient.post<{data: Plan}>('/plans/import', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useParseChecklist() {
  return useMutation({
    mutationFn: async ({ planId, text }: { planId: string; text: string }) => {
      const response = await apiClient.post<{data: ChecklistItem[]}>(`/plans/${planId}/checklist/parse-text`, { text })
      return response.data
    },
  })
}

