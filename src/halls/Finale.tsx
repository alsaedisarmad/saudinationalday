import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { backdrop } from '../backdrop/Backdrop'
import { mapGeometry } from '../content/regions'
import { identity } from '../content/values'
import { values } from '../content/values'
import { audioClips } from '../content/audio'
import { toIndic } from '../content/quran'
import { questions } from '../content/quiz'
import { visible } from '../content/types'
import { Layer } from '../ui/Layer'
import { ExplorerCard } from '../ui/ExplorerCard'
import { AudioClip } from '../ui/AudioClip'
import { useStore } from '../session/store'
import { useSession } from '../session/session'
import { useDiscovery, litSet, discoverIds } from '../exhibition/discovery'
import { audio } from '../audio/engine'

/**
 * النهاية: ١) «ماذا تقول للسعودية؟» ← ٢) نقاط ضوء تتجمع على هيئة المملكة (المضيء منها بقدر ما اكتشفتَ)
 * ← ٣) المملكة العربية السعودية · اليوم الوطني · «عزّنا بطبعنا» · «السعودية... حكاية وطن» · «شكرًا لأنك عشت الحكاية».
 * (brief/04 §47). كلمة الزائر تبقى في الجلسة فقط؛ لا تُحفظ ولا تُرسل، وتُمسح على السبورة بعد الخمول.
 */
const chips = [...values.map((v) => v.phrase), 'شكرًا يا وطن', 'أحبّك يا وطن']
const N = 96

interface Dot { sx: number; sy: number; tx: number; ty: number; delay: number; ph: number }
const rnd = (() => { let s = 4242; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646 })()

