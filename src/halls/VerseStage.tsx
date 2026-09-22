import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { verseById, tafsirFor, refLabel, type Verse } from '../content/quran'
import { Layer } from '../ui/Layer'
import { LongText, SourceLine } from '../ui/parts'
import { IconBack, IconNext } from '../ui/icons'
import { useStore } from '../session/store'
import { discoverIds } from '../exhibition/discovery'
import { audio } from '../audio/engine'
import { sources } from '../content/sources'

/**
 * تجربة الآية: هدوء، قوس ضوء، آية بحجم كبير كتلة واحدة (لا تحريك للحروف)، ثم «اكتشف المعنى» ← طبقة التفسير.
 * القرآن محور التجربة لا زخرفة (brief/04 §18). النص من research/_parts/verified_verses.json (مصدران مستقلان).
 */
export function VerseStage({ ids, index, onIndex, footer }: { ids: string[]; index: number; onIndex: (i: number) => void; footer?: React.ReactNode }) {
  const v: Verse = verseById(ids[index])
  const [open, setOpen] = useState(false)
  const discover = useStore((s) => s.discover)
  const reduced = useStore((s) => s.reducedMotion)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    discover(discoverIds.verse(v.id))
    if (reduced || !box.current) return
    const q = gsap.utils.selector(box.current)
    gsap.fromTo(q('.vs__ref, .vs__topic'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: 'power2.out' })
    gsap.fromTo(q('.vs__verse'), { opacity: 0, y: 18, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 2.4, ease: 'power2.out', delay: 0.3 })
    gsap.fromTo(q('.vs__actions'), { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 1.6 })
  }, [v.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const t = tafsirFor(v.id)
  const words = v.text.split(' ')
  const hl = v.highlightWords
  const openTafsir = () => { audio.chime(2); discover(discoverIds.tafsir(v.id)); setOpen(true) }
  const go = (d: number) => { const n = index + d; if (n >= 0 && n < ids.length) { audio.chime(n); onIndex(n) } }

  return (
    <div ref={box} className="vs">
      <svg className="vs__arch" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <linearGradient id="vsg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFD58A" stopOpacity=".55" /><stop offset=".6" stopColor="#E7B04A" stopOpacity=".08" /><stop offset="1" stopColor="#E7B04A" stopOpacity="0" /></linearGradient>
        </defs>
        <path d="M20 560 V220 C20 110 110 40 200 14 C290 40 380 110 380 220 V560" fill="url(#vsg)" stroke="#C9A45C" strokeOpacity=".55" strokeWidth="1.6" />
        <path d="M46 560 V226 C46 128 122 66 200 44 C278 66 354 128 354 226 V560" fill="none" stroke="#C9A45C" strokeOpacity=".22" strokeWidth="1" />
      </svg>

      <div className="vs__content">
        <div className="kicker vs__topic">{v.topic}</div>
        <div className="vs__ref label">{refLabel(v)}</div>
        <div className="vs__verse quran" lang="ar" dir="rtl">
          {hl ? (
            <>
              <span className="vs__mark">{words.slice(0, hl).join(' ')}</span>{' '}
              <span className="vs__rest">{words.slice(hl).join(' ')}</span>
            </>
          ) : v.text}
          <span className="vs__end"> ۝{String(v.ayah).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])}</span>
        </div>
        {hl ? <div className="label vs__note">المقطع المُضاء هو ما يشرحه التفسير المرافق.</div> : null}
        <div className="vs__actions">
          <button className="btn btn--gold vs__discover" onClick={openTafsir}>اكتشف المعنى</button>
        </div>
        <SourceLine ids={['quran-tanzil', 'quran-com']} label="نصّ الآية" />
      </div>

      {ids.length > 1 && (
        <div className="vs__nav" role="group" aria-label="آيات القاعة">
          <button className="btn btn--icon" disabled={index === ids.length - 1} onClick={() => go(1)} aria-label="الآية التالية"><IconBack /></button>
          <span className="vs__dots" aria-hidden>{ids.map((_, i) => <i key={i} className={i === index ? 'on' : ''} />)}</span>
          <button className="btn btn--icon" disabled={index === 0} onClick={() => go(-1)} aria-label="الآية السابقة"><IconNext /></button>
        </div>
      )}
      {footer}

      <Layer open={open} onClose={() => setOpen(false)} title="اكتشف المعنى" kicker={`${refLabel(v)} — تفسير السعدي`} width="wide">
        <p className="label" style={{ marginBottom: 'var(--s3)' }}>«{t.work}» للشيخ {t.author} رحمه الله.</p>
        <LongText paragraphs={t.paragraphs} />
        <SourceLine ids={t.sourceIds} label="مادة التفسير" />
        <p className="label" style={{ marginTop: 'var(--s2)' }}>{sources['team-text'].title}</p>
      </Layer>
      <style>{css}</style>
    </div>
  )
}

const css = `
.vs{position:absolute;inset:0;display:grid;place-items:center;padding:calc(var(--target) + var(--s6)) var(--s4) calc(var(--s12))}
.vs__arch{position:absolute;inset-block:8% 0;inset-inline:0;margin-inline:auto;height:92%;width:auto;max-width:92vw;opacity:.9;pointer-events:none}
.vs__content{position:relative;z-index:1;text-align:center;display:grid;justify-items:center;gap:var(--s2);max-width:min(64rem,88vw)}
.vs__ref{color:var(--sand)}
.vs__verse{padding-block:var(--s3);text-shadow:0 0 40px rgba(231,176,74,.25)}
.vs__rest{opacity:.55}
.vs__mark{color:#FFE2A6}
.vs__end{color:var(--gold);font-size:.7em}
.vs__note{opacity:.75}
.vs__actions{margin-top:var(--s2)}
.vs__discover{min-height:calc(var(--target) * 1.1);padding-inline:calc(var(--u) * 6);font-size:1.05rem}
.vs__nav{position:absolute;bottom:calc(var(--s8) + var(--s3));inset-inline:0;margin-inline:auto;width:max-content;display:flex;align-items:center;gap:var(--s3);z-index:3}
.vs__dots{display:flex;gap:10px}.vs__dots i{width:10px;height:10px;border-radius:50%;border:1px solid var(--gold);display:block}.vs__dots i.on{background:var(--gold);box-shadow:0 0 10px rgba(231,176,74,.8)}
.vs__nav .btn:disabled{opacity:.25;pointer-events:none}
@media (max-height:760px){.vs__arch{display:none}}
`
