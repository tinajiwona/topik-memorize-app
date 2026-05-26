"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Cloud, House, Import, LibraryBig } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "首页", icon: House },
  { href: "/import", label: "导入", icon: Import },
  { href: "/questions", label: "题库", icon: LibraryBig },
  { href: "/review", label: "背诵", icon: BrainCircuit },
  { href: "/sync", label: "同步", icon: Cloud },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/70 bg-[rgba(247,244,236,0.92)] backdrop-blur-lg">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] pt-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[4.2rem] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
                isActive
                  ? "bg-[#1f7a72] text-white shadow-[0_10px_30px_rgba(31,122,114,0.2)]"
                  : "text-slate-500"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
