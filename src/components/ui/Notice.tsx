import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/cn'

type NoticeTone = 'error' | 'success' | 'info'

interface NoticeProps {
  tone?: NoticeTone
  title?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

const toneStyles: Record<NoticeTone, string> = {
  error: 'border-brand-red/25 bg-brand-red/[0.06] text-brand-red-dark',
  success: 'border-brand-green/25 bg-brand-green/[0.07] text-brand-green-dark',
  info: 'border-line bg-paper-soft/70 text-ink',
}

const icons: Record<NoticeTone, ReactNode> = {
  error: <AlertCircle size={18} aria-hidden="true" />,
  success: <CheckCircle2 size={18} aria-hidden="true" />,
  info: <Info size={18} aria-hidden="true" />,
}

export function Notice({ tone = 'info', title, children, className, action }: NoticeProps) {
  return (
    <div
      className={cn('flex items-start gap-3 rounded-xl border p-4 text-sm leading-6', toneStyles[tone], className)}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <span className="mt-0.5 shrink-0">{icons[tone]}</span>
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={cn(title && 'mt-1', 'text-current/90')}>{children}</div>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  )
}
