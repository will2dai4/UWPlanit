import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

// customise /api/auth/signup to open the Universal Login on the signup tab
export const GET = handleAuth({
  signup: handleLogin({
    authorizationParams: {
      screen_hint: "signup",
    },
    returnTo: "/",
  }),
});

export const POST = GET;
