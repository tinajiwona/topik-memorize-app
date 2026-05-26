import { fail, ok } from "@/lib/server/api-response";
import { topikStore } from "@/lib/server/topik-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return ok(await topikStore.getQuestionById(id));
  } catch (error) {
    return fail(error);
  }
}
