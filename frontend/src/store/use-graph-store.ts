import { create } from 'zustand'
import type { CourseFilters } from '@/types'

interface GraphState {
  filters: CourseFilters
  layout: string
  selectedNodeId: string | null
  highlightedNodes: Set<string>
  setFilters: (filters: CourseFilters) => void
  setLayout: (layout: string) => void
  setSelectedNode: (nodeId: string | null) => void
  setHighlightedNodes: (nodes: Set<string>) => void
  clearFilters: () => void
}

const initialFilters: CourseFilters = {
  search: '',
  subject: undefined,
  level: undefined,
  term: undefined,
  faculty: undefined,
  limit: 200,
  offset: 0,
}

export const useGraphStore = create<GraphState>((set) => ({
  filters: initialFilters,
  layout: 'cose-bilkent',
  selectedNodeId: null,
  highlightedNodes: new Set(),

  setFilters: (filters) => set({ filters: { ...initialFilters, ...filters } }),

  setLayout: (layout) => set({ layout }),

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setHighlightedNodes: (nodes) => set({ highlightedNodes: nodes }),

  clearFilters: () => set({ filters: initialFilters }),
}))

