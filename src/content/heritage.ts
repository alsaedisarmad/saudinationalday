import type { Gated } from './types'
import sums from './generated/heritage-summaries.json'

/** مواقع التراث العالمي — UNESCO WHC (صفحة الدولة الطرف، قُرئت 2026-09-19؛ تسجيلات 2025/2026 غير مؤكدة) */
export interface WhcSite extends Gated {
  id: string
  nameAr: string
  nameEn: string
  year: number
  kind: 'ثقافي' | 'طبيعي'
  /** المنطقة الإدارية: اجتهاد بحثي (research/01 R-UNESCO-1) — يُراجَع مع هيئة التراث */
  regionId?: string
  regionNote?: string
  summary?: string
}

const whc = (o: Omit<WhcSite, 'status' | 'sourceIds'>): WhcSite => ({ ...o, status: 'verified', sourceIds: ['unesco-whc-sa'] })
export const whcSites: WhcSite[] = [
  whc({ id: 'hegra', nameAr: 'موقع الحِجر الأثري (مدائن صالح)', nameEn: 'Hegra Archaeological Site (al-Hijr / Madā’in Ṣāliḥ)', year: 2008, kind: 'ثقافي', regionId: 'madinah' }),
  whc({ id: 'at-turaif', nameAr: 'حي الطريف في الدرعية', nameEn: 'At-Turaif District in ad-Dir’iyah', year: 2010, kind: 'ثقافي', regionId: 'riyadh' }),
  whc({ id: 'jeddah', nameAr: 'جدة التاريخية، بوابة مكة المكرمة', nameEn: 'Historic Jeddah, the Gate to Makkah', year: 2014, kind: 'ثقافي', regionId: 'makkah' }),
  whc({ id: 'hail-rock-art', nameAr: 'الفن الصخري في منطقة حائل', nameEn: 'Rock Art in the Hail Region of Saudi Arabia', year: 2015, kind: 'ثقافي', regionId: 'hail' }),
  whc({ id: 'al-ahsa', nameAr: 'واحة الأحساء', nameEn: 'Al-Ahsa Oasis, an Evolving Cultural Landscape', year: 2018, kind: 'ثقافي', regionId: 'eastern' }),
  whc({ id: 'hima', nameAr: 'منطقة حِمى الثقافية', nameEn: 'Ḥimā Cultural Area', year: 2021, kind: 'ثقافي', regionId: 'najran' }),
  whc({ id: 'uruq', nameAr: 'عروق بني معارض', nameEn: '’Uruq Bani Ma’arid', year: 2023, kind: 'طبيعي' }),
  whc({ id: 'al-faw', nameAr: 'المشهد الثقافي لمنطقة الفاو الأثرية', nameEn: 'The Cultural Landscape of Al-Faw Archaeological Area', year: 2024, kind: 'ثقافي', regionId: 'riyadh' }),
]

