import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { backdrop } from '../backdrop/Backdrop'
import { questions, categoryLabel, type QuizCategory, type Question } from '../content/quiz'
import { visible } from '../content/types'
import { toIndic } from '../content/quran'
import { SourceLine } from '../ui/parts'
import { ExplorerCard } from '../ui/ExplorerCard'
import { useStore } from '../session/store'
import { useSession } from '../session/session'
import { discoverIds } from '../exhibition/discovery'
import { audio } from '../audio/engine'

/**
 * تحدّي المستكشف: جولات قصيرة من أسئلة مأخوذة كلها من محتوى المعرض الموثَّق (لكل سؤال contentRef ومصدر).
 * كل جولة تنتهي بختم إن أصاب الزائر نصف الأسئلة على الأقل؛ اكتمال الأختام = «مستكشف سعودي» + بطاقة المستكشف.
 */
const ROUND = 4
const STAR = 'M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9L9.5 8 12 3Z'
const ORDER: QuizCategory[] = ['quran', 'identity', 'heritage', 'geography', 'nationalDay', 'security']
const numeric = (cs: string[]) => cs.every((c) => /^[٠-٩0-9]+$/.test(c.trim()))

interface Shown { q: Question; choices: { text: string; ok: boolean }[] }
const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] } return r }
const prepare = (q: Question): Shown => {
  const list = q.choices.map((text, i) => ({ text, ok: i === q.answer }))
  return { q, choices: numeric(q.choices) ? list : shuffle(list) }
}

type View = { t: 'home' } | { t: 'round'; cat: QuizCategory; items: Shown[]; i: number; correct: number; picked: number | null } | { t: 'result'; cat: QuizCategory; correct: number; n: number; earned: boolean } | { t: 'card' }

