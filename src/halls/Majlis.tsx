import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { backdrop } from '../backdrop/Backdrop'
import { majlisSpots } from '../content/majlis'
import { visible } from '../content/types'
import { ichById } from '../content/heritage'
import { photo, creditLine } from '../content/photos'
import { Layer } from '../ui/Layer'
import { SourceLine, ReviewTag, LongText } from '../ui/parts'
import { IconGlyph } from '../ui/icons'
import { useStore } from '../session/store'
import { useSession } from '../session/session'
import { discoverIds } from '../exhibition/discovery'
import { audio } from '../audio/engine'
import type { Quality } from './majlis3d/Scene'

// three/R3F لا يُحمَّلان إلا عند دخول هذه القاعة (code-splitting)
const Scene = lazy(() => import('./majlis3d/Scene'))

/**
 * المجلس (Full 3D إجرائي): سجاد سدو، دلّة وفناجين، مبخرة، مشربية تُسقط ضوءها على الأرض، بشت معلّق، كوّة مضيئة.
 * ست نقاط ساخنة كبيرة اللمس (بديلها أزرار DOM في الأسفل) — كل منها يفتح ما وثّقته اليونسكو فقط.
 */
export default function Majlis() {
  const session = useSession()
  const mode = useStore((s) => s.mode)
  const reduced = useStore((s) => s.reducedMotion)
  const seenAll = useStore((s) => s.discovered)
  const discover = useStore((s) => s.discover)
  const spots = useMemo(() => majlisSpots.filter(visible), [])
  const [focus, setFocus] = useState<string | null>(session.focus && spots.some((s) => s.id === session.focus) ? session.focus : null)
  const [pouring, setPouring] = useState(false)
  const timer = useRef<number>(0)
  const webgl = useMemo(() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }, [])
  const quality: Quality = mode === 'mobile' ? 'low' : mode === 'smartboard' || mode === 'tablet' ? 'mid' : 'high'
  const seen = spots.filter((s) => seenAll.includes(discoverIds.majlis(s.id))).map((s) => s.id)
  const cur = spots.find((s) => s.id === focus) ?? null

  useEffect(() => {
    backdrop.grade = 'majlis'
    backdrop.thread = 0
    backdrop.paused = webgl // المشهد ثلاثي الأبعاد يملأ الشاشة: لا حاجة لرسم الخلفية تحته
    return () => { backdrop.paused = false }
  }, [webgl])
  useEffect(() => { if (focus) discover(discoverIds.majlis(focus)) }, [focus]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), [])

  const open = (id: string) => { audio.chime(spots.findIndex((s) => s.id === id)); setFocus(id) }
  const pour = () => { setPouring(true); audio.pour(1.8); clearTimeout(timer.current); timer.current = window.setTimeout(() => { setPouring(false); audio.chime(6) }, 2000) }

  return (
    <div className="mj">
      {webgl ? (
        <Suspense fallback={<div className="mj__loading label">يُجهَّز المجلس…</div>}>
          <Scene spots={spots} focusId={focus} onSelect={open} pouring={pouring} quality={quality} reduced={reduced} seen={seen} />
        </Suspense>
      ) : (
        <div className="mj__fallback">
          {spots.map((s) => <button key={s.id} className="btn mj__card" onClick={() => open(s.id)}><IconGlyph name={s.icon} /> <strong>{s.label}</strong></button>)}
        </div>
      )}

      <div className="mj__title">
        <div className="kicker">المجلس</div>
        <h1 className="display-m">ادخل المجلس والمس ما فيه</h1>
      </div>

      <nav className="mj__bar" aria-label="نقاط المجلس">
        {spots.map((s) => (
          <button key={s.id} className={`mj__btn ${seen.includes(s.id) ? 'is-seen' : ''} ${focus === s.id ? 'is-on' : ''}`} onClick={() => open(s.id)} aria-pressed={focus === s.id}>
            <IconGlyph name={s.icon} /> <span>{s.label}</span>
          </button>
        ))}
      </nav>

      <Layer open={!!cur} onClose={() => setFocus(null)} title={cur?.title ?? ''} kicker={cur ? `المجلس · ${cur.label}` : undefined}>
        {cur && (() => {
          const p = photo(cur.photoId)
          return (
            <>
              {p && (
                <figure className="mj__fig">
                  <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" draggable={false} />
                  <figcaption className="label mj__credit">{creditLine(p)}</figcaption>
                </figure>
              )}
              <p className="body-l">{cur.lead} <ReviewTag item={cur} /></p>
              <LongText paragraphs={cur.article} limit={320} />
              <SourceLine ids={cur.articleSourceIds} />
              <ul className="mj__facts">{cur.facts.map((f) => <li key={f} className="body-l">{f}</li>)}</ul>
              {cur.ichId && ichById(cur.ichId)?.summary && (
                <div className="mj__sum">
                  <div className="kicker">ما تقوله اليونسكو</div>
                  <p className="body-l">{ichById(cur.ichId)!.summary}</p>
                </div>
              )}
              {cur.id === 'coffee' && <button className="btn btn--gold" onClick={pour} disabled={pouring}>{pouring ? 'تُسكب القهوة…' : 'اسكب فنجانًا'}</button>}
              <SourceLine ids={cur.sourceIds} label="مصدر اليونسكو" />
            </>
          )
        })()}
      </Layer>
      <style>{css}</style>
    </div>
  )
}

