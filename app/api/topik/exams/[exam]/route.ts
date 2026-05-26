import { fail, ok } from "@/lib/server/api-response";
import { topikStore } from "@/lib/server/topik-store";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ exam: string }> },
) {
  try {
    const { exam } = await context.params;
    await topikStore.clearExamData(Number(exam));
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
