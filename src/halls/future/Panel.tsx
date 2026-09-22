import {
  futureIntro,
  futureLabels,
  futureClosing,
  futureNationNote,
  futureOfKind,
  futurePillarOrder,
  pillarItem,
  projectsServing,
  themesOf,
  type PillarId,
} from '../../content/future'
import { visible } from '../../content/types'
import { toIndic } from '../../content/quran'
import { SourceLine } from '../../ui/parts'
import { Badge, Beacon, MiniConstellation, RingStar, Sparkle } from './parts'

interface PanelProps {
  pillar: PillarId | null
  stacked: boolean
  seen: (id: string) => boolean
  onPillar: (p: PillarId | null) => void
  onOpen: (id: string) => void
}

/** سطر الختام: «عزّنا بطبعنا» ← «من قيمنا إلى رؤيتنا» + سطر مجلة الفريق. شريط أفقي على السبورة/المكتب، وآخر اللوحة على الهاتف */
export function Closing({ band }: { band?: boolean }) {
  return (
    <footer className={`fclose ${band ? 'fclose--band' : ''}`}>
      <div className="fclose__row">
        <span className="fclose__slogan">{futureClosing.slogan}</span>
        <span className="fclose__dot" aria-hidden>·</span>
        <span className="fclose__line">{futureClosing.line}</span>
      </div>
      <p className="fclose__quote label">
        «{futureClosing.quote}» — {futureClosing.quoteFrom}
      </p>
    </footer>
  )
}

/** لوحة القراءة: العنوان، أزرار الركائز (بديل اللمس/لوحة المفاتيح للكوكبات)، تفاصيل الركيزة، ثم سطر الختام */
export function Panel({ pillar, stacked, seen, onPillar, onOpen }: PanelProps) {
  const cur = pillar ? pillarItem(pillar) : null
  const themes = pillar ? themesOf(pillar).filter(visible) : []
  const projects = pillar ? projectsServing(pillar).filter(visible) : []
  const origin = futureOfKind('origin')[0]
  const groundAll = futureOfKind('project').filter(visible)
  const worldAll = futureOfKind('milestone').filter(visible)

  return (
    <aside className="fpanel" aria-label="ركائز الرؤية">
      <header className="fpanel__head">
        <div className="kicker">{futureIntro.kicker}</div>
        <h1 className="display-l fpanel__title">{futureIntro.title}</h1>
      </header>

      <div className="fpillars" role="group" aria-label="ركائز الرؤية الثلاث">
        {futurePillarOrder.map((p, i) => {
          const it = pillarItem(p)
          const on = pillar === p
          return (
            <button key={p} className={`fpillar ${on ? 'is-on' : ''} ${seen(it.id) ? 'is-seen' : ''}`} aria-pressed={on} onClick={() => onPillar(on ? null : p)}>
              <MiniConstellation pillar={p} on={on} />
              <span className="fpillar__n num" aria-hidden>{toIndic(`0${i + 1}`)}</span>
              <span className="fpillar__t">{it.title}</span>
            </button>
          )
        })}
      </div>

      <div className="fpanel__body" aria-live="polite">
        {cur ? (
          <div className="fdetail" key={cur.id}>
            <div className="fdetail__head">
              <h2 className="display-m">{cur.title}</h2>
              <Badge kind={cur.certainty ?? 'vision'} />
            </div>
            <p className="fdetail__text">{cur.text}</p>
            <SourceLine ids={cur.sourceIds} />
            {stacked && (
              <>
                <div className="kicker fdetail__k">{futureLabels.themesOf}</div>
                <ul className="fchips">
                  {themes.map((t) => (
                    <li key={t.id}>
                      <button className={`fchip ${seen(t.id) ? 'is-seen' : ''}`} onClick={() => onOpen(t.id)}>
                        <Sparkle className="fchip__i" />
                        {t.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {stacked && projects.length > 0 && (
              <>
                <div className="kicker fdetail__k">{futureLabels.projectsOf}</div>
                <ul className="fchips">
                  {projects.map((t) => (
                    <li key={t.id}>
                      <button className={`fchip fchip--gold ${seen(t.id) ? 'is-seen' : ''}`} onClick={() => onOpen(t.id)}>
                        <Beacon className="fchip__i" />
                        {t.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {pillar === 'nation' && (
              <blockquote className="fnote">
                <p>{futureNationNote.text}</p>
                <cite className="label">{futureNationNote.from}</cite>
              </blockquote>
            )}
          </div>
        ) : (
          <div className="fdetail fdetail--idle">
            <p className="fdetail__text">{futureIntro.lead}</p>
            {stacked && origin && (
              <button className={`fchip fchip--origin ${seen(origin.id) ? 'is-seen' : ''}`} onClick={() => onOpen(origin.id)}>
                <Sparkle className="fchip__i" />
                <span className="num">{toIndic(origin.year)}</span> · {origin.title}
              </button>
            )}
          </div>
        )}

        {stacked && (
          <div className="fground">
            <div className="kicker">{futureLabels.onGround}</div>
            <ul className="fchips">
              {groundAll.map((t) => (
                <li key={t.id}>
                  <button className={`fchip fchip--gold ${seen(t.id) ? 'is-seen' : ''}`} onClick={() => onOpen(t.id)}>
                    <Beacon className="fchip__i" />
                    {t.title}
                  </button>
                </li>
              ))}
              {worldAll.map((t) => (
                <li key={t.id}>
                  <button className={`fchip ${seen(t.id) ? 'is-seen' : ''}`} onClick={() => onOpen(t.id)}>
                    <RingStar className="fchip__i" />
                    {t.title}
                  </button>
                </li>
              ))}
            </ul>
            <p className="label">{futureLabels.mapNote}</p>
          </div>
        )}
      </div>

      {stacked && <Closing />}
    </aside>
  )
}
