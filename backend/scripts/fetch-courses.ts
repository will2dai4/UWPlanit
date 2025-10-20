import fs from "fs";
import path from "path";
import axios from "axios";
import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define the course schema for validation
const CourseSchema = z.object({
  courseId: z.string(),
  courseOfferNumber: z.number(),
  termCode: z.string(),
  termName: z.string(),
  associatedAcademicCareer: z.string(),
  associatedAcademicGroupCode: z.string(),
  associatedAcademicOrgCode: z.string(),
  subjectCode: z.string(),
  catalogNumber: z.string(),
  title: z.string(),
  description: z.string(),
  requirementsDescription: z.string().nullable(),
});

type UWCourse = z.infer<typeof CourseSchema>;

// Define our internal course format
interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  units: number;
  prerequisites: string[];
  corequisites: string[];
  antirequisites: string[];
  terms: string[];
  department: string;
  level: number;
}

// Parse prerequisite/corequisite/antirequisite strings
function parseRequirements(reqString?: string): string[] {
  if (!reqString) return [];

  // Extract course codes from requirement text
  const matches = reqString.match(/[A-Z]{2,}\s*\d{3}[A-Z]*/g) || [];
  return matches.map((code) => code.replace(/\s+/g, " ").trim());
}

// Convert UW course format to our internal format
function convertCourse(uwCourse: UWCourse): Course {
  const level = parseInt(uwCourse.catalogNumber.substring(0, 1)) * 100;

  // Extract prerequisites, corequisites, and antirequisites from requirements description
  const requirements = uwCourse.requirementsDescription || "";
  const prereqMatch = requirements.match(/Prereq:\s*([^.;]*)/i);
  const coreqMatch = requirements.match(/Coreq:\s*([^.;]*)/i);
  const antireqMatch = requirements.match(/Antireq:\s*([^.;]*)/i);

  return {
    id: `${uwCourse.subjectCode}${uwCourse.catalogNumber}`,
    code: `${uwCourse.subjectCode} ${uwCourse.catalogNumber}`,
    name: uwCourse.title,
    description: uwCourse.description || "",
    units: 0.5, // Default value since it's not in the API response
    prerequisites: parseRequirements(prereqMatch ? prereqMatch[1] : ""),
    corequisites: parseRequirements(coreqMatch ? coreqMatch[1] : ""),
    antirequisites: parseRequirements(antireqMatch ? antireqMatch[1] : ""),
    terms: [uwCourse.termCode],
    department: uwCourse.subjectCode,
    level,
  };
}

async function fetchCourses() {
  const apiKey = process.env.UW_API_KEY;

  if (!apiKey) {
    console.error("Error: UW_API_KEY environment variable is not set");
    console.error('Please set it with: $env:UW_API_KEY = "YOUR_API_KEY"');
    process.exit(1);
  }

  try {
    console.log("Fetching courses from UW Open Data API...");

    // Create an axios instance with custom headers
    const client = axios.create({
      baseURL: "https://openapi.data.uwaterloo.ca/v3",
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
    });

    // Get current term
    console.log("Fetching current term...");
    const termResponse = await client.get("/Terms/current");
    const currentTerm = termResponse.data.termCode;

    console.log(`Current term: ${currentTerm}`);

    // Get all subjects
    console.log("Fetching subjects...");
    const subjectsResponse = await client.get("/Subjects");
    const subjects = subjectsResponse.data;

    if (!subjects || !Array.isArray(subjects)) {
      throw new Error("Failed to get subjects data from API");
    }

    console.log(`Found ${subjects.length} subjects`);

    const allCourses: Course[] = [];

    // Fetch courses for each subject
    for (const subject of subjects) {
      if (!subject.code) {
        console.warn("Skipping subject with no subject code");
        continue;
      }

      try {
        console.log(`Fetching courses for ${subject.code}...`);

        // Get courses for this subject
        const coursesResponse = await client.get(`/Courses/${currentTerm}/${subject.code}`);
        const uwCourses = coursesResponse.data;

        if (!uwCourses || !Array.isArray(uwCourses)) {
          console.warn(`No courses found for subject ${subject.code}`);
          continue;
        }

        console.log(`Found ${uwCourses.length} courses in ${subject.code}`);

        // Process each course
        for (const uwCourse of uwCourses) {
          try {
            if (!uwCourse.subjectCode || !uwCourse.catalogNumber) {
              console.warn("Skipping course with missing subject or catalog number");
              continue;
            }

            const validatedCourse = CourseSchema.parse(uwCourse);
            const course = convertCourse(validatedCourse);
            allCourses.push(course);
            console.log(`Processed course: ${course.code}`);
          } catch (error) {
            console.error(
              `Error processing course ${uwCourse.subjectCode} ${uwCourse.catalogNumber}:`,
              error
            );
          }
        }

        // Add a small delay to avoid overwhelming the API
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.warn(`No courses found for subject ${subject.code}`);
        } else {
          console.error(`Error fetching courses for ${subject.code}:`, error);
        }
      }
    }

    // Save to JSON file
    const outputPath = path.join(process.cwd(), "src", "data", "courses.json");
    fs.writeFileSync(outputPath, JSON.stringify({ courses: allCourses }, null, 2));

    console.log(`Successfully saved ${allCourses.length} courses to ${outputPath}`);
  } catch (error) {
    console.error("Error during fetching:", error);
    process.exit(1);
  }
}

// Run the script
fetchCourses();
