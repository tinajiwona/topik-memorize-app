"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { ReviewCard } from "@/components/review-card";
import { db } from "@/lib/db/database";
import { getSmartContentLabel, getSmartPhaseLabel } from "@/lib/topik";
import type { SmartReviewItem, SmartReviewPlan, StudyStatus } from "@/types/topik";

export function SmartVocabularySession() {
  const [plan, setPlan] = useState<SmartReviewPlan | null>(null);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const loadPlanEffect = useEffectEvent(() => db.getTodaySmartReviewPlan());

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setIsLoading(true);
      const nextPlan = await loadPlanEffect();

      if (!isMounted) {
        return;
      }

      setPlan(nextPlan);
      setIndex(0);
      setIsFlipped(false);
      setIsLoading(false);
    }

    void run();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentItem = plan?.items[index] ?? null;

  async function handleReview(status: StudyStatus) {
    if (!plan || !currentItem) {
      return;
    }

    await db.updateSmartReviewStatus(currentItem.contentType, currentItem.id, status);
    setPlan((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        items: previous.items.map((item) =>
          item.id === currentItem.id
            ? {
                ...item,
                status,
              }
            : item,
        ),
      };
    });
    setIsFlipped(false);
    setIndex((previous) => {
      if (plan.items.length <= 1) {
        return 0;
      }

      return previous === plan.items.length - 1 ? 0 : previous + 1;
    });
  }

  async function handleFavoriteToggle() {
    if (!currentItem) {
      return;
    }

    const nextFavorite = !currentItem.isFavorite;
    if (currentItem.contentType === "vocabulary") {
      await db.toggleVocabularyFavorite(currentItem.id, nextFavorite);
    } else if (currentItem.contentType === "grammar") {
      await db.toggleGrammarFavorite(currentItem.id, nextFavorite);
    } else {
      await db.toggleExpressionFavorite(currentItem.id, nextFavorite);
    }
    setPlan((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        items: previous.items.map((item) =>
          item.id === currentItem.id
            ? {
                ...item,
                isFavorite: nextFavorite,
              }
            : item,
        ),
      };
    });
  }

  return (
    <PageShell
      title="按记忆规则背诵"
      subtitle="每天新增 50 个学习项，自动把近 5 天的新内容拉回复习；已熟悉内容会转入低频抽查。"
      actions={
        <Link
          href="/review"
          className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_12px_30px_rgba(21,50,50,0.08)] ring-1 ring-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回背诵入口</span>
        </Link>
      }
    >
      {isLoading ? (
        <div className="surface-card p-6 text-sm text-slate-500">正在生成今日计划...</div>
      ) : null}

      {!isLoading && (!plan || plan.items.length === 0) ? (
        <EmptyState
          title="还没有可安排的学习项"
          description="先去导入 TOPIK 题库，系统才会生成今日 50 项的智能背诵计划。"
          action={
            <Link
              href="/import"
              className="inline-flex rounded-2xl bg-[#1f7a72] px-5 py-3 text-sm font-semibold text-white"
            >
              去导入资料
            </Link>
          }
        />
      ) : null}

      {!isLoading && plan && currentItem ? (
        <>
          <section className="surface-card grid grid-cols-3 gap-3 p-4">
            <div className="rounded-2xl bg-[#f8f4eb] p-3">
              <p className="text-xs text-slate-500">今日新项</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{plan.newCount}</p>
            </div>
            <div className="rounded-2xl bg-[#f8f4eb] p-3">
              <p className="text-xs text-slate-500">循环复习</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{plan.reviewCount}</p>
            </div>
            <div className="rounded-2xl bg-[#f8f4eb] p-3">
              <p className="text-xs text-slate-500">低频抽查</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{plan.refreshCount}</p>
            </div>
          </section>

          <section className="surface-card grid grid-cols-3 gap-3 p-4">
            <div className="rounded-2xl bg-[#eef4f1] p-3">
              <p className="text-xs text-slate-500">词汇</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{plan.vocabularyCount}</p>
            </div>
            <div className="rounded-2xl bg-[#eef4f1] p-3">
              <p className="text-xs text-slate-500">语法</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{plan.grammarCount}</p>
            </div>
            <div className="rounded-2xl bg-[#eef4f1] p-3">
              <p className="text-xs text-slate-500">表达</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{plan.expressionsCount}</p>
            </div>
          </section>

          <div className="flex items-center justify-between rounded-[24px] bg-[#1f7a72] px-4 py-3 text-sm text-white shadow-[0_16px_40px_rgba(31,122,114,0.18)]">
            <span>
              第 {index + 1} 张 / 共 {plan.items.length} 张
            </span>
            <span>{getSmartPhaseLabel(currentItem.memory.phase)}</span>
          </div>

          <div className="surface-card flex items-center justify-between rounded-[28px] px-4 py-3 text-sm text-slate-600">
            <span>{getSmartContentLabel(currentItem.contentType)}</span>
            <span>
              第 {currentItem.memory.cycleDay} 天 · 已进入计划{" "}
              {currentItem.memory.daysSinceIntroduced + 1} 天
            </span>
          </div>

          <ReviewCard
            title={getSmartCardTitle(currentItem)}
            front={getSmartFront(currentItem)}
            backLines={getSmartBackLines(currentItem)}
            source={currentItem.source}
            status={currentItem.status}
            isFavorite={currentItem.isFavorite}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((previous) => !previous)}
            onFavoriteToggle={() => void handleFavoriteToggle()}
            onReview={(status) => void handleReview(status)}
          />
        </>
      ) : null}
    </PageShell>
  );
}

function getSmartCardTitle(item: SmartReviewItem) {
  if (item.contentType === "vocabulary") {
    return "记忆规则词汇卡";
  }

  if (item.contentType === "grammar") {
    return "记忆规则语法卡";
  }

  return "记忆规则表达卡";
}

function getSmartFront(item: SmartReviewItem) {
  if (item.contentType === "vocabulary") {
    return item.korean;
  }

  if (item.contentType === "grammar") {
    return item.grammar;
  }

  return item.koreanExpression;
}

function getSmartBackLines(item: SmartReviewItem) {
  if (item.contentType === "vocabulary") {
    return [item.chinese];
  }

  if (item.contentType === "grammar") {
    return [`表达：${item.expression}`, `用法：${item.usage}`];
  }

  return [item.chinese];
}
