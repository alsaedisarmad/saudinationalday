import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { backdrop } from '../backdrop/Backdrop'
import { stations } from '../content/timeline'
import { visible } from '../content/types'
import { toIndic } from '../content/quran'
import { useSession } from '../session/session'
import { useStore } from '../session/store'
import { discoverIds } from '../exhibition/discovery'
import { audio } from '../audio/engine'
import { IconBack, IconNext } from '../ui/icons'
import { createScene, layout, type Scene } from './path/scene'
import { useCamera } from './path/useCamera'
import { StationCard } from './path/StationCard'
import { Spine } from './path/Spine'
import { Detail } from './path/Detail'
import { css } from './path/styles'

/**
 * طريق الحكاية: رحلة على خيط ذهبي واحد عند الفجر، من الدولة السعودية الأولى (١٧٢٧م) إلى اليوم الوطني.
 * السبورة/الديسكتوب: كاميرا أفقية تنزلق بين المحطات (سحب، عجلة، أسهم، أزرار كبيرة، عمود عصور).
 * الهاتف: تمرير عمودي بين محطات ملء الشاشة. المشهد (Canvas2D) بطبقات منظور، رسم رمزي لا يمثّل مكانًا بعينه.
 */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const mobileLayout = { horizon: 0.765, ground: 0.8, thread: 0.845 }

