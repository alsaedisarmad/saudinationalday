import { useEffect, useMemo, useRef, useState } from 'react'
import { backdrop } from '../backdrop/Backdrop'
import { VerseStage } from './VerseStage'
import { security } from '../content/security'
import { visible } from '../content/types'
import { ReviewTag, SourceLine } from '../ui/parts'
import { useStore } from '../session/store'
import { audio } from '../audio/engine'

/**
 * بلدًا آمنًا: دعوة إبراهيم (2:126، 14:35) ← من الظلمة إلى النور (مشهد رمزي موسوم «تصوّر إبداعي») ← الأمن مسؤولية الجميع (مادة الفريق، قيد المراجعة).
 * brief/01 §11: مشهد يتحول من الماضي إلى الحاضر ويظهر مفهوم الأمن ثم يُربط بالمادة التوعوية.
 */
const IDS = ['q2-126', 'q14-35']
type Tab = 'verses' | 'lights' | 'security'

export default function Safe() {
  const [tab, setTab] = useState<Tab>('verses')
  const [vi, setVi] = useState(0)
  const showSecurity = visible(security)
  const tabs: { id: Tab; label: string }[] = [
    { id: 'verses', label: 'الدعوة' },
    { id: 'lights', label: 'من الظلمة إلى النور' },
    ...(showSecurity ? [{ id: 'security' as Tab, label: 'الأمن مسؤولية الجميع' }] : []),
  ]
  useEffect(() => { backdrop.grade = 'safe'; backdrop.thread = 0; backdrop.threadY = 0.34 }, [])

  const bar = (
    <div className="safe__tabs" role="tablist" aria-label="فصول القاعة">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={tab === t.id} className={`safe__tab ${tab === t.id ? 'on' : ''}`} onClick={() => { audio.tick(); setTab(t.id) }}>{t.label}</button>
      ))}
      <style>{`.safe__tabs{position:absolute;z-index:8;bottom:calc(var(--s8) + var(--s6));inset-inline:0;margin-inline:auto;width:max-content;max-width:94vw;display:flex;gap:var(--s2);flex-wrap:wrap;justify-content:center}.safe__tab{min-height:var(--target);padding-inline:var(--s4);border:1px solid var(--line);background:rgba(11,18,16,.55);backdrop-filter:blur(6px);letter-spacing:.02em}.safe__tab.on{border-color:var(--gold);color:var(--gold);background:rgba(201,164,92,.12)}`}</style>
    </div>
  )

  return (
    <>
      {tab === 'verses' && <VerseStage ids={IDS} index={vi} onIndex={setVi} />}
      {tab === 'lights' && <Lights />}
      {tab === 'security' && <Security />}
      {bar}
    </>
  )
}

