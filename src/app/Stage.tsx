import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from 'react'
import gsap from 'gsap'
import { Backdrop, backdrop } from '../backdrop/Backdrop'
import { Hud } from '../ui/Hud'
import { useSession, writeHash, parseHash, actor } from '../session/session'
import { hallById, type HallId } from '../exhibition/halls'
import { discoverIds } from '../exhibition/discovery'
import { useStore } from '../session/store'
import { audio } from '../audio/engine'
import { ErrorBoundary } from './ErrorBoundary'

const H: Partial<Record<HallId, LazyExoticComponent<ComponentType>>> = {
  gate: lazy(() => import('../halls/Gate')),
  courtyard: lazy(() => import('../halls/Courtyard')),
  roots: lazy(() => import('../halls/Roots')),
  safe: lazy(() => import('../halls/Safe')),
  path: lazy(() => import('../halls/Path')),
  land: lazy(() => import('../halls/Land')),
  majlis: lazy(() => import('../halls/Majlis')),
  values: lazy(() => import('../halls/Values')),
  challenge: lazy(() => import('../halls/Challenge')),
  future: lazy(() => import('../halls/Future')),
  murals: lazy(() => import('../halls/Murals')),
  students: lazy(() => import('../halls/Students')),
  finale: lazy(() => import('../halls/Finale')),
  about: lazy(() => import('../halls/About')),
}
const TextView = lazy(() => import('../halls/TextView'))

export function Stage() {
  const session = useSession()
  const [shown, setShown] = useState<HallId>('gate')
  const store = useStore()
  const veil = useRef<HTMLDivElement>(null)
  const line = useRef<HTMLDivElement>(null)
  const main = useRef<HTMLElement>(null)
  const [announce, setAnnounce] = useState('')
  const running = useRef(false)
  // الدخول من رابط عميق (QR/مشاركة): بلا انتقال سينمائي، فالزائر يريد المحتوى فورًا
  const boot = useRef(!!parseHash().hall)

  // الانتقال السينمائي بين القاعات: الخيط يعبر الشاشة ثم يُستبدل المشهد (لا قفزة)
  useEffect(() => {
    if (session.phase !== 'transitioning' || !session.to || running.current) return
    running.current = true
    const to = session.to
    const focus = session.focus
    const reduce = useStore.getState().reducedMotion
    const v = veil.current!
    const l = line.current!
    const swap = () => {
      backdrop.grade = hallById(to).grade
      backdrop.thread = to === 'gate' ? 0 : backdrop.thread
      setShown(to)
      writeHash(to, focus)
      actor.send({ type: 'ARRIVED' })
    }
    if (boot.current) { boot.current = false; swap(); running.current = false; return }
    if (to !== 'gate' && shown !== 'gate') audio.whoosh(1.3)
    const tl = gsap.timeline()
    if (reduce) {
      tl.set(v, { opacity: 0, display: 'block' }).to(v, { opacity: 1, duration: 0.18 }).add(swap).to(v, { opacity: 0, duration: 0.2 }).set(v, { display: 'none' }).add(() => { running.current = false })
    } else {
      tl.set(v, { opacity: 0, display: 'block' })
        .set(l, { scaleX: 0, opacity: 1 })
        .to(l, { scaleX: 1, duration: 0.75, ease: 'power2.inOut' })
        .to(v, { opacity: 1, duration: 0.5, ease: 'power1.in' }, '-=0.3')
        .add(swap)
        .to(v, { opacity: 0, duration: 0.9, ease: 'power1.out', delay: 0.15 })
        .to(l, { opacity: 0, duration: 0.5 }, '<')
        .set(v, { display: 'none' })
        .add(() => { running.current = false })
    }
    // لا نقتل الخط الزمني عند تغيّر الحالة: ARRIVED نفسه يغيّرها في منتصف الانتقال
  }, [session.phase, session.to]) // eslint-disable-line react-hooks/exhaustive-deps

  // بعد الوصول: تركيز، إعلان لقارئ الشاشة، تسجيل زيارة واكتشاف، ضوء وصوت القاعة
  useEffect(() => {
    const h = hallById(shown)
    main.current?.focus({ preventScroll: true })
    if (shown !== 'gate') setAnnounce(`دخلت: ${h.title}`)
    store.visitHall(shown)
    if (h.order > 0 && shown !== 'finale' && shown !== 'about') store.discover(discoverIds.hall(shown))
    audio.ambient(h.grade)
  }, [shown]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { audio.setEnabled(store.sound); audio.ambient(hallById(shown).grade) }, [store.sound]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { document.documentElement.classList.toggle('reduce-motion', store.reducedMotion) }, [store.reducedMotion])

  // الروابط العميقة والرجوع في المتصفح
  useEffect(() => {
    const go = () => {
      const p = parseHash()
      if (p.text && !useStore.getState().textMode) useStore.getState().toggleText()
      if (p.hall && actor.getSnapshot().value !== 'transitioning' && p.hall !== actor.getSnapshot().context.hall) actor.send({ type: 'GOTO', to: p.hall, focus: p.focus })
    }
    go()
    window.addEventListener('hashchange', go)
    return () => window.removeEventListener('hashchange', go)
  }, [])

  const Hall = H[shown]
  if (store.textMode) return <Suspense fallback={null}><TextView /></Suspense>

  return (
    <div className="stage" data-hall={shown}>
      <ErrorBoundary silent><Backdrop /></ErrorBoundary>
      <div className="grain" aria-hidden />
      <main ref={main} id="hall" tabIndex={-1} className="layer-fill hall-root" aria-label={hallById(shown).title}>
        <ErrorBoundary resetKey={shown} label={hallById(shown).title} onBack={shown === 'courtyard' || shown === 'gate' ? undefined : () => session.goto('courtyard')}>
          <Suspense fallback={null}>{Hall ? <Hall key={shown} /> : null}</Suspense>
        </ErrorBoundary>
      </main>
      <Hud hall={shown} />
      <div ref={veil} className="veil" aria-hidden style={{ display: 'none' }}>
        <div ref={line} className="veil__line" />
      </div>
      <IdleReset shown={shown} onReset={() => { store.resetVisitor(); backdrop.grade = 'gate'; backdrop.thread = 0; setShown('gate'); writeHash('gate'); actor.send({ type: 'RESET' }) }} />
      <div className="sr-only" aria-live="polite">{announce}</div>
      <style>{css}</style>
    </div>
  )
}

