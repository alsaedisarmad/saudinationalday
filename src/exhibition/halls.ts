import { visible } from '../content/types'
import { stations } from '../content/timeline'
import { security } from '../content/security'
import { verses } from '../content/quran'
import { murals } from '../content/murals'
import { futureItems } from '../content/future'
import { works } from '../content/students'

export type HallId = 'gate' | 'courtyard' | 'roots' | 'safe' | 'path' | 'land' | 'majlis' | 'values' | 'future' | 'murals' | 'students' | 'challenge' | 'finale' | 'about'
export type HallMode = 'shader2d' | '3d-light' | '2.5d' | 'full3d' | 'ui' | 'points'

export interface HallMeta {
  id: HallId
  /** ترتيب الرحلة الموصى بها (الخيط) — 0 = غير مدرج في الأقواس */
  order: number
  title: string
  kicker: string
  blurb: string
  mode: HallMode
  /** اسم تعليم الضوء في design/tokens.grades */
  grade: string
  /** تظهر القاعة كقوس في الفناء فقط حين يتوفر محتواها الموثّق (لا قاعة فارغة أمام الزائر) */
  ready: () => boolean
}

/** مسار موصى به: الحكاية الأساسية (USER_JOURNEY §2) */
export const halls: HallMeta[] = [
  { id: 'gate', order: 0, title: 'البوابة', kicker: 'البداية', blurb: '', mode: 'shader2d', grade: 'gate', ready: () => true },
  { id: 'courtyard', order: 0, title: 'الفناء', kicker: 'المعرض', blurb: 'أقواس القاعات', mode: '3d-light', grade: 'courtyard', ready: () => true },
  { id: 'roots', order: 1, title: 'الجذور', kicker: 'البيت الحرام', blurb: 'آيات ومعانٍ من مقام إبراهيم', mode: '2.5d', grade: 'roots', ready: () => verses.some(visible) },
  { id: 'safe', order: 2, title: 'بلدًا آمنًا', kicker: 'الأمن', blurb: 'من الدعوة إلى الأمن المسؤولية', mode: '2.5d', grade: 'safe', ready: () => visible(security) || verses.some(visible) },
  { id: 'path', order: 3, title: 'طريق الحكاية', kicker: '١٧٢٧ ← اليوم', blurb: 'محطات على الطريق', mode: '2.5d', grade: 'path', ready: () => stations.filter(visible).length >= 3 },
  { id: 'land', order: 4, title: 'الأرض', kicker: 'المناطق الثلاث عشرة', blurb: 'خريطة تُلمس وتُروى', mode: 'ui', grade: 'land', ready: () => true },
  { id: 'majlis', order: 5, title: 'المجلس', kicker: 'الكرم والتراث', blurb: 'ادخل المجلس والمس ما فيه', mode: 'full3d', grade: 'majlis', ready: () => true },
  { id: 'values', order: 6, title: 'عزّنا بطبعنا', kicker: 'ست قيم', blurb: 'ست بيئات، ست لمسات', mode: '2.5d', grade: 'values', ready: () => true },
  { id: 'future', order: 7, title: 'نحو المستقبل', kicker: 'رؤية ٢٠٣٠', blurb: 'من قيمنا إلى رؤيتنا', mode: '2.5d', grade: 'future', ready: () => futureItems.some(visible) },
  { id: 'murals', order: 8, title: 'الجداريات', kicker: 'من قيمنا إلى رؤيتنا', blurb: 'صفحات المجلة كما ستُعلَّق في المعرض', mode: 'ui', grade: 'murals', ready: () => murals.some(visible) },
  { id: 'students', order: 9, title: 'أعمال الطالبات', kicker: 'إبداع من مدرستنا', blurb: 'لوحات وأعمال فريق المعرض', mode: 'ui', grade: 'students', ready: () => works.some(visible) },
  { id: 'challenge', order: 10, title: 'تحدّي المستكشف', kicker: 'اكتشف', blurb: 'أسئلة من المعرض وبطاقة المستكشف', mode: 'ui', grade: 'challenge', ready: () => true },
  { id: 'finale', order: 11, title: 'النهاية', kicker: 'شكرًا', blurb: 'كلمتك وستةٌ وتسعون نقطة ضوء', mode: 'points', grade: 'finale', ready: () => true },
  { id: 'about', order: 12, title: 'عن المعرض', kicker: 'فريق العمل', blurb: 'من صنع هذه الحكاية', mode: 'ui', grade: 'about', ready: () => true },
]

export const hallById = (id: HallId) => halls.find((h) => h.id === id)!
export const journeyHalls = () => halls.filter((h) => h.order > 0 && h.ready()).sort((a, b) => a.order - b.order)
/** القاعات التي تظهر كأقواس في الفناء (بلا النهاية/عن المعرض: لهما مدخل خاص) */
export const archHalls = () => journeyHalls().filter((h) => h.id !== 'finale' && h.id !== 'about')
