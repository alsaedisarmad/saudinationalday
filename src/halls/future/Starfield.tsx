import { useEffect, useRef } from 'react'
import { useStore } from '../../session/store'

/**
 * سماء ليل: Canvas2D مكتوب يدويًا بلا مكتبات. نجوم دقيقة بلمعان بطيء + شريط مجرّة خافت مرسوم مرة واحدة في لوحة جانبية.
 * - تقليل الحركة: يُرسم إطار واحد ثابت بلا rAF (لا لمعان مستمر).
 * - 30fps كافية للمعان البطيء وتترك الـGPU للخلفية (Shader) — تُوقَف عند إخفاء التبويب.
 */
interface Star { x: number; y: number; r: number; a: number; p: number; v: number; c: string }

const TINTS = ['237,230,211', '237,230,211', '237,230,211', '190,225,205', '143,208,169', '231,176,74']

const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useStore((s) => s.reducedMotion)
  const mode = useStore((s) => s.mode)

  useEffect(() => {
    const cv = ref.current!
    const g = cv.getContext('2d')
    if (!g) return
    let raf = 0
    let w = 0
    let h = 0
    let stars: Star[] = []
    let band: HTMLCanvasElement | null = null
    let last = 0
    let alive = true

    const build = () => {
      const rnd = seeded(96)
      const count = Math.round(Math.min(360, Math.max(110, (w * h) / (mode === 'mobile' ? 3800 : 5600))))
      stars = []
      for (let i = 0; i < count; i++) {
        const inBand = i < count * 0.55
        let x: number
        let y: number
        if (inBand) {
          // شريط قطري من أسفل اليسار إلى أعلى اليمين، بتوزيع شبه غاوسي حول محوره
          const t = rnd()
          const gx = (rnd() + rnd() + rnd() - 1.5) * 0.22 * Math.min(w, h)
          x = -0.05 * w + t * 1.1 * w + gx * 0.5
          y = 0.9 * h - t * 0.8 * h + gx
        } else {
          x = rnd() * w
          y = rnd() * h
        }
        const big = rnd() > 0.93
        stars.push({
          x,
          y,
          r: big ? 0.9 + rnd() * 0.8 : 0.35 + rnd() * 0.55,
          a: big ? 0.65 + rnd() * 0.3 : 0.18 + rnd() * 0.5,
          p: rnd() * 6.28,
          v: 0.35 + rnd() * 1.1,
          c: TINTS[Math.floor(rnd() * TINTS.length)],
        })
      }
      // شريط المجرّة: تدرّج ناعم يُرسم مرة واحدة
      band = document.createElement('canvas')
      band.width = Math.max(2, Math.round(w / 2))
      band.height = Math.max(2, Math.round(h / 2))
      const b = band.getContext('2d')!
      b.translate(band.width / 2, band.height / 2)
      b.rotate(-Math.atan2(0.8 * h, 1.1 * w))
      const len = Math.hypot(1.1 * w, 0.8 * h) / 2
      const grad = b.createLinearGradient(0, -Math.min(w, h) * 0.2, 0, Math.min(w, h) * 0.2)
      grad.addColorStop(0, 'rgba(79,167,121,0)')
      grad.addColorStop(0.5, 'rgba(120,190,160,0.085)')
      grad.addColorStop(1, 'rgba(79,167,121,0)')
      b.fillStyle = grad
      b.fillRect(-len, -Math.min(w, h) * 0.2, len * 2, Math.min(w, h) * 0.4)
    }

    const paint = (t: number) => {
      g.clearRect(0, 0, w, h)
      if (band) g.drawImage(band, 0, 0, w, h)
      for (const s of stars) {
        const tw = reduced ? 1 : 0.72 + 0.28 * Math.sin(t * s.v + s.p)
        g.globalAlpha = s.a * tw
        g.fillStyle = `rgb(${s.c})`
        if (s.r < 0.8) g.fillRect(s.x, s.y, s.r * 1.6, s.r * 1.6)
        else {
          g.beginPath()
          g.arc(s.x, s.y, s.r, 0, 6.283)
          g.fill()
        }
      }
      g.globalAlpha = 1
    }

    const size = () => {
      const r = cv.getBoundingClientRect()
      const d = Math.min(window.devicePixelRatio || 1, mode === 'mobile' ? 1.5 : 2)
      w = r.width
      h = r.height
      cv.width = Math.max(2, Math.round(w * d))
      cv.height = Math.max(2, Math.round(h * d))
      g.setTransform(d, 0, 0, d, 0, 0)
      build()
      paint(0)
    }

    const loop = (now: number) => {
      if (!alive) return
      raf = requestAnimationFrame(loop)
      if (now - last < 33) return
      last = now
      paint(now / 1000)
    }

    size()
    const ro = new ResizeObserver(size)
    ro.observe(cv)
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop)
    }
    document.addEventListener('visibilitychange', onVis)
    if (!reduced) raf = requestAnimationFrame(loop)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [reduced, mode])

  return <canvas ref={ref} className="fut__sky" aria-hidden />
}
