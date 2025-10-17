import { Course, CourseRelation, CytoscapeElements, CytoscapeNode, CytoscapeEdge } from '../types';

/**
 * Build Cytoscape graph elements from courses and relations
 */
export const buildGraphElements = (
  courses: Course[],
  relations: CourseRelation[]
): CytoscapeElements => {
  const nodes: CytoscapeNode[] = courses.map(course => ({
    data: {
      id: course.course_id,
      label: `${course.subject} ${course.catalog_number}`,
      subject: course.subject,
      catalog_number: course.catalog_number,
      title: course.title || undefined,
      units: course.units || undefined,
      level: course.level || undefined,
      faculty: course.faculty || undefined,
    },
  }));

  const edges: CytoscapeEdge[] = relations.map(relation => ({
    data: {
      id: `${relation.source_course_id}->${relation.target_course_id}`,
      source: relation.source_course_id,
      target: relation.target_course_id,
      rtype: relation.rtype,
      note: relation.note || undefined,
    },
  }));

  return { nodes, edges };
};

/**
 * Get node IDs from a course code (subject + catalog_number)
 */
export const getCourseNodeId = (subject: string, catalogNumber: string): string => {
  return `${subject}${catalogNumber}`;
};

