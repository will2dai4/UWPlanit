import { config } from 'dotenv'
config({ path: '.env.local' })
import path from "path";
import fs from "fs/promises";
import { supabaseAdmin } from "../src/lib/supabase";
import type { CourseRow } from "../src/lib/supabase";

async function main() {
  const filePath = path.join(process.cwd(), "src", "data", "courses.json");
  const raw = await fs.readFile(filePath, "utf8");
  const { courses } = JSON.parse(raw) as { courses: CourseRow[] };

  console.log(`🏗  Seeding ${courses.length} courses to Supabase …`);

  const chunkSize = 500;
  for (let i = 0; i < courses.length; i += chunkSize) {
    const slice = courses.slice(i, i + chunkSize);
    // Deduplicate rows within this batch to prevent Postgres error
    const unique = Array.from(new Map(slice.map((c) => [c.id, c])).values());
    const { error } = await supabaseAdmin.from("courses").upsert(unique, {
      onConflict: "id",
    });
    if (error) {
      console.error(`❌  Error at batch ${i / chunkSize}:`, error);
      process.exit(1);
    }
    console.log(`✅  Upserted batch ${i / chunkSize + 1}`);
  }

  console.log("🎉  Seeding complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 