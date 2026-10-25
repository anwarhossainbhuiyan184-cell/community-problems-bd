import { useEffect, useRef, useState } from 'react'
import {
  CalendarDays,
  Check,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  Phone,
  User,
  X,
} from 'lucide-react'
import {
  getReportImageUrl,
  updateReportStatus,
} from '@/lib/api'
import { formatDateTimeBn, normalizePhoneForDisplay } from '@/lib/format'
import { categoryLabel } from '@/lib/labels'
import {
  REPORT_STATUSES,
  type Report,
  type ReportStatus,
} from '@/types/report'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Notice } from '@/components/ui/Notice'
import { Spinner } from '@/components/ui/Spinner'

interface ReportDetailProps {
  report: Report
  onClose: () => void
  onUpdated: (report: Report) => void
}

export function ReportDetail({ report, onClose, onUpdated }: ReportDetailProps) {
  const [status, setStatus] = useState<ReportStatus>(report.status)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(Boolean(report.image_path))
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setStatus(report.status)
    setError(null)
  }, [report.id, report.status])

  useEffect(() => {
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  useEffect(() => {
    let active = true

    if (!report.image_path) {
      setImageUrl(null)
      setImageLoading(false)
      return
    }

    setImageLoading(true)
    void getReportImageUrl(report.image_path).then((url) => {
      if (!active) return
      setImageUrl(url)
      setImageLoading(false)
    })

    return () => {
      active = false
    }
  }, [report.image_path])

  async function handleSave() {
    if (status === report.status) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await updateReportStatus(report.id, status)
      onUpdated(updated)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'স্ট্যাটাস আপডেট করা যায়নি।')
    } finally {
      setSaving(false)
    }
  }

  const displayPhone = normalizePhoneForDisplay(report.reporter_phone)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-paper shadow-lift sm:rounded-2xl"
      >
        <div
          className="h-1.5 w-full bg-[linear-gradient(90deg,#D6283E_0%,#D6283E_33%,#F4B400_33%,#F4B400_66%,#0F6B4F_66%,#0F6B4F_100%)]"
          aria-hidden="true"
        />
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={report.status} />
                <span className="text-xs text-ink-muted">
                  রিপোর্ট নম্বর: {report.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <h2 id="report-dialog-title" className="mt-3 text-xl font-semibold leading-snug sm:text-2xl">
                {report.title}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-paper-soft hover:text-ink"
              aria-label="বন্ধ করুন"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} aria-hidden="true" />
              {formatDateTimeBn(report.created_at)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} aria-hidden="true" />
              {report.area}
            </span>
            <span>{categoryLabel(report.category)}</span>
          </div>

          <div className="mt-5 rounded-xl border border-line bg-paper-soft/45 p-4">
            <p className="whitespace-pre-wrap text-sm leading-8 text-ink">{report.description}</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-4">
              <p className="text-xs font-semibold text-ink-muted">যোগাযোগের তথ্য</p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <User size={15} className="text-ink-muted" aria-hidden="true" />
                  <span>{report.reporter_name || 'নাম দেওয়া হয়নি'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={15} className="text-ink-muted" aria-hidden="true" />
                  {displayPhone ? (
                    <a href={`tel:${displayPhone}`} className="font-medium text-brand-green underline underline-offset-4">
                      {displayPhone}
                    </a>
                  ) : (
                    <span className="text-ink-muted">মোবাইল নম্বর দেওয়া হয়নি</span>
                  )}
                </p>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-ink-muted">
                এই তথ্য শুধুমাত্র অনুমোদিত অ্যাডমিন দেখতে পারেন।
              </p>
            </div>

            <div className="rounded-xl border border-line p-4">
              <p className="text-xs font-semibold text-ink-muted">স্ট্যাটাস পরিবর্তন</p>
              <div className="mt-3 flex flex-col gap-2">
                <label htmlFor="report-status" className="sr-only">
                  রিপোর্টের স্ট্যাটাস
                </label>
                <select
                  id="report-status"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as ReportStatus)
                    setSaved(false)
                  }}
                  className="field-select min-h-11 text-sm"
                >
                  {REPORT_STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || status === report.status}
                  className="btn-primary min-h-11 px-4 py-2 text-sm"
                >
                  {saving ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      সংরক্ষণ হচ্ছে…
                    </>
                  ) : (
                    <>
                      <Check size={16} aria-hidden="true" />
                      স্ট্যাটাস সংরক্ষণ করুন
                    </>
                  )}
                </button>
                {saved ? <p className="text-xs font-medium text-brand-green">স্ট্যাটাস আপডেট হয়েছে।</p> : null}
              </div>
            </div>
          </div>

          {error ? (
            <Notice tone="error" className="mt-4">
              {error}
            </Notice>
          ) : null}

          {report.image_path ? (
            <div className="mt-5">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-ink-muted">
                <ImageIcon size={15} aria-hidden="true" />
                সংযুক্ত ছবি
              </p>
              {imageLoading ? (
                <div className="skeleton h-48 w-full" aria-label="ছবি লোড হচ্ছে" />
              ) : imageUrl ? (
                <a href={imageUrl} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl border border-line">
                  <img
                    src={imageUrl}
                    alt={`${report.title} — সংযুক্ত ছবি`}
                    className="max-h-80 w-full object-contain bg-paper-soft"
                  />
                  <span className="flex items-center justify-center gap-1.5 border-t border-line bg-paper px-3 py-2 text-xs font-medium text-brand-green">
                    <ExternalLink size={13} aria-hidden="true" />
                    নতুন ট্যাবে খুলুন
                  </span>
                </a>
              ) : (
                <p className="rounded-xl border border-line bg-paper-soft/50 p-4 text-sm text-ink-muted">
                  ছবিটি লোড করা যায়নি।
                </p>
              )}
            </div>
          ) : null}

          <p className="mt-5 border-t border-line/70 pt-4 text-[11px] leading-5 text-ink-muted">
            ব্যক্তিগত তথ্য সুরক্ষিত রাখতে এই রিপোর্টটি শুধুমাত্র অনুমোদিত অ্যাডমিনদের কাছে দেখানো হয়।
            রিপোর্টটি প্রকাশ্যে শেয়ার করবেন না।
          </p>
        </div>
      </div>
    </div>
  )
}
