import { NextResponse } from "next/server";
import { getSession, updateSession } from "@auth0/nextjs-auth0";
import qs from "querystring";

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { name, program, term } = await req.json();

    // Fetch Management API token
    const tokenRes = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: qs.stringify({
        grant_type: "client_credentials",
        client_id: process.env.AUTH0_MGMT_CLIENT_ID,
        client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
        audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
      }),
    });

    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      console.error("Failed to obtain management token", txt);
      return NextResponse.json({ error: "token_fail" }, { status: 500 });
    }

    const { access_token } = (await tokenRes.json()) as TokenResponse;

    // Patch user metadata
    const patchRes = await fetch(
      `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${encodeURIComponent(session.user.sub)}`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          user_metadata: { name, program, term },
        }),
      }
    );

    if (!patchRes.ok) {
      const txt = await patchRes.text();
      console.error("Failed to update user", txt);
      return NextResponse.json({ error: "update_fail" }, { status: 500 });
    }

    // update local session so onboarding gate passes immediately
    const newSession = {
      ...session,
      user: {
        ...session.user,
        user_metadata: { name, program, term },
      },
    } as any;
    // Persist updated session cookies so the client reflects changes immediately
    // Create a real NextResponse instance so Auth0 helper can attach cookies.
    const res = NextResponse.json({ success: true });
    // `updateSession` mutates the provided response by setting the new cookie header.
    // We intentionally cast to `any` because `updateSession` currently expects
    // `NextRequest` / `NextResponse` from the edge helpers, but those are compatible
    // with the standard Web types used in the App Router.
    await updateSession(req as any, res, newSession);

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
