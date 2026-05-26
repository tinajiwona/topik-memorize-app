import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#cfe0d8] bg-white/70 px-5 py-8 text-center shadow-[0_18px_45px_rgba(28,52,52,0.06)]">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
