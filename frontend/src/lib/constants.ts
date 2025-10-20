/**
 * Application constants
 */

export const RELATION_COLORS = {
  PREREQ: '#3B82F6', // blue
  COREQ: '#10B981', // green
  ANTIREQ: '#EF4444', // red
  EQUIV: '#9CA3AF', // gray
} as const

export const RELATION_STYLES = {
  PREREQ: 'solid',
  COREQ: 'dashed',
  ANTIREQ: 'dotted',
  EQUIV: 'solid',
} as const

export const FACULTIES = [
  'Applied Health Sciences',
  'Arts',
  'Engineering',
  'Environment',
  'Mathematics',
  'Science',
] as const

export const TERMS = ['Fall', 'Winter', 'Spring'] as const

export const LEVELS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const

export const SUBJECTS = [
  'CS',
  'MATH',
  'STAT',
  'CO',
  'AMATH',
  'ACTSC',
  'PMATH',
  'ECE',
  'SE',
  'SYDE',
  'CHE',
  'CIVE',
  'ENVE',
  'ME',
  'MSCI',
  'NE',
] as const

export const GRAPH_LAYOUTS = {
  force: 'Force-Directed',
  'force-strong': 'Force-Directed (Strong)',
  'force-weak': 'Force-Weak (Weak)',
} as const

// VISX node styling
export const NODE_RADIUS = 8
export const NODE_RADIUS_SELECTED = 12
export const NODE_LABEL_OFFSET = 15

// Layout configurations for d3-force
export const LAYOUT_CONFIGS = {
  force: {
    strength: -300,
    distance: 100,
    iterations: 300,
  },
  'force-strong': {
    strength: -500,
    distance: 150,
    iterations: 400,
  },
  'force-weak': {
    strength: -150,
    distance: 80,
    iterations: 250,
  },
} as const

// Get node color based on level
export const getNodeColor = (level?: number): string => {
  if (!level) return '#3B82F6' // Default blue
  
  if (level < 200) return '#6366F1' // Indigo for 100-level
  if (level < 300) return '#3B82F6' // Blue for 200-level
  if (level < 400) return '#0EA5E9' // Sky for 300-level
  if (level < 500) return '#06B6D4' // Cyan for 400-level
  return '#8B5CF6' // Violet for 500+ level
}

// Get node radius based on level
export const getNodeRadius = (level?: number, selected: boolean = false): number => {
  const base = selected ? NODE_RADIUS_SELECTED : NODE_RADIUS
  if (!level) return base
  
  // Scale radius based on level (higher levels = slightly larger)
  const scale = 1 + (level / 1000) * 0.5
  return base * scale
}