/** التراث الثقافي غير المادي — القائمة التمثيلية (UNESCO ICH، صفحة المملكة قُرئت 2026-09-19) */
export interface IchElement extends Gated {
  id: string
  nameAr: string
  nameEn: string
  year: number
  /** ملف مشترك مع دول أخرى؟ true/false/undefined=غير مُتحقَّق */
  shared?: boolean
  /** عدد الدول المقدِّمة للملف كما تعرضه صفحة اليونسكو (منها المملكة) */
  states?: number
  summary?: string
}
const ich = (o: Omit<IchElement, 'status' | 'sourceIds'>, extra: string[] = []): IchElement => ({ ...o, status: 'verified', sourceIds: ['unesco-ich-sa', ...extra] })
export const ichElements: IchElement[] = [
  ich({ id: 'sadu', nameAr: 'السدو: النسيج التقليدي', nameEn: 'Traditional weaving of Al Sadu', year: 2025 }, ['unesco-ich-sadu']),
  ich({ id: 'bisht', nameAr: 'البشت الرجالي: المهارات والممارسات', nameEn: 'Bisht (men’s Abaa): skills and practices', year: 2025 }),
  ich({ id: 'kohl', nameAr: 'الكحل العربي', nameEn: 'Arabic Kohl', year: 2025 }),
  ich({ id: 'taif-roses', nameAr: 'الممارسات الثقافية المرتبطة بورد الطائف', nameEn: 'Cultural practices related to Taif roses', year: 2024 }),
  ich({ id: 'coffee', nameAr: 'القهوة العربية، رمز الكرم', nameEn: 'Arabic coffee, a symbol of generosity', year: 2024, shared: true }, ['unesco-ich-coffee']),
  ich({ id: 'henna', nameAr: 'الحنّاء: الطقوس والممارسات الجمالية والاجتماعية', nameEn: 'Henna: rituals, aesthetic and social practices', year: 2024 }),
  ich({ id: 'semsemiah', nameAr: 'السمسمية: صناعة الآلة والعزف عليها', nameEn: 'Semsemiah: instrument crafting and playing', year: 2024 }),
  ich({ id: 'harees', nameAr: 'الهريس: المعارف والمهارات والممارسات', nameEn: 'Harees dish: know-how, skills and practices', year: 2023 }),
  ich({ id: 'metal-engraving', nameAr: 'النقش على المعادن (الذهب والفضة والنحاس)', nameEn: 'Arts, skills and practices associated with engraving on metals', year: 2023 }),
  ich({ id: 'alheda', nameAr: 'الهدع: تقاليد شفهية لنداء قطعان الإبل', nameEn: 'Alheda’a, oral traditions of calling camel flocks', year: 2022 }),
  ich({ id: 'khawlani', nameAr: 'زراعة البنّ الخولاني', nameEn: 'Knowledge and practices related to cultivating Khawlani coffee beans', year: 2022 }),
  ich({ id: 'date-palm', nameAr: 'النخلة: المعارف والمهارات والتقاليد والممارسات', nameEn: 'Date palm, knowledge, skills, traditions and practices', year: 2022 }),
  ich({ id: 'falconry', nameAr: 'الصقارة، تراث إنساني حي', nameEn: 'Falconry, a living human heritage', year: 2021 }),
  ich({ id: 'calligraphy', nameAr: 'الخط العربي: المعارف والمهارات والممارسات', nameEn: 'Arabic calligraphy: knowledge, skills and practices', year: 2021 }),
  ich({ id: 'qatt', nameAr: 'القَطّ العسيري: زخرفة الجدران الداخلية التقليدية النسائية في عسير', nameEn: 'Al-Qatt Al-Asiri, female traditional interior wall decoration in Asir', year: 2017 }),
  ich({ id: 'almezmar', nameAr: 'المزمار: الطبول والرقص بالعصي', nameEn: 'Almezmar, drumming and dancing with sticks', year: 2016 }),
  ich({ id: 'majlis', nameAr: 'المجلس: فضاء ثقافي واجتماعي', nameEn: 'Majlis, a cultural and social space', year: 2015 }, ['unesco-ich-majlis']),
  ich({ id: 'alardah', nameAr: 'العرضة النجدية: الرقص والطبول والشعر', nameEn: 'Alardah Alnajdiyah, dance, drumming and poetry in Saudi Arabia', year: 2015 }),
]
export const ichById = (id: string) => ichElements.find((e) => e.id === id)!

/** عدد الدول المقدِّمة لكل عنصر — من صفحات اليونسكو (research/_parts/heritage_summaries.md، قُرئت 2026-09-19) */
const STATES: Record<string, number> = { coffee: 5, majlis: 4, sadu: 3, bisht: 9, 'date-palm': 15, falconry: 24, calligraphy: 16, qatt: 1, alardah: 1 }
for (const e of ichElements) {
  const n = STATES[e.id]
  if (n) { e.states = n; e.shared = n > 1 }
}

/** الملخصات العربية المشتقة حصرًا من جملتين حرفيتين في صفحات اليونسكو */
const S = sums as { whc: Record<string, string>; ich: Record<string, string> }
const indic = (t: string) => t.replace(/\d+(?:[.,]\d+)*/g, (m) => m.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]).replace(/\./g, '٫').replace(/,/g, '٬'))
for (const w of whcSites) if (S.whc[w.id]) w.summary = indic(S.whc[w.id])
for (const e of ichElements) if (S.ich[e.id]) e.summary = indic(S.ich[e.id])

export const sharedLabel = (e: IchElement) => (e.states && e.states > 1 ? `ملف مشترك بين ${String(e.states).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])} دول (منها المملكة)` : e.states === 1 ? 'ملف باسم المملكة وحدها' : null)
