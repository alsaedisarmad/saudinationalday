// أنواع المحتوى وبوابة العرض (docs/CONTENT_ARCHITECTURE.md). المحتوى بيانات لا مكوّنات.
export type Status = 'verified' | 'needs-review' | 'source-required'
export type Certainty = 'documented' | 'vision'

export interface Source {
  id: string
  title: string
  url?: string
  level: 1 | 2 | 3 | 4 | 5 | 6 // هرم المصادر: 1 = مواد الفريق
  publisher: string
  date?: string // تاريخ النشر/الحدث كما ورد
  accessed?: string
}

export interface Gated {
  status: Status
  sourceIds: string[]
  certainty?: Certainty
  /** ملاحظة داخلية للمراجعة — لا تظهر للزائر */
  note?: string
}

/** وضع المراجعة: يُظهر المواد `needs-review`/`source-required` بشارة واضحة (للفريق فقط). يُفعَّل بـ ?review=1 ويُحفظ في الجلسة. */
export function isReviewMode(): boolean {
  try {
    const q = new URLSearchParams(location.search)
    if (q.has('review')) sessionStorage.setItem('review', q.get('review') === '0' ? '0' : '1')
    const off = sessionStorage.getItem('review') === '0'
    return sessionStorage.getItem('review') === '1' || (!off && (import.meta.env.DEV || import.meta.env.VITE_REVIEW === '1'))
  } catch {
    return false
  }
}

export function visible(g: Gated): boolean {
  if (g.status === 'verified') return true
  return isReviewMode()
}

export function statusLabel(g: Gated): string | null {
  if (g.status === 'verified') return null
  return g.status === 'needs-review' ? 'قيد المراجعة' : 'قيد التوثيق'
}
