import versesJson from './generated/verses.json'
import tafsirJson from './generated/tafsir.json'
import type { Gated } from './types'

export interface Verse extends Gated {
  id: string
  surah: number
  ayah: number
  surahName: string
  /** النص المعتمد للعرض: Tanzil Uthmani (SC-08: الاختيار طباعي قابل للتبديل) */
  text: string
  /** بصمة sha256 للنص (تُختبر في vitest ضد research/_parts/verified_verses.json) */
  sha256: string
  /** عدد الكلمات المقتبسة في مادة الفريق إن كانت الآية مقتطعة عندهم (SC-09) — نعرض الآية كاملة ونُبرز هذا المقطع */
  highlightWords?: number
  topic: string
}

const topics: Record<string, string> = {
  'q2-125': 'البيت الحرام · مقام إبراهيم',
  'q2-126': 'بلدًا آمنًا · دعوة إبراهيم',
  'q3-97': 'الآيات البينات · الحج',
  'q14-35': 'دعوة إبراهيم · البلد الآمن',
}

export const verses: Verse[] = (versesJson.verses as Array<{ id: string; surah: number; ayah: number; surahNameAr: string; uthmani_tanzil: string; sha256: { uthmani_tanzil: string } }>).map((v) => ({
  id: v.id,
  surah: v.surah,
  ayah: v.ayah,
  surahName: v.surahNameAr.replace(/^سُورَةُ\s*/, ''),
  text: v.uthmani_tanzil,
  sha256: v.sha256.uthmani_tanzil,
  highlightWords: v.id === 'q14-35' ? 8 : undefined,
  topic: topics[v.id] ?? '',
  status: 'verified',
  sourceIds: ['quran-tanzil', 'quran-com', 'team-text'],
}))

export const verseById = (id: string) => verses.find((v) => v.id === id)!

export interface Tafsir extends Gated {
  verseId: string
  paragraphs: string[]
  author: 'عبدالرحمن بن ناصر السعدي'
  work: 'تيسير الكريم الرحمن'
}

export const tafsir: Tafsir[] = (tafsirJson.items as Array<{ id: string; paragraphs: string[] }>).map((t) => ({
  verseId: t.id,
  paragraphs: t.paragraphs,
  author: 'عبدالرحمن بن ناصر السعدي',
  work: 'تيسير الكريم الرحمن',
  status: 'verified',
  sourceIds: ['team-text'],
  note: 'الطبعة غير مسمّاة (SC-10)؛ حُذفت علامات صفحات الطبعة فقط.',
}))

export const tafsirFor = (verseId: string) => tafsir.find((t) => t.verseId === verseId)!

/** نص الآية بالأرقام الهندية للمرجع */
export const toIndic = (n: number | string) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
export const refLabel = (v: Verse) => `سورة ${v.surahName} · الآية ${toIndic(v.ayah)}`
