import {
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  type ReportCategory,
  type ReportStatus,
} from '@/types/report'

export function categoryLabel(value: ReportCategory) {
  return REPORT_CATEGORIES.find((category) => category.value === value)?.label ?? value
}

export function statusLabel(value: ReportStatus) {
  return REPORT_STATUSES.find((status) => status.value === value)?.label ?? value
}
