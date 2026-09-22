import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { backdrop } from '../backdrop/Backdrop'
import { archHalls, hallById, type HallMeta } from '../exhibition/halls'
import { useSession } from '../session/session'
import { useStore } from '../session/store'
import { audio } from '../audio/engine'
import { toIndic } from '../content/quran'
import { IconNext } from '../ui/icons'

/**
 * الفناء (Hub): أقواس القاعات على جدار طيني عند الغسق. الخيط تحت الأقواس يربطها ويُضيء بحسب ما زرت.
 * الطريق الموصى به: القوس التالي ينبض (USER_JOURNEY §2 «الحكاية الأساسية»).
 */
export default function Courtyard() {
  const session = useSession()
  const visited = useStore((s) => s.visitedHalls)
  const reduced = useStore((s) => s.reducedMotion)
  const list = archHalls()
  const next = list.find((h) => !visited.includes(h.id)) ?? list[0]
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    backdrop.grade = 'courtyard'
    backdrop.thread = 0.0
    backdrop.threadY = 0.5
    const tw = gsap.to(backdrop, { thread: 0, duration: 0.01 })
    if (reduced || !root.current) return () => { tw.kill() }
    const q = gsap.utils.selector(root.current)
    gsap.fromTo(q('.arch'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.3, stagger: 0.09, ease: 'power3.out', delay: 0.4 })
    gsap.fromTo(q('.court__title > *'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: 'power2.out', delay: 0.2 })
    gsap.fromTo(q('.court__cta'), { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 1.4 })
    return () => { tw.kill() }
  }, [reduced])

  const open = (h: HallMeta, i: number) => { audio.chime(i); session.goto(h.id) }

  return (
    <div ref={root} className="court" style={{ ['--n' as string]: list.length }}>
      <div className="court__title">
        <div className="kicker">الفناء</div>
        <h1 className="display-l">اختر بابًا</h1>
        <p className="label court__hint">المس قوسًا لتدخل القاعة — القوس المضيء هو الطريق الموصى به</p>
      </div>

      <div className="court__cta">
        <button className="btn btn--primary" onClick={() => next && open(next, 0)}>
          {visited.length > 1 ? 'تابع الرحلة' : 'ابدأ الحكاية'}: {next?.title} <IconNext />
        </button>
        <div className="court__minor">
          <button className="btn" onClick={() => session.goto('finale')}>{hallById('finale').title}</button>
          <button className="btn" onClick={() => session.goto('about')}>{hallById('about').title}</button>
        </div>
      </div>

      <div className="court__wall" role="group" aria-label="قاعات المعرض">
        <svg className="court__battlement" preserveAspectRatio="none" aria-hidden>
          <defs>
            <pattern id="tri" width="44" height="30" patternUnits="userSpaceOnUse"><path d="M0 30 L22 3 L44 30Z" fill="#241a17" /></pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tri)" />
        </svg>
        <div className="arcade">
          {list.map((h, i) => {
            const isNext = next?.id === h.id
            const seen = visited.includes(h.id)
            return (
              <button key={h.id} className={`arch ${isNext ? 'arch--next' : ''} ${seen ? 'arch--seen' : ''}`} onClick={() => open(h, i)} aria-label={`قاعة ${h.title} — ${h.kicker}${isNext ? ' — الطريق الموصى به' : ''}${seen ? ' — زرتها' : ''}`}>
                <svg viewBox="0 0 120 200" className="arch__svg" aria-hidden>
                  <defs>
                    <linearGradient id={`g${i}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFD58A" /><stop offset=".55" stopColor="#E08A3C" /><stop offset="1" stopColor="#5a2a14" /></linearGradient>
                    <radialGradient id={`r${i}`} cx=".5" cy=".85" r=".8"><stop offset="0" stopColor="#fff2cf" stopOpacity=".95" /><stop offset="1" stopColor="#fff2cf" stopOpacity="0" /></radialGradient>
                  </defs>
                  <path className="arch__frame" d="M4 200 V80 C4 42 30 14 60 3 C90 14 116 42 116 80 V200 Z" />
                  <path className="arch__glow" d="M12 200 V82 C12 48 34 22 60 12 C86 22 108 48 108 82 V200 Z" fill={`url(#g${i})`} />
                  <path className="arch__glow arch__glow--soft" d="M12 200 V82 C12 48 34 22 60 12 C86 22 108 48 108 82 V200 Z" fill={`url(#r${i})`} />
                  <path className="arch__inner" d="M20 200 V86 C20 58 38 34 60 26 C82 34 100 58 100 86 V200" />
                </svg>
                <span className="arch__num display-m num" aria-hidden>{toIndic(h.order)}</span>
                <span className="arch__label"><strong>{h.title}</strong><span className="label">{h.kicker}</span></span>
              </button>
            )
          })}
        </div>
        <div className="court__thread" aria-hidden>
          {list.map((h) => <span key={h.id} className={`court__knot ${visited.includes(h.id) ? 'is-lit' : ''}`} />)}
        </div>
      </div>

      <style>{css}</style>
    </div>
  )
}

