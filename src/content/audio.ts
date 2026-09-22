import watani from '../assets/audio/watani-ana.mp3'
import { sources } from './sources'
import type { Gated } from './types'

/**
 * المقطع الصوتي «وطني أنا» — مادة وصلت من فريق المشروع بطلب صريح «ذا مقطع الصوت يدخله».
 * الحقوق لجهة الإنتاج (إثراء) — يُعرض للاستماع الاختياري فقط ولا يبدأ تلقائيًا. الملف الأصلي بلا موسيقى.
 * ⚠ اسم الملف يذكر «اليوم الوطني 94 — 2025»؛ لذلك لا نعرض اسم الملف ولا رقمًا للنسخة.
 */
sources['team-audio'] = {
  id: 'team-audio',
  level: 1,
  publisher: 'إثراء (مركز الملك عبدالعزيز الثقافي العالمي)',
  title: 'مقطع صوتي «وطني أنا» (نسخة بلا موسيقى)',
  date: '2026-09-19',
}

export interface AudioClipData extends Gated {
  id: string
  title: string
  credit: string
  src: string
  seconds: number
}

export const audioClips: AudioClipData[] = [
  {
    id: 'watani-ana',
    title: 'وطني أنا',
    credit: 'مقطع صوتي من إنتاج إثراء بمناسبة اليوم الوطني',
    src: watani,
    seconds: 100,
    status: 'verified',
    sourceIds: ['team-audio'],
    note: 'الحقوق لإثراء.',
  },
]
