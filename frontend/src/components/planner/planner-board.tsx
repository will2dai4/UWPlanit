'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Grid3x3, Save, AlertCircle } from 'lucide-react'
import { usePlannerStore } from '@/store/use-planner-store'
import type { PlanItem, Course } from '@/types'
import { formatCourseCode, formatTerm } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface PlannerBoardProps {
  planId: string
  items: PlanItem[]
  onUpdateItem: (itemId: string, data: Partial<PlanItem>) => void
  onDeleteItem: (itemId: string) => void
  onSave?: () => void
}

const GRID_SIZE = 50

export function PlannerBoard({ planId, items, onUpdateItem, onDeleteItem, onSave }: PlannerBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const { zoom, panX, panY, gridSnap, showGrid, setZoom, setPan, toggleGridSnap, toggleShowGrid, selectedItems, toggleItemSelection, clearSelection } =
    usePlannerStore()

  const handleZoomIn = () => setZoom(zoom * 1.2)
  const handleZoomOut = () => setZoom(zoom * 0.8)

  const snapToGrid = useCallback(
    (value: number) => {
      if (gridSnap) {
        return Math.round(value / GRID_SIZE) * GRID_SIZE
      }
      return value
    },
    [gridSnap]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, itemId: string, item: PlanItem) => {
      if (e.button !== 0) return // Only left click

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = (e.clientX - rect.left - panX) / zoom
      const y = (e.clientY - rect.top - panY) / zoom

      setDraggedItemId(itemId)
      setDragOffset({
        x: x - item.pos_x,
        y: y - item.pos_y,
      })

      if (!selectedItems.has(itemId)) {
        if (e.shiftKey) {
          toggleItemSelection(itemId)
        } else {
          clearSelection()
          toggleItemSelection(itemId)
        }
      }
    },
    [panX, panY, zoom, selectedItems, toggleItemSelection, clearSelection]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggedItemId || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - panX) / zoom - dragOffset.x
      const y = (e.clientY - rect.top - panY) / zoom - dragOffset.y

      const snappedX = snapToGrid(x)
      const snappedY = snapToGrid(y)

      // Update all selected items with relative movement
      const draggedItem = items.find((item) => item.plan_item_id === draggedItemId)
      if (!draggedItem) return

      const deltaX = snappedX - draggedItem.pos_x
      const deltaY = snappedY - draggedItem.pos_y

      if (selectedItems.has(draggedItemId)) {
        // Move all selected items
        selectedItems.forEach((itemId) => {
          const item = items.find((i) => i.plan_item_id === itemId)
          if (item) {
            onUpdateItem(itemId, {
              pos_x: item.pos_x + deltaX,
              pos_y: item.pos_y + deltaY,
            })
          }
        })
      } else {
        onUpdateItem(draggedItemId, { pos_x: snappedX, pos_y: snappedY })
      }
    },
    [draggedItemId, panX, panY, zoom, dragOffset, snapToGrid, items, selectedItems, onUpdateItem]
  )

  const handleMouseUp = useCallback(() => {
    setDraggedItemId(null)
  }, [])

  useEffect(() => {
    if (draggedItemId) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedItemId, handleMouseMove, handleMouseUp])

  // Pan with middle mouse or space+drag
  const handlePan = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
        e.preventDefault()
        const startX = e.clientX
        const startY = e.clientY

        const handlePanMove = (moveEvent: MouseEvent) => {
          const dx = moveEvent.clientX - startX
          const dy = moveEvent.clientY - startY
          setPan(panX + dx, panY + dy)
        }

        const handlePanEnd = () => {
          document.removeEventListener('mousemove', handlePanMove)
          document.removeEventListener('mouseup', handlePanEnd)
        }

        document.addEventListener('mousemove', handlePanMove)
        document.addEventListener('mouseup', handlePanEnd)
      }
    },
    [panX, panY, setPan]
  )

  return (
    <div className="relative w-full h-full">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/95 backdrop-blur p-2 rounded-lg border shadow-sm">
        <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant={gridSnap ? 'default' : 'ghost'}
          size="icon"
          onClick={toggleGridSnap}
          title={gridSnap ? 'Disable Grid Snap' : 'Enable Grid Snap'}
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>
        {onSave && (
          <Button variant="default" size="sm" onClick={onSave} className="ml-2">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 z-10 bg-background/95 backdrop-blur p-3 rounded-lg border shadow-sm text-xs text-muted-foreground max-w-xs">
        <p>Drag courses to move them. Shift+click to select multiple. Ctrl+drag to pan.</p>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full overflow-hidden ${showGrid ? 'planner-grid' : ''} bg-muted/20`}
        onMouseDown={handlePan}
        style={{
          cursor: draggedItemId ? 'grabbing' : 'default',
        }}
      >
        <div
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'relative',
            width: '5000px',
            height: '5000px',
          }}
        >
          {items.map((item) => (
            <PlannerItem
              key={item.plan_item_id}
              item={item}
              isSelected={selectedItems.has(item.plan_item_id)}
              onMouseDown={(e) => handleMouseDown(e, item.plan_item_id, item)}
              onDelete={() => onDeleteItem(item.plan_item_id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface PlannerItemProps {
  item: PlanItem
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onDelete: () => void
}

function PlannerItem({ item, isSelected, onMouseDown, onDelete }: PlannerItemProps) {
  const course = item.course

  if (!course) {
    return null
  }

  const courseCode = formatCourseCode(course.subject, course.catalog_number)

  return (
    <div
      className={`absolute cursor-move select-none transition-shadow ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
      }`}
      style={{
        left: `${item.pos_x}px`,
        top: `${item.pos_y}px`,
        width: '200px',
      }}
      onMouseDown={onMouseDown}
    >
      <div className="bg-card border rounded-lg p-3 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{courseCode}</h4>
            <p className="text-xs text-muted-foreground line-clamp-1">{course.title}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <AlertCircle className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {course.units} units
          </Badge>
          {item.term && (
            <Badge variant="secondary" className="text-xs">
              {formatTerm(item.term)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

