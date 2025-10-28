import dynamicImport from "next/dynamic";

export const dynamic = "force-dynamic";

// Lazy-load heavy client-side bundle so the server route stays tiny.
const PlannerClient = dynamicImport(() => import("./planner-client").then((m) => m.PlannerClient), {
  ssr: false,
});

export default async function PlannerPage() {
  // No authentication required - planner works for both authenticated and unauthenticated users
  // Authenticated users: plans saved to database
  // Unauthenticated users: plans saved to local storage
  return <PlannerClient />;
} 