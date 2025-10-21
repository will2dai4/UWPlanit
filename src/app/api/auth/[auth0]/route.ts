import { NextRequest, NextResponse } from "next/server";

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
  const { handleAuth, handleLogin } = await import("@auth0/nextjs-auth0");
  
  const handler = handleAuth({
    signup: handleLogin({
      authorizationParams: {
        screen_hint: "signup",
      },
      returnTo: "/",
    }),
  });

  return handler(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: { auth0: string } }) {
  return GET(req, ctx);
}
