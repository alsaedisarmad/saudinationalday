import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { murals } from '../../content/murals'
import { toIndic } from '../../content/quran'
import { useStore } from '../../session/store'
import { Print } from './Print'
import { ar } from './MuralText'

interface Props {
  onOpen: (id: string) => void
  openId: string | null
  focusId: string | null
}

/**
 * الهاتف عموديًا بإبهام واحد: قائمة عمودية بتثبيت (snap) لوحة لوحة على جدار دافئ، والمس لوحة لتفتح الورقة السفلية.
 * ليست نسخة مصغّرة من الجدار الأفقي: لوحة واحدة في كل شاشة، عدّاد ثابت، وتلميح «اسحب للأعلى».
 */
export function MobileList({ onOpen, openId, focusId }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0) // 0 = التعريف، 1..N = اللوحات
  const [announce, setAnnounce] = useState('')
  const reduced = useStore((s) => s.reducedMotion)
  const N = murals.length

  const measure = useCallback(() => {
    const sc = scroller.current
    if (!sc) return
    const r = sc.getBoundingClientRect()
    const cy = r.top + r.height / 2
    let best = 0
    let bd = Infinity
    sc.querySelectorAll<HTMLElement>('[data-stop]').forEach((el, i) => {
      const b = el.getBoundingClientRect()
      const d = Math.abs(b.top + b.height / 2 - cy)
      if (d < bd) { bd = d; best = i }
    })
    setActive(best)
  }, [])

  useEffect(() => {
    const sc = scroller.current
    if (!sc) return
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure) }
    sc.addEventListener('scroll', on, { passive: true })
    measure()
    return () => { cancelAnimationFrame(raf); sc.removeEventListener('scroll', on) }
  }, [measure])

  useEffect(() => {
    const sc = scroller.current
    if (!sc || reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.pr', { '--lit': 0 }, { '--lit': 1, duration: 1.4, ease: 'power2.out', delay: 0.25 })
    }, sc)
    return () => ctx.revert()
  }, [reduced])

  // عند الرجوع من الورقة: اللوحة الأخيرة في مكانها
  useEffect(() => {
    if (!focusId) return
    scroller.current?.querySelector<HTMLElement>(`.pr[data-id="${focusId}"]`)?.scrollIntoView({ block: 'center', behavior: 'auto' })
    measure()
  }, [focusId, measure])

  useEffect(() => {
    if (active < 1 || active > N) return
    const m = murals[active - 1]
    const t = setTimeout(() => setAnnounce(`الجدارية ${toIndic(m.page)} من ${toIndic(N)}: ${ar(m.label)}`), 450)
    return () => clearTimeout(t)
  }, [active, N])

  return (
    <div className="ml">
      <div ref={scroller} className="ml__scroller" role="region" aria-label="الجداريات — مرّر للأعلى والأسفل" tabIndex={0}>
        <div className="ml__cornice" aria-hidden />
        <section className="ml__intro" data-stop aria-labelledby="ml-title">
          <div className="kicker">من قيمنا إلى رؤيتنا</div>
          <h1 id="ml-title" className="display-l">الجداريات</h1>
          <p className="body-l">{toIndic(N)} لوحة هي صفحات مجلتنا المدرسية كما ستُعلَّق في المعرض. المس لوحة لتقرأها.</p>
          <p className="label ml__swipe" aria-hidden>اسحب للأعلى <span>↑</span></p>
        </section>
        <ul className="ml__list" role="list" aria-label="الجداريات">
          {murals.map((m) => (
            <Print key={m.id} m={m} total={N} current={openId === m.id || (!openId && active === m.page)} onOpen={onOpen} />
          ))}
        </ul>
      </div>
      <div className="ml__vig" aria-hidden />
      <div className="ml__count label num" aria-hidden>{active >= 1 ? `${toIndic(active)} / ${toIndic(N)}` : `${toIndic(N)} لوحة`}</div>
      <div className="sr-only" aria-live="polite">{announce}</div>
    </div>
  )
}
