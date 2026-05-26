import { fail, ok } from "@/lib/server/api-response";
import { topikStore } from "@/lib/server/topik-store";
import type { Question } from "@/types/topik";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { questions?: Question[] };
    const questions = payload.questions ?? [];

    await topikStore.importQuestions(questions);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
