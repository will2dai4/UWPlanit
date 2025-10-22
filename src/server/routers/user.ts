/**
 * User Router - handles user profile operations
 */
import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../trpc";
import { supabaseAdmin } from "@/lib/supabase";

export const userRouter = createTRPCRouter({
  /**
   * Get current user profile
   */
  getProfile: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", ctx.user.sub)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data;
  }),

  /**
   * Create or update user profile (upsert)
   */
  upsertProfile: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
        program: z.string().optional(),
        current_term: z.string().optional(),
        avatar_url: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabaseAdmin
        .from("users")
        .upsert(
          {
            id: ctx.user.sub,
            email: ctx.user.email ?? "",
            name: input.name,
            program: input.program,
            current_term: input.current_term,
            avatar_url: input.avatar_url,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        )
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to upsert user profile: ${error.message}`);
      }

      return data;
    }),

  /**
   * Update user profile
   */
  updateProfile: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
        program: z.string().optional(),
        current_term: z.string().optional(),
        avatar_url: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabaseAdmin
        .from("users")
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ctx.user.sub)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update user profile: ${error.message}`);
      }

      return data;
    }),
});

