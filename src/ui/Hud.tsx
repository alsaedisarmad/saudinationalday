import { useState } from 'react'
import { useStore } from '../session/store'
import { useSession } from '../session/session'
import { halls, hallById, archHalls, type HallId } from '../exhibition/halls'
import { useDiscovery } from '../exhibition/discovery'
import { Layer } from './Layer'
import { IconSound, IconMotion, IconText, IconFull, IconArch, IconBack } from './icons'
import { audio } from '../audio/engine'
import { isReviewMode } from '../content/types'

/** شريط التحكم الأدنى: «استكشف المعرض» + الصوت/الحركة/النص/ملء الشاشة + مقياس الاكتشاف */
export function Hud({ hall }: { hall: HallId }) {
  const s = useStore()
  const session = useSession()
  const [open, setOpen] = useState(false)
  const inGate = hall === 'gate'
  const inLobby = hall === 'courtyard'
  const d = useDiscovery()

  const toggleFull = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch { /* غير مدعوم */ }
  }
  const go = (id: HallId) => { setOpen(false); audio.tick(); session.goto(id) }

  return (
    <>
      <div className="hud hud--top" role="toolbar" aria-label="أدوات المعرض">
        {!inGate && (
          <div className="hud__group">
            <button className="btn" onClick={() => { audio.tick(); setOpen(true) }} aria-haspopup="dialog" aria-label="استكشف المعرض — قائمة القاعات">
              <IconArch /> <span className="hud__hide-s">استكشف المعرض</span>
            </button>
            {!inLobby && (
              <button className="btn" onClick={() => { audio.tick(); session.goto('courtyard') }} aria-label="العودة إلى الفناء">
                <IconBack /> <span className="hud__hide-s">الفناء</span>
              </button>
            )}
          </div>
        )}
        <div className="hud__group" style={{ marginInlineStart: 'auto' }}>
          <button className="btn btn--icon" onClick={() => { const on = !s.sound; if (on) audio.unlock(); s.setSound(on) }} aria-pressed={s.sound} aria-label={s.sound ? 'كتم الصوت' : 'تشغيل الصوت'} title="الصوت"><IconSound on={s.sound} /></button>
          <button className="btn btn--icon" onClick={s.toggleMotion} aria-pressed={s.reducedMotion} aria-label={s.reducedMotion ? 'تفعيل الحركة' : 'تخفيف الحركة'} title="الحركة"><IconMotion on={!s.reducedMotion} /></button>
          <button className="btn btn--icon" onClick={s.toggleText} aria-pressed={s.textMode} aria-label="نسخة نصية مبسّطة" title="نسخة نصية"><IconText /></button>
          <button className="btn btn--icon hud__hide-s" onClick={toggleFull} aria-label="ملء الشاشة" title="ملء الشاشة"><IconFull /></button>
        </div>
      </div>

      {!inGate && <Meter count={d.count} total={d.total} dots={d.dots} />}
      {isReviewMode() && <div className="review-flag" role="note">وضع المراجعة — المواد «قيد المراجعة/التوثيق» ظاهرة في هذا الوضع فقط</div>}

      <Layer open={open} onClose={() => setOpen(false)} title="استكشف المعرض" kicker="الخيط يصل القاعات">
        <ol className="thread-nav">
          {[hallById('courtyard'), ...archHalls(), hallById('finale'), hallById('about')].map((h) => (
            <li key={h.id}>
              <button className="thread-nav__item" onClick={() => go(h.id)} aria-current={h.id === hall ? 'page' : undefined}>
                <span className={`thread-nav__dot ${s.visitedHalls.includes(h.id) ? 'is-lit' : ''}`} aria-hidden />
                <span>
                  <strong className="display-m" style={{ fontSize: '1.5rem' }}>{h.title}</strong>
                  <span className="label" style={{ display: 'block' }}>{h.kicker}{s.visitedHalls.includes(h.id) ? ' · زرتها' : ''}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        {!halls.filter((h) => !h.ready()).length && <p className="label" style={{ marginTop: 'var(--s4)' }}>كل القاعات متاحة.</p>}
      </Layer>

      <style>{css}</style>
    </>
  )
}

function Meter({ count, total, dots }: { count: number; total: number; dots: number }) {
  const N = 96
  return (
    <div className="meter" role="img" aria-label={`اكتشفت ${count} من ${total} — ${dots} نقطة ضوء مضيئة`}>
      <svg viewBox={`0 0 ${N * 6} 10`} preserveAspectRatio="none" className="meter__svg" aria-hidden>
        {Array.from({ length: N }, (_, i) => (
          <circle key={i} cx={(N - 1 - i) * 6 + 3} cy="5" r={i < dots ? 2.1 : 1.1} fill={i < dots ? 'var(--gold)' : 'rgba(216,195,160,.35)'} style={i < dots ? { filter: 'drop-shadow(0 0 3px rgba(231,176,74,.9))' } : undefined} />
        ))}
      </svg>
      <span className="label num" style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>{dots}</span>
    </div>
  )
}

const css = `
.hud{position:fixed;inset-inline:0;z-index:30;display:flex;gap:var(--s2);padding:var(--s3);pointer-events:none}
.hud>*{pointer-events:auto}
.hud--top{top:0;align-items:center}
.hud__group{display:flex;gap:var(--s2);align-items:center}
.meter{position:fixed;z-index:29;bottom:var(--s3);inset-inline:0;margin-inline:auto;width:min(46vw,34rem);display:flex;align-items:center;gap:var(--s2);pointer-events:none}
.meter__svg{flex:1;height:12px;overflow:visible}
[data-mode=mobile] .meter{width:78vw;bottom:var(--s2)}
.review-flag{position:fixed;z-index:60;bottom:0;inset-inline-start:0;background:#7D5F22;color:#fff;font-size:.72rem;padding:2px 10px;letter-spacing:.02em}
.thread-nav{list-style:none;margin:0;padding:0;position:relative}
.thread-nav::before{content:'';position:absolute;inset-block:.6rem;inset-inline-start:.85rem;width:1px;background:linear-gradient(var(--gold),transparent);opacity:.5}
.thread-nav__item{display:flex;align-items:center;gap:var(--s3);width:100%;text-align:start;min-height:var(--target);padding:var(--s1) 0}
.thread-nav__item[aria-current=page] strong{color:var(--gold)}
.thread-nav__dot{width:1.7rem;height:1.7rem;flex:0 0 auto;border:1px solid var(--line);border-radius:50%;background:var(--night);position:relative;z-index:1;transition:all 300ms var(--ease-cine)}
.thread-nav__dot.is-lit{background:var(--gold);box-shadow:0 0 14px rgba(231,176,74,.7);border-color:var(--gold)}
@media (max-width:640px){.hud__hide-s{display:none}.hud{padding:var(--s1) var(--s2)}.hud .btn{padding:0;width:var(--target)}}
`
