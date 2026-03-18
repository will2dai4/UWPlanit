import { createTRPCRouter } from "@/server/trpc/init";
import { healthRouter } from "@/server/trpc/routers/health";

export const appRouter = createTRPCRouter({
  health: healthRouter,
});

export type AppRouter = typeof appRouter;
