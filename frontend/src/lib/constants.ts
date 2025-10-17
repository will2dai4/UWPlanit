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
  'cose-bilkent': 'Hierarchical',
  dagre: 'Directed',
  concentric: 'Concentric',
  grid: 'Grid',
} as const

export const DEFAULT_GRAPH_STYLE = [
  {
    selector: 'node',
    style: {
      'background-color': '#3B82F6',
      label: 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      color: '#fff',
      'text-outline-width': 2,
      'text-outline-color': '#3B82F6',
      width: 'mapData(level, 100, 900, 40, 80)',
      height: 'mapData(level, 100, 900, 40, 80)',
      'font-size': '12px',
      'font-weight': 'bold',
    },
  },
  {
    selector: 'edge',
    style: {
      width: 2,
      'line-color': '#9CA3AF',
      'target-arrow-color': '#9CA3AF',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
    },
  },
  {
    selector: 'edge[rtype="PREREQ"]',
    style: {
      'line-color': RELATION_COLORS.PREREQ,
      'target-arrow-color': RELATION_COLORS.PREREQ,
      'line-style': 'solid',
    },
  },
  {
    selector: 'edge[rtype="COREQ"]',
    style: {
      'line-color': RELATION_COLORS.COREQ,
      'target-arrow-color': RELATION_COLORS.COREQ,
      'line-style': 'dashed',
    },
  },
  {
    selector: 'edge[rtype="ANTIREQ"]',
    style: {
      'line-color': RELATION_COLORS.ANTIREQ,
      'target-arrow-color': RELATION_COLORS.ANTIREQ,
      'line-style': 'dotted',
    },
  },
  {
    selector: 'edge[rtype="EQUIV"]',
    style: {
      'line-color': RELATION_COLORS.EQUIV,
      'target-arrow-color': RELATION_COLORS.EQUIV,
      'line-style': 'solid',
      width: 1,
    },
  },
  {
    selector: ':selected',
    style: {
      'background-color': '#F59E0B',
      'line-color': '#F59E0B',
      'target-arrow-color': '#F59E0B',
      'source-arrow-color': '#F59E0B',
    },
  },
]

