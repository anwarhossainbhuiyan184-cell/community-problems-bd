import { REPORT_STATUSES, type ReportStatus } from '@/types/report'
import { cn } from '@/lib/cn'

const styles: Record<ReportStatus, string> = {
  received: 'border-brand-yellow/40 bg-brand-yellow/15 text-[#7A5A00]',
  in_progress: 'border-brand-red/20 bg-brand-red/10 text-brand-red-dark',
  resolved: 'border-brand-green/25 bg-brand-green/10 text-brand-green-dark',
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const meta = REPORT_STATUSES.find((item) => item.value === status) ?? REPORT_STATUSES[0]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        styles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  )
}
