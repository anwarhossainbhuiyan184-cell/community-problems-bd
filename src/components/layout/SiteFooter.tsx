import { Link } from 'react-router-dom'
import { site } from '@/content/site'
import { formatYearBn } from '@/lib/format'

export function SiteFooter() {
  const year = formatYearBn(new Date().getFullYear())

  return (
    <footer className="border-t border-line/70 bg-paper py-10">
      <div className="container-page flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5 font-display text-lg font-semibold text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-green text-sm text-paper" aria-hidden="true">
              আ
            </span>
            {site.candidateName}
          </Link>
          <p className="mt-2 text-sm text-ink-muted">স্থানীয় জনসেবা উদ্যোগ</p>
        </div>

        <nav aria-label="ফুটার" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link to={site.links.submit} className="text-ink-muted transition hover:text-brand-green">
            সমস্যা জানান
          </Link>
          <Link to={site.links.privacy} className="text-ink-muted transition hover:text-brand-green">
            গোপনীয়তা
          </Link>
          <Link to={site.links.admin} className="text-ink-muted/75 transition hover:text-brand-green">
            প্রশাসন
          </Link>
        </nav>
      </div>

      <div className="container-page mt-7 border-t border-line/60 pt-5">
        <p className="text-xs leading-6 text-ink-muted">
          © {year} {site.candidateName}। এই ওয়েবসাইটটি এলাকার সমস্যা সংগ্রহ ও জনসেবার জন্য তৈরি।
        </p>
      </div>
    </footer>
  )
}
