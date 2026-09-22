import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { backdrop } from '../backdrop/Backdrop'
import { works, workUrl } from '../content/students'
import { visible } from '../content/types'
import { toIndic } from '../content/quran'
import { SourceLine, ReviewTag } from '../ui/parts'
import { IconBack, IconNext } from '../ui/icons'
import { useStore } from '../session/store'
import { useSession } from '../session/session'
import { discoverIds } from '../exhibition/discovery'
import { audio } from '../audio/engine'

/**
 * أعمال الطالبات: عمل واحد في المقدّمة على حامل بإضاءة موجّهة، وشريط مصغّرات أسفله. تمرير/أسهم/أزرار كبيرة.
 * لا يظهر اسم الطالبة إلا بموافقة صريحة (consent) — الافتراضي: الصف فقط. لا أعمال = القاعة مخفية من الفناء (halls.ts).
 */
export default function Students() {
  const session = useSession()
  const reduced = useStore((s) => s.reducedMotion)
  const discover = useStore((s) => s.discover)
  const list = useMemo(() => works.filter(visible), [])
  const start = Math.max(0, list.findIndex((w) => w.id === session.focus))
  const [i, setI] = useState(start)
  const frame = useRef<HTMLDivElement>(null)
  const drag = useRef<number | null>(null)
  const cur = list[i]

  useEffect(() => { backdrop.grade = 'students'; backdrop.thread = 0; backdrop.threadY = 0.3 }, [])
  useEffect(() => {
    if (!cur) return
    discover(discoverIds.work(cur.id))
    if (!reduced && frame.current) gsap.fromTo(frame.current, { opacity: 0, y: 14, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power2.out' })
  }, [cur?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(1)
      if (e.key === 'ArrowRight') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  if (!cur) return null
  const go = (d: number) => { const n = i + d; if (n >= 0 && n < list.length) { audio.chime(n % 8); setI(n) } }
  const who = [cur.consent ? cur.studentName : null, cur.classLabel].filter(Boolean).join(' — ')

  return (
    <div className="sw">
      <div className="sw__head">
        <div className="kicker">إبداع من مدرستنا</div>
        <h1 className="display-m">أعمال الطالبات</h1>
      </div>

      <div className="sw__stage" onPointerDown={(e) => { drag.current = e.clientX }} onPointerUp={(e) => { if (drag.current !== null) { const dx = e.clientX - drag.current; if (Math.abs(dx) > 70) go(dx < 0 ? 1 : -1) } drag.current = null }}>
        <button className="btn btn--icon sw__nav" onClick={() => go(-1)} disabled={i === 0} aria-label="العمل السابق"><IconBack /></button>
        <figure ref={frame} className="sw__frame">
          <div className="sw__mat"><img src={workUrl(cur)} alt={cur.alt} draggable={false} /></div>
          <figcaption className="sw__cap">
            <div className="label num" aria-live="polite">العمل {toIndic(i + 1)} من {toIndic(list.length)}</div>
            <h2 className="display-m">{cur.title} <ReviewTag item={cur} /></h2>
            {who && <p className="body-l sw__who">{who}</p>}
            {cur.medium && <p className="label">{cur.medium}</p>}
            {cur.description && <p className="body-l">{cur.description}</p>}
            <SourceLine ids={cur.sourceIds} label="مصدر العمل" />
          </figcaption>
        </figure>
        <button className="btn btn--icon sw__nav" onClick={() => go(1)} disabled={i === list.length - 1} aria-label="العمل التالي"><IconNext /></button>
      </div>

      {list.length > 1 && (
        <ul className="sw__strip" aria-label="مصغّرات الأعمال">
          {list.map((w, k) => (
            <li key={w.id}>
              <button className={`sw__thumb ${k === i ? 'on' : ''}`} onClick={() => { audio.tick(); setI(k) }} aria-label={w.title} aria-current={k === i ? 'true' : undefined}>
                <img src={workUrl(w)} alt="" draggable={false} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <style>{css}</style>
    </div>
  )
}

const css = `
.sw{position:absolute;inset:0;display:grid;grid-template-rows:auto 1fr auto;gap:var(--s3);padding:calc(var(--target) + var(--s4)) var(--s4) calc(var(--s8) + var(--s6))}
.sw__head{text-align:center}
.sw__stage{display:flex;align-items:center;justify-content:center;gap:var(--s3);min-height:0;touch-action:pan-y}
.sw__frame{margin:0;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(16rem,1fr);gap:var(--s4);align-items:center;min-height:0;max-height:100%;width:min(100%,78rem)}
.sw__mat{padding:clamp(10px,1.6vmin,26px);background:#EDE4D0;border:2px solid var(--gold);box-shadow:0 30px 90px rgba(0,0,0,.6),0 0 120px rgba(255,200,100,.12);max-height:100%;display:grid;place-items:center}
.sw__mat img{display:block;max-width:100%;max-height:calc(100dvh - var(--u) * 37 - 150px);object-fit:contain;-webkit-user-drag:none;user-select:none}
.sw__cap{display:grid;gap:var(--s1);align-content:center}
.sw__who{color:var(--gold)}
.sw__nav:disabled{opacity:.2;pointer-events:none}
.sw__strip{list-style:none;margin:0;padding:0;display:flex;gap:var(--s2);justify-content:center;overflow-x:auto;padding-bottom:4px}
.sw__thumb{display:block;width:calc(var(--target) * 1.15);height:calc(var(--target) * 1.15);border:2px solid transparent;opacity:.6;transition:all 200ms var(--ease-cine);overflow:hidden}
.sw__thumb img{width:100%;height:100%;object-fit:cover;display:block}
.sw__thumb.on{border-color:var(--gold);opacity:1}
[data-mode=mobile] .sw{padding-inline:var(--s2)}
[data-mode=mobile] .sw__frame{grid-template-columns:1fr;gap:var(--s2);overflow:auto}
[data-mode=mobile] .sw__stage{position:relative}
[data-mode=mobile] .sw__nav{position:absolute;top:22%;z-index:3;background:rgba(11,18,16,.7)}
[data-mode=mobile] .sw__nav:first-child{inset-inline-end:var(--s1)}[data-mode=mobile] .sw__nav:last-child{inset-inline-start:var(--s1)}
[data-mode=mobile] .sw__mat img{max-height:44vh}
`
