import { z } from "zod";

export const cookedRequestSchema = z.object({
  situation: z
    .string()
    .trim()
    .min(8, "Give CookedMeter a little more evidence.")
    .max(1200, "Keep it under 1,200 characters so the roast stays punchy."),
  source: z.literal("homepage").optional(),
  anon_session_id: z.string().trim().min(8).max(120).optional(),
});

export const cookedResultSchema = z.object({
  cooked_score: z.number().int().min(0).max(100).nullable(),
  cooked_level: z.string().min(1),
  cooked_category: z.string().min(1),
  seriousness_level: z.string().min(1),
  one_line_diagnosis: z.string().min(1),
  why_you_are_cooked: z.array(z.string()).min(0).max(5),
  why_you_might_not_be_cooked: z.array(z.string()).min(0).max(4),
  recovery_plan: z.array(z.string()).min(1).max(5),
  meme_verdict: z.string().min(1),
  final_line: z.string().min(1),
  share_card_summary: z.string().min(1),
  safe_mode: z.boolean(),
});

export const storedResultSchema = z.object({
  id: z.string(),
  situation: z.string(),
  result: cookedResultSchema,
  createdAt: z.string(),
});

export const publicResultCreateSchema = z.object({
  stored: storedResultSchema,
  anon_session_id: z.string().trim().min(8).max(120).optional(),
});

export type CookedRequest = z.infer<typeof cookedRequestSchema>;
export type CookedResult = z.infer<typeof cookedResultSchema>;
export type StoredResult = z.infer<typeof storedResultSchema>;
export type PublicResultCreate = z.infer<typeof publicResultCreateSchema>;
