import { create } from 'zustand'

interface PlannerState {
  selectedItems: Set<string>
  draggedCourse: string | null
  zoom: number
  panX: number
  panY: number
  gridSnap: boolean
  showGrid: boolean
  setSelectedItems: (items: Set<string>) => void
  toggleItemSelection: (itemId: string) => void
  clearSelection: () => void
  setDraggedCourse: (courseId: string | null) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  toggleGridSnap: () => void
  toggleShowGrid: () => void
}

export const usePlannerStore = create<PlannerState>((set) => ({
  selectedItems: new Set(),
  draggedCourse: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  gridSnap: true,
  showGrid: true,

  setSelectedItems: (items) => set({ selectedItems: items }),

  toggleItemSelection: (itemId) =>
    set((state) => {
      const newSelected = new Set(state.selectedItems)
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId)
      } else {
        newSelected.add(itemId)
      }
      return { selectedItems: newSelected }
    }),

  clearSelection: () => set({ selectedItems: new Set() }),

  setDraggedCourse: (courseId) => set({ draggedCourse: courseId }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),

  setPan: (x, y) => set({ panX: x, panY: y }),

  toggleGridSnap: () => set((state) => ({ gridSnap: !state.gridSnap })),

  toggleShowGrid: () => set((state) => ({ showGrid: !state.showGrid })),
}))

