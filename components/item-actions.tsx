"use client";

import { Star } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import type { StudyStatus } from "@/types/topik";

interface ItemActionsProps {
  status: StudyStatus;
  isFavorite: boolean;
  onStatusToggle: () => void;
  onFavoriteToggle: () => void;
}

export function ItemActions({
  status,
  isFavorite,
  onStatusToggle,
  onFavoriteToggle,
}: ItemActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onStatusToggle}
        className="rounded-full p-1 transition hover:scale-[1.01] active:scale-[0.98]"
      >
        <StatusBadge status={status} />
      </button>
      <button
        type="button"
        onClick={onFavoriteToggle}
        className={`rounded-full p-3 transition ${
          isFavorite ? "bg-amber-100 text-amber-500" : "bg-slate-100 text-slate-400"
        }`}
        aria-label={isFavorite ? "取消收藏" : "收藏"}
      >
        <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}
