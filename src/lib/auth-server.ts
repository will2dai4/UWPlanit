import { getSession } from "@auth0/nextjs-auth0";

/**
 * Server-side session utility that safely handles Auth0 session fetching
 * without causing cookie warnings in server components
 */
export async function getServerSession() {
  // Check if Auth0 is configured
  const isAuth0Configured = !!(
    process.env.AUTH0_SECRET &&
    process.env.AUTH0_ISSUER_BASE_URL &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET
  );

  if (!isAuth0Configured) {
    return null;
  }

  try {
    // getSession() automatically handles cookies in App Router context
    const session = await getSession();
    return session;
  } catch (error) {
    console.warn("Failed to get Auth0 session:", error);
    return null;
  }
}
