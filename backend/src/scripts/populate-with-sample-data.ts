#!/usr/bin/env ts-node

/**
 * Populate Database with Sample Data
 * 
 * This script populates the database with realistic sample course data
 * for testing and development purposes.
 * 
 * Usage:
 *   npm run populate:sample
 * 
 * Or directly:
 *   ts-node src/scripts/populate-with-sample-data.ts
 */

import { db } from '../config/database';
import { logger } from '../config/logger';

/**
 * Sample UW Courses (realistic data based on actual UW courses)
 */
const sampleCourses = [
  // Computer Science Courses
  {
    subject: 'CS',
    catalog_number: '135',
    title: 'Designing Functional Programs',
    units: 0.5,
    description: 'An introduction to the fundamentals of computer science through the application of elementary programming patterns in the functional style of programming.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: null,
  },
  {
    subject: 'CS',
    catalog_number: '136',
    title: 'Elementary Algorithm Design and Data Abstraction',
    units: 0.5,
    description: 'This course builds on the techniques and patterns learned in CS 135 while making the transition to use an imperative language.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: 'CS 135',
  },
  {
    subject: 'CS',
    catalog_number: '245',
    title: 'Logic and Computation',
    units: 0.5,
    description: 'Introduces propositional and predicate logic, proof systems, and computation models.',
    terms_offered: ['F', 'W'],
    faculty: 'Mathematics',
    prerequisites: 'CS 136',
  },
  {
    subject: 'CS',
    catalog_number: '246',
    title: 'Object-Oriented Software Development',
    units: 0.5,
    description: 'Introduction to object-oriented programming and to tools and techniques for software development.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: 'CS 136',
  },
  {
    subject: 'CS',
    catalog_number: '240',
    title: 'Data Structures and Data Management',
    units: 0.5,
    description: 'Introduction to fundamental data structures and algorithms, and their role in software development.',
    terms_offered: ['F', 'W'],
    faculty: 'Mathematics',
    prerequisites: 'CS 136',
  },
  {
    subject: 'CS',
    catalog_number: '241',
    title: 'Foundations of Sequential Programs',
    units: 0.5,
    description: 'The relationship between high-level languages and the computer architecture that underlies their implementation.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: 'CS 136',
  },
  {
    subject: 'CS',
    catalog_number: '341',
    title: 'Algorithms',
    units: 0.5,
    description: 'The study of efficient algorithms and effective algorithm design techniques.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: 'CS 240 and CS 245',
  },
  {
    subject: 'CS',
    catalog_number: '343',
    title: 'Concurrent and Parallel Programming',
    units: 0.5,
    description: 'An introduction to concurrent and parallel programming, with an emphasis on solving problems efficiently.',
    terms_offered: ['F', 'W'],
    faculty: 'Mathematics',
    prerequisites: 'CS 246',
  },
  {
    subject: 'CS',
    catalog_number: '350',
    title: 'Operating Systems',
    units: 0.5,
    description: 'An introduction to the fundamentals of operating system function, design, and implementation.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: 'CS 241 and CS 246',
  },
  {
    subject: 'CS',
    catalog_number: '348',
    title: 'Introduction to Database Management',
    units: 0.5,
    description: 'The main objective of this course is to introduce students to fundamentals of database technology.',
    terms_offered: ['F', 'W'],
    faculty: 'Mathematics',
    prerequisites: 'CS 240 and CS 245',
  },

  // Mathematics Courses
  {
    subject: 'MATH',
    catalog_number: '135',
    title: 'Algebra for Honours Mathematics',
    units: 0.5,
    description: 'An introduction to the language of mathematics and proof techniques through a study of the basic algebraic systems.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: null,
  },
  {
    subject: 'MATH',
    catalog_number: '137',
    title: 'Calculus 1 for Honours Mathematics',
    units: 0.5,
    description: 'Derivatives of elementary functions, mean value theorem, applications, definite and indefinite integrals.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: null,
  },
  {
    subject: 'MATH',
    catalog_number: '136',
    title: 'Linear Algebra 1 for Honours Mathematics',
    units: 0.5,
    description: 'Systems of linear equations, matrix algebra, elementary matrices, computational issues.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: null,
  },
  {
    subject: 'MATH',
    catalog_number: '138',
    title: 'Calculus 2 for Honours Mathematics',
    units: 0.5,
    description: 'Techniques of integration, applications of integration, introduction to differential equations.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: 'MATH 137',
  },
  {
    subject: 'MATH',
    catalog_number: '239',
    title: 'Introduction to Combinatorics',
    units: 0.5,
    description: 'Introduction to graph theory: colourings, matchings, connectivity, planarity. Introduction to combinatorial analysis.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: 'MATH 135 or MATH 145',
  },
  {
    subject: 'MATH',
    catalog_number: '235',
    title: 'Linear Algebra 2 for Honours Mathematics',
    units: 0.5,
    description: 'Vector spaces, linear transformations, determinants, eigenvalues and eigenvectors, diagonalization.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: 'MATH 136',
  },
  {
    subject: 'MATH',
    catalog_number: '237',
    title: 'Calculus 3 for Honours Mathematics',
    units: 0.5,
    description: 'Sequences and their limits, series, Taylor series with applications.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: 'MATH 138',
  },
  {
    subject: 'MATH',
    catalog_number: '213',
    title: 'Signals and Systems',
    units: 0.5,
    description: 'Basic concepts in signals and systems including convolution, Fourier transforms, and Laplace transforms.',
    terms_offered: ['F', 'W'],
    faculty: 'Mathematics',
    prerequisites: 'MATH 119 or MATH 138',
  },

  // Statistics Courses
  {
    subject: 'STAT',
    catalog_number: '230',
    title: 'Probability',
    units: 0.5,
    description: 'Introduction to probability based on calculus.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: 'MATH 137 or MATH 147',
  },
  {
    subject: 'STAT',
    catalog_number: '231',
    title: 'Statistics',
    units: 0.5,
    description: 'A first course in data analysis.',
    terms_offered: ['F', 'W', 'S'],
    faculty: 'Mathematics',
    prerequisites: 'STAT 230',
  },
];

