import { useState, type ReactNode } from 'react'
import { sources, sourceLevelLabel } from '../content/sources'
import { statusLabel, isReviewMode, type Gated } from '../content/types'
import { IconSource } from './icons'

/** شارة الحالة: «قيد المراجعة/التوثيق» تظهر للفريق فقط (وضع المراجعة)، ولا تظهر للزائر أبدًا */
export function ReviewTag({ item }: { item: Gated }) {
  const l = statusLabel(item)
  if (!l || !isReviewMode()) return null
  return (
    <span className="review-tag" title={item.note}>
      ⚑ {l}
      <style>{`.review-tag{display:inline-block;font-size:.68rem;padding:1px 8px;margin-inline-start:.6em;background:#7D5F22;color:#fff;border-radius:2px;vertical-align:middle;letter-spacing:.02em}`}</style>
    </span>
  )
}

/** سطر المصدر: يُظهر المصدر ومستواه، وتفاصيله (الرابط والتاريخ) عند الطلب — لا حقيقة بلا مصدر ظاهر */
export function SourceLine({ ids, label = 'المصدر' }: { ids: string[]; label?: string }) {
  const [open, setOpen] = useState(false)
  const list = ids.map((i) => sources[i]).filter(Boolean)
  if (!list.length) return null
  return (
    <div className="srcline">
      <button className="srcline__btn label" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <IconSource /> {label}: {list[0].publisher}
        {list.length > 1 ? ` +${list.length - 1}` : ''}
      </button>
      {open && (
        <ul className="srcline__list label">
          {list.map((s) => (
            <li key={s.id}>
              <strong>{s.title}</strong> — {s.publisher} · <em>{sourceLevelLabel[s.level]}</em>
              {s.date ? ` · ${s.date}` : ''}
              {s.url ? <> · <a href={s.url} target="_blank" rel="noopener noreferrer" dir="ltr">{s.url}</a></> : null}
            </li>
          ))}
        </ul>
      )}
      <style>{`.srcline{margin-top:var(--s3)}.srcline__btn{display:inline-flex;gap:.4em;align-items:center;min-height:calc(var(--target)*.7);color:var(--sand);text-align:start}.srcline__list{margin:.4em 0 0;padding-inline-start:1.2em;display:grid;gap:.4em}.srcline__list a{color:var(--gold);word-break:break-all}`}</style>
    </div>
  )
}

/** نص طويل يُعرض مقتطفًا أوّلًا ثم «تابع القراءة» — لا جدار نصي دفعة واحدة (brief/01 §10) */
export function LongText({ paragraphs, limit = 620 }: { paragraphs: string[]; limit?: number }) {
  const [all, setAll] = useState(false)
  const total = paragraphs.join('').length
  if (all || total <= limit * 1.35) return <>{paragraphs.map((p, i) => <p key={i} className="body-l">{p}</p>)}</>
  // نقتطع عند أقرب فاصلة بعد الحد دون تعديل الكلمات
  let acc = 0
  const shown: string[] = []
  for (const p of paragraphs) {
    if (acc + p.length <= limit) { shown.push(p); acc += p.length; continue }
    const cut = p.indexOf('،', Math.max(0, limit - acc))
    shown.push((cut > 0 ? p.slice(0, cut) : p.slice(0, Math.max(0, limit - acc))) + ' …')
    break
  }
  return (
    <>
      {shown.map((p, i) => <p key={i} className="body-l">{p}</p>)}
      <button className="btn" style={{ marginTop: 'var(--s3)' }} onClick={() => setAll(true)}>تابع القراءة</button>
    </>
  )
}

export function HallTitle({ kicker, title, lead, children }: { kicker: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <header className="halltitle">
      <div className="kicker">{kicker}</div>
      <h1 className="display-l">{title}</h1>
      {lead && <p className="body-l halltitle__lead">{lead}</p>}
      {children}
      <style>{`.halltitle{display:grid;gap:.2em;max-width:44rem}.halltitle__lead{opacity:.9;margin-top:.4em}`}</style>
    </header>
  )
}
