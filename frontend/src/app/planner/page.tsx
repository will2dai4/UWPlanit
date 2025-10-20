import dynamicImport from "next/dynamic";

export const dynamic = "force-dynamic";

// Lazy-load heavy client-side bundle so the server route stays tiny.
const PlannerClient = dynamicImport(() => import("./planner-client").then((m) => m.PlannerClient), {
  ssr: false,
});

export default function PlannerPage() {
  // Public access for all users.
  return <PlannerClient />;
} 