export default function Finale() {
  const session = useSession()
  const mode = useStore((s) => s.mode)
  const reduced = useStore((s) => s.reducedMotion)
  const word = useStore((s) => s.word)
  const setWord = useStore((s) => s.setWord)
  const resetVisitor = useStore((s) => s.resetVisitor)
  const d = useDiscovery()
  const [phase, setPhase] = useState<'ask' | 'show'>(word ? 'show' : 'ask')
  const [draft, setDraft] = useState(word)
  const [done, setDone] = useState(false)
  const [cardOpen, setCardOpen] = useState(false)
  const [clipOpen, setClipOpen] = useState(false)
  const cv = useRef<HTMLCanvasElement>(null)
  const state = useRef({ g: 0, dots: 0, breathe: 0 })
  const tl = useRef<gsap.core.Timeline | null>(null)
  const titles = useRef<(HTMLDivElement | null)[]>([])
  const acts = useRef<HTMLDivElement>(null)
  const mapBox = useRef({ x: 0, y: 0, s: 1 })
  const wordEl = useRef<HTMLDivElement>(null)
  const stamps = useMemo(() => [...new Set(questions.filter(visible).map((q) => q.category))], [])
  const stampsEarned = useStore((s) => stamps.filter((c) => s.discovered.includes(discoverIds.quiz(c))).length)
  const clip = audioClips.find(visible)

  state.current.dots = d.dots
  useEffect(() => { backdrop.grade = 'finale'; backdrop.thread = 0; backdrop.threadY = 0.3 }, [])

  const dots = useMemo<Dot[]>(() => mapGeometry.points96.map(([x, y], i) => ({ sx: rnd(), sy: rnd(), tx: x, ty: y, delay: (i / N) * 0.55 + rnd() * 0.15, ph: rnd() * Math.PI * 2 })), [])

  // ——— الرسم: نقاط تتجمع ثم تتنفس ———
  useEffect(() => {
    if (phase !== 'show') return
    const c = cv.current!
    const g = c.getContext('2d')!
    let raf = 0
    const fit = () => {
      const r = c.getBoundingClientRect()
      const dpr = Math.min(devicePixelRatio || 1, 2)
      c.width = Math.round(r.width * dpr)
      c.height = Math.round(r.height * dpr)
      const [, , vw, vh] = mapGeometry.viewBox
      const s = Math.min((c.width * 0.86) / vw, (c.height * 0.94) / vh)
      mapBox.current = { x: (c.width - vw * s) / 2, y: (c.height - vh * s) / 2, s }
    }
    fit()
    window.addEventListener('resize', fit)
    const lit = () => litSet(state.current.dots)
    let litCache = lit()
    let lastDots = state.current.dots
    const outline = new Path2D(mapGeometry.outline)
    const t0 = performance.now()
    const draw = () => {
      raf = requestAnimationFrame(draw)
      if (lastDots !== state.current.dots) { litCache = lit(); lastDots = state.current.dots }
      const W = c.width, Hh = c.height
      g.clearRect(0, 0, W, Hh)
      const { x: ox, y: oy, s } = mapBox.current
      const gather = state.current.g
      const now = (performance.now() - t0) / 1000
      // حدّ المملكة بخط رفيع جدًا يظهر مع اكتمال التجمّع فتُقرأ الهيئة حتى لو أُضيئت نقاط قليلة
      const fade = Math.max(0, Math.min(1, (gather - 0.7) / 0.4))
      if (fade > 0) {
        g.save()
        g.translate(ox, oy)
        g.scale(s, s)
        g.strokeStyle = `rgba(216,195,160,${0.16 * fade})`
        g.lineWidth = 1.2 / s
        g.lineJoin = 'round'
        g.stroke(outline)
        g.restore()
      }
      for (let i = 0; i < N; i++) {
        const p = dots[i]
        const k = Math.max(0, Math.min(1, (gather - p.delay) / 0.45))
        const e = 1 - Math.pow(1 - k, 3)
        const x = (p.sx * W) * (1 - e) + (ox + p.tx * s) * e
        const y = (p.sy * Hh * 0.7) * (1 - e) + (oy + p.ty * s) * e
        const on = litCache.has(i)
        const tw = reduced ? 1 : 0.82 + 0.18 * Math.sin(now * 1.6 + p.ph)
        if (on) {
          const R = (26 + 10 * (1 - e)) * (s * 1.1 + 0.6)
          const grad = g.createRadialGradient(x, y, 0, x, y, R)
          grad.addColorStop(0, `rgba(255,222,150,${0.95 * tw})`)
          grad.addColorStop(0.3, `rgba(231,176,74,${0.45 * tw})`)
          grad.addColorStop(1, 'rgba(231,176,74,0)')
          g.fillStyle = grad
          g.beginPath()
          g.arc(x, y, R, 0, 6.2832)
          g.fill()
          g.fillStyle = '#FFF0C8'
          g.beginPath()
          g.arc(x, y, Math.max(2.2, 6.5 * s), 0, 6.2832)
          g.fill()
        } else {
          g.fillStyle = `rgba(216,195,160,${0.16 + 0.34 * e})`
          g.beginPath()
          g.arc(x, y, Math.max(1.6, 3.8 * s), 0, 6.2832)
          g.fill()
        }
      }
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', fit) }
  }, [phase, dots, reduced])

  // ——— السيناريو: عناوين متتابعة ثم أزرار ———
  useEffect(() => {
    if (phase !== 'show') return
    const T = titles.current.filter(Boolean) as HTMLDivElement[]
    const a = acts.current
    const finish = () => { setDone(true); if (a) gsap.to(a, { opacity: 1, y: 0, duration: 0.9, pointerEvents: 'auto' }) }
    if (reduced) {
      state.current.g = 1
      gsap.set(T.slice(0, -1), { opacity: 0 })
      gsap.set(T[T.length - 1], { opacity: 1, y: 0 })
      if (a) gsap.set(a, { opacity: 1, y: 0, pointerEvents: 'auto' })
      setDone(true)
      return
    }
    gsap.set(T, { opacity: 0, y: 14 })
    if (a) gsap.set(a, { opacity: 0, y: 12, pointerEvents: 'none' })
    const t = gsap.timeline({ delay: 0.4 })
    t.to(state.current, { g: 1.15, duration: 6.5, ease: 'power2.inOut' }, 0)
    const hold = 2.4
    const seq = T.length - 1 // العناوين المتتابعة؛ الأخير هو «شكرًا» الثابت
    for (let i = 0; i < seq; i++) {
      const at = 0.6 + i * 3.3
      t.to(T[i], { opacity: 1, y: 0, duration: 1.3, ease: 'power2.out' }, at)
      t.to(T[i], { opacity: 0, y: -10, duration: 0.9, ease: 'power1.in' }, at + 1.3 + hold - 0.9)
    }
    const last = 0.6 + seq * 3.3
    t.to(T[seq], { opacity: 1, y: 0, duration: 1.6, ease: 'power2.out', onStart: () => audio.chime(7) }, last)
    t.add(finish, last + 1.4)
    tl.current = t
    return () => { t.kill() }
  }, [phase, reduced])

  const skip = () => { tl.current?.progress(1) }
  const submit = () => {
    const w = draft.trim().slice(0, 40)
    setWord(w)
    audio.chime(w ? 6 : 2)
    setPhase('show')
  }
  const restart = () => {
    if (mode === 'smartboard') resetVisitor()
    session.goto('gate')
  }

  const lines = [
    { k: 'المملكة العربية السعودية', cls: 'fin__t1' },
    { k: 'اليوم الوطني', sub: identity.dateLabel, cls: 'fin__hero' },
    { k: `«${identity.slogan}»`, cls: 'fin__t2' },
    { k: `«${identity.title}»`, cls: 'fin__t2' },
    { k: 'شكرًا لأنك عشت الحكاية', cls: 'fin__t3' },
  ]

  if (phase === 'ask') {
    return (
      <div className="fin fin--ask">
        <div className="fin__ask">
          <div className="kicker">قبل أن تغادر</div>
          <h1 className="display-l">ماذا تقول للسعودية؟</h1>
          <p className="body-l fin__lead">اكتب كلمة أو جملة قصيرة ستضيء نجمةً في سمائها. تبقى كلمتك في هذه الجلسة فقط ولا تُحفظ.</p>
          <label className="sr-only" htmlFor="fin-word">كلمتك للسعودية</label>
          <input id="fin-word" className="fin__input" value={draft} maxLength={40} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit() }} placeholder="اكتب هنا…" autoComplete="off" enterKeyHint="done" />
          <ul className="fin__chips" aria-label="اقتراحات">
            {chips.map((c) => (
              <li key={c}><button className="fin__chip" onClick={() => { audio.tick(); setDraft(c) }}>{c}</button></li>
            ))}
          </ul>
          <div className="fin__row">
            <button className="btn btn--primary fin__go" onClick={submit}>أضئ نجمتي</button>
            <button className="btn" onClick={() => { setWord(''); setPhase('show') }}>تخطَّ</button>
          </div>
        </div>
        <style>{css}</style>
      </div>
    )
  }

  return (
    <div className="fin">
      <canvas ref={cv} className="fin__cv" role="img" aria-label={`نقاط ضوء على هيئة المملكة، أضأتَ منها ${d.dots}`} />
      <div className="fin__seq" aria-hidden>
        {lines.slice(0, -1).map((l, i) => (
          <div key={i} ref={(el) => { titles.current[i] = el }} className={`fin__t ${l.cls}`}>
            <span>{l.k}</span>
            {l.sub ? <small>{l.sub}</small> : null}
          </div>
        ))}
      </div>
      <div className="fin__final" aria-hidden>
        <div ref={(el) => { titles.current[lines.length - 1] = el }} className="fin__t fin__t3"><span>{lines[lines.length - 1].k}</span></div>
        {word && done && (
          <div ref={wordEl} className="fin__word">
            <span className="fin__star" aria-hidden />
            <span className="display-m">«{word}»</span>
          </div>
        )}
      </div>
      <p className="sr-only" role="status">شكرًا لأنك عشت الحكاية. المملكة العربية السعودية، اليوم الوطني، {identity.slogan}، {identity.title}. أضأتَ {d.dots} نقطة من خريطة المملكة.</p>
      <div className="fin__count label num" aria-hidden>{toIndic(d.dots)} نقطة مضيئة على خريطة المملكة</div>
      {!done && <button className="btn fin__skip" onClick={skip}>تخطَّ</button>}
      <div ref={acts} className="fin__acts">
        <div className="fin__row">
          <button className="btn btn--gold" onClick={() => { audio.chime(7); setCardOpen(true) }}>بطاقة المستكشف</button>
          <button className="btn btn--primary" onClick={restart}>{mode === 'smartboard' ? 'ابدأ زائرًا جديدًا' : 'العودة إلى البداية'}</button>
          {clip && <button className="btn" onClick={() => { audio.tick(); setClipOpen(true) }}>استمع: {clip.title}</button>}
          <button className="btn" onClick={() => session.goto('about')}>عن المعرض</button>
        </div>
      </div>
      <Layer open={clipOpen} onClose={() => setClipOpen(false)} title={clip?.title ?? ''} kicker="مقطع صوتي">
        {clip && <AudioClip clip={clip} />}
      </Layer>
      <Layer open={cardOpen} onClose={() => setCardOpen(false)} title="بطاقة المستكشف" kicker="لقطة رحلتك" width="wide">
        <ExplorerCard stamps={stampsEarned} stampsTotal={stamps.length} />
      </Layer>
      <style>{css}</style>
    </div>
  )
}

