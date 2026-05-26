import { fail, ok } from "@/lib/server/api-response";
import { topikStore } from "@/lib/server/topik-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(await topikStore.getExpressionReviewItems());
  } catch (error) {
    return fail(error);
  }
}
