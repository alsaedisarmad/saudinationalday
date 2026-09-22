import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { backdrop } from '../backdrop/Backdrop'
import { toIndic } from '../content/quran'
import { regions, mapGeometry, sitesOfRegion, regionById } from '../content/regions'
import { whcSites } from '../content/heritage'
import { architectureOf } from '../content/architecture'
import { photo, creditLine } from '../content/photos'
import { ReviewTag, LongText } from '../ui/parts'
import { SourceLine } from '../ui/parts'
import { useStore } from '../session/store'
import { discoverIds } from '../exhibition/discovery'
import { audio } from '../audio/engine'
import { IconPlus, IconMinus } from '../ui/icons'
import { useSession } from '../session/session'

/**
 * الأرض: المناطق الإدارية الثلاث عشرة. المس منطقة فتقترب الكاميرا منها وتظهر بطاقتها.
 * الحدود من geoBoundaries (ODbL، سنة 2017) للتوضيح فقط ← إشعار ظاهر (SC-13). العواصم من مصدر رسمي/ثانوي موثّق.
 */
const bbox = (d: string) => {
  const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
  for (let i = 0; i < n.length; i += 2) { x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]); y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]) }
  return { x0, y0, x1, y1 }
}

export default function Land() {
  const session = useSession()
  const [sel, setSel] = useState<string | null>(session.focus && regions.some((r) => r.id === session.focus) ? session.focus : null)
  const [vb, setVb] = useState({ x: 0, y: 0, w: mapGeometry.viewBox[2], h: mapGeometry.viewBox[3] })
  const vbRef = useRef(vb)
  const visited = useStore((s) => s.discovered)
  const discover = useStore((s) => s.discover)
  const reduced = useStore((s) => s.reducedMotion)
  const boxes = useMemo(() => Object.fromEntries(regions.map((r) => [r.id, bbox(r.d)])), [])
  const full = { x: -20, y: -20, w: mapGeometry.viewBox[2] + 40, h: mapGeometry.viewBox[3] + 40 }

  useEffect(() => { backdrop.grade = 'land'; backdrop.thread = 0; backdrop.threadY = 0.32 }, [])

  const zoomTo = (t: { x: number; y: number; w: number; h: number }) => {
    const o = { ...vbRef.current }
    if (reduced) { vbRef.current = t; setVb(t); return }
    gsap.to(o, { ...t, duration: 1.1, ease: 'power3.inOut', onUpdate: () => { vbRef.current = { ...o }; setVb({ ...o }) } })
  }
  useEffect(() => { vbRef.current = full; setVb(full); if (sel) select(sel, true) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const select = (id: string | null, silent = false) => {
    setSel(id)
    if (!id) { zoomTo(full); return }
    if (!silent) audio.chime(regions.findIndex((r) => r.id === id) % 8)
    discover(discoverIds.region(id))
    const b = boxes[id]
    const pad = 70
    const w0 = b.x1 - b.x0 + pad * 2, h0 = b.y1 - b.y0 + pad * 2
    // نحافظ على نسبة عرض/ارتفاع الحاوية تقريبًا 4:3 حتى لا تنضغط المنطقة
    const ar = 1.25
    const w = Math.max(w0, h0 * ar), h = w / ar
    zoomTo({ x: (b.x0 + b.x1) / 2 - w / 2, y: (b.y0 + b.y1) / 2 - h / 2, w, h })
  }
  const zoomBy = (f: number) => {
    const c = vbRef.current
    const w = c.w * f, h = c.h * f
    zoomTo({ x: c.x + (c.w - w) / 2, y: c.y + (c.h - h) / 2, w, h })
  }

  const cur = sel ? regionById(sel) : null
  const sites = cur ? sitesOfRegion(cur.id) : []
  const seen = (id: string) => visited.includes(discoverIds.region(id))

  return (
    <div className="land">
      <div className="land__map">
        <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} role="group" aria-label="خريطة المناطق الإدارية للمملكة (للتوضيح فقط)">
          <defs>
            <filter id="lshadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0b1210" floodOpacity=".35" /></filter>
          </defs>
          <g filter="url(#lshadow)">
            {regions.map((r) => (
              <path
                key={r.id}
                d={r.d}
                className={`land__region ${sel === r.id ? 'is-sel' : ''} ${sel && sel !== r.id ? 'is-dim' : ''} ${seen(r.id) ? 'is-seen' : ''}`}
                onClick={() => select(r.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(r.id) } }}
                tabIndex={0}
                role="button"
                aria-label={`${r.nameAr}، العاصمة الإدارية ${r.capitalAr}`}
                aria-pressed={sel === r.id}
              />
            ))}
          </g>
          <g pointerEvents="none">
            {regions.map((r) => (
              <text key={r.id} x={r.c[0]} y={r.c[1]} className={`land__label ${sel && sel !== r.id ? 'is-dim' : ''}`} textAnchor="middle">
                {r.nameAr.replace('منطقة ', '').replace('المنطقة ', '')}
              </text>
            ))}
          </g>
        </svg>
        <div className="land__zoom" role="group" aria-label="تكبير الخريطة">
          <button className="btn btn--icon" onClick={() => zoomBy(0.75)} aria-label="تقريب"><IconPlus /></button>
          <button className="btn btn--icon" onClick={() => zoomBy(1.3)} aria-label="تبعيد"><IconMinus /></button>
        </div>
        <div className="land__attr label">{mapGeometry.attribution}</div>
      </div>

      <aside className="land__panel" aria-live="polite">
        {!cur ? (
          <>
            <div className="kicker">الأرض</div>
            <h1 className="display-l">ثلاث عشرة منطقة</h1>
            <p className="body-l">المس منطقة على الخريطة لتقترب منها، أو اخترها من القائمة.</p>
            <ul className="land__chips">
              {regions.map((r) => (
                <li key={r.id}><button className={`land__chip ${seen(r.id) ? 'is-seen' : ''}`} onClick={() => select(r.id)}>{r.nameAr.replace('منطقة ', '').replace('المنطقة ', '')}</button></li>
              ))}
            </ul>
            <details className="land__whc">
              <summary>مواقع التراث العالمي في المملكة ({whcSites.length}) — اليونسكو</summary>
              <ul>
                {whcSites.map((s) => <li key={s.id}><strong>{s.nameAr}</strong> <span className="label">— {toIndic(s.year)} · {s.kind}</span></li>)}
              </ul>
              <SourceLine ids={['unesco-whc-sa']} />
            </details>
          </>
        ) : (
          <>
            <button className="btn" onClick={() => select(null)}>← كل المناطق</button>
            <div className="kicker" style={{ marginTop: 'var(--s3)' }}>المنطقة</div>
            <h1 className="display-l">{cur.nameAr}</h1>
            <p className="display-m">العاصمة الإدارية: {cur.capitalAr}</p>
            {(() => {
              const arch = architectureOf(cur.id)
              const p = arch ? photo(arch.building.photoId) : undefined
              if (!arch || !p) return null
              return (
                <div className="land__arch">
                  <figure className="land__fig">
                    <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" draggable={false} />
                    <figcaption className="label land__cap2">
                      <span>{arch.building.nameAr}</span>
                      <span className="land__credit">{creditLine(p)}</span>
                    </figcaption>
                  </figure>

                  <div className="kicker" style={{ marginTop: 'var(--s4)' }}>قصة المبنى</div>
                  <LongText paragraphs={arch.building.story} limit={280} />
                  <SourceLine ids={arch.building.sourceIds} />

                  <div className="kicker" style={{ marginTop: 'var(--s4)' }}>الزي التقليدي</div>
                  <p className="body-l"><strong>النساء: </strong>{arch.dress.women}</p>
                  <p className="body-l"><strong>الرجال: </strong>{arch.dress.men}</p>
                  <SourceLine ids={arch.dress.sourceIds} />

                  {arch.culture.length > 0 && (
                    <>
                      <div className="kicker" style={{ marginTop: 'var(--s4)' }}>ملامح ثقافية</div>
                      {arch.culture.map((c) => (
                        <div key={c.title} className="land__culture">
                          <p className="body-l"><strong>{c.title}: </strong>{c.text}</p>
                          <SourceLine ids={c.sourceIds} />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )
            })()}
            {sites.length > 0 ? (
              <div className="land__sites">
                <div className="kicker">من قائمة التراث العالمي لليونسكو <ReviewTag item={{ status: 'needs-review', sourceIds: [], note: 'ربط الموقع بالمنطقة اجتهاد بحثي يُراجَع مع هيئة التراث' }} /></div>
                {sites.map((x) => (
                  <div key={x.id} className="land__site">
                    <p className="body-l"><strong>{x.nameAr}</strong> — {toIndic(x.year)} · {x.kind}</p>
                    {x.summary && <p className="body-l land__sum">{x.summary}</p>}
                    <SourceLine ids={x.sourceIds} label="اليونسكو" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="body-l land__cap">اقرأ في قائمة «مواقع التراث العالمي» أسفل الخريطة ما سجّلته اليونسكو للمملكة.</p>
            )}
            <SourceLine ids={cur.sourceIds} />
          </>
        )}
      </aside>
      <style>{css}</style>
    </div>
  )
}

const css = `
.land{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(20rem,1fr);gap:var(--s4);padding:calc(var(--target) + var(--s5)) var(--s4) calc(var(--s8) + var(--s6))}
.land__map{position:relative;min-height:0;order:2}
.land__map svg{width:100%;height:100%;display:block;overflow:visible;touch-action:manipulation}
.land__region{fill:#d9c7a1;stroke:#0A3D2A;stroke-width:1.6;stroke-linejoin:round;cursor:pointer;transition:fill 300ms var(--ease-cine),opacity 400ms var(--ease-cine);outline:none}
.land__region.is-seen{fill:#b7cdab}
.land__region.is-sel{fill:#E7B04A;stroke:#7D5F22;stroke-width:2.6}
.land__region.is-dim{opacity:.5}
.land__region:focus-visible{stroke:#005430;stroke-width:4}
@media (hover:hover){.land__region:hover{fill:#f0d9a3}}
.land__label{font-family:var(--font-display);font-weight:700;font-size:21px;fill:#0A3D2A;paint-order:stroke;stroke:rgba(245,240,230,.85);stroke-width:4px;stroke-linejoin:round}
.land__label.is-dim{opacity:.35}
.land__zoom{position:absolute;bottom:var(--s2);inset-inline-start:0;display:grid;gap:var(--s1)}
.land__attr{position:absolute;bottom:0;inset-inline-end:0;background:rgba(11,18,16,.75);padding:2px 8px;font-size:.65rem;max-width:80%}
.land__panel{order:1;z-index:1;background:rgba(11,18,16,.82);backdrop-filter:blur(10px);border:1px solid var(--line);padding:var(--s4);overflow:auto;display:flex;flex-direction:column;gap:var(--s2);align-self:stretch}
.land__chips{list-style:none;margin:var(--s2) 0 0;padding:0;display:flex;flex-wrap:wrap;gap:var(--s1)}
.land__chip{min-height:calc(var(--target)*.8);padding-inline:var(--s3);border:1px solid var(--line);font-size:.9rem}
.land__chip.is-seen{border-color:var(--saudi-green-light);color:var(--saudi-green-light)}
.land__whc{margin-top:var(--s3)}
.land__whc summary{cursor:pointer;min-height:var(--target);display:flex;align-items:center;color:var(--gold)}
.land__whc ul{padding-inline-start:1.1em;display:grid;gap:.35em}
.land__site{margin-top:var(--s2)}.land__sum{opacity:.92}
.land__sites{margin-top:var(--s2);border-inline-start:2px solid var(--gold);padding-inline-start:var(--s3)}
.land__arch{display:flex;flex-direction:column}
.land__fig{margin:var(--s2) 0 0;border:1px solid var(--line)}
.land__fig img{display:block;width:100%;height:auto}
.land__cap2{display:flex;flex-direction:column;gap:.2em;padding:var(--s1) var(--s2);background:rgba(11,18,16,.6)}
.land__credit{opacity:.75;font-size:.8em}
.land__culture{margin-top:var(--s2);border-inline-start:2px solid var(--saudi-green-light);padding-inline-start:var(--s3)}
[data-mode=mobile] .land{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) auto;padding-inline:var(--s2)}
[data-mode=mobile] .land__map{order:1}[data-mode=mobile] .land__panel{order:2;max-height:44vh}
@media (max-width:900px){.land{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) auto}.land__map{order:1}.land__panel{order:2;max-height:44vh}}
`
