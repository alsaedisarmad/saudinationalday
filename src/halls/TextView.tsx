import { useEffect, useMemo, type ReactNode } from 'react'
import { verseById, tafsirFor, refLabel, toIndic } from '../content/quran'
import { stations, eras } from '../content/timeline'
import { regions } from '../content/regions'
import { whcSites } from '../content/heritage'
import { majlisSpots } from '../content/majlis'
import { valueScenes } from '../content/valueScenes'
import { futureItems } from '../content/future'
import { murals } from '../content/murals'
import { works } from '../content/students'
import { security } from '../content/security'
import { credits } from '../content/credits'
import { identity } from '../content/values'
import { aboutText } from '../content/about'
import { sources } from '../content/sources'
import { visible, type Gated } from '../content/types'
import { useStore } from '../session/store'

/**
 * النسخة النصية المبسّطة: كل محتوى المعرض نصًّا واضحًا بترتيب الرحلة — لقارئ الشاشة، للأجهزة الضعيفة، وللطباعة.
 * تقرأ من ملفات content/ نفسها التي تقرؤها القاعات (لا نص مكرَّر). لا تُظهر إلا ما حالته «موثَّق».
 */
const Src = ({ g }: { g: Gated }) => {
  const list = g.sourceIds.map((i) => sources[i]?.publisher).filter(Boolean)
  return list.length ? <p className="tv__src">المصدر: {[...new Set(list)].join(' · ')}</p> : null
}

const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <section id={id} className="tv__sec" aria-labelledby={`${id}-h`}>
    <h2 id={`${id}-h`}>{title}</h2>
    {children}
  </section>
)

