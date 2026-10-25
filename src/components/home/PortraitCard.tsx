import { cn } from '@/lib/cn'
import { site } from '@/content/site'

interface PortraitCardProps {
  className?: string
}

function PortraitPlaceholder() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_18%,#FCF5E7_0%,#F1E5CD_58%,#E9D9BC_100%)]">
      <svg
        viewBox="0 0 400 500"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M62 454V258c0-80 62-144 138-144s138 64 138 144v196"
          fill="none"
          stroke="#D6C3A0"
          strokeWidth="2"
        />
        <path
          d="M62 454h276"
          stroke="#D6C3A0"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="200" cy="225" r="64" fill="#D6C3A0" opacity="0.55" />
        <path
          d="M104 454c0-86 43-136 96-136s96 50 96 136"
          fill="#D6C3A0"
          opacity="0.55"
        />
        <path
          d="M110 454c0-86 40-136 90-136s90 50 90 136"
          fill="none"
          stroke="#C7B18A"
          strokeWidth="2"
          opacity="0.6"
        />
      </svg>
      <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-full border border-line/80 bg-paper/85 px-3 py-1 text-[11px] font-medium text-ink-muted">
        প্রার্থীর ছবি
      </span>
      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-display text-5xl font-semibold text-brand-green/25">
        আ
      </span>
    </div>
  )
}

export function PortraitCard({ className }: PortraitCardProps) {
  return (
    <figure className={cn('relative', className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] border border-line bg-paper-soft shadow-lift">
        {site.portraitImage ? (
          <img
            src={site.portraitImage}
            alt={site.portraitAlt}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        ) : (
          <PortraitPlaceholder />
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-1.5 bg-[linear-gradient(90deg,#D6283E_0%,#D6283E_33%,#F4B400_33%,#F4B400_66%,#0F6B4F_66%,#0F6B4F_100%)]"
          aria-hidden="true"
        />
      </div>
      <figcaption className="mt-3 text-center text-xs font-medium leading-5 text-ink-muted">
        {site.portraitImage ? site.portraitAlt : 'প্রার্থীর ছবি — এখানে আপনার আসল ছবি যুক্ত করুন'}
      </figcaption>
    </figure>
  )
}
