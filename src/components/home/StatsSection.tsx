import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Database, MessageSquareText, MapPin, RefreshCw } from 'lucide-react'
import { getPublicStats, type StatsResult } from '@/lib/api'
import { formatNumberBn } from '@/lib/format'
import { site } from '@/content/site'
import { cn } from '@/lib/cn'

interface StatCardProps {
  value: number
  label: string
  icon: ReactNode
  tone: 'green' | 'red'
  loading: boolean
}

function StatCard({ value, label, icon, tone, loading }: StatCardProps) {
  return (
    <div className="card flex flex-col items-center px-6 py-8 text-center sm:px-8">
      <span
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full',
          tone === 'green' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red',
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      {loading ? (
        <span className="skeleton mt-4 block h-14 w-24" aria-hidden="true" />
      ) : (
        <span className="mt-3 block font-display text-5xl font-semibold leading-none text-ink sm:text-6xl">
          {formatNumberBn(value)}
        </span>
      )}
      <span className="mt-3 text-sm font-medium text-ink-muted sm:text-base">{label}</span>
    </div>
  )
}

export function StatsSection() {
  const [result, setResult] = useState<StatsResult | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    setLoading(true)
    const next = await getPublicStats()
    setResult(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  const stats = result?.stats
  const hasError = Boolean(result?.error)
  const configured = result?.configured ?? true
  const totalReports = stats?.total_reports ?? 0
  const showCards = loading || (configured && !hasError)
  const showUnconfigured = !loading && result !== null && !configured
  const showEmpty = !loading && !hasError && configured && totalReports === 0

  return (
    <section className="border-t border-line/60 bg-paper py-16 sm:py-24" aria-labelledby="stats-heading">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">স্বচ্ছতা</p>
          <h2 id="stats-heading" className="mt-4 text-3xl font-semibold sm:text-4xl">
            {site.stats.heading}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-muted sm:text-base">
            {site.stats.description}
          </p>
        </div>

        {showCards ? (
          <div
            className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2"
            aria-busy={loading}
          >
            <StatCard
              value={stats?.total_submitters ?? 0}
              label={site.stats.submittersLabel}
              icon={<MessageSquareText size={20} strokeWidth={1.8} />}
              tone="green"
              loading={loading}
            />
            <StatCard
              value={stats?.total_reports ?? 0}
              label={site.stats.reportsLabel}
              icon={<MapPin size={20} strokeWidth={1.8} />}
              tone="red"
              loading={loading}
            />
          </div>
        ) : null}

        {!loading && !hasError && configured && stats && totalReports > 0 ? (
          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-ink-muted sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow" aria-hidden="true" />
              গৃহীত: {formatNumberBn(stats.received)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red" aria-hidden="true" />
              প্রক্রিয়াধীন: {formatNumberBn(stats.in_progress)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden="true" />
              সমাধান হয়েছে: {formatNumberBn(stats.resolved)}
            </span>
          </div>
        ) : null}

        {showEmpty ? (
          <p className="mx-auto mt-7 max-w-xl text-center text-sm leading-7 text-ink-muted">
            {site.stats.emptyNote}{' '}
            <Link to={site.links.submit} className="font-semibold text-brand-green underline decoration-brand-green/30 underline-offset-4">
              সমস্যা জানান
            </Link>
          </p>
        ) : null}

        {showUnconfigured ? (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-line bg-paper-soft/45 px-6 py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow/20 text-[#7A5A00]">
              <Database size={23} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">পরিসংখ্যান এখনো চালু হয়নি</h3>
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              ডেটাবেস সংযোগ কনফিগার করা হয়নি, তাই কোনো সংখ্যা দেখানো হচ্ছে না। সংযোগ চালু হলে
              এখানে প্রকৃত জমা করা রিপোর্টের পরিসংখ্যান দেখা যাবে।
            </p>
          </div>
        ) : null}

        {hasError ? (
          <div className="mt-7 flex flex-col items-center gap-2 text-center" role="status">
            <p className="text-sm text-ink-muted">পরিসংখ্যান এখন লোড করা যাচ্ছে না।</p>
            <button type="button" onClick={() => void loadStats()} className="btn-ghost">
              <RefreshCw size={15} aria-hidden="true" />
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