function Verses({ ids }: { ids: string[] }) {
  return (
    <>
      {ids.map((id) => {
        const v = verseById(id)
        if (!v || !visible(v)) return null
        const t = tafsirFor(id)
        return (
          <article key={id} className="tv__verse">
            <p className="tv__ref">{refLabel(v)} — {v.topic}</p>
            <p className="tv__quran" lang="ar">{v.text} ۝{toIndic(v.ayah)}</p>
            {t && visible(t) && (
              <details>
                <summary>تفسير السعدي — «تيسير الكريم الرحمن» (كما أرسله فريق المشروع)</summary>
                {t.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </details>
            )}
          </article>
        )
      })}
    </>
  )
}

export default function TextView() {
  const toggle = useStore((s) => s.toggleText)
  useEffect(() => {
    document.title = 'السعودية... حكاية وطن — النسخة النصية'
    return () => { document.title = 'السعودية... حكاية وطن' }
  }, [])
  const st = useMemo(() => stations.filter(visible), [])
  const vis = useMemo(() => ({ fut: futureItems.filter(visible), mur: murals.filter(visible), wk: works.filter(visible), maj: majlisSpots.filter(visible) }), [])

  const nav = [
    ['roots', 'الجذور'], ['safe', 'بلدًا آمنًا'], ['path', 'طريق الحكاية'], ['land', 'الأرض'], ['majlis', 'المجلس'], ['values', 'عزّنا بطبعنا'],
    ...(vis.fut.length ? [['future', 'نحو المستقبل']] : []),
    ...(vis.mur.length ? [['murals', 'الجداريات']] : []),
    ...(vis.wk.length ? [['students', 'أعمال الطالبات']] : []),
    ['about', 'عن المعرض'],
  ]

  return (
    <div className="tv" lang="ar" dir="rtl">
      <a className="tv__skip" href="#tv-main">انتقل إلى المحتوى</a>
      <header className="tv__head">
        <p className="tv__kicker">النسخة النصية المبسّطة</p>
        <h1>{identity.title}</h1>
        <p>اليوم الوطني السعودي — {identity.dateLabel} · «{identity.slogan}»</p>
        <div className="tv__actions">
          <button onClick={toggle}>العودة إلى المعرض التفاعلي</button>
          <button onClick={() => window.print()}>طباعة</button>
        </div>
        <nav aria-label="فهرس المحتوى">
          <ul>{nav.map(([id, t]) => <li key={id}><a href={`#${id}`}>{t}</a></li>)}</ul>
        </nav>
      </header>

      <main id="tv-main" tabIndex={-1}>
        <Section id="roots" title="الجذور — البيت الحرام ومقام إبراهيم">
          <Verses ids={['q2-125', 'q3-97']} />
        </Section>

        <Section id="safe" title="بلدًا آمنًا">
          <Verses ids={['q2-126', 'q14-35']} />
          {visible(security) && (
            <article>
              <h3>{security.headline}</h3>
              <p>{security.definition}</p>
              <p>{security.importance}</p>
              <h4>ركائز الأمن الوطني</h4>
              <ul>{security.pillars.map((p) => <li key={p.id}><strong>{p.title}:</strong> {p.text}</li>)}</ul>
              <Src g={security} />
            </article>
          )}
        </Section>

        <Section id="path" title="طريق الحكاية">
          {eras.map((e) => {
            const list = st.filter((s) => s.era === e.id)
            if (!list.length) return null
            return (
              <div key={e.id}>
                <h3>{e.title}</h3>
                <ul>
                  {list.map((s) => (
                    <li key={s.id}>
                      <strong>{s.yearLabel ?? `${toIndic(s.year)}م`}{s.dateLabel ? ` (${s.dateLabel})` : ''} — {s.title}.</strong> {s.text}
                      {s.sideLabel ? ` ${s.sideLabel}.` : ''}
                      {s.more?.paragraphs.map((p, i) => <span key={i} className="tv__more"> {p}</span>)}
                      <Src g={s} />
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </Section>

        <Section id="land" title="الأرض — المناطق الإدارية الثلاث عشرة">
          <ul className="tv__cols">{regions.filter(visible).map((r) => <li key={r.id}>{r.nameAr} — العاصمة الإدارية: {r.capitalAr}</li>)}</ul>
          <p className="tv__src">الحدود المرسومة في المعرض للتوضيح فقط وليست حدودًا رسمية (geoBoundaries، © مساهمو OpenStreetMap).</p>
          <h3>مواقع التراث العالمي في المملكة — اليونسكو</h3>
          <ul>{whcSites.filter(visible).map((s) => <li key={s.id}>{s.nameAr} — سُجّل عام {toIndic(s.year)} ({s.kind})</li>)}</ul>
        </Section>

        <Section id="majlis" title="المجلس">
          {vis.maj.map((m) => (
            <article key={m.id}>
              <h3>{m.title}</h3>
              <p>{m.lead}</p>
              <ul>{m.facts.map((f) => <li key={f}>{f}</li>)}</ul>
              <Src g={m} />
            </article>
          ))}
        </Section>

        <Section id="values" title="عزّنا بطبعنا — القيم الست">
          {valueScenes.filter(visible).map((v) => (
            <article key={v.id}>
              <h3>{v.word} — «{v.phrase}»</h3>
              <p>{v.reveal}</p>
              <p><strong>{v.anchor.title}</strong> ({v.anchor.dateLabel}): {v.anchor.text}</p>
              <Src g={v} />
            </article>
          ))}
        </Section>

        {vis.fut.length > 0 && (
          <Section id="future" title="نحو المستقبل — رؤية ٢٠٣٠">
            {vis.fut.map((f) => (
              <article key={f.id}>
                <h3>{f.title}{f.certainty === 'vision' ? ' (مستهدف)' : ''}</h3>
                <p>{f.text}</p>
                {f.facts?.map((x) => <p key={x.text}>{x.text}{x.certainty === 'vision' ? ' (مستهدف)' : ''}</p>)}
                <Src g={f} />
              </article>
            ))}
          </Section>
        )}

        {vis.mur.length > 0 && (
          <Section id="murals" title="الجداريات — مجلة «من قيمنا إلى رؤيتنا»">
            {vis.mur.map((m) => (
              <article key={m.id}>
                <h3>{toIndic(m.page)}. {m.title}</h3>
                {m.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </article>
            ))}
          </Section>
        )}

        {vis.wk.length > 0 && (
          <Section id="students" title="أعمال الطالبات">
            {vis.wk.map((w) => (
              <article key={w.id}>
                <h3>{w.title}</h3>
                <p>{[w.consent ? w.studentName : null, w.classLabel, w.medium].filter(Boolean).join(' — ')}</p>
                {w.description && <p>{w.description}</p>}
                <p className="tv__src">وصف الصورة: {w.alt}</p>
              </article>
            ))}
          </Section>
        )}

        <Section id="about" title="عن المعرض">
          <p>{aboutText.purpose}</p>
          <dl>
            <dt>{credits.preparedBy}</dt><dd>{credits.classes.join(' ، ')}</dd>
            <dt>{credits.schoolLabel}</dt><dd>{credits.school}</dd>
            <dt>{credits.supervisorsLabel}</dt><dd>{credits.supervisors.join(' ، ')}</dd>
            <dt>{credits.principalLabel}</dt><dd>{credits.principal}</dd>
          </dl>
          <p>{aboutText.privacy}</p>
        </Section>
      </main>
      <style>{css}</style>
    </div>
  )
}

const css = `
.tv{position:fixed;inset:0;overflow:auto;background:#F5F0E6;color:#1C2421;font-family:var(--font-ui);line-height:1.95;font-size:max(1.05rem,17px);-webkit-overflow-scrolling:touch}
.tv>*{max-width:52rem;margin-inline:auto;padding-inline:clamp(16px,4vw,32px)}
.tv__skip{position:absolute;inset-inline-start:8px;top:-60px;background:#0A3D2A;color:#fff;padding:10px 16px;z-index:5}.tv__skip:focus{top:8px}
.tv__head{padding-block:32px 8px}
.tv__kicker{color:#7D5F22;font-weight:600;letter-spacing:.06em;font-size:.85rem}
.tv h1{font-family:var(--font-display);font-size:clamp(2rem,6vw,3rem);line-height:1.2;color:#0A3D2A;margin:.1em 0}
.tv h2{font-family:var(--font-display);font-size:1.8rem;color:#0A3D2A;border-bottom:2px solid #C9A45C;padding-bottom:.2em;margin:2em 0 .6em}
.tv h3{font-size:1.2rem;margin:1.4em 0 .3em;color:#1C2421}.tv h4{margin:1em 0 .2em}
.tv ul,.tv dl{padding-inline-start:1.3em}.tv li{margin-bottom:.5em}
.tv dt{font-weight:600;margin-top:.6em}.tv dd{margin:0;padding-inline-start:1em}
.tv__actions{display:flex;flex-wrap:wrap;gap:12px;margin:1em 0}
.tv button{min-height:48px;padding:0 22px;border:2px solid #0A3D2A;background:#fff;color:#0A3D2A;font:inherit;font-weight:600;cursor:pointer;border-radius:2px}
.tv button:hover{background:#0A3D2A;color:#fff}
.tv a{color:#005430;text-underline-offset:3px}
.tv :focus-visible{outline:3px solid #7D5F22;outline-offset:3px}
.tv nav ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px 18px}
.tv__quran{font-family:var(--font-quran);font-size:1.7rem;line-height:2.3;color:#0A3D2A}
.tv__ref{color:#7D5F22;font-weight:600;margin-bottom:0}
.tv__src{font-size:.85rem;color:#5a5347;margin:.2em 0 .8em}
.tv__more{display:block;margin-top:.4em}
.tv__cols{columns:2;column-gap:2em}
.tv details{margin:.6em 0;padding:.4em .9em;border:1px solid #C9A45C;background:#fffdf7}.tv summary{cursor:pointer;font-weight:600;min-height:44px;display:flex;align-items:center}
.tv main{padding-bottom:80px}
@media (max-width:640px){.tv__cols{columns:1}}
@media print{.tv{position:static;overflow:visible}.tv__actions,.tv nav,.tv__skip{display:none}.tv details{border:0}.tv details[open]{display:block}}
`
