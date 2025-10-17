import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Plan, PlanItem, ChecklistItem, PlanExport } from '@/types'

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => apiClient.get<Plan[]>('/plans/mine'),
  })
}

export function usePlan(planId: string) {
  return useQuery({
    queryKey: ['plan', planId],
    queryFn: () => apiClient.get<Plan>(`/plans/${planId}`),
    enabled: !!planId,
  })
}

export function usePlanItems(planId: string) {
  return useQuery({
    queryKey: ['plan-items', planId],
    queryFn: () => apiClient.get<PlanItem[]>(`/plans/${planId}/items`),
    enabled: !!planId,
  })
}

export function useChecklistItems(planId: string) {
  return useQuery({
    queryKey: ['checklist-items', planId],
    queryFn: () => apiClient.get<ChecklistItem[]>(`/plans/${planId}/checklist`),
    enabled: !!planId,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string }) => apiClient.post<Plan>('/plans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: Partial<Plan> }) =>
      apiClient.patch<Plan>(`/plans/${planId}`, data),
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
    mutationFn: ({
      planId,
      data,
    }: {
      planId: string
      data: { course_id: string; term?: string; pos_x: number; pos_y: number }
    }) => apiClient.post<PlanItem>(`/plans/${planId}/items`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plan-items', variables.planId] })
    },
  })
}

export function useUpdatePlanItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, itemId, data }: { planId: string; itemId: string; data: Partial<PlanItem> }) =>
      apiClient.patch<PlanItem>(`/plans/${planId}/items/${itemId}`, data),
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
    mutationFn: ({
      planId,
      data,
    }: {
      planId: string
      data: { label: string; group_key?: string; required_count?: number }
    }) => apiClient.post<ChecklistItem>(`/plans/${planId}/checklist`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-items', variables.planId] })
    },
  })
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, itemId, data }: { planId: string; itemId: string; data: Partial<ChecklistItem> }) =>
      apiClient.patch<ChecklistItem>(`/plans/${planId}/checklist/${itemId}`, data),
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
    queryFn: () => apiClient.get<PlanExport>(`/plans/${planId}/export`),
    enabled: false, // Only run manually
  })
}

export function useImportPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlanExport) => apiClient.post<Plan>('/plans/import', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useParseChecklist() {
  return useMutation({
    mutationFn: ({ planId, text }: { planId: string; text: string }) =>
      apiClient.post<ChecklistItem[]>(`/plans/${planId}/checklist/parse-text`, { text }),
  })
}

