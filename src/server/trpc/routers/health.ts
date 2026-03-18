import { publicProcedure, createTRPCRouter } from "@/server/trpc/init";

export const healthRouter = createTRPCRouter({
  ping: publicProcedure.query(() => {
    return {
      ok: true,
      service: "uwplanit",
      timestamp: new Date().toISOString(),
    };
  }),
});
