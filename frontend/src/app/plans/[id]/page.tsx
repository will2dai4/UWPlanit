'use client'

import { use, useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { PlannerBoard } from '@/components/planner/planner-board'
import { ChecklistPanel } from '@/components/planner/checklist-panel'
import { SearchBar } from '@/components/search/search-bar'
import { CourseCard } from '@/components/courses/course-card'
import {
  usePlan,
  usePlanItems,
  useChecklistItems,
  useUpdatePlanItem,
  useDeletePlanItem,
  useCreatePlanItem,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
  useParseChecklist,
  useExportPlan,
  useImportPlan,
} from '@/hooks/use-plans'
import { useCourses } from '@/hooks/use-courses'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Upload } from 'lucide-react'
import Link from 'next/link'
import { downloadJson } from '@/lib/utils'
import { usePlannerStore } from '@/store/use-planner-store'

export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthGuard>
      <PlanDetailContent params={params} />
    </AuthGuard>
  )
}

function PlanDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: planId } = use(params)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCourseList, setShowCourseList] = useState(false)

  const { data: plan } = usePlan(planId)
  const { data: planItems = [] } = usePlanItems(planId)
  const { data: checklistItems = [] } = useChecklistItems(planId)
  const { data: courses = [] } = useCourses({ search: searchQuery, limit: 20 })

  const updatePlanItem = useUpdatePlanItem()
  const deletePlanItem = useDeletePlanItem()
  const createPlanItem = useCreatePlanItem()
  const createChecklistItem = useCreateChecklistItem()
  const updateChecklistItem = useUpdateChecklistItem()
  const deleteChecklistItem = useDeleteChecklistItem()
  const parseChecklist = useParseChecklist()
  const { refetch: exportPlan } = useExportPlan(planId)
  const importPlan = useImportPlan()

  const { setDraggedCourse } = usePlannerStore()

  const handleUpdateItem = (itemId: string, data: any) => {
    updatePlanItem.mutate({ planId, itemId, data })
  }

  const handleDeleteItem = (itemId: string) => {
    deletePlanItem.mutate({ planId, itemId })
  }

  const handleDragStart = (courseId: string) => {
    setDraggedCourse(courseId)
  }

  const handleExport = async () => {
    try {
      const { data } = await exportPlan()
      if (data) {
        downloadJson(data, `${plan?.name || 'plan'}-export.json`)
      }
    } catch (error) {
      console.error('Failed to export plan:', error)
    }
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)
        await importPlan.mutateAsync(data)
      } catch (error) {
        console.error('Failed to import plan:', error)
      }
    }
    input.click()
  }

  const handleParseChecklist = async (text: string) => {
    try {
      await parseChecklist.mutateAsync({ planId, text })
    } catch (error) {
      console.error('Failed to parse checklist:', error)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/plans">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{plan?.name || 'Loading...'}</h1>
              <p className="text-sm text-muted-foreground">
                {planItems.length} courses • {checklistItems.length} checklist items
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
      </div>

      {/* Course Search */}
      {showCourseList && (
        <div className="border-b bg-background p-4">
          <div className="container">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search courses to add..."
              className="max-w-md"
            />
            {searchQuery && courses.length > 0 && (
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-60 overflow-y-auto">
                {courses.map((course) => (
                  <CourseCard key={course.course_id} course={course} onDragStart={handleDragStart} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Planner Board */}
        <div className="flex-1">
          <PlannerBoard
            planId={planId}
            items={planItems}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        </div>

        {/* Checklist Panel */}
        <div className="w-96">
          <ChecklistPanel
            items={checklistItems}
            onCreateItem={(data) => createChecklistItem.mutate({ planId, data })}
            onUpdateItem={(itemId, data) => updateChecklistItem.mutate({ planId, itemId, data })}
            onDeleteItem={(itemId) => deleteChecklistItem.mutate({ planId, itemId })}
            onParseText={handleParseChecklist}
          />
        </div>
      </div>
    </div>
  )
}

