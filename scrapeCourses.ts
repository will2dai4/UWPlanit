import axios from "axios";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface Course {
  code: string;
  name: string;
  description: string;
  prerequisites: string[];
  corequisites: string[];
  antirequisites: string[];
  department: string;
}

interface UWSubject {
  code: string;
  name: string;
  description: string;
  descriptionAbbreviated: string;
  associatedAcademicOrgCode: string;
}

interface UWCourse {
  courseId: string;
  courseOfferNumber: number;
  termCode: string;
  termName: string;
  associatedAcademicCareer: string;
  associatedAcademicGroupCode: string;
  associatedAcademicOrgCode: string;
  subjectCode: string;
  catalogNumber: string;
  title: string;
  description: string;
  requirementsDescription: string | null;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeCourses() {
  try {
    // Check if API key is set
    if (!process.env.UW_API_KEY) {
      throw new Error(
        "UW_API_KEY environment variable is not set. Please add it to your .env file."
      );
    }

    console.log("Fetching courses from UW Open Data API...");

    // Create an axios instance with custom headers
    const client = axios.create({
      baseURL: "https://openapi.data.uwaterloo.ca/v3",
      headers: {
        "x-api-key": process.env.UW_API_KEY,
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
    const subjectsResponse = await client.get<UWSubject[]>("/Subjects");
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
        const coursesResponse = await client.get<UWCourse[]>(
          `/Courses/${currentTerm}/${subject.code}`
        );
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

            // Extract course codes from requirement text
            const extractCodes = (text: string): string[] => {
              if (!text) return [];
              const matches = text.match(/[A-Z]{2,}\s*\d{3}[A-Z]*/g) || [];
              return matches.map((code) => code.replace(/\s+/g, ""));
            };

            // Extract prerequisites, corequisites, and antirequisites from requirements description
            const requirements = uwCourse.requirementsDescription || "";
            const prereqMatch = requirements.match(/Prereq:\s*([^.;]*)/i);
            const coreqMatch = requirements.match(/Coreq:\s*([^.;]*)/i);
            const antireqMatch = requirements.match(/Antireq:\s*([^.;]*)/i);

            const course: Course = {
              code: `${uwCourse.subjectCode} ${uwCourse.catalogNumber}`,
              name: uwCourse.title || "",
              description: uwCourse.description || "",
              prerequisites: extractCodes(prereqMatch ? prereqMatch[1] : ""),
              corequisites: extractCodes(coreqMatch ? coreqMatch[1] : ""),
              antirequisites: extractCodes(antireqMatch ? antireqMatch[1] : ""),
              department: uwCourse.subjectCode,
            };

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
        await delay(1000);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.warn(`No courses found for subject ${subject.code}`);
        } else {
          console.error(`Error fetching courses for ${subject.code}:`, error);
        }
      }
    }

    // Save the scraped data
    const outputPath = path.join(process.cwd(), "data", "courses.json");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(allCourses, null, 2));

    console.log(`Successfully processed ${allCourses.length} courses!`);
  } catch (error) {
    console.error("Error during scraping:", error);
  }
}

// Run the scraper
scrapeCourses().catch(console.error);
