"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { ReviewCard } from "@/components/review-card";
import type { ReviewSource, StudyStatus } from "@/types/topik";

interface ReviewSessionItem {
  id: string;
  status: StudyStatus;
  isFavorite: boolean;
  source: ReviewSource;
}

interface ReviewSessionProps<T extends ReviewSessionItem> {
  title: string;
  subtitle: string;
  reviewLabel: string;
  backHref?: string;
  backLabel?: string;
  loadItems: () => Promise<T[]>;
  getFront: (item: T) => string;
  getBackLines: (item: T) => string[];
  onReview: (id: string, status: StudyStatus) => Promise<void>;
  onFavoriteToggle: (id: string, isFavorite: boolean) => Promise<void>;
}

export function ReviewSession<T extends ReviewSessionItem>({
  title,
  subtitle,
  reviewLabel,
  backHref = "/review",
  backLabel = "返回背诵入口",
  loadItems,
  getFront,
  getBackLines,
  onReview,
  onFavoriteToggle,
}: ReviewSessionProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const loadItemsEffect = useEffectEvent(loadItems);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setIsLoading(true);
      const loadedItems = await loadItemsEffect();

      if (!isMounted) {
        return;
      }

      setItems(loadedItems);
      setIndex(0);
      setIsFlipped(false);
      setIsLoading(false);
    }

    void run();

    return () => {
      isMounted = false;
    };
  }, [title]);

  const currentItem = items[index];

  async function handleReview(status: StudyStatus) {
    if (!currentItem) {
      return;
    }

    await onReview(currentItem.id, status);
    setItems((previous) =>
      previous.map((item) =>
        item.id === currentItem.id
          ? ({
              ...item,
              status,
            } as T)
          : item,
      ),
    );
    setIsFlipped(false);
    setIndex((previous) => {
      if (items.length <= 1) {
        return 0;
      }

      return previous === items.length - 1 ? 0 : previous + 1;
    });
  }

  async function handleFavoriteToggle() {
    if (!currentItem) {
      return;
    }

    const nextFavorite = !currentItem.isFavorite;
    await onFavoriteToggle(currentItem.id, nextFavorite);
    setItems((previous) =>
      previous.map((item) =>
        item.id === currentItem.id
          ? ({
              ...item,
              isFavorite: nextFavorite,
            } as T)
          : item,
      ),
    );
  }

  return (
    <PageShell
      title={title}
      subtitle={subtitle}
      actions={
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_12px_30px_rgba(21,50,50,0.08)] ring-1 ring-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backLabel}</span>
        </Link>
      }
    >
      {isLoading ? (
        <div className="rounded-[28px] bg-white p-6 text-sm text-slate-500 shadow-[0_18px_40px_rgba(21,50,50,0.08)]">
          正在加载背诵卡片...
        </div>
      ) : null}

      {!isLoading && !currentItem ? (
        <EmptyState
          title={`还没有${reviewLabel}资料`}
          description="先去导入 Markdown，再回来开始背诵。"
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

      {!isLoading && currentItem ? (
        <>
          <div className="flex items-center justify-between rounded-[24px] bg-[#1f7a72] px-4 py-3 text-sm text-white shadow-[0_16px_40px_rgba(31,122,114,0.18)]">
            <span>
              第 {index + 1} 张 / 共 {items.length} 张
            </span>
            <span>{reviewLabel}</span>
          </div>

          <ReviewCard
            title={reviewLabel}
            front={getFront(currentItem)}
            backLines={getBackLines(currentItem)}
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
