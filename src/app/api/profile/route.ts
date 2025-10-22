import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { name, program, term } = await req.json();

    // Save to Supabase (this is now the source of truth for user profile data)
    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          id: session.user.sub,
          email: session.user.email ?? "",
          name,
          program,
          current_term: term,
          avatar_url: session.user.picture,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Failed to update user profile in Supabase:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
