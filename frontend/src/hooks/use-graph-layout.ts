/**
 * Hook for computing graph layouts using web workers
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { GraphNode, GraphEdge } from '@/types'

interface LayoutConfig {
  width: number
  height: number
  strength?: number
  distance?: number
  iterations?: number
}

interface LayoutResult {
  nodes: Array<GraphNode & { x: number; y: number }>
  progress: number
}

export function useGraphLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  config: LayoutConfig,
  enabled: boolean = true
) {
  const [layoutNodes, setLayoutNodes] = useState<Array<GraphNode & { x: number; y: number }>>([])
  const [progress, setProgress] = useState(0)
  const [isComputing, setIsComputing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const workerRef = useRef<Worker | null>(null)

  // Initialize worker
  useEffect(() => {
    // Only create worker on client side
    if (typeof window === 'undefined') return

    // Create worker
    workerRef.current = new Worker(
      new URL('../workers/graph-layout.worker.ts', import.meta.url),
      { type: 'module' }
    )

    // Set up message handler
    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, data, error: workerError } = event.data

      if (type === 'PROGRESS') {
        setProgress(data.progress)
        setLayoutNodes(data.nodes)
      } else if (type === 'COMPLETE') {
        setLayoutNodes(data.nodes)
        setProgress(100)
        setIsComputing(false)
      } else if (type === 'ERROR') {
        setError(new Error(workerError))
        setIsComputing(false)
      }
    }

    // Set up error handler
    workerRef.current.onerror = (event) => {
      setError(new Error(event.message))
      setIsComputing(false)
    }

    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  // Compute layout when data changes
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    if (!enabled || !workerRef.current || nodes.length === 0) {
      return
    }

    setIsComputing(true)
    setProgress(0)
    setError(null)

    // Send data to worker
    workerRef.current.postMessage({
      type: 'COMPUTE_LAYOUT',
      data: { nodes, edges },
      config,
    })
  }, [nodes, edges, config, enabled])

  // Recompute layout on demand
  const recomputeLayout = useCallback(
    (newConfig?: Partial<LayoutConfig>) => {
      if (!workerRef.current || nodes.length === 0) {
        return
      }

      const finalConfig = { ...config, ...newConfig }

      setIsComputing(true)
      setProgress(0)
      setError(null)

      workerRef.current.postMessage({
        type: 'COMPUTE_LAYOUT',
        data: { nodes, edges },
        config: finalConfig,
      })
    },
    [nodes, edges, config]
  )

  return {
    nodes: layoutNodes,
    progress,
    isComputing,
    error,
    recomputeLayout,
  }
}

