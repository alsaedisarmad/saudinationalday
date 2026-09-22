import type { PillarId } from '../../content/future'

/**
 * هندسة المسرح: نظام إحداثيات الخريطة نفسه (viewBox الخريطة = 0 0 1000 816)،
 * ممتدًا إلى الأطراف الفارغة حيث تسكن الكوكبات (كل كوكبة في زاوية خالية من اليابسة).
 * الإحداثيات تصميمية رمزية؛ مواضع المشاريع تقريبية على مستوى المنطقة فقط (الحقيقة في content/future.ts).
 */
export type V = [number, number]
export interface Box { x: number; y: number; w: number; h: number }

/** كامل المسرح (سطح مكتب/سبورة): الخريطة + سماء الكوكبات */
export const VB_FULL: Box = { x: -200, y: -60, w: 1320, h: 1060 }
/** الهاتف/العمودي: الخريطة وحدها */
export const VB_TIGHT: Box = { x: -50, y: -20, w: 1100, h: 850 }

export type Side = 'l' | 'r' | 't' | 'b'

export interface Constellation {
  head: V
  headSide: Side
  /** مواقع نجوم المحاور الفرعية (id الأداة في futureItems) */
  themes: Record<string, { p: V; side: Side }>
  /** ترتيب رسم الخيط: 'head' أو id محور */
  chain: string[]
}

export const constellations: Record<PillarId, Constellation> = {
  // «مجتمع حيوي»: قوس (رمز العمارة) يصعد من الجذور ويستقر عند النجمة الرئيسة
  society: {
    head: [1012, 128],
    headSide: 't',
    themes: {
      'theme-roots': { p: [742, 190], side: 'r' },
      'theme-environment': { p: [808, 84], side: 't' },
      'theme-foundation': { p: [912, 44], side: 't' },
    },
    chain: ['theme-roots', 'theme-environment', 'theme-foundation', 'head'],
  },
  // «اقتصاد مزدهر»: خط صاعد متعرّج (نموّ) على ساحل البحر الأحمر
  economy: {
    head: [-78, 812],
    headSide: 'r',
    themes: {
      'theme-opportunity': { p: [46, 716], side: 'r' },
      'theme-investment': { p: [-62, 620], side: 'r' },
      'theme-competitive': { p: [52, 524], side: 'r' },
      'theme-location': { p: [-52, 430], side: 'r' },
    },
    chain: ['head', 'theme-opportunity', 'theme-investment', 'theme-competitive', 'theme-location'],
  },
  // «وطن طموح»: خط قصير منخفض على الأفق الجنوبي الشرقي
  nation: {
    head: [1000, 770],
    headSide: 't',
    themes: {
      'theme-government': { p: [872, 826], side: 'b' },
      'theme-citizen': { p: [738, 872], side: 'b' },
    },
    chain: ['head', 'theme-government', 'theme-citizen'],
  },
}

/** مواضع المشاريع والمحطات — مركز المنطقة الإدارية مع إزاحة رمزية عند تزاحم أكثر من نقطة في منطقة واحدة */
export const starPos: Record<string, { p: V; side: Side }> = {
  neom: { p: [88, 182], side: 'l' }, // منطقة تبوك
  'red-sea': { p: [156, 276], side: 'l' }, // منطقة تبوك
  diriyah: { p: [468, 432], side: 'l' }, // منطقة الرياض
  qiddiya: { p: [488, 528], side: 'l' }, // منطقة الرياض
  'expo-2030': { p: [576, 470], side: 'r' }, // منطقة الرياض
  'world-cup-2034': { p: [928, 292], side: 'b' }, // المملكة كلها (فوق الخليج، بلا منطقة)
}

/** على الهاتف تُنقل تسميات تبوك إلى يمين النجمة (لا يتّسع يسارها) */
export const stackedSide: Record<string, Side> = { neom: 'r', 'red-sea': 'r' }

/** نجمة البداية: أعلى يسار المسرح خارج اليابسة */
export const originPos: { p: V; side: Side } = { p: [-72, 46], side: 'r' }

export const pct = (p: V, vb: Box) => ({ left: `${((p[0] - vb.x) / vb.w) * 100}%`, top: `${((p[1] - vb.y) / vb.h) * 100}%` })

/** مسار خط بين نقطتين مع اقتطاع طرفيه (لتبقى الخيوط بين النجوم لا داخلها) */
export function seg(a: V, b: V, trim: number): string {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const f = (n: number) => n.toFixed(1)
  return `M${f(a[0] + ux * trim)} ${f(a[1] + uy * trim)}L${f(b[0] - ux * trim)} ${f(b[1] - uy * trim)}`
}

/** منحنى ناعم من نجمة الركيزة إلى نجمة مشروع (خيط الضوء الهابط إلى الأرض) */
export function arc(a: V, b: V, trimA: number, trimB: number, bend = 0.18): string {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const s: V = [a[0] + ux * trimA, a[1] + uy * trimA]
  const e: V = [b[0] - ux * trimB, b[1] - uy * trimB]
  const mx = (s[0] + e[0]) / 2 - uy * len * bend
  const my = (s[1] + e[1]) / 2 + ux * len * bend
  const f = (n: number) => n.toFixed(1)
  return `M${f(s[0])} ${f(s[1])}Q${f(mx)} ${f(my)} ${f(e[0])} ${f(e[1])}`
}

/** مصغّر الكوكبة داخل أزرار الركائز: يطبّع النقاط إلى صندوق 64×40 */
export function miniPoints(p: PillarId): { pts: V[]; head: V } {
  const c = constellations[p]
  const all = [c.head, ...Object.values(c.themes).map((t) => t.p)]
  const xs = all.map((a) => a[0])
  const ys = all.map((a) => a[1])
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const y0 = Math.min(...ys)
  const y1 = Math.max(...ys)
  const sc = Math.min(52 / Math.max(x1 - x0, 1), 30 / Math.max(y1 - y0, 1))
  const nx = (v: number) => 32 + (v - (x0 + x1) / 2) * sc
  const ny = (v: number) => 20 + (v - (y0 + y1) / 2) * sc
  const at = (id: string): V => {
    const q = id === 'head' ? c.head : c.themes[id].p
    return [nx(q[0]), ny(q[1])]
  }
  return { pts: c.chain.map(at), head: at('head') }
}
