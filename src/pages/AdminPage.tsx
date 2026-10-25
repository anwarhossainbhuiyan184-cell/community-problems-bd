import { Link } from 'react-router-dom'
import { ArrowLeft, Database, KeyRound } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { AdminGate } from '@/components/admin/AdminGate'
import { isBackendConfigured } from '@/lib/api'
import { Notice } from '@/components/ui/Notice'

function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition hover:text-brand-green"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        হোমে ফিরুন
      </Link>

      <div className="card mt-8 p-6 sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow/20 text-[#7A5A00]">
          <Database size={24} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">অ্যাডমিন প্যানেল প্রস্তুত নয়</h1>
        <p className="mt-3 text-sm leading-7 text-ink-muted">
          অ্যাডমিন ড্যাশবোর্ড ব্যবহার করতে Supabase সংযোগ এবং ডেটাবেস মাইগ্রেশন সম্পন্ন করতে হবে।
          নিচের ধাপগুলো একবার সম্পন্ন করলেই এই পেজটি সক্রিয় হবে।
        </p>

        <div className="mt-6 space-y-4 text-sm leading-7">
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-soft text-xs font-semibold">১</span>
            <p>
              <code className="rounded bg-paper-soft px-1.5 py-0.5">.env</code> ফাইলে{' '}
              <code className="rounded bg-paper-soft px-1.5 py-0.5">VITE_SUPABASE_URL</code> এবং{' '}
              <code className="rounded bg-paper-soft px-1.5 py-0.5">VITE_SUPABASE_ANON_KEY</code> যোগ করুন।
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-soft text-xs font-semibold">২</span>
            <p>
              <code className="rounded bg-paper-soft px-1.5 py-0.5">supabase/migrations</code>-এর SQL ফাইলটি
              Supabase SQL Editor-এ চালান।
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-soft text-xs font-semibold">৩</span>
            <p>
              Supabase Auth-এ একটি অ্যাডমিন ইউজার তৈরি করুন এবং তার UUID{' '}
              <code className="rounded bg-paper-soft px-1.5 py-0.5">public.admins</code> টেবিলে যোগ করুন।
            </p>
          </div>
        </div>

        <Notice tone="info" className="mt-6">
          বিস্তারিত ধাপ ও নিরাপত্তা নির্দেশনা প্রজেক্টের <code>README.md</code>-তে আছে।
        </Notice>

        <div className="mt-6 flex items-center gap-2 text-xs text-ink-muted">
          <KeyRound size={14} aria-hidden="true" />
          কখনোই service-role key ব্রাউজার কোডে বা <code>VITE_</code> ভেরিয়েবলে রাখবেন না।
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <PageShell wide>
      {isBackendConfigured() ? <AdminGate /> : <SetupNotice />}
    </PageShell>
  )
}
