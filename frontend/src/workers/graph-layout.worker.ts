/**
 * Web Worker for computing graph layouts using d3-force
 * This runs in a separate thread to avoid blocking the UI
 */

// Polyfill for d3-timer which expects window/document in workers
declare const self: Worker

// @ts-ignore - Polyfill window for d3-timer
if (typeof window === 'undefined') {
  // @ts-ignore
  globalThis.window = globalThis
}
// @ts-ignore - Polyfill document for d3-timer
if (typeof document === 'undefined') {
  // @ts-ignore
  globalThis.document = {
    documentElement: {},
    hidden: false,
  }
}

export interface GraphNode {
  id: string
  label: string
  subject: string
  catalog_number: string
  title?: string
  units?: number
  level?: number
  faculty?: string
  x?: number
  y?: number
  vx?: number
  vy?: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  rtype: 'PREREQ' | 'COREQ' | 'ANTIREQ' | 'EQUIV'
  note?: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface LayoutConfig {
  width: number
  height: number
  strength?: number
  distance?: number
  iterations?: number
}

export interface LayoutResult {
  nodes: Array<GraphNode & { x: number; y: number }>
  progress: number
}

/**
 * Compute graph layout using d3-force
 */
async function computeLayout(
  data: GraphData,
  config: LayoutConfig,
  onProgress?: (result: LayoutResult) => void
): Promise<LayoutResult> {
  // Dynamic import to avoid window reference during build
  const { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } = await import('d3-force')

  return new Promise((resolve) => {
    const { width, height, strength = -300, distance = 100, iterations = 300 } = config

    // Clone nodes to avoid mutating original data
    const nodes = data.nodes.map((n) => ({ ...n }))
    const edges = data.edges.map((e) => ({ ...e }))

    // Create simulation
    const simulation = forceSimulation(nodes)
      .force(
        'link',
        forceLink(edges)
          .id((d: any) => d.id)
          .distance(distance)
          .strength(0.5)
      )
      .force('charge', forceManyBody().strength(strength))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide().radius(30))
      .alphaDecay(0.02)
      .velocityDecay(0.3)

    let tickCount = 0
    const tickInterval = Math.floor(iterations / 10) // Report progress 10 times

    simulation.on('tick', () => {
      tickCount++
      
      // Report progress periodically
      if (onProgress && tickCount % tickInterval === 0) {
        const progress = Math.min(100, (tickCount / iterations) * 100)
        onProgress({
          nodes: nodes as Array<GraphNode & { x: number; y: number }>,
          progress,
        })
      }
    })

    simulation.on('end', () => {
      resolve({
        nodes: nodes as Array<GraphNode & { x: number; y: number }>,
        progress: 100,
      })
    })

    // Run simulation for specified iterations
    simulation.tick(iterations)
    simulation.stop()
  })
}

// Web Worker message handler
self.addEventListener('message', async (event: MessageEvent) => {
  const { type, data, config } = event.data

  if (type === 'COMPUTE_LAYOUT') {
    try {
      const result = await computeLayout(data, config, (progress) => {
        // Send progress updates
        self.postMessage({ type: 'PROGRESS', data: progress })
      })

      // Send final result
      self.postMessage({ type: 'COMPLETE', data: result })
    } catch (error) {
      self.postMessage({ 
        type: 'ERROR', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }
})

