import { z } from 'zod'
import { REPORT_CATEGORY_VALUES } from '@/types/report'

const bdPhonePattern = /^(?:\+?880|0)1[3-9]\d{8}$/

export const reportSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'শিরোনাম কমপক্ষে ৫ অক্ষরের হতে হবে।')
    .max(120, 'শিরোনাম ১২০ অক্ষরের বেশি হতে পারবে না।'),
  description: z
    .string()
    .trim()
    .min(20, 'সমস্যাটি কমপক্ষে ২০ অক্ষরে বিস্তারিত লিখুন।')
    .max(2000, 'বিবরণ ২০০০ অক্ষরের বেশি হতে পারবে না।'),
  category: z.enum(REPORT_CATEGORY_VALUES, {
    error: 'সমস্যার ধরন নির্বাচন করুন।',
  }),
  area: z
    .string()
    .trim()
    .min(2, 'এলাকার নাম বা মহল্লা লিখুন।')
    .max(80, 'এলাকার নাম ৮০ অক্ষরের বেশি হতে পারবে না।'),
  reporter_name: z
    .string()
    .trim()
    .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।')
    .max(80, 'নাম ৮০ অক্ষরের বেশি হতে পারবে না।')
    .optional()
    .or(z.literal('')),
  reporter_phone: z
    .string()
    .trim()
    .max(20, 'মোবাইল নম্বরটি সঠিকভাবে লিখুন।')
    .refine(
      (value) => !value || bdPhonePattern.test(value.replace(/[\s-]/g, '')),
      'সঠিক বাংলাদেশি মোবাইল নম্বর দিন, যেমন ০১৭XXXXXXXX।',
    )
    .optional()
    .or(z.literal('')),
  // Hidden anti-spam field. Real visitors never fill this in.
  website: z.string().max(0, 'জমা দেওয়া যায়নি।').optional(),
})

export type ReportFormValues = z.infer<typeof reportSchema>

export const emptyReportForm: ReportFormValues = {
  title: '',
  description: '',
  category: '' as ReportFormValues['category'],
  area: '',
  reporter_name: '',
  reporter_phone: '',
  website: '',
}
