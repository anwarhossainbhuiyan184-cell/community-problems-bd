import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { LogOut, ShieldAlert } from 'lucide-react'
import {
  checkIsAdmin,
  getAdminSession,
  signOutAdmin,
} from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { Spinner } from '@/components/ui/Spinner'

export function AdminGate() {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const currentSession = await getAdminSession()
    setSession(currentSession)

    if (currentSession) {
      const admin = await checkIsAdmin()
      setIsAdmin(admin)
    } else {
      setIsAdmin(false)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()

    const subscription = supabase?.auth.onAuthStateChange(() => {
      // Defer the async Supabase call so we do not block the auth callback.
      setTimeout(() => {
        void refresh()
      }, 0)
    })

    return () => {
      subscription?.data.subscription.unsubscribe()
    }
  }, [refresh])

  async function handleSignOut() {
    await signOutAdmin()
    setSession(null)
    setIsAdmin(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-ink-muted" role="status">
        <Spinner className="h-6 w-6 text-brand-green" />
        লোড হচ্ছে…
      </div>
    )
  }

  if (!session) {
    return <AdminLogin onSignedIn={() => void refresh()} />
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card p-6 text-center sm:p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
            <ShieldAlert size={24} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold">প্রবেশাধিকার নেই</h1>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            এই অ্যাকাউন্টটি অ্যাডমিন হিসেবে নিবন্ধিত নয়। Supabase-এর <code>admins</code> টেবিলে
            আপনার ইউজার আইডি যোগ করা হয়েছে কি না দেখুন।
          </p>
          <button type="button" onClick={() => void handleSignOut()} className="btn-secondary mt-6">
            <LogOut size={17} aria-hidden="true" />
            সাইন আউট
          </button>
        </div>
      </div>
    )
  }

  return <AdminDashboard onSignOut={handleSignOut} />
}
