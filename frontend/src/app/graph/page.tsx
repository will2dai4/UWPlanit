'use client'

import { useState } from 'react'
import { GraphCanvas } from '@/components/graph/graph-canvas'
import { SearchBar } from '@/components/search/search-bar'
import { FiltersPanel } from '@/components/filters/filters-panel'
import { FiltersSidebar } from '@/components/graph/filters-sidebar'
import { useGlobalGraph } from '@/hooks/use-courses'
import { useGraphStore } from '@/store/use-graph-store'
import { Button } from '@/components/ui/button'
import { Menu, Search } from 'lucide-react'

export default function GraphPage() {
  const { data: graphData, isLoading, error } = useGlobalGraph()
  const { filters, layout, setFilters, clearFilters, setSelectedNode } = useGraphStore()
  const [showFilters, setShowFilters] = useState(false)

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId)
    // Could navigate to course detail page
    // router.push(`/course/${nodeId}`)
  }

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      {/* Filters Sidebar */}
      <FiltersSidebar isOpen={showFilters} onClose={() => setShowFilters(false)}>
        {/* Search Bar */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Courses
          </label>
          <SearchBar
            value={filters.search || ''}
            onChange={(value) => setFilters({ ...filters, search: value })}
            placeholder="Search courses (e.g., CS 246)"
          />
        </div>

        {/* Filters Panel */}
        <FiltersPanel filters={filters} onChange={setFilters} onClear={clearFilters} />
      </FiltersSidebar>

      {/* Menu Button - Top Left */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="default"
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          className="shadow-lg"
        >
          <Menu className="h-5 w-5 mr-2" />
          Filters & Search
        </Button>
      </div>

      {/* Graph Canvas - Full Screen */}
      <div className="w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading course graph...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center max-w-md">
              <p className="text-destructive mb-4">Failed to load graph data</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </div>
        )}

        {graphData && !isLoading && (
          <GraphCanvas
            elements={graphData}
            layout={layout as any}
            onNodeClick={handleNodeClick}
          />
        )}
      </div>
    </div>
  )
}