const css = `
.fin{position:absolute;inset:0;overflow:hidden}
.fin--ask{display:flex;padding:calc(var(--target) + var(--s6)) var(--s4) var(--s12);overflow:auto}
.fin__ask{display:grid;justify-items:center;text-align:center;gap:var(--s3);width:min(100%,50rem);margin:auto}
.fin__lead{max-width:34rem;opacity:.9}
.fin__input{width:100%;min-height:calc(var(--target) * 1.2);padding:0 var(--s3);background:rgba(11,18,16,.7);border:1px solid var(--gold);color:var(--museum-white);font:inherit;font-size:1.4rem;text-align:center;border-radius:2px}
.fin__input::placeholder{color:var(--fg-muted)}
.fin__chips{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:var(--s2);justify-content:center}
.fin__chip{min-height:calc(var(--target) * .85);padding-inline:var(--s3);border:1px solid var(--line);font-size:.95rem;transition:all 160ms var(--ease-cine)}
.fin__chip:active{background:rgba(201,164,92,.2);border-color:var(--gold)}
@media (hover:hover){.fin__chip:hover{border-color:var(--gold);color:var(--gold)}}
.fin__row{display:flex;flex-wrap:wrap;gap:var(--s3);justify-content:center;align-items:center}
.fin__go{min-width:calc(var(--target) * 3)}
.fin__cv{position:absolute;inset-inline:0;top:29%;height:46%;width:100%}
.fin__seq{position:absolute;inset:calc(var(--target) + var(--s4)) 0 24% 0;display:grid;place-items:center;pointer-events:none}
.fin__final{position:absolute;inset-inline:0;top:calc(var(--target) + var(--s6));display:grid;justify-items:center;gap:var(--s1);pointer-events:none}
.fin__t{grid-area:1/1;display:grid;justify-items:center;text-align:center;gap:.1em;padding-inline:var(--s4);text-shadow:0 0 50px rgba(231,176,74,.3)}
.fin__final .fin__t{grid-area:auto}
.fin__t1{font-family:var(--font-kufi);font-size:clamp(28px,5.4vmin,96px);color:var(--sand);letter-spacing:.06em}
.fin__hero span{font-family:var(--font-display);font-weight:700;font-size:clamp(48px,11vmin,190px);line-height:1.05;background:linear-gradient(180deg,#F5F0E6 8%,#E7C77A 55%,#9c7a34 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.fin__hero small{font-size:clamp(20px,3.4vmin,56px);color:var(--sand)}
.fin__t2{font-family:var(--font-display);font-weight:700;font-size:clamp(34px,7vmin,132px);color:var(--museum-white);line-height:1.2}
.fin__t3{font-family:var(--font-display);font-weight:700;font-size:clamp(34px,6vmin,110px);color:#FFE2A6}
.fin__word{display:flex;align-items:center;gap:var(--s2);color:#FFE2A6;text-shadow:0 0 30px rgba(231,176,74,.5);animation:finIn 1.4s var(--ease-cine) both}
.fin__star{width:.8em;height:.8em;background:#FFD58A;clip-path:polygon(50% 0,62% 38%,100% 38%,69% 60%,80% 100%,50% 76%,20% 100%,31% 60%,0 38%,38% 38%);box-shadow:0 0 20px #FFD58A}
@keyframes finIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.fin__count{position:absolute;inset-inline:0;top:76%;text-align:center;opacity:.85;pointer-events:none}
.fin__skip{position:absolute;inset-inline-start:var(--s3);bottom:calc(var(--s8) + var(--s6));opacity:.8}
.fin__acts{position:absolute;inset-inline:0;bottom:calc(var(--s8) + var(--s3));display:grid;justify-items:center;gap:var(--s2);padding-inline:var(--s3)}
[data-mode=mobile] .fin__cv{top:34%;height:36%}
[data-mode=mobile] .fin__seq{bottom:30%}
[data-mode=mobile] .fin__count{top:71%}
[data-mode=mobile] .fin__acts{bottom:calc(var(--s8) + var(--s1));gap:var(--s1)}
[data-mode=mobile] .fin__acts .btn{padding-inline:var(--s2);font-size:.9rem}
`
