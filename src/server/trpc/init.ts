import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";

type TRPCContext = {
  userId: string | null;
};

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ error, shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication is required for this procedure.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

export const createTRPCContext = async () => {
  return {
    userId: null as string | null,
  };
};

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const protectedProcedure = t.procedure.use(authMiddleware);
export const publicProcedure = t.procedure;
