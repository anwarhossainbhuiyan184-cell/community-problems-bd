import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Send,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import {
  BackendNotConfiguredError,
  ReportSubmissionError,
  isBackendConfigured,
  submitReport,
  type SubmitResult,
} from '@/lib/api'
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/supabase'
import { formatNumberBn, shortReportId } from '@/lib/format'
import { createUuid } from '@/lib/id'
import { emptyReportForm, reportSchema, type ReportFormValues } from '@/lib/validation'
import { REPORT_CATEGORIES } from '@/types/report'
import { site } from '@/content/site'
import { cn } from '@/lib/cn'
import { Notice } from '@/components/ui/Notice'
import { Spinner } from '@/components/ui/Spinner'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="field-error">
      <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  )
}

function describedBy(...ids: Array<string | false | undefined>) {
  return ids.filter(Boolean).join(' ') || undefined
}

export function ReportForm() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<SubmitResult | null>(null)
  const [submissionId, setSubmissionId] = useState(() => createUuid())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: emptyReportForm,
    mode: 'onTouched',
  })

  const titleLength = watch('title')?.length ?? 0
  const descriptionLength = watch('description')?.length ?? 0

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function acceptImage(file: File | undefined) {
    setImageError(null)
    if (!file) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      setImageError('শুধুমাত্র JPG, PNG অথবা WebP ছবি সংযুক্ত করুন।')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('ছবিটির আকার ৫ মেগাবাইটের কম হতে হবে।')
      return
    }

    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setPreviewUrl(null)
    setImageError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    acceptImage(event.target.files?.[0])
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    acceptImage(event.dataTransfer.files?.[0])
  }

  async function onSubmit(values: ReportFormValues) {
    setSubmitError(null)

    if (!isBackendConfigured()) {
      setSubmitError(
        'অনলাইন জমা নেওয়ার ব্যবস্থা এখনো চালু হয়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
      )
      return
    }

    try {
      const result = await submitReport(
        {
          title: values.title,
          description: values.description,
          category: values.category,
          area: values.area,
          reporterName: values.reporter_name || undefined,
          reporterPhone: values.reporter_phone || undefined,
          clientSubmissionId: submissionId,
        },
        imageFile,
      )
      setSuccess(result)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      if (error instanceof BackendNotConfiguredError) {
        setSubmitError(
          'অনলাইন জমা নেওয়ার ব্যবস্থা এখনো চালু হয়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
        )
      } else if (error instanceof ReportSubmissionError) {
        setSubmitError(error.message)
      } else {
        console.error('Unexpected submission error:', error)
        setSubmitError(
          'রিপোর্টটি জমা দেওয়া যায়নি। আপনার তথ্য মুছে যায়নি — অনুগ্রহ করে আবার চেষ্টা করুন।',
        )
      }
    }
  }

  function startAnother() {
    setSuccess(null)
    setSubmitError(null)
    setSubmissionId(createUuid())
    reset(emptyReportForm)
    removeImage()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (success) {
    return (
      <div className="card overflow-hidden">
        <div className="bg-brand-green/[0.06] px-6 py-12 text-center sm:px-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-paper">
            <CheckCircle2 size={34} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl font-semibold sm:text-3xl">
            {success.duplicate ? 'এই রিপোর্টটি আগেই জমা হয়েছে' : 'আপনার সমস্যাটি জমা হয়েছে'}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-ink-muted sm:text-base">
            {success.duplicate
              ? 'আপনার এই রিপোর্টটি ইতিমধ্যে আমাদের কাছে পৌঁছেছে। আলাদা করে আবার জমা দেওয়ার প্রয়োজন নেই।'
              : 'ধন্যবাদ। আপনার রিপোর্টটি সফলভাবে আমাদের কাছে পৌঁছেছে। প্রয়োজনে আমরা এটি যাচাই করে ব্যবস্থা নেওয়ার চেষ্টা করব।'}
          </p>
          {success.id ? (
            <p className="mt-4 inline-flex rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink">
              রিপোর্ট নম্বর: <span className="ml-2 font-body tracking-wide">{shortReportId(success.id)}</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-center sm:p-8">
          <button type="button" onClick={startAnother} className="btn-primary">
            আরেকটি সমস্যা জানান
          </button>
          <Link to="/" className="btn-secondary">
            হোমে ফিরুন
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {!isBackendConfigured() ? (
        <Notice tone="info" title="অনলাইন জমা এখনো চালু হয়নি">
          সাইটটি প্রস্তুত, তবে ডেটাবেস সংযোগ এখনো কনফিগার করা হয়নি। ফর্মটি পূরণ করে দেখতে পারেন;
          জমা দেওয়ার জন্য প্রশাসকের সাথে যোগাযোগ করুন।
          {import.meta.env.DEV ? (
            <span className="mt-2 block text-xs leading-6 text-ink-muted">
              ডেভেলপার: <code>.env</code>-এ <code>VITE_SUPABASE_URL</code> ও{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> যোগ করুন এবং Supabase মাইগ্রেশন চালান।
            </span>
          ) : null}
        </Notice>
      ) : null}

      {submitError ? (
        <Notice tone="error" title="জমা দেওয়া যায়নি">
          {submitError}
        </Notice>
      ) : null}

      <section className="space-y-6" aria-labelledby="problem-details-heading">
        <div>
          <p className="eyebrow">ধাপ ০১</p>
          <h2 id="problem-details-heading" className="mt-3 text-xl font-semibold sm:text-2xl">
            সমস্যার বিবরণ
          </h2>
          <p className="mt-2 text-sm leading-7 text-ink-muted">
            সমস্যাটি যত স্পষ্টভাবে লিখবেন, তত দ্রুত ব্যবস্থা নেওয়া সহজ হবে।
          </p>
        </div>

        <div>
          <label htmlFor="title" className="field-label">
            সমস্যার শিরোনাম <span className="text-brand-red">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className="field-input"
            placeholder="যেমন: প্রধান রাস্তায় বড় গর্ত"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={describedBy('title-hint', errors.title && 'title-error')}
            autoComplete="off"
          />
          <div className="mt-1.5 flex items-start justify-between gap-4">
            <p id="title-hint" className="field-hint">
              সংক্ষেপে সমস্যাটি কী, তা লিখুন।
            </p>
            <span className="shrink-0 text-xs tabular-nums text-ink-muted">
              {formatNumberBn(titleLength)}/{formatNumberBn(120)}
            </span>
          </div>
          <FieldError id="title-error" message={errors.title?.message} />
        </div>

        <div>
          <label htmlFor="description" className="field-label">
            সমস্যার বিস্তারিত বিবরণ <span className="text-brand-red">*</span>
          </label>
          <textarea
            id="description"
            {...register('description')}
            className="field-textarea"
            placeholder="সমস্যাটি কোথায়, কতদিন ধরে আছে এবং কী ধরনের সমস্যা হচ্ছে—বিস্তারিত লিখুন।"
            rows={6}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={describedBy('description-hint', errors.description && 'description-error')}
          />
          <div className="mt-1.5 flex items-start justify-between gap-4">
            <p id="description-hint" className="field-hint">
              কমপক্ষে ২০ অক্ষর লিখুন। ব্যক্তিগত ঠিকানা বা জাতীয় পরিচয়পত্রের নম্বর দেবেন না।
            </p>
            <span className="shrink-0 text-xs tabular-nums text-ink-muted">
              {formatNumberBn(descriptionLength)}/{formatNumberBn(2000)}
            </span>
          </div>
          <FieldError id="description-error" message={errors.description?.message} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="field-label">
              সমস্যার ধরন <span className="text-brand-red">*</span>
            </label>
            <select
              id="category"
              {...register('category')}
              className="field-select"
              aria-invalid={Boolean(errors.category)}
              aria-describedby={describedBy(errors.category && 'category-error')}
            >
              <option value="" disabled>
                নির্বাচন করুন
              </option>
              {REPORT_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <FieldError id="category-error" message={errors.category?.message} />
          </div>

          <div>
            <label htmlFor="area" className="field-label">
              এলাকার নাম / মহল্লা <span className="text-brand-red">*</span>
            </label>
            <input
              id="area"
              type="text"
              {...register('area')}
              className="field-input"
              placeholder="যেমন: ৩ নং ওয়ার্ড, পশ্চিম পাড়া"
              aria-invalid={Boolean(errors.area)}
              aria-describedby={describedBy('area-hint', errors.area && 'area-error')}
              autoComplete="off"
            />
            <p id="area-hint" className="field-hint">
              নির্দিষ্ট ঠিকানা নয়, শুধু এলাকার নাম লিখুন।
            </p>
            <FieldError id="area-error" message={errors.area?.message} />
          </div>
        </div>
      </section>

      <div className="border-t border-line/70" />

      <section className="space-y-4" aria-labelledby="photo-heading">
        <div>
          <p className="eyebrow">ধাপ ০২</p>
          <h2 id="photo-heading" className="mt-3 text-xl font-semibold sm:text-2xl">
            ছবি সংযুক্ত করুন <span className="font-body text-sm font-medium text-ink-muted">(ঐচ্ছিক)</span>
          </h2>
          <p className="mt-2 text-sm leading-7 text-ink-muted">
            সমস্যাটি বোঝাতে সাহায্য করে এমন একটি ছবি যোগ করতে পারেন। ছবিতে মানুষ বা ব্যক্তিগত তথ্য
            থাকলে তা এড়িয়ে চলুন।
          </p>
        </div>

        <div
          className={cn(
            'rounded-2xl border-2 border-dashed p-4 transition sm:p-6',
            imageError
              ? 'border-brand-red/40 bg-brand-red/[0.03]'
              : 'border-line bg-paper-soft/35 hover:border-brand-green/45',
          )}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            id="report-image"
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={handleFileChange}
            className="sr-only"
            aria-describedby={describedBy('image-hint', Boolean(imageError) && 'image-error')}
          />

          {previewUrl ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-line bg-paper">
                <img
                  src={previewUrl}
                  alt="সংযুক্ত ছবির প্রিভিউ"
                  className="h-44 w-full object-cover sm:h-56"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium text-ink">
                  {imageFile?.name}
                  <span className="ml-2 text-xs font-normal text-ink-muted">
                    ({formatNumberBn(Math.max(1, Math.round((imageFile?.size ?? 0) / 1024)))} KB)
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="report-image"
                    className="btn-ghost cursor-pointer text-brand-green"
                  >
                    অন্য ছবি
                  </label>
                  <button type="button" onClick={removeImage} className="btn-ghost text-brand-red">
                    <Trash2 size={15} aria-hidden="true" />
                    মুছে ফেলুন
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <label
              htmlFor="report-image"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl px-3 py-6 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                <ImagePlus size={22} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="mt-1 font-semibold text-ink">ছবি বেছে নিন</span>
              <span className="mt-2 text-sm font-semibold text-brand-green underline decoration-brand-green/30 underline-offset-4">
                ফাইল নির্বাচন করুন
              </span>
            </label>
          )}

          <p id="image-hint" className="mt-2 text-center text-xs leading-5 text-ink-muted">
            ঐচ্ছিক · JPG, PNG বা WebP · সর্বোচ্চ ৫ MB
          </p>

          {imageError ? (
            <p id="image-error" className="field-error justify-center">
              <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              {imageError}
            </p>
          ) : null}
        </div>
      </section>

      <div className="border-t border-line/70" />

      <section className="space-y-5" aria-labelledby="contact-heading">
        <div>
          <p className="eyebrow">ধাপ ০৩</p>
          <h2 id="contact-heading" className="mt-3 text-xl font-semibold sm:text-2xl">
            আপনার তথ্য <span className="font-body text-sm font-medium text-ink-muted">(ঐচ্ছিক)</span>
          </h2>
          <p className="mt-2 text-sm leading-7 text-ink-muted">
            যোগাযোগের জন্য নাম ও মোবাইল নম্বর দিতে পারেন। এগুলো প্রকাশ্যে দেখানো হয় না।
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="reporter_name" className="field-label">
              আপনার নাম <span className="font-normal text-ink-muted">(ঐচ্ছিক)</span>
            </label>
            <input
              id="reporter_name"
              type="text"
              {...register('reporter_name')}
              className="field-input"
              placeholder="আপনার নাম"
              aria-invalid={Boolean(errors.reporter_name)}
              aria-describedby={describedBy(errors.reporter_name && 'name-error')}
              autoComplete="name"
            />
            <FieldError id="name-error" message={errors.reporter_name?.message} />
          </div>

          <div>
            <label htmlFor="reporter_phone" className="field-label">
              মোবাইল নম্বর <span className="font-normal text-ink-muted">(ঐচ্ছিক)</span>
            </label>
            <input
              id="reporter_phone"
              type="tel"
              inputMode="tel"
              {...register('reporter_phone')}
              className="field-input"
              placeholder="01XXXXXXXXX"
              aria-invalid={Boolean(errors.reporter_phone)}
              aria-describedby={describedBy('phone-hint', errors.reporter_phone && 'phone-error')}
              autoComplete="tel"
            />
            <p id="phone-hint" className="field-hint">
              শুধুমাত্র প্রয়োজনে যোগাযোগের জন্য।
            </p>
            <FieldError id="phone-error" message={errors.reporter_phone?.message} />
          </div>
        </div>

        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">ওয়েবসাইট</label>
          <input id="website" type="text" {...register('website')} tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-line bg-paper-soft/45 p-4 text-sm leading-7 text-ink-muted">
          <ShieldCheck size={19} className="mt-1 shrink-0 text-brand-green" aria-hidden="true" />
          <p>
            {site.privacy.summary}{' '}
            <Link
              to={site.links.privacy}
              className="font-semibold text-brand-green underline decoration-brand-green/30 underline-offset-4"
            >
              গোপনীয়তা নীতি
            </Link>
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t border-line/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-6 text-ink-muted">
          জমা দেওয়ার মাধ্যমে আপনি আমাদের গোপনীয়তা নীতিতে সম্মত হচ্ছেন।
        </p>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto sm:min-w-[240px]">
          {isSubmitting ? (
            <>
              <Spinner className="h-5 w-5" />
              পাঠানো হচ্ছে…
            </>
          ) : (
            <>
              {site.cta.button}
              <Send size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
