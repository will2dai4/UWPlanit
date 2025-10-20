'use client'

import { use } from 'react'
import { GraphCanvas } from '@/components/graph/graph-canvas'
import { useSubjectGraph } from '@/hooks/use-courses'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SubjectGraphPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params)
  const { data: graphData, isLoading, error } = useSubjectGraph(subject.toUpperCase())

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="container flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/graph">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{subject.toUpperCase()} Courses</h1>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading {subject.toUpperCase()} graph...</p>
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

        {graphData && !isLoading && <GraphCanvas elements={graphData} layout="force" />}
      </div>
    </div>
  )
}