/** مشهد رمزي: شريط زمني من ليل قليل الأضواء إلى مدينة مضيئة. لا يمثل مكانًا ولا زمنًا محددًا. */
function Lights() {
  const cv = useRef<HTMLCanvasElement>(null)
  const [t, setT] = useState(0.08)
  const cur = useRef(0.08)
  const target = useRef(0.08)
  const reduced = useStore((s) => s.reducedMotion)
  target.current = t
  const rnd = useMemo(() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646 }, [])
  const blds = useMemo(() => Array.from({ length: 74 }, () => ({ h: 0.05 + rnd() * 0.32, w: 0.012 + rnd() * 0.022, order: rnd(), win: rnd() })), [rnd])

  useEffect(() => {
    const c = cv.current!
    const g = c.getContext('2d')!
    let raf = 0
    const size = () => { const r = c.getBoundingClientRect(); const d = Math.min(devicePixelRatio || 1, 2); c.width = r.width * d; c.height = r.height * d }
    size()
    window.addEventListener('resize', size)
    const draw = () => {
      raf = requestAnimationFrame(draw)
      cur.current += (target.current - cur.current) * (reduced ? 1 : 0.06)
      const k = cur.current
      const W = c.width, H = c.height
      g.clearRect(0, 0, W, H)
      const base = H * 0.86
      // وهج المدينة
      const glow = g.createRadialGradient(W / 2, base, 0, W / 2, base, W * 0.55)
      glow.addColorStop(0, `rgba(255,190,90,${0.05 + 0.32 * k})`)
      glow.addColorStop(1, 'rgba(255,190,90,0)')
      g.fillStyle = glow
      g.fillRect(0, 0, W, H)
      let x = W * 0.03
      const span = W * 0.94
      const count = Math.round(8 + 66 * k)
      const used = blds.slice().sort((a, b) => a.order - b.order).slice(0, count)
      const total = used.reduce((s, b) => s + b.w, 0)
      const scale = span / Math.max(total, 0.001)
      for (const b of used) {
        const bw = b.w * scale * 0.94, bh = b.h * H * (0.5 + 0.7 * k)
        g.fillStyle = 'rgba(8,12,20,.96)'
        g.fillRect(x, base - bh, bw, bh)
        const cols = Math.max(1, Math.floor(bw / (W * 0.011))), rows = Math.max(1, Math.floor(bh / (H * 0.03)))
        for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
          const on = ((i * 7 + j * 13 + Math.floor(b.win * 100)) % 100) / 100 < 0.06 + 0.9 * k
          if (!on) continue
          g.fillStyle = `rgba(255,${200 + ((i + j) % 3) * 15},120,${0.5 + 0.5 * k})`
          g.fillRect(x + (i + 0.3) * (bw / cols), base - bh + (j + 0.3) * (bh / rows), bw / cols * 0.42, bh / rows * 0.42)
        }
        x += bw + (b.w * scale * 0.06)
      }
      g.fillStyle = 'rgba(8,12,20,1)'
      g.fillRect(0, base, W, H - base)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size) }
  }, [blds, reduced])

  return (
    <div className="lt">
      <canvas ref={cv} className="lt__cv" aria-label="مشهد رمزي: من ليل قليل الأضواء إلى مدينة مضيئة" role="img" />
      <div className="lt__top">
        <div className="kicker">من الظلمة إلى النور</div>
        <h1 className="display-l">أمنٌ يُبنى، ونورٌ يزداد</h1>
        <span className="lt__badge">تصوّر إبداعي — مشهد رمزي لا يمثل مكانًا بعينه</span>
      </div>
      <div className="lt__ctrl">
        <button className="btn" onClick={() => { audio.chime(0); setT(0.08) }}>الماضي</button>
        <input type="range" min={0} max={100} value={Math.round(t * 100)} onChange={(e) => { setT(Number(e.target.value) / 100); if (Number(e.target.value) % 20 === 0) audio.chime(Number(e.target.value) / 20) }} aria-label="من الماضي إلى الحاضر" className="lt__range" />
        <button className="btn" onClick={() => { audio.chime(5); setT(1) }}>الحاضر</button>
      </div>
      <style>{`
.lt{position:absolute;inset:0}
.lt__cv{position:absolute;inset:0;width:100%;height:100%}
.lt__top{position:absolute;inset-inline:0;top:calc(var(--target) + var(--s6));display:grid;justify-items:center;gap:.3em;text-align:center;padding-inline:var(--s4)}
.lt__badge{font-size:.78rem;border:1px dashed var(--gold);color:var(--gold);padding:2px 12px;letter-spacing:.02em}
.lt__ctrl{position:absolute;inset-inline:0;bottom:calc(var(--s8) + var(--s6) + var(--target) + var(--s3));margin-inline:auto;width:min(80vw,46rem);display:flex;align-items:center;gap:var(--s3)}
.lt__range{flex:1;height:calc(var(--target)*.9);accent-color:#E7B04A;direction:ltr}
`}</style>
    </div>
  )
}

