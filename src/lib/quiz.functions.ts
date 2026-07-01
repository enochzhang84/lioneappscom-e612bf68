// Public quiz reads. Uses the publishable (anon) key on the server — RLS allows
// SELECT on rows where is_active = true.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type QuizQuestion = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string | null;
  category: string;
};

export const getRandomQuizQuestions = createServerFn({ method: "GET" })
  .inputValidator((d: { category?: string; count?: number }) =>
    z.object({
      category: z.string().min(1).max(40).default("c1"),
      count: z.number().int().min(1).max(200).default(36),
    }).parse(d ?? {}),
  )
  .handler(async ({ data }): Promise<QuizQuestion[]> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data: rows, error } = await supabasePublic
      .from("quiz_questions")
      .select("id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, category")
      .eq("category", data.category)
      .eq("is_active", true);
    if (error) throw new Error(error.message);
    const list = (rows ?? []) as QuizQuestion[];
    // Fisher–Yates shuffle then take N
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, data.count);
  });
