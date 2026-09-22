import { verses } from '../content/quran'
import { regions } from '../content/regions'
import { majlisSpots } from '../content/majlis'
import { values } from '../content/values'
import { stations } from '../content/timeline'
import { murals } from '../content/murals'
import { futureItems } from '../content/future'
import { works } from '../content/students'
import { questions } from '../content/quiz'
import { visible } from '../content/types'
import { archHalls } from './halls'
import { useStore } from '../session/store'

/**
 * «96 اكتشافًا» (EXHIBITION_CONCEPT §4): كل عنصر يفتحه الزائر اكتشاف؛ عدد النقاط المضيئة = round(96 × مكتشَف/كلي).
 * لا نُجبر المحتوى على أن يبلغ 96 عنصرًا.
 */
export const discoverIds = {
  hall: (id: string) => `hall:${id}`,
  verse: (id: string) => `verse:${id}`,
  tafsir: (id: string) => `tafsir:${id}`,
  region: (id: string) => `region:${id}`,
  majlis: (id: string) => `majlis:${id}`,
  value: (id: string) => `value:${id}`,
  station: (id: string) => `station:${id}`,
  mural: (id: string) => `mural:${id}`,
  future: (id: string) => `future:${id}`,
  work: (id: string) => `work:${id}`,
  quiz: (id: string) => `quiz:${id}`,
}

export function allDiscoverables(): string[] {
  return [
    ...archHalls().map((h) => discoverIds.hall(h.id)),
    ...verses.filter(visible).flatMap((v) => [discoverIds.verse(v.id), discoverIds.tafsir(v.id)]),
    ...regions.filter(visible).map((r) => discoverIds.region(r.id)),
    ...majlisSpots.filter(visible).map((s) => discoverIds.majlis(s.id)),
    ...values.filter(visible).map((v) => discoverIds.value(v.id)),
    ...stations.filter(visible).map((x) => discoverIds.station(x.id)),
    ...futureItems.filter(visible).map((x) => discoverIds.future(x.id)),
    ...murals.filter(visible).map((x) => discoverIds.mural(x.id)),
    ...works.filter(visible).map((x) => discoverIds.work(x.id)),
    ...[...new Set(questions.filter(visible).map((q) => q.category))].map((c) => discoverIds.quiz(c)),
  ]
}

export function useDiscovery() {
  const discovered = useStore((s) => s.discovered)
  const all = allDiscoverables()
  const set = new Set(all)
  const count = discovered.filter((d) => set.has(d)).length
  const total = all.length
  return { count, total, dots: total ? Math.round((96 * count) / total) : 0, ratio: total ? count / total : 0 }
}

/** ترتيب إضاءة النقاط الـ96: تبديل ثابت (بذرة ثابتة) فتنتشر المضيئة على المملكة كلها لا في ركن واحد */
const LIT_ORDER = (() => {
  let seed = 96 * 7919
  const a = Array.from({ length: 96 }, (_, i) => i)
  for (let i = 95; i > 0; i--) {
    seed = (seed * 16807) % 2147483647
    const j = seed % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
})()
export const litSet = (dots: number) => new Set(LIT_ORDER.slice(0, Math.max(0, Math.min(96, dots))))