/** «الأمن مسؤولية الجميع» — أربع ركائز (أعمدة) تُضاء باللمس، ثم المؤسسات والواجبات (نص مقطع الفريق، قيد المراجعة) */
function Security() {
  const [sel, setSel] = useState<string>(security.pillars[0].id)
  const [more, setMore] = useState<'inst' | 'duty' | 'apps' | null>(null)
  const cur = security.pillars.find((p) => p.id === sel)!
  return (
    <div className="sec">
      <div className="sec__inner">
        <div className="kicker">الأمن الوطني <ReviewTag item={security} /></div>
        <h1 className="display-l">{security.headline}</h1>
        <p className="body-l" style={{ maxWidth: '40rem' }}>{security.definition}</p>
        <div className="sec__pillars" role="tablist" aria-label="ركائز الأمن الوطني">
          {security.pillars.map((p, i) => (
            <button key={p.id} role="tab" aria-selected={sel === p.id} className={`sec__pillar ${sel === p.id ? 'on' : ''}`} onClick={() => { audio.chime(i + 1); setSel(p.id) }}>
              <svg viewBox="0 0 80 120" aria-hidden><path d="M6 120V40C6 20 22 6 40 2c18 4 34 18 34 38v80" /></svg>
              <strong className="display-m">{p.title}</strong>
            </button>
          ))}
        </div>
        <p className="sec__text display-m" aria-live="polite">{cur.text}</p>
        <div className="sec__more">
          <button className="btn" onClick={() => setMore(more === 'inst' ? null : 'inst')} aria-expanded={more === 'inst'}>مؤسسات الأمن الوطني</button>
          <button className="btn" onClick={() => setMore(more === 'duty' ? null : 'duty')} aria-expanded={more === 'duty'}>واجبات المواطن</button>
          <button className="btn" onClick={() => setMore(more === 'apps' ? null : 'apps')} aria-expanded={more === 'apps'}>التقنية في خدمة الأمن</button>
        </div>
        {more === 'inst' && (
          <ul className="sec__list">
            {security.institutions.map((x) => (
              <li key={x.title}>
                <strong>{x.title}</strong>
                <span>{x.text}</span>
                <SourceLine ids={x.sourceIds} />
              </li>
            ))}
          </ul>
        )}
        {more === 'duty' && <ul className="sec__list">{security.duties.map((x) => <li key={x.title}><strong>{x.title}</strong><span>{x.text}</span></li>)}</ul>}
        {more === 'apps' && (
          <div className="sec__list">
            <p>{security.appsNote}</p>
            <ul className="sec__list">
              {security.apps.map((a) => (
                <li key={a.name}><strong>{a.name}</strong><span>{a.text}</span></li>
              ))}
            </ul>
            <SourceLine ids={security.appsSourceIds} />
          </div>
        )}
        <SourceLine ids={security.sourceIds} label="المصادر" />
      </div>
      <style>{`
.sec{position:absolute;inset:0;overflow:auto;padding:calc(var(--target) + var(--s6)) var(--s4) calc(var(--s12) * 1.6);display:grid;place-items:start center}
.sec__inner{display:grid;gap:var(--s3);justify-items:center;text-align:center;max-width:58rem;width:100%}
.sec__pillars{display:flex;gap:var(--s3);flex-wrap:wrap;justify-content:center;margin-top:var(--s2)}
.sec__pillar{width:clamp(110px,15vw,190px);display:grid;justify-items:center;gap:.3em;padding:var(--s2);border:1px solid transparent;transition:all 300ms var(--ease-cine)}
.sec__pillar svg{width:100%;height:auto;fill:rgba(216,195,160,.08);stroke:var(--sand);stroke-width:2;transition:all 400ms var(--ease-cine)}
.sec__pillar.on svg{fill:rgba(255,213,138,.28);stroke:#FFD58A;filter:drop-shadow(0 0 16px rgba(255,213,138,.6))}
.sec__pillar.on strong{color:#FFD58A}
.sec__text{min-height:3.6em;max-width:36rem;color:var(--museum-white)}
.sec__more{display:flex;gap:var(--s2);flex-wrap:wrap;justify-content:center}
.sec__list{list-style:none;margin:0;padding:0;display:grid;gap:var(--s2);text-align:start;max-width:44rem;width:100%}
.sec__list li{display:grid;gap:0;border-inline-start:2px solid var(--gold);padding-inline-start:var(--s3)}
.sec__list li span{color:var(--museum-white);opacity:.9}
`}</style>
    </div>
  )
}
