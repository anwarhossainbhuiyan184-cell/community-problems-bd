import { cn } from '@/lib/cn'
import { site } from '@/content/site'

interface BrushBannerProps {
  className?: string
}

export function BrushBanner({ className }: BrushBannerProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-x-0 top-0 overflow-hidden', className)} aria-hidden="true">
      <img
        src={site.bannerImage || '/banner.svg'}
        alt=""
        className="h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-paper sm:h-32" />
      <div className="paper-grain absolute inset-0 opacity-[0.035] mix-blend-multiply" />
    </div>
  )
}
