import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { site } from '@/content/site'
import { SiteFooter } from '@/components/layout/SiteFooter'

interface PageShellProps {
  children: ReactNode
  wide?: boolean
}

export function PageShell({ children, wide = false }: PageShellProps) {
  const location = useLocation()
  const onSubmitPage = location.pathname.startsWith('/submit')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line/70 bg-paper">
        <div className="container-page flex min-h-16 items-center justify-between gap-4 py-3">
          <Link
            to="/"
            className="inline-flex min-w-0 items-center gap-2.5 font-display text-sm font-semibold text-ink sm:text-lg"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green text-sm text-paper"
              aria-hidden="true"
            >
              আ
            </span>
            <span className="truncate">{site.candidateName}</span>
          </Link>

          <nav aria-label="প্রধান" className="flex shrink-0 items-center gap-1 text-sm">
            <Link to="/" className="btn-ghost">
              হোম
            </Link>
            {!onSubmitPage ? (
              <Link to={site.links.submit} className="btn-ghost text-brand-green">
                সমস্যা জানান
              </Link>
            ) : null}
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        <div className={wide ? 'container-page py-10 sm:py-14' : 'container-narrow py-10 sm:py-14'}>
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
