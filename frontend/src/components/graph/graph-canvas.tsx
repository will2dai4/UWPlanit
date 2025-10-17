'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import cytoscape, { type Core, type NodeSingular, type LayoutOptions } from 'cytoscape'
// @ts-ignore - these packages don't have perfect types
import dagre from 'cytoscape-dagre'
// @ts-ignore
import coseBilkent from 'cytoscape-cose-bilkent'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { DEFAULT_GRAPH_STYLE, GRAPH_LAYOUTS } from '@/lib/constants'
import type { GraphElements } from '@/types'

// Register layout extensions
if (typeof cytoscape !== 'undefined') {
  cytoscape.use(dagre)
  cytoscape.use(coseBilkent)
}

interface GraphCanvasProps {
  elements: GraphElements
  layout?: string
  onNodeClick?: (nodeId: string) => void
  onNodeHover?: (nodeId: string | null) => void
  highlightNodes?: Set<string>
  className?: string
}

export function GraphCanvas({
  elements,
  layout = 'cose-bilkent',
  onNodeClick,
  onNodeHover,
  highlightNodes,
  className = '',
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const [currentLayout, setCurrentLayout] = useState(layout)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: DEFAULT_GRAPH_STYLE,
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    })

    cyRef.current = cy

    // Event listeners
    cy.on('tap', 'node', (evt) => {
      const node = evt.target as NodeSingular
      onNodeClick?.(node.id())
    })

    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target as NodeSingular
      onNodeHover?.(node.id())
    })

    cy.on('mouseout', 'node', () => {
      onNodeHover?.(null)
    })

    setIsInitialized(true)

    return () => {
      cy.destroy()
      cyRef.current = null
    }
  }, [onNodeClick, onNodeHover])

  // Update elements
  useEffect(() => {
    if (!cyRef.current || !isInitialized) return

    const cy = cyRef.current

    // Batch update for performance
    cy.startBatch()

    // Remove old elements
    cy.elements().remove()

    // Add new elements
    if (elements.nodes.length > 0 || elements.edges.length > 0) {
      cy.add([...elements.nodes, ...elements.edges])
    }

    cy.endBatch()

    // Run layout
    if (cy.elements().length > 0) {
      const layoutOptions = getLayoutOptions(currentLayout)
      const layoutInstance = cy.layout(layoutOptions)
      layoutInstance.run()
    }
  }, [elements, currentLayout, isInitialized])

  // Highlight nodes
  useEffect(() => {
    if (!cyRef.current || !highlightNodes) return

    const cy = cyRef.current

    // Reset all nodes
    cy.nodes().removeClass('highlighted')

    // Highlight selected nodes
    highlightNodes.forEach((nodeId) => {
      cy.getElementById(nodeId).addClass('highlighted')
    })
  }, [highlightNodes])

  // Layout change handler
  const handleLayoutChange = useCallback((newLayout: string) => {
    setCurrentLayout(newLayout)
  }, [])

  // Zoom controls
  const zoomIn = useCallback(() => {
    cyRef.current?.zoom(cyRef.current.zoom() * 1.2)
  }, [])

  const zoomOut = useCallback(() => {
    cyRef.current?.zoom(cyRef.current.zoom() * 0.8)
  }, [])

  const fitToScreen = useCallback(() => {
    cyRef.current?.fit(undefined, 50)
  }, [])

  // Highlight neighborhood on node selection
  const highlightNeighborhood = useCallback((nodeId: string) => {
    if (!cyRef.current) return

    const cy = cyRef.current
    const node = cy.getElementById(nodeId)

    if (node.length === 0) return

    // Get 1-hop neighborhood
    const neighborhood = node.neighborhood().add(node)

    // Dim other nodes
    cy.elements().removeClass('highlighted').addClass('dimmed')
    neighborhood.removeClass('dimmed').addClass('highlighted')
  }, [])

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/95 backdrop-blur p-2 rounded-lg border shadow-sm">
        <Select value={currentLayout} onValueChange={handleLayoutChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GRAPH_LAYOUTS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 border-l pl-2">
          <Button variant="ghost" size="icon" onClick={zoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={zoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={fitToScreen} title="Fit to Screen">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-background/95 backdrop-blur p-3 rounded-lg border shadow-sm">
        <h4 className="text-sm font-semibold mb-2">Edge Types</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500"></div>
            <span>Prerequisite</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-green-500"></div>
            <span>Corequisite</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dotted border-red-500"></div>
            <span>Antirequisite</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gray-400"></div>
            <span>Equivalent</span>
          </div>
        </div>
      </div>

      {/* Cytoscape container */}
      <div ref={containerRef} className="cytoscape-container w-full h-full" />

      {/* Loading state */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}

/**
 * Get layout options based on layout name
 */
function getLayoutOptions(layoutName: string): LayoutOptions {
  const baseOptions: LayoutOptions = {
    name: layoutName as any,
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 50,
  }

  switch (layoutName) {
    case 'cose-bilkent':
      return {
        ...baseOptions,
        name: 'cose-bilkent',
        nodeRepulsion: 4500,
        idealEdgeLength: 100,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.4,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10,
        gravityRangeCompound: 1.5,
        gravityCompound: 1.0,
        gravityRange: 3.8,
      }

    case 'dagre':
      return {
        ...baseOptions,
        name: 'dagre',
        rankDir: 'TB',
        nodeSep: 50,
        edgeSep: 10,
        rankSep: 100,
      }

    case 'concentric':
      return {
        ...baseOptions,
        name: 'concentric',
        concentric: (node: any) => node.degree(),
        levelWidth: () => 2,
        minNodeSpacing: 100,
      }

    case 'grid':
      return {
        ...baseOptions,
        name: 'grid',
        rows: undefined,
        cols: undefined,
        position: () => ({}),
      }

    default:
      return baseOptions
  }
}

