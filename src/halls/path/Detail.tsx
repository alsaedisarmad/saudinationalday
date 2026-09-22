import { Layer } from '../../ui/Layer'
import { LongText, SourceLine } from '../../ui/parts'
import type { Station } from '../../content/timeline'

/** «اكتشف المعنى»: فقرة موثّقة أوسع + قوائم (المناطق/التراث) + المصدر. يُستدعى اكتشاف المحطة عند الفتح من Path. */
export function Detail({ s, open, onClose }: { s: Station | undefined; open: boolean; onClose: () => void }) {
  if (!s) return null
  const m = s.more
  return (
    <Layer open={open} onClose={onClose} title={m?.title ?? s.title} kicker={`${s.yearLabel ?? ''} — ${s.title}`} width="wide">
      <div className="pd">
        {s.dateLabel && <p className="label pd__date">{s.dateLabel}{s.sideLabel ? ` · ${s.sideLabel}` : ''}</p>}
        <LongText paragraphs={m?.paragraphs ?? [s.text]} />
        {m?.groups?.map((g) => (
          <section key={g.title} className="pd__group">
            <h3 className="display-m pd__gt">{g.title}</h3>
            <ul className="pd__list">
              {g.entries.map((e) => (
                <li key={e.year + e.title}>
                  <span className="pd__year num">{e.year}</span>
                  <span className="pd__what"><strong>{e.title}</strong>{e.text ? <span className="label"> — {e.text}</span> : null}</span>
                </li>
              ))}
            </ul>
            {g.sourceIds && <SourceLine ids={g.sourceIds} />}
          </section>
        ))}
        {m?.note && <p className="label pd__note">{m.note}</p>}
        <SourceLine ids={s.sourceIds} />
      </div>
      <style>{`
.pd__date{color:var(--gold);margin-bottom:var(--s2)}
.pd__group{margin-top:var(--s4);border-top:1px solid var(--line);padding-top:var(--s3)}
.pd__gt{font-size:1.5rem!important}
.pd__list{list-style:none;margin:var(--s2) 0 0;padding:0;display:grid;gap:.15em}
.pd__list li{display:grid;grid-template-columns:5.2em 1fr;gap:var(--s2);align-items:baseline;padding:.35em 0;border-bottom:1px solid rgba(216,195,160,.12)}
.pd__year{color:var(--gold);font-family:var(--font-display);font-weight:700;font-size:1.15em}
.pd__note{margin-top:var(--s3);border-inline-start:2px solid var(--gold);padding-inline-start:var(--s2)}
`}</style>
    </Layer>
  )
}
