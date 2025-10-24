import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { Session } from "@auth0/nextjs-auth0";

// Check if Auth0 is configured
const isAuth0Configured = () => {
  return !!(
    process.env.AUTH0_SECRET &&
    process.env.AUTH0_ISSUER_BASE_URL &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET
  );
};

// Handle auth requests with runtime configuration check
export async function GET(req: NextRequest, ctx: { params: { auth0: string } }) {
  if (!isAuth0Configured()) {
    return NextResponse.json(
      {
        error: "Auth0 not configured",
        message: "Please set up Auth0 environment variables to enable authentication. See README.md for setup instructions.",
        requiredVars: ["AUTH0_SECRET", "AUTH0_ISSUER_BASE_URL", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET"],
      },
      { status: 503 }
    );
  }

  // Dynamically import Auth0 handlers only when configured
  const { handleAuth, handleLogin, handleCallback } = await import("@auth0/nextjs-auth0");
  
  const handler = handleAuth({
    signup: handleLogin({
      authorizationParams: {
        screen_hint: "signup",
      },
      returnTo: "/",
    }),
    callback: handleCallback({
      async afterCallback(req: NextRequest, session: Session) {
        // Register user in database on first login/signup
        if (session.user) {
          try {
            const { error } = await supabaseAdmin
              .from("users")
              .upsert(
                {
                  id: session.user.sub,
                  email: session.user.email ?? "",
                  name: session.user.name ?? "",
                  avatar_url: session.user.picture,
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: "id",
                  // Don't override existing data if user already exists
                  ignoreDuplicates: false,
                }
              );

            if (error) {
              console.error("Failed to register user in database:", error);
            }
          } catch (err) {
            console.error("Error registering user:", err);
          }
        }
        return session;
      },
    }),
  });

  return handler(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: { auth0: string } }) {
  return GET(req, ctx);
}
