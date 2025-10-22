import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({
      req,
      res: {},
    } as unknown as CreateNextContextOptions),
  });

export { handler as GET, handler as POST };