const css = `
.court{position:absolute;inset:0;display:flex;flex-direction:column;padding-top:calc(var(--target) + var(--s4))}
.court__title{text-align:center;display:grid;gap:.15em;justify-items:center;padding-inline:var(--s4)}
.court__hint{max-width:34rem;opacity:.85}
.court__wall{position:relative;flex:1 0 auto;margin-top:var(--s4);padding-top:24px;padding-bottom:calc(var(--s8) + var(--s2));background:linear-gradient(180deg,#241a17 0%,#1a1311 60%,#120d0b 100%);box-shadow:0 -30px 80px rgba(0,0,0,.35)}
.court__wall::after{content:'';position:absolute;inset:0;pointer-events:none;opacity:.18;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.55' numOctaves='3'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.court__battlement{position:absolute;left:0;right:0;top:-29px;width:100%;height:30px}
.arcade{--aw:min(calc((100vw - 9vw) / (var(--n) * 1.2)),27vh);display:flex;justify-content:center;align-items:flex-end;gap:calc(var(--aw) * .18);padding:calc(var(--aw) * .18) 4vw 0}
.arch{position:relative;flex:0 0 var(--aw);width:var(--aw);display:grid;justify-items:center;text-align:center;padding:0;cursor:pointer;color:var(--museum-white)}
.arch__svg{width:100%;height:auto;display:block;overflow:visible;transition:transform 420ms var(--ease-cine),filter 420ms var(--ease-cine)}
.arch__frame{fill:#0f0b09;stroke:var(--gold);stroke-width:2;opacity:.9}
.arch__glow{opacity:.62;transition:opacity 500ms var(--ease-cine)}
.arch__glow--soft{opacity:.35}
.arch__inner{fill:none;stroke:rgba(255,242,207,.28);stroke-width:1.2}
.arch--seen .arch__glow{opacity:.9}
.arch--next .arch__glow{animation:breathe 3.2s ease-in-out infinite}
.arch--next .arch__frame{stroke:#FFD58A;stroke-width:2.6;filter:drop-shadow(0 0 14px rgba(255,213,138,.8))}
@keyframes breathe{0%,100%{opacity:.7}50%{opacity:1}}
.arch:active .arch__svg{transform:scale(.985)}
@media (hover:hover){.arch:hover .arch__svg{transform:translateY(-6px);filter:drop-shadow(0 0 22px rgba(255,213,138,.45))}.arch:hover .arch__glow{opacity:1}}
.arch__num{position:absolute;top:24%;left:0;right:0;color:#2a1608;opacity:.7;font-size:clamp(28px,calc(var(--aw) * .3),80px);pointer-events:none;text-shadow:0 1px 0 rgba(255,255,255,.25)}
.arch__label{display:grid;gap:0;margin-top:.9rem;line-height:1.35}
.arch__label strong{font-family:var(--font-display);font-size:clamp(19px,calc(var(--aw) * .18),40px);font-weight:700}
.arch__label .label{font-size:clamp(13px,calc(var(--aw) * .105),22px);color:var(--sand);opacity:.9}
.court__thread{display:flex;justify-content:center;gap:calc(var(--aw,8vw) * .18);padding:.9rem 4vw 1.4rem;position:relative;margin-top:.2rem}
.court__thread::before{content:'';position:absolute;inset-inline:6vw;top:calc(.9rem + 5px);height:1px;background:linear-gradient(to left,transparent,var(--gold) 12%,var(--gold) 88%,transparent);opacity:.55}
.court__knot{position:relative;flex:0 0 min(calc((100vw - 9vw) / (var(--n) * 1.2)),27vh);height:11px;display:grid;place-items:center}
.court__knot::before{content:'';width:11px;height:11px;border-radius:50%;background:var(--night);border:1px solid var(--gold);transition:all 400ms var(--ease-cine)}
.court__knot.is-lit::before{background:var(--gold);box-shadow:0 0 14px rgba(231,176,74,.9)}
.court__cta{display:grid;justify-items:center;gap:var(--s2);margin-top:var(--s3);position:relative;z-index:2}
.court__minor{display:flex;gap:var(--s2)}
.court__minor .btn{font-size:.8rem;min-height:calc(var(--target) * .8);opacity:.85}
[data-mode=mobile] .court{padding-top:calc(var(--target) + var(--s4))}
[data-mode=mobile] .court__wall{overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
[data-mode=mobile] .arcade{--aw:62vw;justify-content:flex-start;padding-inline:10vw}
[data-mode=mobile] .arch{scroll-snap-align:center}
[data-mode=mobile] .court__thread{display:none}
[data-mode=mobile] .court__battlement{display:none}
@media (max-height:820px){.court__hint{display:none}.court__minor{display:none}}
`
