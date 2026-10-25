import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { site } from '@/content/site'

export default function PrivacyPage() {
  return (
    <PageShell>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition hover:text-brand-green"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        হোমে ফিরুন
      </Link>

      <div className="mt-8">
        <p className="eyebrow">স্বচ্ছতা</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">গোপনীয়তা নীতি</h1>
        <p className="mt-3 text-base leading-8 text-ink-muted">
          এই প্ল্যাটফর্মটি এলাকার মানুষের সমস্যা সংগ্রহ ও সমাধানের জন্য তৈরি। নিচে সংক্ষেপে বলা হলো
          কী তথ্য সংগ্রহ করা হয়, কেন করা হয় এবং কে তা দেখতে পারেন।
        </p>
      </div>

      <div className="prose-bn mt-10">
        <h2>আমরা কী তথ্য সংগ্রহ করি</h2>
        <p>
          সমস্যার শিরোনাম, বিবরণ, ধরন, এলাকার নাম, ঐচ্ছিক ছবি এবং আপনার দেওয়া ঐচ্ছিক নাম ও মোবাইল
          নম্বর সংগ্রহ করা হয়। জাতীয় পরিচয়পত্রের নম্বর, সঠিক বাসার ঠিকানা বা অন্য অপ্রয়োজনীয়
          সংবেদনশীল তথ্য আমরা চাই না।
        </p>

        <h2>তথ্য কেন ব্যবহার করা হয়</h2>
        <p>
          জমা দেওয়া রিপোর্ট এলাকার সমস্যাগুলো বুঝতে, অগ্রাধিকার নির্ধারণ করতে এবং প্রয়োজন অনুযায়ী
          ব্যবস্থা নিতে ব্যবহার করা হয়। রিপোর্ট থেকে শুধুমাত্র সমষ্টিগত পরিসংখ্যান প্রকাশ্যে দেখানো
          হয়; কোনো ব্যক্তির নাম, ফোন নম্বর বা সম্পূর্ণ রিপোর্ট প্রকাশ্যে দেখানো হয় না।
        </p>

        <h2>কে তথ্য দেখতে পারেন</h2>
        <p>
          সম্পূর্ণ রিপোর্ট এবং যোগাযোগের তথ্য শুধুমাত্র অনুমোদিত প্রতিনিধি দেখতে পারেন। ডেটাবেস
          অ্যাক্সেস নিয়ন্ত্রণ (Row Level Security) দিয়ে এই সীমাবদ্ধতা কার্যকর করা হয়, শুধু বাটন
          লুকিয়ে রাখা হয় না।
        </p>

        <h2>তথ্য কতদিন রাখা হয়</h2>
        <p>{site.privacy.retention}</p>

        <h2>আপনার অধিকার</h2>
        <p>
          আপনি আপনার জমা দেওয়া রিপোর্ট সম্পর্কে জানতে, তা সংশোধন করতে বা মুছে ফেলার অনুরোধ করতে
          পারেন। এ জন্য স্থানীয় প্রতিনিধির কার্যালয়ে যোগাযোগ করুন
          {site.contact.phone ? (
            <>
              {' '}
              অথবা <span className="font-medium text-ink">{site.contact.phone}</span> নম্বরে কল করুন
            </>
          ) : null}
          {site.contact.email ? (
            <>
              {' '}
              অথবা{' '}
              <a href={`mailto:${site.contact.email}`} className="font-medium text-brand-green underline underline-offset-4">
                {site.contact.email}
              </a>{' '}
              ঠিকানায় ইমেইল করুন
            </>
          ) : null}
          {'।'}
        </p>

        <h2>ছবি ও নিরাপত্তা</h2>
        <p>
          ঐচ্ছিক ছবি শুধুমাত্র JPG, PNG বা WebP ফরম্যাটে এবং সর্বোচ্চ ৫ মেগাবাইট আকারে গ্রহণ করা হয়।
          ছবিগুলো একটি ব্যক্তিগত স্টোরেজে রাখা হয়; সাধারণ ব্যবহারকারীরা সেগুলো সরাসরি দেখতে পারেন না।
        </p>

        <p className="mt-8 rounded-xl border border-line bg-paper-soft/50 p-4 text-sm">
          এই নীতিটি সংক্ষিপ্ত এবং বোঝার সুবিধার জন্য লেখা। সাইটটি চালু করার আগে স্থানীয় আইন ও
          প্রয়োজনের সাথে মিলিয়ে চূড়ান্ত করতে হবে।
        </p>
      </div>
    </PageShell>
  )
}
