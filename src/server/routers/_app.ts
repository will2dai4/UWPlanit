import { createTRPCRouter } from "../trpc";
import { courseRouter } from "./course";
import { userRouter } from "./user";
import { planRouter } from "./plan";

export const appRouter = createTRPCRouter({
  course: courseRouter,
  user: userRouter,
  plan: planRouter,
});

export type AppRouter = typeof appRouter;
