import { z } from "zod";

export const DreamRequestSchema = z.object({
  dream: z.string().min(2, "Dream career must be at least 2 characters string").max(150, "Dream career is too long").trim(),
  history: z.array(z.object({
    role: z.string(),
    content: z.string()
  })).optional()
});

export type DreamRequest = z.infer<typeof DreamRequestSchema>;
