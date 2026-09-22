import type { Gated } from './types'
import { verseById, toIndic } from './quran'

export type QuizCategory = 'quran' | 'identity' | 'heritage' | 'geography' | 'nationalDay' | 'security'
export const categoryLabel: Record<QuizCategory, string> = {
  quran: 'القرآن والمحتوى الديني',
  identity: 'الهوية',
  heritage: 'التراث',
  geography: 'الجغرافيا',
  nationalDay: 'اليوم الوطني',
  security: 'الأمن الوطني',
}

export interface Question extends Gated {
  id: string
  category: QuizCategory
  prompt: string
  choices: string[]
  answer: number // فهرس الإجابة الصحيحة في choices
  explanation: string
  contentRef: string
}

// مقتطفات الآيات تُؤخذ من النص المتحقَّق كلمةً بكلمة (لا كتابة يدوية لنص قرآني)
const words = (id: string, from: number, to?: number) => verseById(id).text.split(' ').slice(from, to).join(' ')
const ref = (id: string) => {
  const v = verseById(id)
  return `سورة ${v.surahName} — الآية ${toIndic(v.ayah)}`
}

const q = (o: Omit<Question, 'status'> & { status?: Question['status'] }): Question => ({ status: 'verified', ...o })
const SURAH4 = ['البقرة', 'آل عمران', 'إبراهيم', 'النور']

