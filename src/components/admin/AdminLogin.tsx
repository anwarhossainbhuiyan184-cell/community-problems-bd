import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react'
import { signInAdmin } from '@/lib/api'
import { Notice } from '@/components/ui/Notice'
import { Spinner } from '@/components/ui/Spinner'

interface AdminLoginProps {
  onSignedIn: () => void
}

export function AdminLogin({ onSignedIn }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signInAdmin(email.trim(), password)
      onSignedIn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'সাইন ইন করা যায়নি। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
          <ShieldCheck size={24} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">প্রশাসনিক লগইন</h1>
        <p className="mt-2 text-sm leading-7 text-ink-muted">
          শুধুমাত্র অনুমোদিত প্রতিনিধিরা এখানে প্রবেশ করতে পারবেন।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card mt-7 space-y-5 p-6 sm:p-8">
        {error ? <Notice tone="error">{error}</Notice> : null}

        <div>
          <label htmlFor="admin-email" className="field-label">
            ইমেইল
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-input"
            placeholder="admin@example.com"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="field-label">
            পাসওয়ার্ড
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field-input pr-12"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-ink-muted transition hover:text-ink"
              aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <Spinner className="h-5 w-5" />
              সাইন ইন হচ্ছে…
            </>
          ) : (
            <>
              <LogIn size={18} aria-hidden="true" />
              সাইন ইন করুন
            </>
          )}
        </button>

        <p className="text-center text-xs leading-6 text-ink-muted">
          পাবলিক সাইন-আপ বন্ধ রাখুন। নতুন অ্যাডমিন তৈরি করতে Supabase Auth ড্যাশবোর্ড ব্যবহার করুন।
        </p>
      </form>
    </div>
  )
}
