import { photo, creditLine } from '../../content/photos'
import { toIndic } from '../../content/quran'
import type { Station } from '../../content/timeline'
import { IconSource } from '../../ui/icons'
import { ReviewTag } from '../../ui/parts'

/** إطار مثلثات نجدية رقيق: فاصل مقتصد (لا زخرفة عامة) */
function TriRule({ n = 9 }: { n?: number }) {
  return (
    <svg className="tri" viewBox={`0 0 ${n * 14} 10`} preserveAspectRatio="xMinYMid meet" aria-hidden>
      {Array.from({ length: n }, (_, i) => <path key={i} d={`M${i * 14 + 1} 9L${i * 14 + 7} 1L${i * 14 + 13} 9`} />)}
    </svg>
  )
}

interface Props {
  s: Station
  index: number
  total: number
  active: boolean
  onOpen: () => void
  cardRef?: (el: HTMLDivElement | null) => void
}

/**
 * محطة واحدة: السنة ضخمة، العنوان، جملتان، صورة مرخّصة (اختيارية) مع النسب، وزر «اكتشف المعنى».
 * غير النشطة تبقى في شجرة الإتاحة لكن بلا تركيز لوحة مفاتيح (roving tabindex).
 */
export function StationCard({ s, index, total, active, onOpen, cardRef }: Props) {
  const p = s.photoId ? photo(s.photoId) : undefined
  const long = (s.yearLabel ?? '').length > 7
  const ym = /^(.+?)\s*(م)$/.exec(s.yearLabel ?? '')
  return (
    <div
      ref={cardRef}
      className="pc"
      tabIndex={active ? 0 : -1}
      role="group"
      aria-roledescription="محطة"
      aria-label={`المحطة ${toIndic(index + 1)} من ${toIndic(total)}: ${s.yearLabel ?? ''} — ${s.title}`}
      onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpen() } }}
    >
      <div className={`pc__text ${p ? '' : 'pc__text--solo'}`}>
        <h2 className="pc__h">
          <span className={`pc__year num ${long ? 'is-long' : ''}`} lang="ar">{ym ? <>{ym[1]}<span className="pc__unit">{ym[2]}</span></> : s.yearLabel}</span>
          <span className="sr-only"> — </span>
          <span className="pc__title display-m">{s.title}</span>
        </h2>
        {(s.dateLabel || s.sideLabel) && (
          <div className="pc__dates">
            {s.dateLabel && <span className="pc__date">{s.dateLabel}</span>}
            {s.sideLabel && <span className="pc__side">{s.sideLabel}</span>}
          </div>
        )}
        <TriRule />
        <p className="pc__body body-l">{s.text}</p>
        <div className="pc__actions">
          <button className="btn btn--gold pc__more" tabIndex={active ? 0 : -1} onClick={onOpen} aria-haspopup="dialog">
            <IconSource /> اكتشف المعنى
          </button>
          <ReviewTag item={s} />
        </div>
      </div>
      {p && (
        <figure className="pc__fig" style={{ ['--ar' as string]: `${p.w} / ${p.h}` }}>
          <div className="pc__frame">
            <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" draggable={false} />
          </div>
          <figcaption className="pc__cap label">
            {s.photoCaption && <span className="pc__capt">{s.photoCaption}</span>}
            <span className="pc__credit">{creditLine(p)}</span>
          </figcaption>
        </figure>
      )}
    </div>
  )
}