const css = `
.mj{position:absolute;inset:0;background:linear-gradient(#1a1108,#3a2410)}
.mj__loading{position:absolute;inset:0;display:grid;place-items:center}
.mj__title{position:absolute;inset-inline-start:var(--s4);top:calc(var(--target) + var(--s5));pointer-events:none;text-shadow:0 2px 20px rgba(0,0,0,.6)}
.mj__bar{position:absolute;z-index:8;bottom:calc(var(--s8) + var(--s4));inset-inline:0;margin-inline:auto;width:max-content;max-width:96vw;display:flex;gap:var(--s2);flex-wrap:wrap;justify-content:center}
.mj__btn{display:inline-flex;align-items:center;gap:.5em;min-height:var(--target);padding-inline:var(--s3);border:1px solid var(--line);background:rgba(20,12,6,.6);backdrop-filter:blur(6px);transition:all 250ms var(--ease-cine)}
.mj__btn.is-seen{border-color:rgba(201,164,92,.7)}
.mj__btn.is-on{border-color:var(--gold);color:var(--gold);background:rgba(201,164,92,.16)}
.mj__sum{margin:var(--s3) 0;padding-inline-start:var(--s3);border-inline-start:2px solid var(--gold)}
.mj__fig{margin:0 0 var(--s3);border:1px solid var(--line)}
.mj__fig img{display:block;width:100%;height:auto}
.mj__credit{padding:var(--s1) var(--s2);background:rgba(11,18,16,.6);opacity:.85}
.mj__facts{padding-inline-start:1.1em;margin:var(--s3) 0;display:grid;gap:.4em}
.mj__fallback{position:absolute;inset:0;display:grid;place-content:center;grid-template-columns:repeat(2,minmax(9rem,1fr));gap:var(--s3);padding:var(--s6)}
.mj__card{min-height:calc(var(--target) * 2)}
.mj-spot{position:relative;display:grid;justify-items:center;gap:6px;cursor:pointer;color:#fff8e8;font-family:var(--font-ui)}
.mj-spot__core{width:calc(var(--target) * .82);height:calc(var(--target) * .82);border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,rgba(255,213,138,.95),rgba(201,164,92,.85));color:#2a1608;box-shadow:0 0 22px rgba(255,200,100,.75);position:relative;z-index:1}
.mj-spot__ring{position:absolute;top:0;left:50%;width:calc(var(--target) * .82);height:calc(var(--target) * .82);margin-inline-start:calc(var(--target) * -.41);border-radius:50%;border:2px solid rgba(255,213,138,.8);animation:mjpulse 2.4s ease-out infinite}
.mj-spot--seen .mj-spot__core{background:radial-gradient(circle,#c8e6d0,#4FA779);box-shadow:0 0 16px rgba(143,208,169,.7)}
.mj-spot--seen .mj-spot__ring{animation:none;opacity:0}
.mj-spot__label{background:rgba(20,12,6,.72);padding:1px 12px;border:1px solid rgba(201,164,92,.5);font-size:.9rem;white-space:nowrap;font-weight:500}
@keyframes mjpulse{0%{transform:scale(.9);opacity:.9}100%{transform:scale(1.9);opacity:0}}
[data-mode=mobile] .mj__title{inset-inline:var(--s3);top:calc(var(--target) + var(--s3))}
[data-mode=mobile] .mj__bar{gap:var(--s1)}
[data-mode=mobile] .mj__btn span{display:none}
`
