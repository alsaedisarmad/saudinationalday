import { eras, type Station } from '../../content/timeline'
import { toIndic } from '../../content/quran'

/**
 * عمود التقدّم: خيط قصير مقسّم إلى عصور؛ لكل محطة عقدة زر ≥ حجم اللمس. الملء الذهبي يتبع الكاميرا (--prog).
 * على الهاتف: اسم العصر + العدّاد فقط (الأزرار تكفي).
 */
export function Spine({ list, index, visited, onGo, compact }: { list: Station[]; index: number; visited: Set<string>; onGo: (i: number) => void; compact?: boolean }) {
  const groups = eras
    .map((e) => ({ e, items: list.map((s, i) => ({ s, i })).filter((x) => x.s.era === e.id) }))
    .filter((g) => g.items.length)
  const cur = list[index]
  const era = eras.find((e) => e.id === cur?.era)

  if (compact) {
    return (
      <div className="sp sp--compact" aria-hidden>
        <span className="sp__era label">{era?.title}</span>
        <span className="sp__rail"><i className="sp__fill" /></span>
        <span className="sp__count label num">{toIndic(index + 1)} / {toIndic(list.length)}</span>
      </div>
    )
  }

  return (
    <nav className="sp" aria-label="عمود التقدّم: عصور الحكاية" style={{ ['--n' as string]: list.length }}>
      <div className="sp__eras">
        {groups.map((g) => (
          <div key={g.e.id} className={`sp__era ${g.e.id === cur?.era ? 'is-cur' : ''}`} style={{ flexGrow: g.items.length }}>
            <span className="sp__eraName label">{g.e.short ?? g.e.title}</span>
            <div className="sp__ticks">
              {g.items.map(({ s, i }) => (
                <button
                  key={s.id}
                  className={`sp__tick ${i === index ? 'is-cur' : ''} ${i < index ? 'is-past' : ''} ${visited.has(s.id) ? 'is-seen' : ''}`}
                  onClick={() => onGo(i)}
                  aria-label={`الانتقال إلى المحطة ${toIndic(i + 1)}: ${s.yearLabel ?? ''} — ${s.title}`}
                  aria-current={i === index ? 'step' : undefined}
                >
                  <i aria-hidden />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <span className="sp__rail" aria-hidden><i className="sp__fill" /></span>
    </nav>
  )
}
