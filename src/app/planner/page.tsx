import dynamicImport from "next/dynamic";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

// Lazy-load heavy client-side bundle so the server route stays tiny.
const PlannerClient = dynamicImport(() => import("./planner-client").then((m) => m.PlannerClient), {
  ssr: false,
});

export default async function PlannerPage() {
  // Check if user is authenticated
  const session = await getServerSession();
  
  // Redirect to login page if not authenticated
  if (!session) {
    redirect("/auth");
  }

  return <PlannerClient />;
} 