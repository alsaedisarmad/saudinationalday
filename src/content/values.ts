import type { Gated } from './types'

/** القيم الست كما وردت في واس (N2642350) — ترتيب الوكالة، مطابقة لمادة الفريق */
export interface Value extends Gated {
  id: 'courage' | 'vision' | 'authenticity' | 'ambition' | 'giving' | 'generosity'
  word: string
  phrase: string
}
const v = (id: Value['id'], word: string, phrase: string): Value => ({ id, word, phrase, status: 'verified', sourceIds: ['spa-identity-2026', 'team-text'] })
export const values: Value[] = [
  v('courage', 'الشجاعة', 'عزّنا بشجاعتنا'),
  v('vision', 'الرؤية', 'عزّنا برؤيتنا'),
  v('authenticity', 'الأصالة', 'عزّنا بأصالتنا'),
  v('ambition', 'الهمّة', 'عزّنا بهمّتنا'),
  v('giving', 'الجود', 'عزّنا بجودنا'),
  v('generosity', 'الكرم', 'عزّنا بكرمنا'),
]

export const identity = {
  slogan: 'عزّنا بطبعنا',
  title: 'السعودية... حكاية وطن',
  dateLabel: '٢٣ سبتمبر',
  attribution: 'اليوم الوطني السعودي — هوية «عزّنا بطبعنا» أعلنتها الهيئة العامة للترفيه',
  sourceIds: ['spa-identity-2026'],
}
