import { fail, ok } from "@/lib/server/api-response";
import { topikStore } from "@/lib/server/topik-store";
import type { TopikLevel, TopikPart } from "@/types/topik";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examParam = searchParams.get("exam");
    const levelParam = searchParams.get("level");
    const partParam = searchParams.get("part");

    return ok(
      await topikStore.getAllQuestions({
        exam: examParam ? Number(examParam) : undefined,
        level: levelParam ? (levelParam as TopikLevel) : undefined,
        part: partParam ? (partParam as TopikPart) : undefined,
      }),
    );
  } catch (error) {
    return fail(error);
  }
}
