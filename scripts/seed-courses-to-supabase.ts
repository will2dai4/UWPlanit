#!/usr/bin/env tsx

/**
 * Script to seed the Supabase courses table with data from courses.json
 * 
 * Usage:
 *   npm run seed:courses
 *   or
 *   tsx scripts/seed-courses-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Database } from '../src/lib/supabase.types';
import type { CourseData } from '../src/types/course';

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from project root
config({ path: resolve(process.cwd(), '.env.local') });

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

async function seedCourses() {
  try {
    console.log('🚀 Starting course data migration to Supabase...');

    // Read the courses data from JSON file
    const coursesDataPath = join(process.cwd(), 'src', 'data', 'courses.json');
    console.log(`📖 Reading courses data from: ${coursesDataPath}`);
    
    const coursesData: CourseData = JSON.parse(
      readFileSync(coursesDataPath, 'utf-8')
    );

    console.log(`📊 Found ${coursesData.courses.length} courses to migrate`);

    // Check if courses table is empty
    const { count: existingCount, error: countError } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error checking existing courses:', countError);
      throw countError;
    }

    if (existingCount && existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing courses in database`);
      
      // Ask for confirmation to proceed
      const shouldProceed = process.argv.includes('--force') || 
        process.argv.includes('--overwrite');
      
      if (!shouldProceed) {
        console.log('💡 Use --force flag to overwrite existing data');
        console.log('🛑 Migration cancelled to prevent data loss');
        return;
      }

      console.log('🗑️  Clearing existing courses...');
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .neq('id', ''); // Delete all records

      if (deleteError) {
        console.error('❌ Error clearing existing courses:', deleteError);
        throw deleteError;
      }
    }

    // Prepare courses data for insertion
    const coursesToInsert = coursesData.courses.map(course => ({
      id: course.id,
      code: course.code,
      name: course.name,
      description: course.description || null,
      units: course.units || null,
      prerequisites: course.prerequisites || null,
      corequisites: course.corequisites || null,
      antirequisites: course.antirequisites || null,
      terms: course.terms || null,
      department: course.department,
      level: course.level || null
    }));

    console.log('📝 Inserting courses into Supabase...');

    // Insert courses in batches to avoid timeout issues
    const batchSize = 100;
    let insertedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < coursesToInsert.length; i += batchSize) {
      const batch = coursesToInsert.slice(i, i + batchSize);
      
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(coursesToInsert.length / batchSize)} (${batch.length} courses)`);

      const { data, error } = await supabase
        .from('courses')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`❌ Error inserting batch starting at index ${i}:`, error);
        errorCount += batch.length;
      } else {
        insertedCount += data?.length || 0;
        console.log(`✅ Successfully inserted ${data?.length || 0} courses`);
      }
    }

    // Verify the migration
    const { count: finalCount, error: finalCountError } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });

    if (finalCountError) {
      console.error('❌ Error verifying migration:', finalCountError);
      throw finalCountError;
    }

    console.log('\n🎉 Migration completed!');
    console.log(`📊 Summary:`);
    console.log(`   • Total courses processed: ${coursesData.courses.length}`);
    console.log(`   • Successfully inserted: ${insertedCount}`);
    console.log(`   • Errors: ${errorCount}`);
    console.log(`   • Final count in database: ${finalCount}`);

    if (errorCount > 0) {
      console.log('⚠️  Some courses failed to insert. Check the errors above.');
      process.exit(1);
    }

    console.log('✅ All courses successfully migrated to Supabase!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  seedCourses();
}

export { seedCourses };
