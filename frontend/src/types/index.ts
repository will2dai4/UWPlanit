/**
 * Core types for UWPlanit
 */

export type RelationType = 'PREREQ' | 'COREQ' | 'ANTIREQ' | 'EQUIV'

export interface Course {
  course_id: string
  subject: string
  catalog_number: string
  title: string
  units: number
  description: string
  level: number
  terms_offered: string[]
  faculty: string
}

export interface CourseRelation {
  id: number
  source_course_id: string
  target_course_id: string
  rtype: RelationType
  note?: string
}

// Cytoscape types
export interface CytoscapeNode {
  data: {
    id: string
    label: string
    units: number
    level: number
    subject: string
    catalog_number: string
    title?: string
    faculty?: string
  }
}

export interface CytoscapeEdge {
  data: {
    id: string
    source: string
    target: string
    rtype: RelationType
    note?: string
  }
}

export interface GraphElements {
  nodes: CytoscapeNode[]
  edges: CytoscapeEdge[]
}

// Plan types
export interface Plan {
  plan_id: string
  user_id: string
  name: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface PlanItem {
  plan_item_id: string
  plan_id: string
  course_id: string
  term?: string
  pos_x: number
  pos_y: number
  created_at: string
  // Populated from join
  course?: Course
}

export interface ChecklistItem {
  checklist_item_id: string
  plan_id: string
  label: string
  is_done: boolean
  group_key?: string
  required_count?: number
  created_at: string
}

// Filter types
export interface CourseFilters {
  search?: string
  subject?: string
  level?: number
  term?: string
  faculty?: string
  limit?: number
  offset?: number
}

export interface User {
  user_id: string
  email: string
  display_name?: string
  created_at: string
}

// API response types
export interface ApiError {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export interface PlanExport {
  plan: Plan
  items: PlanItem[]
  checklist: ChecklistItem[]
}

