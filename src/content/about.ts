import './audio' // registers the audio source before the lists are built
import { photos, creditLine } from './photos'
import { sources, sourceLevelLabel } from './sources'
import type { Source } from './types'

/** نصوص «عن المعرض» غير المنسوبة لمصدر خارجي: وصف المشروع وطريقة الاستخدام والخصوصية. بيانات الفريق نفسها في credits.ts حرفيًا. */
export const aboutText = {
  purpose:
    '«السعودية... حكاية وطن» معرض افتراضي بمناسبة اليوم الوطني السعودي (٢٣ سبتمبر ٢٠٢٦)، يقابله معرض واقعي من الجداريات المطبوعة: رمز QR في كل جدارية يفتح صفحتها الرقمية في هذا المعرض.',
  howTo: [
    'المس أي شيء يضيء لتفتحه؛ الخيط الذهبي يقودك من قاعة إلى التالية.',
    'زر «استكشف المعرض» في أعلى الشاشة يفتح قائمة القاعات في أي وقت، وزر «الفناء» يعيدك إلى الأقواس.',
    'في كل قاعة عنصر «اكتشف المعنى» أو «الدلالة» يفتح النص الموثّق مع مصدره.',
    'كل ما تكتشفه يُضيء نقطة، وتتجمع كل النقاط في النهاية على هيئة المملكة.',
  ],
  access: [
    'كل التفاعلات لها بديل بالنقر أو لوحة المفاتيح، ولا يعتمد المعرض على تمرير المؤشر.',
    'زر «نسخة نصية مبسّطة» يعرض المحتوى كله نصًّا واضحًا يقرؤه قارئ الشاشة ويمكن طباعته.',
    'زر «الحركة» يخفّف الحركة، ويحترم المعرض إعداد جهازك لتقليلها.',
    'الصوت اختياري ولا يبدأ إلا بلمستك.',
  ],
  privacy:
    'لا يجمع المعرض بيانات شخصية: لا حسابات ولا تتبّع ولا إرسال لأي خادم. يُحفظ تقدّمك في جلسة المتصفح على جهازك فقط، وعلى السبورة يبدأ زائر جديد تلقائيًا بعد فترة خمول.',
}

export const techCredits: { label: string; text: string }[] = [
  { label: 'الخطوط', text: 'Amiri وAmiri Quran وReem Kufi وIBM Plex Sans Arabic — برخصة SIL Open Font License' },
  { label: 'خريطة المناطق', text: 'حدود geoBoundaries، © مساهمو OpenStreetMap (ODbL) — للتوضيح فقط وليست حدودًا رسمية' },
  { label: 'نصّ الآيات', text: 'المصحف العثماني — مشروع Tanzil، وقورن بنص Quran.com (كلمة بكلمة)' },
  { label: 'التفسير', text: '«تيسير الكريم الرحمن» للشيخ عبدالرحمن بن ناصر السعدي رحمه الله — كما أرسله فريق المشروع' },
  { label: 'القيم الست', text: 'هوية اليوم الوطني ٢٠٢٦ «عزّنا بطبعنا» — الهيئة العامة للترفيه (وكالة الأنباء السعودية، ٢٧ يوليو ٢٠٢٦)' },
]

export interface PhotoCredit { id: string; alt: string; line: string; page: string }
export const photoCredits: PhotoCredit[] = Object.values(photos).map((p) => ({ id: p.id, alt: p.alt, line: creditLine(p), page: p.page }))

export const sourceGroups: { level: number; label: string; items: Source[] }[] = [1, 2, 3, 4, 5, 6]
  .map((level) => ({ level, label: sourceLevelLabel[level], items: Object.values(sources).filter((s) => s.level === level) }))
  .filter((g) => g.items.length)