async function main() {
  try {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║     UWPlanit Sample Data Population Script          ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📊 This will populate your database with sample UW course data');
    console.log('   for testing and development purposes.');
    console.log('');

    const startTime = Date.now();
    let added = 0;
    let updated = 0;
    let errors = 0;

    console.log(`🚀 Inserting ${sampleCourses.length} sample courses...`);
    console.log('');

    for (const course of sampleCourses) {
      try {
        // Check if course exists
        const existing = await db.queryOne<{ course_id: string }>(
          'SELECT course_id FROM courses WHERE subject = $1 AND catalog_number = $2',
          [course.subject, course.catalog_number]
        );

        // Upsert course
        const query = `
          INSERT INTO courses (subject, catalog_number, title, units, description, terms_offered, faculty, raw_json)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (subject, catalog_number)
          DO UPDATE SET
            title = EXCLUDED.title,
            units = EXCLUDED.units,
            description = EXCLUDED.description,
            terms_offered = EXCLUDED.terms_offered,
            faculty = EXCLUDED.faculty,
            raw_json = EXCLUDED.raw_json,
            updated_at = NOW()
          RETURNING course_id
        `;

        await db.queryOne<{ course_id: string }>(query, [
          course.subject,
          course.catalog_number,
          course.title,
          course.units,
          course.description,
          course.terms_offered || [],
          course.faculty || null,
          course,
        ]);

        if (existing) {
          updated++;
          console.log(`   ✓ Updated: ${course.subject} ${course.catalog_number} - ${course.title}`);
        } else {
          added++;
          console.log(`   ✓ Added: ${course.subject} ${course.catalog_number} - ${course.title}`);
        }
      } catch (error) {
        errors++;
        console.error(`   ✗ Error: ${course.subject} ${course.catalog_number}`, error);
      }
    }

    // Create some prerequisite relationships
    console.log('');
    console.log('🔗 Creating prerequisite relationships...');
    
    const relationships = [
      { source: 'CS', sourceCat: '136', target: 'CS', targetCat: '135' },
      { source: 'CS', sourceCat: '245', target: 'CS', targetCat: '136' },
      { source: 'CS', sourceCat: '246', target: 'CS', targetCat: '136' },
      { source: 'CS', sourceCat: '240', target: 'CS', targetCat: '136' },
      { source: 'CS', sourceCat: '241', target: 'CS', targetCat: '136' },
      { source: 'CS', sourceCat: '341', target: 'CS', targetCat: '240' },
      { source: 'CS', sourceCat: '341', target: 'CS', targetCat: '245' },
      { source: 'CS', sourceCat: '343', target: 'CS', targetCat: '246' },
      { source: 'CS', sourceCat: '350', target: 'CS', targetCat: '241' },
      { source: 'CS', sourceCat: '350', target: 'CS', targetCat: '246' },
      { source: 'CS', sourceCat: '348', target: 'CS', targetCat: '240' },
      { source: 'CS', sourceCat: '348', target: 'CS', targetCat: '245' },
      { source: 'MATH', sourceCat: '138', target: 'MATH', targetCat: '137' },
      { source: 'MATH', sourceCat: '235', target: 'MATH', targetCat: '136' },
      { source: 'MATH', sourceCat: '237', target: 'MATH', targetCat: '138' },
      { source: 'STAT', sourceCat: '231', target: 'STAT', targetCat: '230' },
    ];

    for (const rel of relationships) {
      try {
        const sourceCourse = await db.queryOne<{ course_id: string }>(
          'SELECT course_id FROM courses WHERE subject = $1 AND catalog_number = $2',
          [rel.source, rel.sourceCat]
        );

        const targetCourse = await db.queryOne<{ course_id: string }>(
          'SELECT course_id FROM courses WHERE subject = $1 AND catalog_number = $2',
          [rel.target, rel.targetCat]
        );

        if (sourceCourse && targetCourse) {
          await db.query(
            `INSERT INTO course_relations (source_course_id, target_course_id, rtype)
             VALUES ($1, $2, 'PREREQ')
             ON CONFLICT DO NOTHING`,
            [sourceCourse.course_id, targetCourse.course_id]
          );
          console.log(`   ✓ ${rel.source} ${rel.sourceCat} → ${rel.target} ${rel.targetCat}`);
        }
      } catch (error) {
        console.error(`   ✗ Error creating relationship`, error);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('');
    console.log('✅ Sample Data Population Completed!');
    console.log('');
    console.log('📈 Results:');
    console.log(`   ✓ Courses Added: ${added}`);
    console.log(`   ✓ Courses Updated: ${updated}`);
    console.log(`   ✓ Prerequisites Created: ${relationships.length}`);
    if (errors > 0) {
      console.log(`   ⚠️  Errors: ${errors}`);
    }
    console.log(`   ✓ Duration: ${duration}s`);
    console.log('');
    console.log('🎉 Sample database ready for testing!');
    console.log('   You can now:');
    console.log('   - Search for courses: CS, MATH, STAT');
    console.log('   - View prerequisite graphs');
    console.log('   - Create academic plans');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Fatal Error:');
    console.error('   ', error instanceof Error ? error.message : String(error));
    console.error('');
    
    logger.error({ err: error }, 'Sample data population failed');
    process.exit(1);
  }
}

main();

