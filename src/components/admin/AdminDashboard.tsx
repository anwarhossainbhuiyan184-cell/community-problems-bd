import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Download,
  Inbox,
  LoaderCircle,
  LogOut,
  RefreshCw,
} from 'lucide-react'
import {
  exportReports,
  getPublicStats,
  listReports,
  type ReportListResult,
} from '@/lib/api'
import { formatDateBn, formatNumberBn } from '@/lib/format'
import { categoryLabel } from '@/lib/labels'
import type {
  PublicStats,
  Report,
  ReportFilters,
} from '@/types/report'
import { ReportFilters as Filters } from '@/components/admin/ReportFilters'
import { ReportDetail } from '@/components/admin/ReportDetail'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Notice } from '@/components/ui/Notice'
import { Spinner } from '@/components/ui/Spinner'

const PAGE_SIZE = 15

const emptyFilters: ReportFilters = {
  search: '',
  category: '',
  status: '',
  area: '',
  dateFrom: '',
  dateTo: '',
}

interface MiniStatProps {
  label: string
  value: number | null
  icon: ReactNode
  tone: 'ink' | 'red' | 'yellow' | 'green'
  loading: boolean
}

const toneClasses: Record<MiniStatProps['tone'], string> = {
  ink: 'bg-ink/5 text-ink',
  red: 'bg-brand-red/10 text-brand-red',
  yellow: 'bg-brand-yellow/15 text-[#7A5A00]',
  green: 'bg-brand-green/10 text-brand-green',
}

