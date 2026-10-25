import { Link } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'

export default function NotFoundPage() {
  return (
    <PageShell>
      <div className="py-16 text-center sm:py-24">
        <p className="font-display text-7xl font-semibold text-brand-green/20 sm:text-8xl">৪০৪</p>
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">পেজটি খুঁজে পাওয়া যায়নি</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-ink-muted">
          আপনি যে পেজটি খুঁজছেন সেটি সরানো হয়েছে অথবা ঠিকানাটি ভুল। হোমে ফিরে আবার চেষ্টা করুন।
        </p>
        <Link to="/" className="btn-primary mt-7">
          হোমে ফিরুন
        </Link>
      </div>
    </PageShell>
  )
}
