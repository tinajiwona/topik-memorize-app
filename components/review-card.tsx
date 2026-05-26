"use client";

import { Star } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { formatReviewSource } from "@/lib/topik";
import type { ReviewSource, StudyStatus } from "@/types/topik";

interface ReviewCardAction {
  label: string;
  status: StudyStatus;
  className: string;
}

interface ReviewCardProps {
  title: string;
  front: string;
  backLines: string[];
  source: ReviewSource;
  status: StudyStatus;
  isFavorite: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  onFavoriteToggle: () => void;
  onReview: (status: StudyStatus) => void;
}

const REVIEW_ACTIONS: ReviewCardAction[] = [
  {
    label: "不认识",
    status: "new",
    className: "bg-slate-900 text-white",
  },
  {
    label: "模糊",
    status: "learning",
    className: "bg-amber-100 text-amber-700",
  },
  {
    label: "认识",
    status: "mastered",
    className: "bg-emerald-100 text-emerald-700",
  },
];

export function ReviewCard({
  title,
  front,
  backLines,
  source,
  status,
  isFavorite,
  isFlipped,
  onFlip,
  onFavoriteToggle,
  onReview,
}: ReviewCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-xs text-slate-400">{formatReviewSource(source)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <button
            type="button"
            onClick={onFavoriteToggle}
            className={`rounded-full p-3 ${
              isFavorite ? "bg-amber-100 text-amber-500" : "bg-slate-100 text-slate-400"
            }`}
            aria-label={isFavorite ? "取消收藏" : "收藏"}
          >
            <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onFlip}
        className="flex min-h-[380px] flex-1 flex-col justify-between rounded-[32px] bg-white p-6 text-left shadow-[0_22px_70px_rgba(21,50,50,0.12)] ring-1 ring-[#dfeae5]"
      >
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-[#1f7a72]">
          <span>{isFlipped ? "Back" : "Front"}</span>
          <span>点击翻面</span>
        </div>
        <div className="space-y-4 text-center">
          <p className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2.8rem]">
            {front}
          </p>
          {isFlipped ? (
            <div className="space-y-3 text-base leading-7 text-slate-600">
              {backLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}
        </div>
        <p className="text-xs text-slate-400">{source.title}</p>
      </button>

      <div className="grid grid-cols-3 gap-3">
        {REVIEW_ACTIONS.map((action) => (
          <button
            key={action.status}
            type="button"
            onClick={() => onReview(action.status)}
            className={`rounded-2xl px-4 py-4 text-sm font-semibold shadow-sm transition active:scale-[0.98] ${action.className}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
