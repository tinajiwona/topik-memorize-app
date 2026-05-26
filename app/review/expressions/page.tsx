"use client";

import { ReviewSession } from "@/components/review-session";
import { db } from "@/lib/db/database";

export default function ExpressionsReviewPage() {
  return (
    <ReviewSession
      title="背惯用表达"
      subtitle="先看韩语表达，再翻面看中文释义和来源。"
      reviewLabel="表达卡"
      backHref="/review/library"
      backLabel="返回题库背诵"
      loadItems={() => db.getExpressionReviewItems()}
      getFront={(item) => item.koreanExpression}
      getBackLines={(item) => [item.chinese]}
      onReview={(id, status) => db.updateExpressionStatus(id, status)}
      onFavoriteToggle={(id, isFavorite) => db.toggleExpressionFavorite(id, isFavorite)}
    />
  );
}
