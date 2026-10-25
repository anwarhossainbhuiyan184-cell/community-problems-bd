import type { Session } from '@supabase/supabase-js'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  REPORT_IMAGE_BUCKET,
  isSupabaseConfigured,
  supabase,
} from '@/lib/supabase'
import { normalizePhoneForStorage } from '@/lib/format'
import type {
  PublicStats,
  Report,
  ReportFilters,
  ReportStatus,
  ReportSubmission,
} from '@/types/report'

export class BackendNotConfiguredError extends Error {
  constructor() {
    super('সার্ভার এখনো কনফিগার করা হয়নি।')
    this.name = 'BackendNotConfiguredError'
  }
}

export class ReportSubmissionError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ReportSubmissionError'
    this.code = code
  }
}

export interface StatsResult {
  configured: boolean
  stats: PublicStats | null
  error: string | null
}

export interface SubmitResult {
  id: string | null
  duplicate: boolean
}

export interface ReportListResult {
  reports: Report[]
  count: number
  error: string | null
}

const emptyStats: PublicStats = {
  total_reports: 0,
  total_submitters: 0,
  received: 0,
  in_progress: 0,
  resolved: 0,
}

function normalizeStats(value: unknown): PublicStats {
  const raw = (Array.isArray(value) ? value[0] : value) as Record<string, unknown> | null
  return {
    total_reports: Number(raw?.total_reports ?? 0),
    total_submitters: Number(raw?.total_submitters ?? 0),
    received: Number(raw?.received ?? 0),
    in_progress: Number(raw?.in_progress ?? 0),
    resolved: Number(raw?.resolved ?? 0),
  }
}

export async function getPublicStats(): Promise<StatsResult> {
  if (!supabase) {
    return { configured: false, stats: emptyStats, error: null }
  }

  const { data, error } = await supabase.rpc('get_public_stats')
  if (error) {
    console.error('Failed to load public statistics:', error)
    return { configured: true, stats: null, error: error.message }
  }

  return { configured: true, stats: normalizeStats(data), error: null }
}

