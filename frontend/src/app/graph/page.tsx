'use client'

import { useState } from 'react'
import { GraphCanvas } from '@/components/graph/graph-canvas'
import { SearchBar } from '@/components/search/search-bar'
import { FiltersPanel } from '@/components/filters/filters-panel'
import { useGlobalGraph } from '@/hooks/use-courses'
import { useGraphStore } from '@/store/use-graph-store'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'

export default function GraphPage() {
  const { data: graphData, isLoading, error } = useGlobalGraph()
  const { filters, layout, setFilters, setLayout, clearFilters, setSelectedNode } = useGraphStore()
  const [showFilters, setShowFilters] = useState(true)

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId)
    // Could navigate to course detail page
    // router.push(`/course/${nodeId}`)
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Search Bar */}
      <div className="border-b bg-background p-4">
        <div className="container flex items-center gap-4">
          <SearchBar
            value={filters.search || ''}
            onChange={(value) => setFilters({ ...filters, search: value })}
            className="flex-1 max-w-md"
            placeholder="Search courses (e.g., CS 246)"
          />
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 overflow-y-auto border-r bg-background p-4">
            <FiltersPanel filters={filters} onChange={setFilters} onClear={clearFilters} />
          </div>
        )}

        {/* Graph Canvas */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading course graph...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md">
                <p className="text-destructive mb-4">Failed to load graph data</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
            </div>
          )}

          {graphData && !isLoading && (
            <GraphCanvas
              elements={graphData}
              layout={layout}
              onNodeClick={handleNodeClick}
            />
          )}
        </div>
      </div>
    </div>
  )
}

