import { getStatusClasses } from "@/lib/topik";
import type { StudyStatus } from "@/types/topik";

interface StatusBadgeProps {
  status: StudyStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
        status,
      )}`}
    >
      {status}
    </span>
  );
}
