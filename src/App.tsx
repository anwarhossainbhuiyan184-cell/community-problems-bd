import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { Spinner } from '@/components/ui/Spinner'
import HomePage from '@/pages/HomePage'

const SubmitPage = lazy(() => import('@/pages/SubmitPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageFallback() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper text-sm text-ink-muted"
      role="status"
    >
      <Spinner className="h-6 w-6 text-brand-green" />
      লোড হচ্ছে…
    </div>
  )
}

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-paper"
      >
        মূল বিষয়বস্তুতে যান
      </a>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}
