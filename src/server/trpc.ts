import { initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@auth0/nextjs-auth0";

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  
  // Get Auth0 session if available
  let user = null;
  try {
    const session = await getSession();
    if (session?.user) {
      user = session.user;
    }
  } catch (error) {
    // Session not available - this is fine for public procedures
    console.debug("No Auth0 session available");
  }

  return {
    req,
    res,
    supabase: supabaseAdmin,
    user,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