export default function Challenge() {
  const session = useSession()
  const discovered = useStore((s) => s.discovered)
  const discover = useStore((s) => s.discover)
  const reduced = useStore((s) => s.reducedMotion)
  const cats = useMemo(() => ORDER.filter((c) => questions.some((q) => q.category === c && visible(q))), [])
  const [view, setView] = useState<View>({ t: 'home' })
  const box = useRef<HTMLDivElement>(null)
  const earned = (c: QuizCategory) => discovered.includes(discoverIds.quiz(c))
  const stamps = cats.filter(earned).length
  const all = stamps === cats.length && cats.length > 0

  useEffect(() => { backdrop.grade = 'challenge'; backdrop.thread = 0; backdrop.threadY = 0.34 }, [])
  useEffect(() => {
    if (reduced || !box.current) return
    gsap.fromTo(box.current.querySelectorAll('[data-in]'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power2.out' })
  }, [view.t, view.t === 'round' ? view.i : 0, reduced]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = (cat: QuizCategory) => {
    audio.chime(1)
    const pool = shuffle(questions.filter((q) => q.category === cat && visible(q))).slice(0, ROUND)
    setView({ t: 'round', cat, items: pool.map(prepare), i: 0, correct: 0, picked: null })
  }
  const pick = (k: number) => {
    if (view.t !== 'round' || view.picked !== null) return
    const ok = view.items[view.i].choices[k].ok
    audio.chime(ok ? 5 : 0)
    setView({ ...view, picked: k, correct: view.correct + (ok ? 1 : 0) })
  }
  const next = () => {
    if (view.t !== 'round') return
    audio.tick()
    if (view.i + 1 < view.items.length) return setView({ ...view, i: view.i + 1, picked: null })
    const n = view.items.length
    const ok = view.correct * 2 >= n
    if (ok) { discover(discoverIds.quiz(view.cat)); audio.chime(7) }
    setView({ t: 'result', cat: view.cat, correct: view.correct, n, earned: ok })
  }

  return (
    <div ref={box} className="ch">
      {view.t === 'home' && (
        <div className="ch__home">
          <div data-in className="kicker">اكتشف</div>
          <h1 data-in className="display-l">تحدّي المستكشف</h1>
          <p data-in className="body-l ch__lead">جولات قصيرة من أسئلة المعرض. أصِب نصفها لتنال ختم الجولة، واجمع أختامك كلها لتصير «مستكشفًا سعوديًا».</p>
          <ul data-in className="ch__stamps" aria-label="أختام التحدّي">
            {cats.map((c) => (
              <li key={c}>
                <button className={`stamp ${earned(c) ? 'is-earned' : ''}`} onClick={() => start(c)} aria-label={`${categoryLabel[c]} — ${earned(c) ? 'نلتَ الختم، العب مجددًا' : 'ابدأ الجولة'}`}>
                  <svg viewBox="0 0 120 120" aria-hidden>
                    <circle cx="60" cy="60" r="56" className="stamp__ring" />
                    <circle cx="60" cy="60" r="46" className="stamp__ring2" />
                    <path className="stamp__mark" d={STAR} transform="translate(60 61) scale(2.7) translate(-12 -11.5)" />
                  </svg>
                  <span className="stamp__name">{categoryLabel[c]}</span>
                  <span className="label">{toIndic(questions.filter((q) => q.category === c && visible(q)).length)} أسئلة</span>
                </button>
              </li>
            ))}
          </ul>
          <div data-in className="ch__row">
            <span className="label num" aria-live="polite">الأختام: {toIndic(stamps)} من {toIndic(cats.length)}</span>
            {all ? <button className="btn btn--gold" onClick={() => { audio.chime(7); setView({ t: 'card' }) }}>بطاقة المستكشف</button> : null}
          </div>
          {all && <p data-in className="display-m ch__title">أنتَ الآن «مستكشف سعودي»</p>}
        </div>
      )}

      {view.t === 'round' && (() => {
        const cur = view.items[view.i]
        const done = view.picked !== null
        return (
          <div className="ch__round" role="group" aria-label={`جولة ${categoryLabel[view.cat]}`}>
            <div data-in className="kicker">{categoryLabel[view.cat]} · السؤال {toIndic(view.i + 1)} من {toIndic(view.items.length)}</div>
            <h1 data-in className="display-m ch__q">{cur.q.prompt}</h1>
            <ul data-in className="ch__choices">
              {cur.choices.map((c, k) => {
                const state = !done ? '' : c.ok ? 'is-right' : view.picked === k ? 'is-wrong' : 'is-dim'
                return (
                  <li key={k}>
                    <button className={`choice ${state}`} onClick={() => pick(k)} disabled={done} aria-pressed={view.picked === k}>
                      <span className="choice__n" aria-hidden>{toIndic(k + 1)}</span>
                      <span>{c.text}</span>
                      {done && c.ok ? <span className="sr-only"> — الإجابة الصحيحة</span> : null}
                    </button>
                  </li>
                )
              })}
            </ul>
            {done && (
              <div className="ch__why" role="status">
                <p className="body-l"><strong>{cur.choices[view.picked!].ok ? 'أحسنتَ! ' : 'ليست هذه. '}</strong>{cur.q.explanation}</p>
                <SourceLine ids={cur.q.sourceIds} />
                <button className="btn btn--primary" onClick={next} autoFocus>{view.i + 1 < view.items.length ? 'التالي' : 'انتهت الجولة'}</button>
              </div>
            )}
          </div>
        )
      })()}

      {view.t === 'result' && (
        <div className="ch__home">
          <div data-in className="kicker">{categoryLabel[view.cat]}</div>
          <h1 data-in className="display-l">{toIndic(view.correct)} من {toIndic(view.n)}</h1>
          {view.earned ? (
            <>
              <div data-in className="stamp stamp--big is-earned" aria-hidden>
                <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" className="stamp__ring" /><circle cx="60" cy="60" r="46" className="stamp__ring2" /><path className="stamp__mark" d={STAR} transform="translate(60 61) scale(2.7) translate(-12 -11.5)" /></svg>
              </div>
              <p data-in className="display-m" role="status">نلتَ ختم «{categoryLabel[view.cat]}»</p>
            </>
          ) : (
            <p data-in className="body-l" role="status">اقتربتَ! أعد الجولة بأسئلة جديدة لتنال الختم.</p>
          )}
          <div data-in className="ch__row">
            <button className="btn btn--primary" onClick={() => start(view.cat)}>{view.earned ? 'العب مجددًا' : 'أعد المحاولة'}</button>
            <button className="btn" onClick={() => setView({ t: 'home' })}>الأختام</button>
            {all && <button className="btn btn--gold" onClick={() => setView({ t: 'card' })}>بطاقة المستكشف</button>}
          </div>
        </div>
      )}

      {view.t === 'card' && (
        <div className="ch__card">
          <ExplorerCard stamps={stamps} stampsTotal={cats.length} />
          <div className="ch__row">
            <button className="btn" onClick={() => setView({ t: 'home' })}>رجوع</button>
            <button className="btn btn--primary" onClick={() => session.goto('finale')}>إلى النهاية</button>
          </div>
        </div>
      )}
      <style>{css}</style>
    </div>
  )
}

const css = `
.ch::before{content:'؟';position:absolute;inset:0;display:grid;place-items:center;font-family:var(--font-display);font-size:min(78vh,60vw);line-height:1;color:transparent;-webkit-text-stroke:1.5px rgba(201,164,92,.10);pointer-events:none}
.ch{position:absolute;inset:0;overflow:auto;padding:calc(var(--target) + var(--s6)) var(--s4) calc(var(--s12) * 1.5);display:flex}
.ch>*{margin:auto}
.ch__home,.ch__round,.ch__card{display:grid;justify-items:center;text-align:center;gap:var(--s3);width:min(100%,64rem)}
.ch__lead{max-width:40rem;opacity:.92}
.ch__stamps{list-style:none;margin:var(--s2) 0 0;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:var(--s4)}
.ch__row{display:flex;flex-wrap:wrap;gap:var(--s3);align-items:center;justify-content:center}
.ch__title{color:#FFE2A6;text-shadow:0 0 40px rgba(231,176,74,.4)}
.stamp{display:grid;justify-items:center;gap:.25em;width:clamp(120px,15vw,200px);padding:var(--s2);border:1px solid transparent;transition:transform 260ms var(--ease-cine)}
.stamp svg{width:100%;height:auto;overflow:visible}
.stamp__ring{fill:rgba(216,195,160,.05);stroke:var(--sand);stroke-width:2;stroke-dasharray:3 5;opacity:.6}
.stamp__ring2{fill:none;stroke:var(--sand);stroke-width:1.5;opacity:.5}
.stamp__mark{fill:none;stroke:var(--sand);stroke-width:.9;opacity:.55;stroke-linejoin:miter}
.stamp__name{font-family:var(--font-display);font-weight:700;font-size:1.25rem;line-height:1.3}
.stamp.is-earned .stamp__ring{fill:rgba(231,176,74,.16);stroke:#FFD58A;stroke-dasharray:none;opacity:1;filter:drop-shadow(0 0 14px rgba(255,213,138,.55))}
.stamp.is-earned .stamp__ring2{stroke:#FFD58A;opacity:.9}
.stamp.is-earned .stamp__mark{stroke:#FFD58A;fill:rgba(255,213,138,.25);opacity:1}
.stamp.is-earned .stamp__name{color:#FFE2A6}
.stamp--big{width:clamp(150px,20vw,260px);animation:stampIn .9s var(--ease-cine) both}
@keyframes stampIn{0%{transform:scale(1.6) rotate(-14deg);opacity:0}60%{transform:scale(.96) rotate(3deg);opacity:1}100%{transform:none}}
@media (hover:hover){.stamp:hover{transform:translateY(-4px)}}
.ch__q{max-width:44rem;line-height:1.5}
.ch__choices{list-style:none;margin:var(--s2) 0 0;padding:0;display:grid;gap:var(--s2);width:min(100%,46rem)}
.choice{display:flex;align-items:center;gap:var(--s3);width:100%;min-height:calc(var(--target) * 1.05);padding:var(--s1) var(--s3);text-align:start;border:1px solid var(--line);background:rgba(11,18,16,.6);font-size:1.1rem;transition:all 200ms var(--ease-cine)}
.choice__n{display:grid;place-items:center;flex:0 0 auto;width:calc(var(--target) * .6);height:calc(var(--target) * .6);border:1px solid var(--gold);border-radius:50%;color:var(--gold);font-size:.9rem}
.choice:disabled{cursor:default}
.choice.is-right{border-color:#8FD0A9;background:rgba(0,108,53,.35)}
.choice.is-right .choice__n{background:#8FD0A9;color:#0B1210;border-color:#8FD0A9}
.choice.is-wrong{border-color:#C58A6B;background:rgba(158,98,72,.3)}
.choice.is-dim{display:none}
@media (hover:hover){.choice:not(:disabled):hover{border-color:var(--gold);background:rgba(201,164,92,.12)}}
.ch__why{display:grid;justify-items:center;gap:var(--s2);max-width:44rem;margin-top:var(--s2)}
[data-mode=mobile] .ch{padding-inline:var(--s2)}
[data-mode=mobile] .stamp{width:38vw}
`
