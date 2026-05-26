import type { ReactNode } from "react";

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1f7a72]">
            TOPIK Memorize
          </p>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions}
      </header>
      <main className="flex flex-1 flex-col gap-4">{children}</main>
    </div>
  );
}
