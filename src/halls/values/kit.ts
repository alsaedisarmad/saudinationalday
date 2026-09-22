import { useEffect, useRef, useCallback, type RefObject } from 'react'
import type { Mode } from '../../design/tokens'

/** أدوات مشتركة لمشاهد «عزّنا بطبعنا»: رياضيات، ضوضاء، ألوان، ومحرّك Canvas2D صغير يُنظَّف عند الإزالة. */
export const TAU = Math.PI * 2
export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3)
export const easeInOut = (t: number) => {
  t = clamp(t)
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** مولّد عشوائي حتمي (mulberry32) */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** ضوضاء قيمة أحادية البعد ناعمة (0..1) */
export function makeNoise(seed: number) {
  const r = rng(seed)
  const tab = Array.from({ length: 512 }, () => r())
  const n1 = (x: number) => {
    const i = Math.floor(x)
    const f = x - i
    const u = f * f * (3 - 2 * f)
    return lerp(tab[i & 511], tab[(i + 1) & 511], u)
  }
  const fbm = (x: number, oct = 4) => {
    let s = 0
    let a = 0.5
    let f = 1
    let norm = 0
    for (let o = 0; o < oct; o++) {
      s += a * n1(x * f + o * 17.3)
      norm += a
      a *= 0.5
      f *= 2.03
    }
    return s / norm
  }
  return { n1, fbm }
}

export type RGB = [number, number, number]
export const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
export const mixRgb = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
export const css = (c: RGB, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`
export const mix = (a: string, b: string, t: number, al = 1) => css(mixRgb(hex(a), hex(b), t), al)
export const rgba = (h: string, a: number) => css(hex(h), a)

export function mkCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.ceil(w))
  c.height = Math.max(1, Math.ceil(h))
  const g = c.getContext('2d')!
  return { c, g }
}

/** توهّج شعاعي ناعم (يُستعمل غالبًا مع globalCompositeOperation='lighter') */
export function glow(g: CanvasRenderingContext2D, x: number, y: number, r: number, c: RGB, a: number) {
  if (r <= 0 || a <= 0) return
  const gr = g.createRadialGradient(x, y, 0, x, y, r)
  gr.addColorStop(0, css(c, a))
  gr.addColorStop(0.35, css(c, a * 0.42))
  gr.addColorStop(0.7, css(c, a * 0.1))
  gr.addColorStop(1, css(c, 0))
  g.fillStyle = gr
  g.fillRect(x - r, y - r, r * 2, r * 2)
}

/** ضوضاء بصرية ناعمة للأسطح (حبيبات الطين/الصوف) تُخبز مرة واحدة */
export function speckle(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, count: number, seed: number, light = 'rgba(255,240,220,', dark = 'rgba(0,0,0,') {
  const r = rng(seed)
  for (let i = 0; i < count; i++) {
    const px = x + r() * w
    const py = y + r() * h
    const s = 0.6 + r() * 1.6
    g.fillStyle = (r() < 0.5 ? light : dark) + (0.03 + r() * 0.06).toFixed(3) + ')'
    g.fillRect(px, py, s, s * (0.6 + r()))
  }
}

export interface Env {
  reduced: boolean
  mode: Mode
  done: boolean
  /** يستدعيها المحرّك عند اكتمال التفاعل */
  complete: () => void
  /** يعيد رسم إطار واحد (عند تقليل الحركة لا توجد حلقة رسم) */
  invalidate: () => void
  /** أصوات ناعمة (يتحكم المحرّك الصوتي في التفعيل) */
  chime: (step: number, vel?: number) => void
  tick: () => void
  pour: () => void
  /** تقدّم اختياري (0..1) للواجهة */
  progress: (v: number) => void
}

export interface Engine {
  resize(w: number, h: number, s: number): void
  frame(g: CanvasRenderingContext2D, t: number, dt: number): void
  dispose?(): void
}

export interface EngineOpts {
  reduced: boolean
  mode: Mode
  done: boolean
  onComplete: () => void
  onProgress?: (v: number) => void
  chime: (step: number, vel?: number) => void
  tick: () => void
  pour: () => void
}

/**
 * يربط محرّكًا تخيليًا (كائن يملك الحالة المتغيرة) بـcanvas: حلقة rAF وResizeObserver وتنظيف كامل.
 * عند تقليل الحركة: لا حلقة مستمرة؛ يُرسم إطار واحد عند كل invalidate/resize.
 */
export function useEngine<E extends Engine>(make: (env: Env) => E, o: EngineOpts): { canvas: RefObject<HTMLCanvasElement | null>; api: RefObject<E | null>; point: (e: { clientX: number; clientY: number }) => { x: number; y: number } } {
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const api = useRef<E | null>(null)
  const cb = useRef(o)
  cb.current = o
  const done0 = useRef(o.done)
  const makeRef = useRef(make)
  makeRef.current = make

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const g = c.getContext('2d')!
    const reduced = cb.current.reduced
    let raf = 0
    let last = 0
    let t = 0
    let s = 1
    let W = 0
    let H = 0
    let alive = true
    let pending = false

    const paint = (dt: number) => {
      if (!W || !H) return
      g.setTransform(s, 0, 0, s, 0, 0)
      api.current?.frame(g, t, dt)
    }
    const invalidate = () => {
      if (!reduced || pending || !alive) return
      pending = true
      requestAnimationFrame(() => {
        pending = false
        if (alive) paint(0)
      })
    }
    const env: Env = {
      reduced,
      mode: cb.current.mode,
      done: done0.current,
      complete: () => cb.current.onComplete(),
      invalidate,
      chime: (st, v) => cb.current.chime(st, v),
      tick: () => cb.current.tick(),
      pour: () => cb.current.pour(),
      progress: (v) => cb.current.onProgress?.(v),
    }
    const eng = makeRef.current(env)
    api.current = eng

    const size = () => {
      const w = c.clientWidth
      const h = c.clientHeight
      if (!w || !h) return
      W = w
      H = h
      s = Math.min(window.devicePixelRatio || 1, 2, Math.max(1, 1300 / h))
      if (cb.current.mode === 'mobile') s = Math.min(s, 1.6)
      c.width = Math.round(w * s)
      c.height = Math.round(h * s)
      eng.resize(w, h, s)
      paint(0)
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(c)

    const loop = (now: number) => {
      if (!alive) return
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
      last = now
      t += dt
      paint(dt)
    }
    if (!reduced) {
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      eng.dispose?.()
      api.current = null
    }
    // المحرّك يُعاد بناؤه فقط عند تغيّر تقليل الحركة أو الوضع
  }, [o.reduced, o.mode]) // eslint-disable-line react-hooks/exhaustive-deps

  const point = useCallback((e: { clientX: number; clientY: number }) => {
    const r = canvas.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }, [])
  return { canvas, api, point }
}

/** خيط ناعم مقوّس (Quadratic) بين نقطتين */
export function arcTo(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, bend: number) {
  const mx = (x0 + x1) / 2
  const my = (y0 + y1) / 2
  const dx = x1 - x0
  const dy = y1 - y0
  const len = Math.hypot(dx, dy) || 1
  g.quadraticCurveTo(mx - (dy / len) * bend, my + (dx / len) * bend, x1, y1)
}

/** يرسم مثلّثًا نجديًا (فتحة/سنّ شرفة) */
export function tri(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  g.moveTo(x, y + h)
  g.lineTo(x + w / 2, y)
  g.lineTo(x + w, y + h)
  g.closePath()
}

/** نموذج خاصية اللمس/الفأرة الموحّد لسحب بمؤشر واحد */
export interface DragState {
  active: boolean
  id: number
  x: number
  y: number
  sx: number
  sy: number
}
