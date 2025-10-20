import { createTRPCRouter } from "../trpc";
import { courseRouter } from "./course";

export const appRouter = createTRPCRouter({
  course: courseRouter,
});

export type AppRouter = typeof appRouter;