function safeFileName(name: string, mimeType: string) {
  const extension =
    mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'
  const base = name
    .replace(/\.[^.]*$/, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(-70)
  return `${base || 'photo'}.${extension}`
}

export async function submitReport(
  input: ReportSubmission,
  image: File | null,
): Promise<SubmitResult> {
  if (!supabase) throw new BackendNotConfiguredError()

  if (image) {
    if (!ACCEPTED_IMAGE_TYPES.includes(image.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      throw new ReportSubmissionError('শুধুমাত্র JPG, PNG অথবা WebP ছবি সংযুক্ত করুন।', 'IMAGE_TYPE')
    }
    if (image.size > MAX_IMAGE_BYTES) {
      throw new ReportSubmissionError('ছবিটির আকার ৫ মেগাবাইটের কম হতে হবে।', 'IMAGE_SIZE')
    }
  }

  let imagePath: string | null = null

  if (image) {
    const folder = input.clientSubmissionId
    imagePath = `reports/${folder}/${Date.now()}-${safeFileName(image.name, image.type)}`
    const { error: uploadError } = await supabase.storage
      .from(REPORT_IMAGE_BUCKET)
      .upload(imagePath, image, {
        cacheControl: '3600',
        contentType: image.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Image upload failed:', uploadError)
      throw new ReportSubmissionError(
        'ছবিটি আপলোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
        'IMAGE_UPLOAD',
      )
    }
  }

  // Public writes go through a SECURITY DEFINER RPC: anonymous visitors have no
  // direct INSERT policy on public.reports. A null result means this
  // client_submission_id was already stored, so the retry is a duplicate.
  const { data, error } = await supabase.rpc('submit_report', {
    p_title: input.title.trim(),
    p_description: input.description.trim(),
    p_category: input.category,
    p_area: input.area.trim(),
    p_reporter_name: input.reporterName?.trim() || null,
    p_reporter_phone: normalizePhoneForStorage(input.reporterPhone),
    p_image_path: imagePath,
    p_client_submission_id: input.clientSubmissionId,
  })

  if (error) {
    if (imagePath) {
      await supabase.storage.from(REPORT_IMAGE_BUCKET).remove([imagePath])
    }

    console.error('Report submission failed:', error)
    throw new ReportSubmissionError(
      'রিপোর্টটি সংরক্ষণ করা যায়নি। আপনার তথ্য মুছে যায়নি — অনুগ্রহ করে আবার চেষ্টা করুন।',
      error.code,
    )
  }

  if (!data) {
    // The report was already saved in an earlier attempt; the freshly uploaded
    // image is not referenced by any row, so remove the orphan.
    if (imagePath) {
      await supabase.storage.from(REPORT_IMAGE_BUCKET).remove([imagePath])
    }
    return { id: null, duplicate: true }
  }

  return { id: String(data), duplicate: false }
}

export async function signInAdmin(email: string, password: string) {
  if (!supabase) throw new BackendNotConfiguredError()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    const invalidCredentials =
      error.code === 'invalid_credentials' || error.status === 400 || error.status === 401
    throw new ReportSubmissionError(
      invalidCredentials
        ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।'
        : 'সাইন ইন করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।',
      error.code,
    )
  }
}

export async function signOutAdmin() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getAdminSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function checkIsAdmin() {
  if (!supabase) return false
  const { data, error } = await supabase.rpc('is_admin')
  if (error) {
    console.error('Admin check failed:', error)
    return false
  }
  return data === true
}

function sanitizeSearchTerm(value: string) {
  return value.replace(/[%,()]/g, ' ').trim()
}

export async function listReports(
  filters: ReportFilters,
  page: number,
  pageSize: number,
): Promise<ReportListResult> {
  if (!supabase) {
    return { reports: [], count: 0, error: 'সার্ভার কনফিগার করা হয়নি।' }
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  let query = supabase.from('reports').select('*', { count: 'exact' })

  const search = sanitizeSearchTerm(filters.search)
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,area.ilike.%${search}%`,
    )
  }
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.area.trim()) query = query.ilike('area', `%${sanitizeSearchTerm(filters.area)}%`)
  if (filters.dateFrom) query = query.gte('created_at', `${filters.dateFrom}T00:00:00+06:00`)
  if (filters.dateTo) query = query.lte('created_at', `${filters.dateTo}T23:59:59.999+06:00`)

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Failed to load reports:', error)
    return { reports: [], count: 0, error: error.message }
  }

  return { reports: (data ?? []) as Report[], count: count ?? 0, error: null }
}

export async function updateReportStatus(id: string, status: ReportStatus) {
  if (!supabase) throw new BackendNotConfiguredError()
  const { data, error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    console.error('Failed to update report:', error)
    throw new ReportSubmissionError('স্ট্যাটাস আপডেট করা যায়নি।', error.code)
  }

  return data as Report
}

export async function getReportImageUrl(path: string) {
  if (!supabase) return null
  const { data, error } = await supabase.storage
    .from(REPORT_IMAGE_BUCKET)
    .createSignedUrl(path, 60 * 60)

  if (error) {
    console.error('Failed to create signed image URL:', error)
    return null
  }
  return data.signedUrl
}

export async function exportReports(filters: ReportFilters) {
  const pageSize = 1000
  const first = await listReports(filters, 1, pageSize)
  if (first.error) throw new ReportSubmissionError(first.error)

  const reports = [...first.reports]
  const totalPages = Math.ceil(first.count / pageSize)

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await listReports(filters, page, pageSize)
    if (next.error) throw new ReportSubmissionError(next.error)
    reports.push(...next.reports)
  }

  return reports
}

export function isBackendConfigured() {
  return isSupabaseConfigured
}
