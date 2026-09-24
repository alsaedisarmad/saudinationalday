import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { backdrop } from '../backdrop/Backdrop'
import { credits } from '../content/credits'
import { identity } from '../content/values'
import { aboutText, techCredits, photoCredits, sourceGroups } from '../content/about'
import { Layer } from '../ui/Layer'
import { useStore } from '../session/store'
import { useSession } from '../session/session'
import { audio } from '../audio/engine'

/**
 * عن المعرض — «البيانات بآخر ركن بالمعرض» (طلب الفريق): بيانات الفريق حرفيًا (brief/04 §46) على هيئة لوحة متحفية،
 * ثم تفاصيل التجربة والمصادر والحقوق في طبقات.
 */
type Panel = 'how' | 'sources' | 'photos' | null

export default function About() {
  const session = useSession()
  const reduced = useStore((s) => s.reducedMotion)
  const [panel, setPanel] = useState<Panel>(null)
  useEffect(() => { backdrop.grade = 'about'; backdrop.thread = 0; backdrop.threadY = 0.3 }, [])
  useEffect(() => {
    if (reduced) return
    gsap.fromTo('.ab [data-in]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: 'power2.out', delay: 0.2 })
  }, [reduced])
  const open = (p: Panel) => { audio.tick(); setPanel(p) }

  return (
    <div className="ab">
      <div className="ab__wall">
        <svg data-in className="ab__tri" viewBox="0 0 400 18" preserveAspectRatio="none" aria-hidden>
          <defs><pattern id="abtri" width="20" height="18" patternUnits="userSpaceOnUse"><path d="M0 18 L10 2 L20 18Z" fill="#C9A45C" opacity=".85" /></pattern></defs>
          <rect width="400" height="18" fill="url(#abtri)" />
        </svg>
        <div data-in className="kicker">فريق العمل</div>
        <h1 data-in className="display-l">عن المعرض</h1>
        <p data-in className="body-l ab__lead">{aboutText.purpose}</p>

        <dl data-in className="ab__credits">
          <div>
            <dt className="label">{credits.preparedBy}</dt>
            <dd className="display-m num">{credits.classes.join(' ، ')}</dd>
          </div>
          <div>
            <dt className="label">{credits.schoolLabel}</dt>
            <dd className="display-m">{credits.school}</dd>
          </div>
          <div>
            <dt className="label">{credits.supervisorsLabel}</dt>
            <dd className="display-m">{credits.supervisors.join(' ، ')}</dd>
          </div>
          <div>
            <dt className="label">{credits.activityLeadersLabel}</dt>
            <dd className="display-m">{credits.activityLeaders.join(' ، ')}</dd>
          </div>
          <div>
            <dt className="label">{credits.principalLabel}</dt>
            <dd className="display-m">{credits.principal}</dd>
          </div>
        </dl>

        <p data-in className="ab__slogan">«{identity.slogan}» · {identity.title}</p>
        <div data-in className="ab__row">
          <button className="btn" onClick={() => open('how')}>كيف تتنقّل</button>
          <button className="btn" onClick={() => open('sources')}>المصادر</button>
          <button className="btn" onClick={() => open('photos')}>حقوق الصور والمواد</button>
          <button className="btn btn--primary" onClick={() => session.goto('courtyard')}>العودة إلى الفناء</button>
        </div>
      </div>

      <Layer open={panel === 'how'} onClose={() => setPanel(null)} title="كيف تتنقّل" kicker="عن المعرض" width="wide">
        <ul className="ab__list">{aboutText.howTo.map((t) => <li key={t} className="body-l">{t}</li>)}</ul>
        <h3 className="display-m ab__h">إمكانية الوصول</h3>
        <ul className="ab__list">{aboutText.access.map((t) => <li key={t} className="body-l">{t}</li>)}</ul>
        <h3 className="display-m ab__h">الخصوصية</h3>
        <p className="body-l">{aboutText.privacy}</p>
      </Layer>

      <Layer open={panel === 'sources'} onClose={() => setPanel(null)} title="المصادر" kicker="كل معلومة في المعرض لها مصدر" width="wide">
        <p className="label">مرتّبة بحسب موثوقيتها: مواد المشروع، ثم المصادر السعودية الرسمية، فالمؤسسات الثقافية والأكاديمية والدولية، ثم البيانات العامة.</p>
        {sourceGroups.map((g) => (
          <section key={g.level} className="ab__grp">
            <h3 className="kicker">{g.label}</h3>
            <ul className="ab__src">
              {g.items.map((s) => (
                <li key={s.id}>
                  <strong>{s.title}</strong>
                  <span className="label"> — {s.publisher}{s.date ? ` · ${s.date}` : ''}</span>
                  {s.url ? <a className="label" href={s.url} target="_blank" rel="noopener noreferrer" dir="ltr"> {s.url}</a> : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Layer>

      <Layer open={panel === 'photos'} onClose={() => setPanel(null)} title="حقوق الصور والمواد" kicker="شكرًا لمن شاركوا أعمالهم بترخيص مفتوح" width="wide">
        <ul className="ab__list">{techCredits.map((t) => <li key={t.label} className="body-l"><strong>{t.label}:</strong> {t.text}</li>)}</ul>
        <h3 className="display-m ab__h">الصور</h3>
        <ul className="ab__src">
          {photoCredits.map((p) => (
            <li key={p.id}>
              <span>{p.alt}</span>
              <span className="label"> — {p.line} · </span>
              <a className="label" href={p.page} target="_blank" rel="noopener noreferrer" dir="ltr">Wikimedia Commons</a>
            </li>
          ))}
        </ul>
      </Layer>
      <style>{css}</style>
    </div>
  )
}

const css = `
.ab{position:absolute;inset:0;overflow:auto;padding:calc(var(--target) + var(--s6)) var(--s4) calc(var(--s12) * 1.4);display:flex}
.ab__wall{margin:auto;width:min(100%,72rem);display:grid;justify-items:center;text-align:center;gap:var(--s2);padding:var(--s4) var(--s6) var(--s4);border:1px solid var(--line);background:linear-gradient(180deg,rgba(28,20,16,.72),rgba(15,11,9,.82));position:relative;box-shadow:0 30px 100px rgba(0,0,0,.5)}
.ab__wall::before{content:'';position:absolute;inset:10px;border:1px solid rgba(201,164,92,.28);pointer-events:none}
.ab__tri{width:min(60%,22rem);height:14px;opacity:.9}
.ab__lead{max-width:44rem;opacity:.92}
.ab__credits{margin:var(--s2) 0 0;display:grid;grid-template-columns:1fr 1fr;gap:0 var(--s4);width:100%}
.ab__credits div{display:grid;gap:0;padding-block:var(--s2);border-top:1px solid rgba(201,164,92,.25)}
.ab__credits div:last-child:nth-child(odd){grid-column:1/-1}
.ab__credits dt{color:var(--sand);letter-spacing:.04em}
.ab__credits dd{margin:0;color:var(--museum-white)}
.ab__slogan{font-family:var(--font-display);font-weight:700;color:var(--gold);font-size:clamp(22px,3vmin,44px)}
.ab__row{display:flex;flex-wrap:wrap;gap:var(--s2);justify-content:center}
.ab__list{margin:0;padding-inline-start:1.2em;display:grid;gap:.5em}
.ab__h{margin-top:var(--s4)}
.ab__grp{margin-top:var(--s3)}
.ab__src{list-style:none;margin:var(--s1) 0 0;padding:0;display:grid;gap:.6em}
.ab__src li{border-inline-start:2px solid rgba(201,164,92,.5);padding-inline-start:var(--s2);line-height:1.6}
.ab__src a{color:var(--gold);word-break:break-all}
@media (max-width:820px){.ab__credits{grid-template-columns:1fr}}
[data-mode=mobile] .ab{padding-inline:var(--s2)}
[data-mode=mobile] .ab__wall{padding:var(--s4) var(--s3)}
`