/** السبورة: بعد خمول ٩٠ ثانية نسأل «هل ما زلت هنا؟» ثم نعيد الضبط تلقائيًا (لا تخزين شخصي على جهاز مشترك) */
function IdleReset({ shown, onReset }: { shown: HallId; onReset: () => void }) {
  const mode = useStore((s) => s.mode)
  const [warn, setWarn] = useState<number | null>(null)
  const last = useRef(Date.now())
  useEffect(() => {
    if (mode !== 'smartboard') return
    const bump = () => { last.current = Date.now(); setWarn(null) }
    const ev: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'wheel', 'touchstart']
    ev.forEach((e) => window.addEventListener(e, bump, { passive: true }))
    const id = setInterval(() => {
      if (shown === 'gate') return
      const idle = (Date.now() - last.current) / 1000
      if (idle > 90 + 20) { setWarn(null); last.current = Date.now(); onReset() }
      else if (idle > 90) setWarn(Math.ceil(110 - idle))
    }, 1000)
    return () => { ev.forEach((e) => window.removeEventListener(e, bump)); clearInterval(id) }
  }, [mode, shown, onReset])
  if (warn === null) return null
  return (
    <div className="idle" role="alertdialog" aria-label="هل ما زلت هنا؟">
      <div className="idle__card">
        <div className="display-m">هل ما زلت هنا؟</div>
        <p className="label" style={{ fontSize: '1rem' }}>سنبدأ من جديد بعد {warn} ثانية ليستقبل المعرض زائرًا جديدًا.</p>
        <button className="btn btn--primary" onClick={() => setWarn(null)}>ما زلت هنا</button>
      </div>
    </div>
  )
}

const css = `
.hall-root{outline:none;z-index:5}
.veil{position:absolute;inset:0;z-index:35;background:radial-gradient(ellipse at 50% 50%,#050908 0%,#030605 100%);pointer-events:all}
.veil__line{position:absolute;inset-inline:0;top:50%;height:2px;transform-origin:100% 50%;background:linear-gradient(to left,transparent,#E7B04A 12%,#FFD58A 50%,#E7B04A 88%,transparent);box-shadow:0 0 24px 4px rgba(231,176,74,.65)}
.idle{position:fixed;inset:0;z-index:70;display:grid;place-items:center;background:rgba(3,6,5,.72)}
.idle__card{display:grid;gap:var(--s3);text-align:center;padding:var(--s8);border:1px solid var(--line);background:rgba(11,18,16,.92)}
`