function MiniStat({ label, value, icon, tone, loading }: MiniStatProps) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneClasses[tone]}`} aria-hidden="true">
          {icon}
        </span>
        {loading ? (
          <span className="skeleton h-7 w-12" aria-hidden="true" />
        ) : (
          <span className="font-display text-2xl font-semibold text-ink">
            {value === null ? '—' : formatNumberBn(value)}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs font-medium text-ink-muted">{label}</p>
    </div>
  )
}

function csvEscape(value: unknown) {
  const text = String(value ?? '')
  // Prevent spreadsheet formula injection when an admin opens the export.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

interface AdminDashboardProps {
  onSignOut: () => Promise<void>
}

export function AdminDashboard({ onSignOut }: AdminDashboardProps) {
  const [filters, setFilters] = useState<ReportFilters>(emptyFilters)
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<ReportListResult>({
    reports: [],
    count: 0,
    error: null,
  })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const loadReports = useCallback(async () => {
    setLoading(true)
    const next = await listReports(filters, page, PAGE_SIZE)
    setResult(next)
    setLoading(false)
  }, [filters, page])

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError(null)
    const next = await getPublicStats()
    if (next.error) {
      setStatsError(next.error)
      setStats(null)
    } else {
      setStats(next.stats)
    }
    setStatsLoading(false)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReports()
    }, 250)

    return () => window.clearTimeout(timer)
  }, [loadReports])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const totalPages = Math.max(1, Math.ceil(result.count / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  function updateFilter(key: keyof ReportFilters, value: string) {
    setFilters((previous) => ({ ...previous, [key]: value }) as ReportFilters)
    setPage(1)
  }

  function resetFilters() {
    setFilters(emptyFilters)
    setPage(1)
  }

  function handleUpdated(updated: Report) {
    setResult((previous) => ({
      ...previous,
      reports: previous.reports.map((report) => (report.id === updated.id ? updated : report)),
    }))
    setSelectedReport(updated)
    setToast('স্ট্যাটাস আপডেট হয়েছে।')
    void loadStats()
    void loadReports()
  }

  async function handleExport() {
    setExporting(true)
    try {
      const rows = await exportReports(filters)
      if (rows.length === 0) {
        setToast('এই ফিল্টারে কোনো রিপোর্ট নেই।')
        return
      }

      const headers = [
        'id',
        'created_at',
        'title',
        'description',
        'category',
        'area',
        'reporter_name',
        'reporter_phone',
        'status',
        'image_path',
      ]

      const csv = [
        headers.map(csvEscape).join(','),
        ...rows.map((report) =>
          [
            report.id,
            report.created_at,
            report.title,
            report.description,
            categoryLabel(report.category),
            report.area,
            report.reporter_name ?? '',
            report.reporter_phone ?? '',
            report.status,
            report.image_path ?? '',
          ]
            .map(csvEscape)
            .join(','),
        ),
      ].join('\r\n')

      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `community-reports-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setToast('CSV ডাউনলোড শুরু হয়েছে।')
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'এক্সপোর্ট করা যায়নি।')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">অ্যাডমিন</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            প্রশাসনিক ড্যাশবোর্ড
          </h1>
          <p className="mt-2 text-sm leading-7 text-ink-muted">
            রিপোর্ট যাচাই করুন, স্ট্যাটাস আপডেট করুন এবং এলাকার পরিসংখ্যান দেখুন।
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/" className="btn-secondary min-h-10 px-4 py-2 text-sm">
            সাইট দেখুন
          </Link>
          <button type="button" onClick={() => void onSignOut()} className="btn-ghost">
            <LogOut size={16} aria-hidden="true" />
            সাইন আউট
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat
          label="মোট রিপোর্ট"
          value={stats?.total_reports ?? null}
          icon={<ClipboardList size={18} />}
          tone="ink"
          loading={statsLoading}
        />
        <MiniStat
          label="নতুন / গৃহীত"
          value={stats?.received ?? null}
          icon={<Inbox size={18} />}
          tone="red"
          loading={statsLoading}
        />
        <MiniStat
          label="প্রক্রিয়াধীন"
          value={stats?.in_progress ?? null}
          icon={<LoaderCircle size={18} />}
          tone="yellow"
          loading={statsLoading}
        />
        <MiniStat
          label="সমাধান হয়েছে"
          value={stats?.resolved ?? null}
          icon={<CheckCircle2 size={18} />}
          tone="green"
          loading={statsLoading}
        />
      </div>

      {statsError ? (
        <Notice
          tone="error"
          title="পরিসংখ্যান লোড করা যায়নি"
          className="mt-3"
          action={
            <button type="button" onClick={() => void loadStats()} className="btn-ghost text-brand-red">
              <RefreshCw size={15} aria-hidden="true" />
              আবার চেষ্টা করুন
            </button>
          }
        >
          উপরের সংখ্যাগুলো দেখানো হচ্ছে না, কারণ সার্ভার থেকে প্রকৃত পরিসংখ্যান আনা যায়নি।
        </Notice>
      ) : null}

      <div className="mt-8">
        <Filters filters={filters} onChange={updateFilter} onReset={resetFilters} />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          মোট {formatNumberBn(result.count)}টি রিপোর্ট
          {filters.search || filters.category || filters.status || filters.area || filters.dateFrom || filters.dateTo
            ? ' (ফিল্টার করা)'
            : ''}
        </p>
        <button
          type="button"
          onClick={() => void handleExport()}
          disabled={exporting || result.count === 0}
          className="btn-secondary min-h-10 px-4 py-2 text-sm"
        >
          {exporting ? <Spinner className="h-4 w-4" /> : <Download size={16} aria-hidden="true" />}
          CSV ডাউনলোড
        </button>
      </div>

      {result.error ? (
        <Notice
          tone="error"
          title="রিপোর্ট লোড করা যায়নি"
          className="mt-4"
          action={
            <button type="button" onClick={() => void loadReports()} className="btn-ghost text-brand-red">
              <RefreshCw size={15} aria-hidden="true" />
              আবার চেষ্টা করুন
            </button>
          }
        >
          {result.error}
        </Notice>
      ) : loading ? (
        <div className="card mt-4 flex min-h-52 flex-col items-center justify-center gap-3 text-sm text-ink-muted" role="status">
          <Spinner className="h-6 w-6 text-brand-green" />
          রিপোর্ট লোড হচ্ছে…
        </div>
      ) : result.reports.length === 0 ? (
        <div className="card mt-4 p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper-soft text-ink-muted">
            <Inbox size={24} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">কোনো রিপোর্ট পাওয়া যায়নি</h2>
          <p className="mt-2 text-sm text-ink-muted">ফিল্টার পরিবর্তন করে আবার দেখুন।</p>
        </div>
      ) : (
        <>
          <div className="table-wrap mt-4 hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>সমস্যা</th>
                  <th>এলাকা</th>
                  <th>ধরন</th>
                  <th>স্ট্যাটাস</th>
                  <th>
                    <span className="sr-only">ব্যবস্থা</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.reports.map((report) => (
                  <tr key={report.id}>
                    <td className="whitespace-nowrap text-xs text-ink-muted">
                      {formatDateBn(report.created_at)}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedReport(report)}
                        className="block max-w-[280px] text-right font-semibold leading-6 text-ink transition hover:text-brand-green"
                      >
                        {report.title}
                      </button>
                      <p className="mt-1 max-w-[280px] truncate text-xs text-ink-muted">
                        {report.description}
                      </p>
                    </td>
                    <td className="whitespace-nowrap text-sm">{report.area}</td>
                    <td className="whitespace-nowrap text-sm">{categoryLabel(report.category)}</td>
                    <td>
                      <StatusBadge status={report.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedReport(report)}
                        className="btn-ghost min-h-8 px-2 py-1 text-xs text-brand-green"
                        aria-label={`${report.title} বিস্তারিত দেখুন`}
                      >
                        বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {result.reports.map((report) => (
              <article key={report.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-ink-muted">{formatDateBn(report.created_at)}</p>
                    <h2 className="mt-1 font-semibold leading-6">{report.title}</h2>
                  </div>
                  <StatusBadge status={report.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-7 text-ink-muted">{report.description}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                  <span>{report.area}</span>
                  <span>{categoryLabel(report.category)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReport(report)}
                  className="btn-secondary mt-3 min-h-10 w-full px-4 py-2 text-sm"
                >
                  বিস্তারিত দেখুন
                </button>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-ink-muted">
              পৃষ্ঠা {formatNumberBn(page)} / {formatNumberBn(totalPages)}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1}
                className="btn-secondary min-h-10 px-4 py-2 text-sm"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                আগের
              </button>
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={page >= totalPages}
                className="btn-secondary min-h-10 px-4 py-2 text-sm"
              >
                পরের
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}

      {selectedReport ? (
        <ReportDetail
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdated={handleUpdated}
        />
      ) : null}

      {toast ? (
        <div
          className="fixed bottom-5 left-1/2 z-[60] w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-center text-sm font-medium text-paper shadow-lift"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
