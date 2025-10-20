'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Group } from '@visx/group'
import { Zoom } from '@visx/zoom'
import { localPoint } from '@visx/event'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ZoomIn, ZoomOut, Maximize2, Loader2 } from 'lucide-react'
import { GRAPH_LAYOUTS, LAYOUT_CONFIGS, RELATION_COLORS, getNodeColor, getNodeRadius } from '@/lib/constants'
import type { GraphElements, GraphNode, GraphEdge } from '@/types'
import { useGraphLayout } from '@/hooks/use-graph-layout'

interface GraphCanvasProps {
  elements: GraphElements
  layout?: keyof typeof GRAPH_LAYOUTS
  onNodeClick?: (nodeId: string) => void
  onNodeHover?: (nodeId: string | null) => void
  highlightNodes?: Set<string>
  className?: string
}

interface PositionedNode extends GraphNode {
  x: number
  y: number
}

export function GraphCanvas({
  elements,
  layout = 'force',
  onNodeClick,
  onNodeHover,
  highlightNodes,
  className = '',
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [currentLayout, setCurrentLayout] = useState(layout)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [neighborhoodNodes, setNeighborhoodNodes] = useState<Set<string>>(new Set())

  // Get layout configuration
  const layoutConfig = useMemo(
    () => ({
      ...LAYOUT_CONFIGS[currentLayout],
      width: dimensions.width,
      height: dimensions.height,
    }),
    [currentLayout, dimensions]
  )

  // Use web worker for layout computation
  const { nodes: layoutNodes, isComputing, progress } = useGraphLayout(
    elements.nodes,
    elements.edges,
    layoutConfig,
    true
  )

  // Update dimensions on container resize
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Build edge lookup map for quick neighbor finding
  const edgeMap = useMemo(() => {
    const map = new Map<string, Set<string>>()

    elements.edges.forEach((edge) => {
      if (!map.has(edge.source)) {
        map.set(edge.source, new Set())
      }
      if (!map.has(edge.target)) {
        map.set(edge.target, new Set())
      }
      map.get(edge.source)?.add(edge.target)
      map.get(edge.target)?.add(edge.source)
    })

    return map
  }, [elements.edges])

  // Highlight neighborhood (1-hop)
  const highlightNeighborhood = useCallback(
    (nodeId: string) => {
      const neighbors = edgeMap.get(nodeId) || new Set()
      const neighborhood = new Set([nodeId, ...Array.from(neighbors)])
      setNeighborhoodNodes(neighborhood)
      setSelectedNode(nodeId)
    },
    [edgeMap]
  )

  // Clear neighborhood highlight
  const clearNeighborhood = useCallback(() => {
    setNeighborhoodNodes(new Set())
    setSelectedNode(null)
  }, [])

  // Handle node click
  const handleNodeClick = useCallback(
    (nodeId: string, event: React.MouseEvent) => {
      event.stopPropagation()
      highlightNeighborhood(nodeId)
      onNodeClick?.(nodeId)
    },
    [highlightNeighborhood, onNodeClick]
  )

  // Handle node hover
  const handleNodeHover = useCallback(
    (nodeId: string | null) => {
      setHoveredNode(nodeId)
      onNodeHover?.(nodeId)
    },
    [onNodeHover]
  )

  // Handle canvas click (clear selection)
  const handleCanvasClick = useCallback(() => {
    clearNeighborhood()
  }, [clearNeighborhood])

  // Get edge style based on type
  const getEdgeStyle = useCallback((rtype: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      strokeWidth: 2,
    }

    switch (rtype) {
      case 'PREREQ':
        return { ...baseStyle, stroke: RELATION_COLORS.PREREQ, strokeDasharray: 'none' }
      case 'COREQ':
        return { ...baseStyle, stroke: RELATION_COLORS.COREQ, strokeDasharray: '5,5' }
      case 'ANTIREQ':
        return { ...baseStyle, stroke: RELATION_COLORS.ANTIREQ, strokeDasharray: '2,3' }
      case 'EQUIV':
        return { ...baseStyle, stroke: RELATION_COLORS.EQUIV, strokeWidth: 1, strokeDasharray: 'none' }
      default:
        return { ...baseStyle, stroke: '#9CA3AF' }
    }
  }, [])

  // Check if node should be dimmed
  const isNodeDimmed = useCallback(
    (nodeId: string): boolean => {
      if (neighborhoodNodes.size === 0) return false
      return !neighborhoodNodes.has(nodeId)
    },
    [neighborhoodNodes]
  )

  // Check if edge should be dimmed
  const isEdgeDimmed = useCallback(
    (edge: GraphEdge): boolean => {
      if (neighborhoodNodes.size === 0) return false
      return !neighborhoodNodes.has(edge.source) || !neighborhoodNodes.has(edge.target)
    },
    [neighborhoodNodes]
  )

  // Find node by id
  const findNode = useCallback(
    (id: string): PositionedNode | undefined => {
      return layoutNodes.find((n) => n.id === id) as PositionedNode | undefined
    },
    [layoutNodes]
  )

  return (
    <div ref={containerRef} className={`relative w-full h-full isolate ${className}`}>
      {/* Controls - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-background/95 backdrop-blur p-2 rounded-lg border shadow-sm">
        <Select value={currentLayout} onValueChange={(value) => setCurrentLayout(value as keyof typeof GRAPH_LAYOUTS)}>
          <SelectTrigger className="w-[180px]">
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
      </div>

      {/* Legend - Top Right */}
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

      {/* Loading State */}
      {isComputing && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
          <div className="text-center bg-background p-6 rounded-lg border shadow-lg">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Computing layout...</p>
            <div className="w-48 bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Graph Canvas */}
      <Zoom<SVGSVGElement>
        width={dimensions.width}
        height={dimensions.height}
        scaleXMin={0.1}
        scaleXMax={4}
        scaleYMin={0.1}
        scaleYMax={4}
      >
        {(zoom) => (
          <div className="relative">
            {/* Zoom Controls - Bottom Right */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1 bg-background/95 backdrop-blur p-1 rounded-lg border shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={zoom.reset} title="Reset View">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* SVG Canvas */}
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="touch-none cursor-grab active:cursor-grabbing"
              onClick={handleCanvasClick}
            >
              <rect
                width={dimensions.width}
                height={dimensions.height}
                fill="transparent"
                ref={zoom.containerRef as any}
                onTouchStart={zoom.dragStart}
                onTouchMove={zoom.dragMove}
                onTouchEnd={zoom.dragEnd}
                onMouseDown={zoom.dragStart}
                onMouseMove={zoom.dragMove}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd()
                }}
                onWheel={(event) => {
                  zoom.handleWheel(event)
                }}
              />

              <Group transform={zoom.toString()}>
                {/* Render Edges */}
                {elements.edges.map((edge) => {
                  const sourceNode = findNode(edge.source)
                  const targetNode = findNode(edge.target)

                  if (!sourceNode || !targetNode) return null

                  const isDimmed = isEdgeDimmed(edge)
                  const style = getEdgeStyle(edge.rtype)

                  // Calculate arrow end point (stop at node boundary)
                  const dx = targetNode.x - sourceNode.x
                  const dy = targetNode.y - sourceNode.y
                  const dist = Math.sqrt(dx * dx + dy * dy)
                  const nodeRadius = getNodeRadius(targetNode.level)
                  const ratio = (dist - nodeRadius - 2) / dist

                  const endX = sourceNode.x + dx * ratio
                  const endY = sourceNode.y + dy * ratio

                  return (
                    <g key={edge.id} opacity={isDimmed ? 0.1 : 1}>
                      {/* Edge line */}
                      <line
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={endX}
                        y2={endY}
                        style={style}
                        markerEnd="url(#arrowhead)"
                      />
                      {/* Arrow marker */}
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="10"
                          refX="9"
                          refY="3"
                          orient="auto"
                          markerUnits="strokeWidth"
                        >
                          <path d="M0,0 L0,6 L9,3 z" fill={style.stroke as string} />
                        </marker>
                      </defs>
                    </g>
                  )
                })}

                {/* Render Nodes */}
                {layoutNodes.map((node) => {
                  const isHovered = hoveredNode === node.id
                  const isSelected = selectedNode === node.id
                  const isHighlighted = highlightNodes?.has(node.id)
                  const isDimmed = isNodeDimmed(node.id)
                  const radius = getNodeRadius(node.level, isSelected || isHovered)
                  const color = getNodeColor(node.level)

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      opacity={isDimmed ? 0.2 : 1}
                      onMouseEnter={() => handleNodeHover(node.id)}
                      onMouseLeave={() => handleNodeHover(null)}
                      onClick={(e) => handleNodeClick(node.id, e)}
                      className="cursor-pointer"
                      style={{ transition: 'opacity 0.2s' }}
                    >
                      {/* Node circle */}
                      <circle
                        r={radius}
                        fill={color}
                        stroke={isSelected || isHighlighted ? '#F59E0B' : '#fff'}
                        strokeWidth={isSelected || isHighlighted ? 3 : 2}
                      />

                      {/* Node label */}
                      <text
                        y={radius + 12}
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize="11px"
                        fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                        className="pointer-events-none select-none"
                      >
                        {node.label}
                      </text>

                      {/* Tooltip on hover */}
                      {isHovered && node.title && (
                        <g>
                          <rect
                            x={radius + 5}
                            y={-20}
                            width={Math.min(node.title.length * 6 + 10, 200)}
                            height="30"
                            fill="rgba(0,0,0,0.9)"
                            rx="4"
                            className="pointer-events-none"
                          />
                          <text
                            x={radius + 10}
                            y={-5}
                            fill="#fff"
                            fontSize="10px"
                            className="pointer-events-none"
                          >
                            {node.title.length > 30 ? `${node.title.substring(0, 30)}...` : node.title}
                          </text>
                        </g>
                      )}
                    </g>
                  )
                })}
              </Group>
            </svg>
          </div>
        )}
      </Zoom>

      {/* Info Bar */}
      {selectedNode && (
        <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur p-3 rounded-lg border shadow-sm max-w-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              {(() => {
                const node = findNode(selectedNode)
                if (!node) return null
                return (
                  <>
                    <h4 className="font-semibold text-sm">{node.label}</h4>
                    {node.title && <p className="text-xs text-muted-foreground mt-1">{node.title}</p>}
                    <div className="flex gap-2 mt-2 text-xs">
                      {node.units && <span className="text-muted-foreground">{node.units} units</span>}
                      {node.faculty && <span className="text-muted-foreground">• {node.faculty}</span>}
                    </div>
                  </>
                )
              })()}
            </div>
            <Button variant="ghost" size="sm" onClick={clearNeighborhood}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
