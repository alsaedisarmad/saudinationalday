import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { murals } from '../../content/murals'
import { hallById } from '../../exhibition/halls'
import { toIndic } from '../../content/quran'
import { useStore } from '../../session/store'
import { useSession } from '../../session/session'
import { audio } from '../../audio/engine'
import { IconBack, IconNext } from '../../ui/icons'
import { Print } from './Print'
import { ar } from './MuralText'

interface WallProps {
  onOpen: (id: string) => void
  /** الجدارية المفتوحة الآن في العارض (أو null) — تُعلَّم aria-current */
  openId: string | null
  /** آخر لوحة كانت مفتوحة: يُبرز الجدار موضعها عند الرجوع */
  focusId: string | null
}

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n))

/**
 * الجدار الأفقي (سبورة/سطح مكتب/لوح): جص دافئ، إفريز مثلثات نجدية، لوحات بأطرافها ومصابيحها.
 * التنقل: سحب (فأرة) / لمس أصلي / عجلة الفأرة / أسهم لوحة المفاتيح / أزرار السابق-التالي / شريط الأرقام (بدائل للسحب، WCAG 2.5.7).
 * المنطق RTL: أول لوحة على اليمين، و«التالي» جهة اليسار.
 */
export function Wall({ onOpen, openId, focusId }: WallProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const drag = useRef({ on: false, x: 0, sl: 0, moved: false })
  const [active, setActive] = useState(0) // فهرس المحطة: 0 = اللافتة التعريفية، 1..N = اللوحات، N+1 = خاتمة الجدار
  const [ends, setEnds] = useState({ start: true, end: false })
  const [announce, setAnnounce] = useState('')
  const reduced = useStore((s) => s.reducedMotion)
  const session = useSession()
  const N = murals.length
  const lastStop = N + 1

  const stops = useCallback(() => Array.from(scroller.current?.querySelectorAll<HTMLElement>('[data-stop]') ?? []), [])

  const measure = useCallback(() => {
    const sc = scroller.current
    if (!sc) return
    const r = sc.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const max = sc.scrollWidth - sc.clientWidth
    const pos = Math.abs(sc.scrollLeft)
    const start = pos < 4
    const end = pos > max - 4
    let best = 0
    let bd = Infinity
    stops().forEach((el, i) => {
      const b = el.getBoundingClientRect()
      const d = Math.abs(b.left + b.width / 2 - cx)
      if (d < bd) { bd = d; best = i }
    })
    setActive(start ? 0 : end ? lastStop : best)
    setEnds({ start, end })
  }, [stops, lastStop])

  const goStop = useCallback((i: number) => {
    const el = stops()[clamp(i, 0, lastStop)]
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduced ? 'auto' : 'smooth' })
  }, [stops, lastStop, reduced])

  const step = (dir: 1 | -1) => { audio.tick(); goStop(active + dir) }

  // القياس عند التمرير (rAF) والتحجيم
  useEffect(() => {
    const sc = scroller.current
    if (!sc) return
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure) }
    sc.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    measure()
    return () => { cancelAnimationFrame(raf); sc.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [measure])

  // عجلة الفأرة العمودية تحرّك الجدار أفقيًا (RTL: للأمام = تناقص scrollLeft)
  useEffect(() => {
    const sc = scroller.current
    if (!sc) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      e.preventDefault()
      sc.scrollLeft -= e.deltaY * (e.deltaMode === 1 ? 32 : 1)
    }
    sc.addEventListener('wheel', onWheel, { passive: false })
    return () => sc.removeEventListener('wheel', onWheel)
  }, [])

  // إضاءة المصابيح تباعًا عند الدخول (لا حركة مع «تخفيف الحركة»)
  useEffect(() => {
    const sc = scroller.current
    if (!sc) return
    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.fromTo('.pr', { '--lit': 0 }, { '--lit': 1, duration: 1.6, stagger: 0.12, ease: 'power2.out', delay: 0.35 })
      gsap.fromTo('.pr__btn', { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09, ease: 'power3.out', delay: 0.2 })
      gsap.fromTo('.mw__intro > *, .mw__outro > *', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: 'power2.out', delay: 0.1 })
    }, sc)
    return () => ctx.revert()
  }, [reduced])

  // عند العودة من العارض أو الرابط العميق: نُظهر اللوحة الأخيرة في وسط الجدار بلا حركة
  useEffect(() => {
    if (!focusId) return
    const el = scroller.current?.querySelector<HTMLElement>(`.pr[data-id="${focusId}"]`)
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' })
    measure()
  }, [focusId, measure])

  // إعلان لقارئ الشاشة عند تغيّر اللوحة المتوسطة (بعد استقرار التمرير)
  useEffect(() => {
    if (active < 1 || active > N) return
    const m = murals[active - 1]
    const t = setTimeout(() => setAnnounce(`الجدارية ${toIndic(m.page)} من ${toIndic(N)}: ${ar(m.label)}`), 450)
    return () => clearTimeout(t)
  }, [active, N])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    const dir = e.key === 'ArrowLeft' ? 1 : -1 // ← = التالي في RTL
    const btns = Array.from(scroller.current?.querySelectorAll<HTMLButtonElement>('.pr__btn') ?? [])
    const i = btns.indexOf(document.activeElement as HTMLButtonElement)
    e.preventDefault()
    if (i >= 0) {
      const n = clamp(i + dir, 0, btns.length - 1)
      btns[n].focus({ preventScroll: true })
      btns[n].scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduced ? 'auto' : 'smooth' })
    } else step(dir as 1 | -1)
  }

  // سحب بالفأرة (اللمس يتحرك أصلًا)
  const onPointerDown = (e: React.PointerEvent) => {
    const sc = scroller.current
    if (!sc || e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { on: true, x: e.clientX, sl: sc.scrollLeft, moved: false }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const sc = scroller.current
    const d = drag.current
    if (!sc || !d.on) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 6) { d.moved = true; sc.classList.add('is-drag'); try { sc.setPointerCapture(e.pointerId) } catch { /* لا مشكلة */ } }
    if (d.moved) sc.scrollLeft = d.sl - dx
  }
  const endDrag = () => {
    drag.current.on = false
    scroller.current?.classList.remove('is-drag')
  }
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false }
  }

  const hallsAfter = (['future', 'values', 'safe'] as const).map((id) => hallById(id)).filter((h) => h.ready())

  return (
    <div className="mw">
      <div
        ref={scroller}
        className="mw__scroller"
        role="region"
        aria-label="جدار الجداريات — اسحب أو استخدم الأسهم للتنقل"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        <div className="mw__strip">
          <div className="mw__cornice" aria-hidden />
          <div className="mw__dado" aria-hidden />
          <div className="mw__grain" aria-hidden />

          <section className="mw__intro mw__panel" data-stop aria-labelledby="mw-title">
            <div className="kicker">من قيمنا إلى رؤيتنا</div>
            <h1 id="mw-title" className="display-l mw__h1">الجداريات</h1>
            <p className="body-l mw__lead">{toIndic(N)} لوحة هي صفحات مجلتنا المدرسية، كما ستُعلَّق على جدران المعرض. المس لوحة لتقرأها كاملة.</p>
            <p className="label mw__hint">اسحب الجدار، أو استعمل الأسهم والأزرار. وعلى كل لوحة مطبوعة رمز QR يفتح صفحتها على هاتفك.</p>
            <div className="mw__tri" aria-hidden />
          </section>

          <ul className="mw__list" role="list" aria-label="الجداريات">
            {murals.map((m) => (
              <Print key={m.id} m={m} total={N} current={openId === m.id || (!openId && active === m.page)} onOpen={onOpen} />
            ))}
          </ul>

          <section className="mw__outro mw__panel" data-stop aria-label="نهاية الجدار">
            <div className="kicker">نهاية الجدار</div>
            <h2 className="display-m mw__h2">من اللوحات إلى القاعات</h2>
            <p className="body-l mw__lead">هذه صفحات المجلة الثلاث عشرة. تابع الرحلة في قاعة تشرح ما قرأت.</p>
            <div className="mw__outbtns">
              {hallsAfter.map((h) => (
                <button key={h.id} className="btn btn--gold" onClick={() => { audio.chime(2); session.goto(h.id) }}>{h.title}</button>
              ))}
              <button className="btn" onClick={() => { audio.tick(); goStop(0) }}>العودة إلى أول الجدار</button>
            </div>
          </section>
        </div>
      </div>

      <div className="mw__vig" aria-hidden />

      <button className="btn mw__nav mw__nav--prev" onClick={() => step(-1)} disabled={ends.start} aria-label="السابق على الجدار">
        <IconBack />
      </button>
      <button className="btn mw__nav mw__nav--next" onClick={() => step(1)} disabled={ends.end} aria-label="التالي على الجدار">
        <IconNext />
      </button>

      <nav className="mw__rail" aria-label="انتقال سريع بين الجداريات">
        <ul role="list">
          {murals.map((m, i) => (
            <li key={m.id}>
              <button
                className={`mw__tick num ${active === i + 1 ? 'is-on' : ''}`}
                onClick={() => { audio.tick(); goStop(i + 1) }}
                aria-label={`اذهب إلى الجدارية ${toIndic(m.page)}: ${ar(m.label)}`}
                aria-current={active === i + 1 ? 'true' : undefined}
              >
                {toIndic(m.page)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sr-only" aria-live="polite">{announce}</div>
    </div>
  )
}
