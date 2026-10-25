export const REPORT_CATEGORIES = [
  { value: 'roads', label: 'রাস্তা ও চলাচল' },
  { value: 'drainage', label: 'ড্রেনেজ ও জলাবদ্ধতা' },
  { value: 'water', label: 'পানি সরবরাহ' },
  { value: 'electricity', label: 'বিদ্যুৎ' },
  { value: 'waste', label: 'বর্জ্য ব্যবস্থাপনা' },
  { value: 'public_safety', label: 'জননিরাপত্তা' },
  { value: 'education', label: 'শিক্ষা' },
  { value: 'healthcare', label: 'স্বাস্থ্যসেবা' },
  { value: 'other', label: 'অন্যান্য' },
] as const

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]['value']

export const REPORT_CATEGORY_VALUES = REPORT_CATEGORIES.map((category) => category.value) as [
  ReportCategory,
  ...ReportCategory[],
]

export const REPORT_STATUSES = [
  { value: 'received', label: 'গৃহীত', tone: 'neutral' },
  { value: 'in_progress', label: 'প্রক্রিয়াধীন', tone: 'progress' },
  { value: 'resolved', label: 'সমাধান হয়েছে', tone: 'success' },
] as const

export type ReportStatus = (typeof REPORT_STATUSES)[number]['value']

export const REPORT_STATUS_VALUES = REPORT_STATUSES.map((status) => status.value) as [
  ReportStatus,
  ...ReportStatus[],
]

export interface Report {
  id: string
  created_at: string
  title: string
  description: string
  category: ReportCategory
  area: string
  reporter_name: string | null
  reporter_phone: string | null
  image_path: string | null
  status: ReportStatus
  client_submission_id: string | null
}

export interface PublicStats {
  total_reports: number
  total_submitters: number
  received: number
  in_progress: number
  resolved: number
}

export interface ReportSubmission {
  title: string
  description: string
  category: ReportCategory
  area: string
  reporterName?: string
  reporterPhone?: string
  clientSubmissionId: string
}

export interface ReportFilters {
  search: string
  category: ReportCategory | ''
  status: ReportStatus | ''
  area: string
  dateFrom: string
  dateTo: string
}
