import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const courseRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    // Supabase has a default limit of 1000 rows, so we need to fetch in batches
    const allCourses = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await ctx.supabase
        .from("courses")
        .select("*")
        .order("code")
        .range(from, from + batchSize - 1);
      
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      
      if (data && data.length > 0) {
        allCourses.push(...data);
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    return allCourses;
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

  getByDepartment: publicProcedure
    .input(z.object({ department: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("courses")
        .select("*")
        .eq("department", input.department)
        .order("code");
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return data ?? [];
    }),

  getByLevel: publicProcedure
    .input(z.object({ level: z.number() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("courses")
        .select("*")
        .eq("level", input.level)
        .order("code");
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return data ?? [];
    }),

  getByTerm: publicProcedure
    .input(z.object({ term: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("courses")
        .select("*")
        .contains("terms", [input.term])
        .order("code");
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return data ?? [];
    }),

  getAllDepartments: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("courses")
      .select("department")
      .order("department");
    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
    const departments = Array.from(new Set(data?.map((c: { department: string }) => c.department) ?? [])).sort();
    return departments;
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

  getCorequisites: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: courseRow, error } = await ctx.supabase
        .from("courses")
        .select("corequisites")
        .eq("id", input.id)
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      const coreqIds = (courseRow?.corequisites ?? []) as string[];
      if (!coreqIds.length) return [];

      const { data: coreqs, error: err2 } = await ctx.supabase
        .from("courses")
        .select("*")
        .in("id", coreqIds);

      if (err2) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err2.message });
      }

      return coreqs ?? [];
    }),

  getAntirequisites: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: courseRow, error } = await ctx.supabase
        .from("courses")
        .select("antirequisites")
        .eq("id", input.id)
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      const antireqIds = (courseRow?.antirequisites ?? []) as string[];
      if (!antireqIds.length) return [];

      const { data: antireqs, error: err2 } = await ctx.supabase
        .from("courses")
        .select("*")
        .in("id", antireqIds);

      if (err2) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err2.message });
      }

      return antireqs ?? [];
    }),
});