export const questions: Question[] = [
  q({ id: 'qz-q1', category: 'quran', prompt: `في أي سورة وردت الآية: «${words('q2-125', 0, 5)}…»؟`, choices: SURAH4, answer: 0, explanation: `${ref('q2-125')} — من مادة الجذور.`, contentRef: 'q2-125', sourceIds: ['quran-tanzil', 'quran-com', 'team-text'] }),
  q({ id: 'qz-q2', category: 'quran', prompt: `في أي سورة وردت الآية: «${words('q3-97', 0, 4)}…»؟`, choices: SURAH4, answer: 1, explanation: `${ref('q3-97')}.`, contentRef: 'q3-97', sourceIds: ['quran-tanzil', 'quran-com', 'team-text'] }),
  q({ id: 'qz-q3', category: 'quran', prompt: `أي الآيات التالية تنتهي بـ «${words('q14-35', 9)}»؟`, choices: [ref('q2-125'), ref('q2-126'), ref('q3-97'), ref('q14-35')], answer: 3, explanation: `${ref('q14-35')}.`, contentRef: 'q14-35', sourceIds: ['quran-tanzil', 'quran-com', 'team-text'] }),
  q({ id: 'qz-q4', category: 'quran', prompt: 'في تفسير السعدي للمادة المرفقة: معنى «مثابةً للناس» أي:', choices: ['مرجعًا يثوبون إليه', 'سوقًا يقصده التجار', 'حصنًا للدفاع', 'موضعًا للراحة فقط'], answer: 0, explanation: 'ورد في التفسير: «أي: مرجعا يثوبون إليه، لحصول منافعهم الدينية والدنيوية».', contentRef: 'q2-125', sourceIds: ['team-text'] }),
  q({ id: 'qz-q5', category: 'quran', prompt: 'ذكر السعدي في قوله «وأمنًا» أنه يأمن به كل أحد، حتى:', choices: ['الوحش والجمادات كالأشجار', 'المسافرون فقط', 'أهل البلد فقط', 'الحجاج وحدهم'], answer: 0, explanation: 'ورد: «يأمن به كل أحد، حتى الوحش، وحتى الجمادات كالأشجار».', contentRef: 'q2-125', sourceIds: ['team-text'] }),
  q({ id: 'qz-q6', category: 'quran', prompt: 'دعا إبراهيم عليه السلام لهذا البلد — بحسب التفسير المرفق — أن يجعله الله:', choices: ['بلدًا آمنًا ويرزق أهله من الثمرات', 'أعلى الجبال', 'أغنى الأسواق', 'أوسع الصحارى'], answer: 0, explanation: 'ورد: «أن يجعله الله بلدا آمنا، ويرزق أهله من أنواع الثمرات».', contentRef: 'q2-126', sourceIds: ['team-text'] }),
  q({ id: 'qz-i1', category: 'identity', prompt: 'كم قيمة تجمعها هوية اليوم الوطني «عزّنا بطبعنا»؟', choices: ['٤', '٥', '٦', '٧'], answer: 2, explanation: 'الشجاعة، الرؤية، الأصالة، الهمّة، الجود، الكرم.', contentRef: 'values', sourceIds: ['spa-identity-2026', 'team-text'] }),
  q({ id: 'qz-i2', category: 'identity', prompt: 'أي مما يلي ليس من قيم «عزّنا بطبعنا»؟', choices: ['الشجاعة', 'الرؤية', 'الأصالة', 'السرعة'], answer: 3, explanation: 'القيم الست: الشجاعة، الرؤية، الأصالة، الهمّة، الجود، الكرم.', contentRef: 'values', sourceIds: ['spa-identity-2026'] }),
  q({ id: 'qz-i3', category: 'identity', prompt: 'أي جهة أعلنت هوية اليوم الوطني لعام ٢٠٢٦ بحسب وكالة الأنباء السعودية؟', choices: ['الهيئة العامة للترفيه', 'وزارة التعليم', 'الهيئة العامة للإحصاء', 'وزارة الداخلية'], answer: 0, explanation: 'واس، ٢٧ يوليو ٢٠٢٦: رئيس هيئة الترفيه يعلن إطلاق هوية اليوم الوطني لعام ٢٠٢٦.', contentRef: 'identity', sourceIds: ['spa-identity-2026'] }),
  q({ id: 'qz-h1', category: 'heritage', prompt: 'في أي عام سُجّل موقع الحِجر (مدائن صالح) في قائمة التراث العالمي لليونسكو؟', choices: ['٢٠٠٨', '٢٠١٠', '٢٠١٤', '٢٠١٨'], answer: 0, explanation: 'الحِجر: ٢٠٠٨، وهو أول موقع سعودي في القائمة بحسب صفحة اليونسكو.', contentRef: 'whc-hegra', sourceIds: ['unesco-whc-sa'] }),
  q({ id: 'qz-h2', category: 'heritage', prompt: 'أي موقع سعودي سُجّل في قائمة التراث العالمي عام ٢٠١٠؟', choices: ['حي الطريف في الدرعية', 'واحة الأحساء', 'جدة التاريخية', 'منطقة حِمى الثقافية'], answer: 0, explanation: 'حي الطريف في الدرعية: ٢٠١٠.', contentRef: 'whc-at-turaif', sourceIds: ['unesco-whc-sa'] }),
  q({ id: 'qz-h3', category: 'heritage', prompt: 'كم موقعًا سعوديًا في قائمة التراث العالمي بحسب صفحة اليونسكو (قُرئت بتاريخ ٢٠٢٦-٠٩-١٩)؟', choices: ['٤', '٦', '٨', '١٠'], answer: 2, explanation: 'ثمانية مواقع: سبعة ثقافية وواحد طبيعي (عروق بني معارض).', contentRef: 'whc', sourceIds: ['unesco-whc-sa'] }),
  q({ id: 'qz-h4', category: 'heritage', prompt: 'أي عنصر أُدرج عام ٢٠١٥ على القائمة التمثيلية للتراث الثقافي غير المادي؟', choices: ['المجلس', 'السدو', 'الصقارة', 'القَطّ العسيري'], answer: 0, explanation: 'المجلس: فضاء ثقافي واجتماعي — ٢٠١٥.', contentRef: 'ich-majlis', sourceIds: ['unesco-ich-sa'] }),
  q({ id: 'qz-h5', category: 'heritage', prompt: 'أي عنصر أُدرج عام ٢٠٢٥ على القائمة التمثيلية؟', choices: ['السدو', 'الهريس', 'الصقارة', 'المزمار'], answer: 0, explanation: 'السدو (النسيج التقليدي): ٢٠٢٥.', contentRef: 'ich-sadu', sourceIds: ['unesco-ich-sa', 'unesco-ich-sadu'] }),
  q({ id: 'qz-g1', category: 'geography', prompt: 'كم عدد المناطق الإدارية في المملكة العربية السعودية؟', choices: ['١١', '١٢', '١٣', '١٤'], answer: 2, explanation: 'ثلاث عشرة منطقة إدارية بحسب نظام المناطق.', contentRef: 'regions', sourceIds: ['saudipedia-provinces'] }),
  q({ id: 'qz-g2', category: 'geography', prompt: 'ما عاصمة منطقة القصيم؟', choices: ['بريدة', 'حائل', 'عرعر', 'الباحة'], answer: 0, explanation: 'عاصمة القصيم: بريدة.', contentRef: 'region-qassim', sourceIds: ['saudipedia-provinces'] }),
  q({ id: 'qz-g3', category: 'geography', prompt: 'ما عاصمة المنطقة الشرقية؟', choices: ['الدمام', 'الرياض', 'أبها', 'جازان'], answer: 0, explanation: 'عاصمة المنطقة الشرقية: الدمام.', contentRef: 'region-eastern', sourceIds: ['saudipedia-provinces'] }),
  q({ id: 'qz-g4', category: 'geography', prompt: 'ما عاصمة منطقة عسير؟', choices: ['أبها', 'نجران', 'تبوك', 'سكاكا'], answer: 0, explanation: 'عاصمة عسير: أبها.', contentRef: 'region-asir', sourceIds: ['saudipedia-provinces'] }),
  q({ id: 'qz-n1', category: 'nationalDay', prompt: 'في أي يوم من شهر سبتمبر يُحتفل باليوم الوطني السعودي؟', choices: ['١٨', '٢٣', '٢٦', '٣٠'], answer: 1, explanation: 'الثالث والعشرون من سبتمبر.', contentRef: 'unification-1932', sourceIds: ['spa-national-day-95'] }),
  q({ id: 'qz-n2', category: 'nationalDay', prompt: 'يُحيي اليوم الوطني مرسومًا ملكيًا صدر من الملك عبدالعزيز غيّر اسم الدولة إلى:', choices: ['المملكة العربية السعودية', 'مملكة الحجاز ونجد', 'الدولة السعودية', 'إمارة الرياض'], answer: 0, explanation: 'بحسب واس: المرسوم الذي غيّر اسم الدولة إلى «المملكة العربية السعودية».', contentRef: 'unification-1932', sourceIds: ['spa-national-day-95'] }),
  q({
    id: 'qz-s1',
    category: 'security',
    status: 'needs-review',
    prompt: 'ما الركائز الأربع للأمن الوطني كما وردت في المقطع التوعوي؟',
    choices: ['الدين، المواطن، الحاكم، المؤسسات', 'المال، التجارة، الصناعة، السياحة', 'الرياضة، الفن، الأدب، الإعلام', 'الطاقة، النقل، المياه، الزراعة'],
    answer: 0,
    explanation: 'الدين، المواطن، الحاكم، المؤسسات.',
    contentRef: 'security',
    sourceIds: ['team-video-security'],
  }),
]
