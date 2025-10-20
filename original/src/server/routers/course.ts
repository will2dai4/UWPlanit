import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const courseRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.from("courses").select("*").order("code");
    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
    return data ?? [];
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("courses")
        .select("*")
        .eq("id", input.id)
        .single();
      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return data ?? null;
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const query = `%${input.query}%`;
      const { data, error } = await ctx.supabase
        .from("courses")
        .select("*")
        .or(
          `code.ilike.${query},name.ilike.${query},description.ilike.${query}`
        )
        .limit(50);
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return data ?? [];
    }),

  getPrerequisites: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: courseRow, error } = await ctx.supabase
        .from("courses")
        .select("prerequisites")
        .eq("id", input.id)
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      const prereqIds = (courseRow?.prerequisites ?? []) as string[];
      if (!prereqIds.length) return [];

      const { data: prereqs, error: err2 } = await ctx.supabase
        .from("courses")
        .select("*")
        .in("id", prereqIds);

      if (err2) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err2.message });
      }

      return prereqs ?? [];
    }),
});
