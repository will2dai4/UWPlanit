import { Request } from 'express';

/**
 * Extended Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Course from database
 */
export interface Course {
  course_id: string;
  subject: string;
  catalog_number: string;
  title: string | null;
  units: number | null;
  description: string | null;
  level: number | null;
  terms_offered: string[] | null;
  faculty: string | null;
  raw_json: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Course relation types
 */
export type RelationType = 'PREREQ' | 'COREQ' | 'ANTIREQ' | 'EQUIV';

/**
 * Course relation from database
 */
export interface CourseRelation {
  id: number;
  source_course_id: string;
  target_course_id: string;
  rtype: RelationType;
  note: string | null;
  created_at: Date;
}

/**
 * VISX graph element types
 */
export interface GraphNode {
  id: string;
  label: string;
  subject: string;
  catalog_number: string;
  title?: string;
  units?: number;
  level?: number;
  faculty?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  rtype: RelationType;
  note?: string;
}

export interface GraphElements {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Legacy type aliases for backward compatibility
export type CytoscapeNode = { data: GraphNode };
export type CytoscapeEdge = { data: GraphEdge };
export interface CytoscapeElements {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
}

/**
 * Plan from database
 */
export interface Plan {
  plan_id: string;
  user_id: string;
  name: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Plan item from database
 */
export interface PlanItem {
  plan_item_id: string;
  plan_id: string;
  course_id: string;
  term: string | null;
  pos_x: number | null;
  pos_y: number | null;
  created_at: Date;
}

/**
 * Checklist item from database
 */
export interface ChecklistItem {
  checklist_item_id: string;
  plan_id: string;
  label: string;
  is_done: boolean;
  group_key: string | null;
  required_count: number | null;
  parent_id: string | null;
  position: number;
  created_at: Date;
}

/**
 * ETL run from database
 */
export interface ETLRun {
  run_id: number;
  started_at: Date;
  finished_at: Date | null;
  status: string;
  added: number;
  updated: number;
  errors: Record<string, unknown> | null;
  cursor: string | null;
}

/**
 * Standard API error response
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Standard API success response with data
 */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

