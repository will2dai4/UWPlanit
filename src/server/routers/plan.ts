/**
 * Plan Router - handles course planning operations
 */
import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../trpc";
import { supabaseAdmin } from "@/lib/supabase";

export const planRouter = createTRPCRouter({
  /**
   * Get all course plans for the current user
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    const supabase = supabaseAdmin;
    const { data, error } = await supabase
      .from("course_plans")
      .select("*")
      .eq("user_id", ctx.user.sub)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch course plans: ${error.message}`);
    }

    return data;
  }),

  /**
   * Get a specific course plan with all courses
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      const supabase = supabaseAdmin;

      // Fetch the plan
      const { data: plan, error: planError } = await supabase
        .from("course_plans")
        .select("*")
        .eq("id", input.id)
        .eq("user_id", ctx.user.sub)
        .single();

      if (planError) {
        throw new Error(`Failed to fetch course plan: ${planError.message}`);
      }

      // Fetch all courses in the plan with course details
      const { data: planCourses, error: coursesError } = await supabase
        .from("plan_courses")
        .select(
          `
          *,
          course:courses(*)
        `
        )
        .eq("plan_id", input.id)
        .order("year", { ascending: true })
        .order("term", { ascending: true })
        .order("term_order", { ascending: true });

      if (coursesError) {
        throw new Error(`Failed to fetch plan courses: ${coursesError.message}`);
      }

      return {
        ...plan,
        courses: planCourses,
      };
    }),

  /**
   * Get the active course plan for the current user
   */
  getActive: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    const supabase = supabaseAdmin;

    // Fetch the active plan
    const { data: plan, error: planError } = await supabase
      .from("course_plans")
      .select("*")
      .eq("user_id", ctx.user.sub)
      .eq("is_active", true)
      .single();

    if (planError && planError.code !== "PGRST116") {
      throw new Error(`Failed to fetch active plan: ${planError.message}`);
    }

    if (!plan) {
      return null;
    }

    // Fetch all courses in the plan
    const { data: planCourses, error: coursesError } = await supabase
      .from("plan_courses")
      .select(
        `
        *,
        course:courses(*)
      `
      )
      .eq("plan_id", plan.id)
      .order("year", { ascending: true })
      .order("term", { ascending: true })
      .order("term_order", { ascending: true });

    if (coursesError) {
      throw new Error(`Failed to fetch plan courses: ${coursesError.message}`);
    }

    return {
      ...plan,
      courses: planCourses,
    };
  }),

  /**
   * Create a new course plan
   */
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        start_term: z.string().optional(),
        start_year: z.number().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      const supabase = supabaseAdmin;

      // If setting as active, deactivate other plans first
      if (input.is_active) {
        await supabase
          .from("course_plans")
          .update({ is_active: false })
          .eq("user_id", ctx.user.sub);
      }

      const { data, error } = await supabase
        .from("course_plans")
        .insert({
          user_id: ctx.user.sub,
          name: input.name,
          description: input.description,
          start_term: input.start_term,
          start_year: input.start_year,
          is_active: input.is_active ?? false,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create course plan: ${error.message}`);
      }

      return data;
    }),

  /**
   * Update a course plan
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        start_term: z.string().optional(),
        start_year: z.number().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      const supabase = supabaseAdmin;
      const { id, ...updates } = input;

      // If setting as active, deactivate other plans first
      if (updates.is_active) {
        await supabase
          .from("course_plans")
          .update({ is_active: false })
          .eq("user_id", ctx.user.sub)
          .neq("id", id);
      }

      const { data, error } = await supabase
        .from("course_plans")
        .update(updates)
        .eq("id", id)
        .eq("user_id", ctx.user.sub)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update course plan: ${error.message}`);
      }

      return data;
    }),

  /**
   * Delete a course plan
   */
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      const supabase = supabaseAdmin;
      const { error } = await supabase
        .from("course_plans")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.user.sub);

      if (error) {
        throw new Error(`Failed to delete course plan: ${error.message}`);
      }

      return { success: true };
    }),

  /**
   * Add a course to a plan
   */
  addCourse: publicProcedure
    .input(
      z.object({
        plan_id: z.string().uuid(),
        course_id: z.string(),
        term: z.string(),
        year: z.number().optional(),
        term_order: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      const supabase = supabaseAdmin;

      // Verify plan belongs to user
      const { data: plan } = await supabase
        .from("course_plans")
        .select("id")
        .eq("id", input.plan_id)
        .eq("user_id", ctx.user.sub)
        .single();

      if (!plan) {
        throw new Error("Course plan not found or access denied");
      }

      const { data, error } = await supabase
        .from("plan_courses")
        .insert({
          plan_id: input.plan_id,
          course_id: input.course_id,
          term: input.term,
          year: input.year,
          term_order: input.term_order,
          notes: input.notes,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add course to plan: ${error.message}`);
      }

      return data;
    }),

  /**
   * Update a course in a plan
   */
  updateCourse: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        term: z.string().optional(),
        year: z.number().optional(),
        term_order: z.number().optional(),
        notes: z.string().optional(),
        is_completed: z.boolean().optional(),
        grade: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      const supabase = supabaseAdmin;
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from("plan_courses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update plan course: ${error.message}`);
      }

      return data;
    }),

  /**
   * Remove a course from a plan
   */
  removeCourse: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      const supabase = supabaseAdmin;
      const { error } = await supabase
        .from("plan_courses")
        .delete()
        .eq("id", input.id);

      if (error) {
        throw new Error(`Failed to remove course from plan: ${error.message}`);
      }

      return { success: true };
    }),
});

