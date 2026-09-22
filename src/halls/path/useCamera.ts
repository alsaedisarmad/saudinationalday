import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * كاميرا أفقية تنزلق بين المحطات: سحب باللمس/الفأرة + عجلة + لوحة مفاتيح + أزرار.
 * الحالة المتغيّرة كل إطار (cam) خارج React؛ يُرسل المشهد والعناصر عبر onFrame. المؤشر الصحيح (index) وحده حالة React.
 * RTL: التقدّم إلى اليسار. السحب يمينًا = المحطة التالية (كقلب صفحة عربية).
 */
export interface CameraOptions {
  count: number
  start: number
  /** المسافة بين المحطات بالبكسل */
  spacing: () => number
  reduced: boolean
  /** هل نرسم حركة محيطية مستمرة (نبض الخيط، تمايل النخيل) */
  ambient: boolean
  enabled: boolean
  onFrame: (cam: number, t: number, moving: boolean) => void
  onSettle?: (index: number, user: boolean) => void
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

export function useCamera(opts: CameraOptions) {
  const o = useRef(opts)
  o.current = opts
  const [index, setIndex] = useState(() => clamp(opts.start, 0, opts.count - 1))
  const st = useRef({ cam: index, target: index, dragging: false, raf: 0, last: 0, t: 0, drawn: 0, idx: index })
  const el = useRef<HTMLElement | null>(null)

  const loop = useCallback((now: number) => {
    const s = st.current
    const dt = Math.min(0.05, (now - (s.last || now)) / 1000)
    s.last = now
    const opt = o.current
    let moving = false
    if (!s.dragging) {
      const d = s.target - s.cam
      if (Math.abs(d) > 0.0008) {
        s.cam = opt.reduced ? s.target : s.cam + d * (1 - Math.exp(-dt * 5.2))
        moving = Math.abs(s.target - s.cam) > 0.0008
        if (!moving) s.cam = s.target
      }
    } else moving = true
    if (opt.ambient && !opt.reduced) s.t += dt
    const animating = opt.ambient && !opt.reduced
    if (moving || (animating && now - s.drawn > 38) || s.drawn === 0) {
      s.drawn = now
      opt.onFrame(s.cam, s.t, moving)
    }
    if (moving || animating || s.dragging) s.raf = requestAnimationFrame(loop)
    else { s.raf = 0; s.last = 0 }
  }, [])

  const kick = useCallback(() => {
    if (!st.current.raf) { st.current.last = 0; st.current.raf = requestAnimationFrame(loop) }
  }, [loop])

  const goTo = useCallback((i: number, user = true) => {
    const n = o.current.count
    const t = clamp(Math.round(i), 0, n - 1)
    const s = st.current
    s.target = t
    if (s.idx !== t) { s.idx = t; setIndex(t); o.current.onSettle?.(t, user) }
    if (o.current.reduced) { s.cam = t; o.current.onFrame(t, s.t, false) }
    kick()
  }, [kick])

  const next = useCallback(() => goTo(st.current.target + 1), [goTo])
  const prev = useCallback(() => goTo(st.current.target - 1), [goTo])

  // إعادة الرسم عند تغيّر الخيارات (حجم/حركة)
  useEffect(() => {
    if (o.current.reduced) st.current.cam = st.current.target
    kick()
    return () => { cancelAnimationFrame(st.current.raf); st.current.raf = 0 }
  }, [opts.reduced, opts.ambient, opts.enabled, kick])

  const redraw = useCallback(() => { st.current.drawn = 0; kick() }, [kick])

  // سحب + عجلة + لوحة مفاتيح
  useEffect(() => {
    const host = el.current
    if (!host || !opts.enabled) return
    const s = st.current
    let sx = 0, sc = 0, lx = 0, lt = 0, vel = 0, id = -1, moved = false
    const S = () => Math.max(300, o.current.spacing())
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if ((e.target as HTMLElement).closest('button, a, summary, input, [data-nodrag]')) return
      id = e.pointerId; sx = lx = e.clientX; sc = s.cam; lt = performance.now(); vel = 0; moved = false
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      const dx = e.clientX - sx
      if (!moved && Math.abs(dx) > 10) { moved = true; s.dragging = true; try { host.setPointerCapture(id) } catch { /* لا بأس */ } kick() }
      if (!moved) return
      const now = performance.now()
      const dtm = Math.max(1, now - lt)
      vel = vel * 0.7 + ((e.clientX - lx) / S() / dtm * 1000) * 0.3
      lx = e.clientX; lt = now
      const raw = sc + dx / S()
      const n = o.current.count
      // مقاومة عند الطرفين
      s.cam = raw < 0 ? raw * 0.25 : raw > n - 1 ? n - 1 + (raw - (n - 1)) * 0.25 : raw
      s.drawn = 0
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      id = -1
      if (!moved) return
      try { host.releasePointerCapture(e.pointerId) } catch { /* لا بأس */ }
      s.dragging = false
      const proj = s.cam + clamp(vel * 0.22, -1.2, 1.2)
      const d = proj - sc
      const steps = Math.abs(d) < 0.16 ? 0 : Math.max(1, Math.round(Math.abs(d)))
      goTo(Math.round(sc) + Math.sign(d) * steps)
      // نمنع نقرة «الشبح» بعد السحب
      const stop = (ev: Event) => { ev.stopPropagation(); ev.preventDefault() }
      window.addEventListener('click', stop, { capture: true, once: true })
      setTimeout(() => window.removeEventListener('click', stop, true), 60)
    }
    let wheelLock = 0
    const wheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? -e.deltaX : -e.deltaY
      const now = performance.now()
      if (Math.abs(d) < 12 || now < wheelLock) return
      wheelLock = now + 520
      // RTL: التمرير للأسفل/لليسار = التالي (d سالب)
      goTo(s.target + (d < 0 ? 1 : -1))
    }
    host.addEventListener('pointerdown', down)
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerup', up)
    host.addEventListener('pointercancel', up)
    host.addEventListener('wheel', wheel, { passive: true })
    const key = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      if (document.querySelector('.layer--open')) return
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      const n = o.current.count
      let to = -1
      if (e.key === 'ArrowLeft' || e.key === 'PageDown') to = s.target + 1
      else if (e.key === 'ArrowRight' || e.key === 'PageUp') to = s.target - 1
      else if (e.key === 'Home') to = 0
      else if (e.key === 'End') to = n - 1
      if (to < 0) return
      e.preventDefault()
      goTo(to)
    }
    window.addEventListener('keydown', key)
    return () => {
      host.removeEventListener('pointerdown', down)
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerup', up)
      host.removeEventListener('pointercancel', up)
      host.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', key)
      s.dragging = false
    }
  }, [opts.enabled, goTo, kick])

  return { index, goTo, next, prev, redraw, host: el, state: st }
}
