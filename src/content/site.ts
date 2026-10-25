/**
 * Edit the values in this file to update the public content of the website.
 *
 * The candidate's portrait and banner are intentionally empty by default.
 * Add a URL or a file in /public (for example "/images/portrait.jpg") and set
 * the matching value below. The layout has a designed placeholder until then.
 */
export const site = {
  candidateName: 'মোঃ আনোয়ার হোসেন ভূঁইয়া',
  areaName: '', // e.g. "৩ নং ওয়ার্ড, পশ্চিম পাড়া"
  intro: {
    line1: 'আমি মোঃ আনোয়ার হোসেন ভূঁইয়া',
    line2: 'কাজ করতে চাই আপনাদের জন্য',
  },
  slogan: {
    line1: 'আমরা এখানে আছি',
    line2: 'আপনাদের সমস্যা সম্পর্কে জানতে',
  },
  cta: {
    line1: 'আপনাদের সমস্যা সম্পর্কে জানান',
    line2: 'নিচের বাটনে ক্লিক করে',
    button: 'আপনাদের সমস্যা জানান',
  },
  stats: {
    heading: 'এলাকার পরিসংখ্যান',
    description: 'স্বচ্ছতার জন্য সরাসরি জমা করা রিপোর্ট থেকে গণনা করা হয়েছে।',
    submittersLabel: 'সমস্যা জানিয়েছেন',
    reportsLabel: 'এলাকার মোট সমস্যা',
    emptyNote: 'এখনও কোনো সমস্যা জমা পড়েনি। প্রথম সমস্যাটি আপনিই জানান।',
  },
  portraitImage: '', // recommended: portrait with a 4:5 aspect ratio
  portraitAlt: 'মোঃ আনোয়ার হোসেন ভূঁইয়ার প্রতিকৃতি',
  bannerImage: '', // optional painted banner artwork; SVG artwork is used when empty
  contact: {
    phone: '', // optional, e.g. "017XXXXXXXX"
    email: '', // optional, e.g. "contact@example.com"
  },
  privacy: {
    summary:
      'আপনার নাম ও ফোন নম্বর ঐচ্ছিক। জমা দেওয়া তথ্য শুধুমাত্র অনুমোদিত প্রতিনিধি দেখতে পারেন এবং তা সমস্যা সমাধানের কাজে ব্যবহার করা হয়।',
    retention:
      'রিপোর্টগুলো সমস্যা সমাধান ও এলাকার পরিসংখ্যান সংরক্ষণের প্রয়োজনে রাখা হয়। আপনি চাইলে আপনার রিপোর্ট মুছে ফেলার অনুরোধ করতে পারেন।',
  },
  links: {
    admin: '/admin',
    privacy: '/privacy',
    submit: '/submit',
  },
} as const
