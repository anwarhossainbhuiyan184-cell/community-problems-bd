import { Link } from 'react-router-dom'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { ReportForm } from '@/components/submit/ReportForm'
import { site } from '@/content/site'

export default function SubmitPage() {
  return (
    <PageShell>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition hover:text-brand-green"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        হোমে ফিরুন
      </Link>

      <div className="mt-8 max-w-2xl">
        <p className="eyebrow">আপনার সমস্যা</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
          {site.cta.button}
        </h1>
        <p className="mt-3 text-base leading-8 text-ink-muted">
          আপনার এলাকার সমস্যাটি বিস্তারিত লিখুন। আপনার দেওয়া তথ্য সরাসরি আমাদের কাছে পৌঁছাবে এবং
          শুধুমাত্র অনুমোদিত প্রতিনিধি তা দেখতে পাবেন।
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2 rounded-xl border border-brand-green/20 bg-brand-green/[0.05] px-4 py-3 text-sm text-brand-green-dark">
        <LockKeyhole size={16} className="shrink-0" aria-hidden="true" />
        <p>আপনার নাম ও ফোন নম্বর ঐচ্ছিক। ব্যক্তিগত তথ্য প্রকাশ্যে দেখানো হয় না।</p>
      </div>

      <div className="mt-8">
        <ReportForm />
      </div>

      <p className="mt-8 text-center text-xs leading-6 text-ink-muted">
        কোনো সমস্যা জমা দিতে অসুবিধা হলে স্থানীয় প্রতিনিধির কার্যালয়ে যোগাযোগ করুন।{' '}
        <Link to={site.links.privacy} className="font-medium text-brand-green underline underline-offset-4">
          গোপনীয়তা নীতি
        </Link>
      </p>
    </PageShell>
  )
}