export default function Path() {
  const session = useSession()
  const mode = useStore((s) => s.mode)
  const reduced = useStore((s) => s.reducedMotion)
  const discover = useStore((s) => s.discover)
  const discovered = useStore((s) => s.discovered)
  const vertical = mode === 'mobile'
  const list = useMemo(() => stations.filter(visible), [])
  const start = useMemo(() => Math.max(0, list.findIndex((s) => s.id === session.focus)), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [open, setOpen] = useState(false)
  const [announce, setAnnounce] = useState('')

  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLLIElement | null)[]>([])
  const marks = useRef<(HTMLSpanElement | null)[]>([])
  const scene = useRef<Scene | null>(null)
  const size = useRef({ W: 1920, H: 1080, S: 1920 })
  const vIndex = useRef(start)

  const onFrame = useCallback((cam: number, t: number, moving: boolean) => {
    const c = canvas.current
    const r = root.current
    if (!c || !r) return
    const { W, H, S } = size.current
    const n = list.length
    const progress = n > 1 ? clamp(cam / (n - 1), 0, 1) : 0
    if (!vertical) {
      for (let i = 0; i < n; i++) {
        const li = items.current[i]
        const mk = marks.current[i]
        const d = cam - i
        const p = clamp(1 - Math.abs(d) * 1.35, 0, 1)
        const e = p * p * (3 - 2 * p)
        if (li) {
          li.style.transform = `translate3d(${d * S}px,0,0)`
          li.style.opacity = String(e)
          li.style.pointerEvents = p > 0.55 ? 'auto' : 'none'
        }
        if (mk) mk.style.transform = `translate3d(${d * S}px,0,0) translateX(-50%)`
      }
    }
    r.style.setProperty('--prog', String(progress))
    const g = c.getContext('2d')
    if (g && scene.current) {
      const dpr = c.width / W
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      scene.current.draw(g, { W, H, cam, S, progress, t, animate: !reduced })
    }
    void moving
  }, [list.length, vertical, reduced])

  const camera = useCamera({
    count: list.length,
    start,
    spacing: () => size.current.S,
    reduced,
    ambient: true,
    enabled: !vertical,
    onFrame,
    onSettle: (i, user) => { if (user) audio.chime(i % 8) },
  })
  const { index: hIndex, goTo, state, redraw } = camera
  const [vIdx, setVIdx] = useState(start)
  const idx = vertical ? vIdx : hIndex
  const cur = list[idx]

  // قياس المشهد وبناؤه عند تغيير الحجم/الوضع
  useLayoutEffect(() => {
    const r = root.current
    const c = canvas.current
    if (!r || !c) return
    const build = () => {
      const W = Math.max(320, r.clientWidth)
      const H = Math.max(320, r.clientHeight)
      const dpr = Math.min(window.devicePixelRatio || 1, mode === 'smartboard' ? 1 : 1.5)
      c.width = Math.round(W * dpr)
      c.height = Math.round(H * dpr)
      const lay = vertical ? mobileLayout : layout
      const S = vertical ? W * 1.1 : W
      size.current = { W, H, S }
      scene.current = createScene(list.map((s) => s.scene), W, H, S, { lay, unit: vertical ? Math.min(H / 1080, W / 640) : H / 1080 })
      r.style.setProperty('--ty', `${lay.thread * H}px`)
      r.style.setProperty('--H', `${H}px`)
      r.style.setProperty('--ground', String(lay.ground))
      redraw()
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(r)
    return () => ro.disconnect()
  }, [vertical, mode, list, redraw])

  useEffect(() => { backdrop.grade = 'path'; backdrop.thread = 0; backdrop.threadY = 0.35 }, [])

  // الهاتف: الكاميرا = موضع التمرير العمودي
  useEffect(() => {
    if (!vertical) return
    const sc = scroller.current
    if (!sc) return
    let raf = 0
    const read = () => {
      raf = 0
      const h = sc.clientHeight || 1
      const c = clamp(sc.scrollTop / h, 0, list.length - 1)
      state.current.cam = c
      state.current.target = c
      redraw()
      const i = Math.round(c)
      if (i !== vIndex.current) { vIndex.current = i; setVIdx(i); audio.tick() }
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(read) }
    sc.addEventListener('scroll', on, { passive: true })
    sc.scrollTop = start * sc.clientHeight
    read()
    return () => { sc.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [vertical, list.length, start, redraw, state])

  const go = useCallback((i: number) => {
    const n = clamp(i, 0, list.length - 1)
    if (vertical) {
      const sc = scroller.current
      sc?.scrollTo({ top: n * sc.clientHeight, behavior: reduced ? 'auto' : 'smooth' })
    } else goTo(n)
  }, [vertical, reduced, list.length, goTo])
  const prev = () => { audio.tick(); go(idx - 1) }
  const next = () => { audio.tick(); go(idx + 1) }

  // الاكتشاف عند الوصول إلى المحطة + إعلان لقارئ الشاشة
  useEffect(() => {
    if (!cur) return
    discover(discoverIds.station(cur.id))
    setAnnounce(`المحطة ${toIndic(idx + 1)} من ${toIndic(list.length)}: ${cur.yearLabel ?? ''}، ${cur.title}`)
  }, [cur, idx, list.length, discover])

  const openDetail = () => { if (cur) { audio.chime(3); discover(discoverIds.station(cur.id)); setOpen(true) } }
  const seen = useMemo(() => new Set(list.filter((s) => discovered.includes(discoverIds.station(s.id))).map((s) => s.id)), [list, discovered])

  const cards = list.map((s, i) => (
    <StationCard key={s.id} s={s} index={i} total={list.length} active={i === idx} onOpen={openDetail} />
  ))

  return (
    <div ref={root} className="path" data-vertical={vertical || undefined}>
      <canvas ref={canvas} className="path__canvas" aria-hidden />
      <h1 className="sr-only">طريق الحكاية — من الدولة السعودية الأولى إلى اليوم الوطني</h1>
      <div className="path__kicker kicker" aria-hidden>طريق الحكاية</div>

      {vertical ? (
        <div ref={scroller} className="pv" data-nodrag>
          <ul role="list" className="pv__list" aria-label="محطات الحكاية">
            {list.map((s, i) => (
              <li key={s.id} className="pv__item" aria-current={i === idx ? 'step' : undefined}>
                {cards[i]}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <div className="path__marks" aria-hidden>
            {list.map((s, i) => <span key={s.id} ref={(el) => { marks.current[i] = el }} className={`mk num ${i === idx ? 'is-cur' : ''}`}>{s.short}</span>)}
          </div>
          <div ref={(el) => { camera.host.current = el }} className="path__vp">
            <ul role="list" className="pt" aria-label="محطات الحكاية">
              {list.map((s, i) => (
                <li key={s.id} ref={(el) => { items.current[i] = el }} className="pt__item" aria-current={i === idx ? 'step' : undefined}>
                  {cards[i]}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="path__bar">
        <button className="btn btn--icon path__nav" onClick={prev} aria-disabled={idx === 0} aria-label="المحطة السابقة"><IconBack /></button>
        <Spine list={list} index={idx} visited={seen} onGo={go} compact={vertical} />
        <button className="btn btn--icon path__nav" onClick={next} aria-disabled={idx === list.length - 1} aria-label="المحطة التالية"><IconNext /></button>
      </div>
      <div className="path__scenenote label" aria-hidden>رسم رمزي للطريق — لا يمثّل مكانًا بعينه</div>

      <div className="sr-only" aria-live="polite">{announce}</div>
      <Detail s={cur} open={open} onClose={() => setOpen(false)} />
      <style>{css}</style>
    </div>
  )
}
