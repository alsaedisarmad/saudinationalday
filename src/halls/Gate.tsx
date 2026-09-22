import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { backdrop } from '../backdrop/Backdrop'
import { useSession } from '../session/session'
import { useStore } from '../session/store'
import { audio } from '../audio/engine'
import { clipPlayer } from '../audio/clip'
import { identity } from '../content/values'
import logoSrc from '../assets/brand/logo.webp'

/**
 * البوابة: ظلام ← خيط ضوء يعبر من اليمين ← «المملكة العربية السعودية» ← «اليوم الوطني» ← تاريخه ← «عزّنا بطبعنا» ← ابدأ الرحلة.
 * (brief/01 §6، brief/04 §14). الخيط نفسه هو الفكرة المركزية للمعرض (EXHIBITION_CONCEPT §1).
 */
export default function Gate() {
  const session = useSession()
  const store = useStore()
  const r = { logo: useRef<HTMLImageElement>(null), kicker: useRef<HTMLDivElement>(null), num: useRef<HTMLDivElement>(null), sub: useRef<HTMLDivElement>(null), rule: useRef<HTMLDivElement>(null), slogan: useRef<HTMLDivElement>(null), cta: useRef<HTMLDivElement>(null), credit: useRef<HTMLDivElement>(null), anchor: useRef<HTMLDivElement>(null), skip: useRef<HTMLButtonElement>(null), btn: useRef<HTMLButtonElement>(null) }
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    backdrop.grade = 'gate'
    backdrop.thread = 0
    backdrop.pulse = 0
    const align = () => {
      const a = r.anchor.current
      if (!a) return
      const b = a.getBoundingClientRect()
      backdrop.threadY = 1 - (b.top + b.height / 2) / window.innerHeight
    }
    align()
    window.addEventListener('resize', align)
    const items = [r.logo.current, r.kicker.current, r.num.current, r.sub.current, r.rule.current, r.slogan.current, r.cta.current, r.credit.current]
    if (useStore.getState().reducedMotion) {
      gsap.set(items, { opacity: 1 })
      backdrop.thread = 1
      backdrop.pulse = 1
      r.btn.current?.focus()
      return () => window.removeEventListener('resize', align)
    }
    gsap.set(items, { opacity: 0 })
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.to(backdrop, { thread: 1, duration: 3, ease: 'power2.inOut', delay: 0.7 })
      .fromTo(r.logo.current, { opacity: 0, y: 10, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.6 }, '-=1.4')
      .fromTo(r.kicker.current, { opacity: 0, y: 12, letterSpacing: '0.4em' }, { opacity: 1, y: 0, letterSpacing: '0.12em', duration: 1.8 }, '-=1.1')
      .fromTo(r.num.current, { opacity: 0, y: 30, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 2.2, ease: 'power3.out' }, '-=0.5')
      .to(backdrop, { pulse: 1, duration: 2 }, '<')
      .fromTo(r.sub.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.6 }, '-=0.6')
      .fromTo(r.rule.current, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 1.2 }, '-=0.4')
      .fromTo(r.slogan.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.8 }, '-=0.6')
      .fromTo([r.cta.current, r.credit.current], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.3, onComplete: () => { r.btn.current?.focus({ preventScroll: true }); gsap.to(r.skip.current, { opacity: 0, duration: 0.6, pointerEvents: 'none' }) } }, '-=0.5')
    tlRef.current = tl
    return () => { tl.kill(); window.removeEventListener('resize', align) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const skip = () => { tlRef.current?.progress(1); backdrop.thread = 1; backdrop.pulse = 1; r.btn.current?.focus() }
  const start = () => {
    audio.unlock()
    store.setSound(true)
    audio.setEnabled(true)
    audio.chime(4)
    audio.whoosh(1.8)
    clipPlayer.playOnce()
    session.goto('courtyard')
  }

  return (
    <div className="gate">
      <button ref={r.skip} className="btn gate__skip" onClick={skip}>تخطَّ المقدمة</button>
      <img ref={r.logo} className="gate__logo" src={logoSrc} width={1200} height={630} alt={`${identity.slogan} — اليوم الوطني السعودي`} draggable={false} />
      <div ref={r.kicker} className="gate__kicker">المملكة العربية السعودية</div>
      <div ref={r.num} className="gate__num">اليوم الوطني</div>
      <div ref={r.anchor} className="gate__anchor" aria-hidden />
      <div ref={r.sub} className="gate__sub">{identity.dateLabel}</div>
      <div ref={r.rule} className="gate__rule" aria-hidden />
      <div ref={r.slogan} className="gate__slogan">«{identity.slogan}»</div>
      <div ref={r.cta} className="gate__cta">
        <button ref={r.btn} className="btn btn--primary gate__btn" onClick={start}>ابدأ الرحلة</button>
      </div>
      <div ref={r.credit} className="gate__credit label">{identity.attribution}</div>
      <style>{css}</style>
    </div>
  )
}

const css = `
.gate{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:var(--s4);padding-bottom:calc(var(--s12) * 1.2)}
.gate__skip{position:absolute;top:var(--s3);inset-inline-start:var(--s3);opacity:.7;font-size:.8rem}
.gate__logo{width:min(72vw,340px);height:auto;margin-bottom:clamp(14px,3vmin,36px);filter:drop-shadow(0 4px 30px rgba(0,0,0,.35))}
.gate__kicker{font-family:var(--font-kufi);font-size:clamp(16px,2.7vmin,46px);color:var(--sand);letter-spacing:.12em;margin-bottom:clamp(6px,1.6vmin,28px)}
.gate__num{font-family:var(--font-display);font-weight:700;font-size:clamp(40px,9vmin,170px);line-height:1.05;letter-spacing:-.01em;background:linear-gradient(180deg,#F5F0E6 8%,#E7C77A 55%,#9c7a34 100%);-webkit-background-clip:text;background-clip:text;color:transparent;padding-inline:.05em;filter:drop-shadow(0 0 40px rgba(231,176,74,.25))}
.gate__anchor{height:2px;width:1px;margin-block:clamp(10px,2.6vmin,44px)}
.gate__sub{font-family:var(--font-display);font-size:clamp(20px,3.6vmin,60px);color:var(--museum-white)}
.gate__rule{width:min(34vw,460px);height:1px;background:linear-gradient(to right,transparent,var(--gold),transparent);margin-block:clamp(12px,3vmin,44px)}
.gate__slogan{font-family:var(--font-display);font-weight:700;font-size:clamp(34px,7.2vmin,138px);color:var(--sand);line-height:1.15}
.gate__cta{margin-top:clamp(20px,5vmin,72px)}
.gate__credit{position:absolute;bottom:var(--s3);inset-inline:0;opacity:.7}
.gate__btn{min-height:calc(var(--target) * 1.15);padding-inline:calc(var(--u) * 7);font-size:1.15rem;letter-spacing:.04em}
[data-mode=mobile] .gate__num{font-size:clamp(34px,10vmin,90px)}
`
