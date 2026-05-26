import { fail, ok } from "@/lib/server/api-response";
import { topikStore } from "@/lib/server/topik-store";
import type { SmartReviewContentType, StudyStatus } from "@/types/topik";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    return ok(await topikStore.getTodaySmartReviewPlan(searchParams.get("dateKey") ?? undefined));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      contentType: SmartReviewContentType;
      id: string;
      status: StudyStatus;
      dateKey?: string;
    };

    await topikStore.updateSmartReviewStatus(
      payload.contentType,
      payload.id,
      payload.status,
      payload.dateKey,
    );
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
