const bengaliNumber = new Intl.NumberFormat('bn-BD')
const bengaliYear = new Intl.NumberFormat('bn-BD', { useGrouping: false })

export function formatNumberBn(value: number) {
  return bengaliNumber.format(value)
}

export function formatYearBn(value: number) {
  return bengaliYear.format(value)
}

export function formatDateBn(iso: string) {
  try {
    return new Intl.DateTimeFormat('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function formatDateTimeBn(iso: string) {
  try {
    return new Intl.DateTimeFormat('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function shortReportId(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

export function normalizePhoneForStorage(phone: string | undefined | null) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('880')) return `+${digits}`
  if (digits.startsWith('0')) return `+880${digits.slice(1)}`
  return `+880${digits}`
}

export function normalizePhoneForDisplay(phone: string | null) {
  if (!phone) return ''
  return phone.replace(/^\+880/, '0')
}
