import { db } from '../config/database';
import { logger } from '../config/logger';

/**
 * Seed database with sample data for development
 */
async function seed() {
  try {
    logger.info('Starting database seeding');

    // Create sample users
    const userId1 = '00000000-0000-0000-0000-000000000001';
    const userId2 = '00000000-0000-0000-0000-000000000002';

    await db.query(
      `INSERT INTO users (user_id, email, display_name)
       VALUES ($1, $2, $3), ($4, $5, $6)
       ON CONFLICT (user_id) DO NOTHING`,
      [
        userId1, 'alice@example.com', 'Alice Smith',
        userId2, 'bob@example.com', 'Bob Johnson',
      ]
    );

    logger.info('Sample users created');

    // Create sample CS courses
    const courses = [
      {
        subject: 'CS',
        catalog_number: '135',
        title: 'Designing Functional Programs',
        units: 0.5,
        description: 'An introduction to the fundamentals of computer science through the application of elementary programming patterns in the functional style of programming.',
        terms_offered: ['FALL', 'WINTER', 'SPRING'],
        faculty: 'Mathematics',
        level: 100,
      },
      {
        subject: 'CS',
        catalog_number: '136',
        title: 'Elementary Algorithm Design and Data Abstraction',
        units: 0.5,
        description: 'This course builds on the techniques and patterns learned in CS 135 while making the transition to use an imperative language.',
        terms_offered: ['FALL', 'WINTER', 'SPRING'],
        faculty: 'Mathematics',
        level: 100,
      },
      {
        subject: 'CS',
        catalog_number: '245',
        title: 'Logic and Computation',
        units: 0.5,
        description: 'Propositional and predicate logic. Soundness and completeness. Undecidability. Applications to program specification and verification.',
        terms_offered: ['FALL', 'WINTER'],
        faculty: 'Mathematics',
        level: 200,
      },
      {
        subject: 'CS',
        catalog_number: '246',
        title: 'Object-Oriented Software Development',
        units: 0.5,
        description: 'Introduction to object-oriented programming and to tools and techniques for software development.',
        terms_offered: ['FALL', 'WINTER', 'SPRING'],
        faculty: 'Mathematics',
        level: 200,
      },
      {
        subject: 'MATH',
        catalog_number: '135',
        title: 'Algebra for Honours Mathematics',
        units: 0.5,
        description: 'An introduction to the language of mathematics and proof techniques through a study of the basic algebraic systems.',
        terms_offered: ['FALL', 'WINTER', 'SPRING'],
        faculty: 'Mathematics',
        level: 100,
      },
      {
        subject: 'MATH',
        catalog_number: '136',
        title: 'Linear Algebra 1 for Honours Mathematics',
        units: 0.5,
        description: 'Systems of linear equations, matrix algebra, elementary matrices, computational issues.',
        terms_offered: ['FALL', 'WINTER', 'SPRING'],
        faculty: 'Mathematics',
        level: 100,
      },
    ];

    const courseIds: Record<string, string> = {};

    for (const course of courses) {
      const result = await db.queryOne<{ course_id: string }>(
        `INSERT INTO courses (subject, catalog_number, title, units, description, terms_offered, faculty)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (subject, catalog_number) DO UPDATE
         SET title = EXCLUDED.title,
             units = EXCLUDED.units,
             description = EXCLUDED.description,
             terms_offered = EXCLUDED.terms_offered,
             faculty = EXCLUDED.faculty
         RETURNING course_id`,
        [
          course.subject,
          course.catalog_number,
          course.title,
          course.units,
          course.description,
          course.terms_offered,
          course.faculty,
        ]
      );

      if (result) {
        courseIds[`${course.subject}${course.catalog_number}`] = result.course_id;
      }
    }

    logger.info('Sample courses created');

    // Create sample relations
    const relations = [
      // CS 136 requires CS 135
      { source: courseIds['CS135'], target: courseIds['CS136'], rtype: 'PREREQ' },
      // CS 246 requires CS 136
      { source: courseIds['CS136'], target: courseIds['CS246'], rtype: 'PREREQ' },
      // MATH 136 requires MATH 135
      { source: courseIds['MATH135'], target: courseIds['MATH136'], rtype: 'PREREQ' },
    ];

    for (const rel of relations) {
      if (rel.source && rel.target) {
        await db.query(
          `INSERT INTO course_relations (source_course_id, target_course_id, rtype)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [rel.source, rel.target, rel.rtype]
        );
      }
    }

    logger.info('Sample course relations created');

    // Create sample plan for Alice
    const plan = await db.queryOne<{ plan_id: string }>(
      `INSERT INTO plans (user_id, name)
       VALUES ($1, $2)
       RETURNING plan_id`,
      [userId1, 'My First Year Plan']
    );

    if (plan && courseIds['CS135']) {
      // Add CS 135 to the plan
      await db.query(
        `INSERT INTO plan_items (plan_id, course_id, term, pos_x, pos_y)
         VALUES ($1, $2, $3, $4, $5)`,
        [plan.plan_id, courseIds['CS135'], 'F2024', 100, 100]
      );

      // Add CS 136 to the plan
      if (courseIds['CS136']) {
        await db.query(
          `INSERT INTO plan_items (plan_id, course_id, term, pos_x, pos_y)
           VALUES ($1, $2, $3, $4, $5)`,
          [plan.plan_id, courseIds['CS136'], 'W2025', 300, 100]
        );
      }

      logger.info('Sample plan created');
    }

    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Database seeding failed');
    process.exit(1);
  }
}

seed();

