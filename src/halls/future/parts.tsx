import type { CSSProperties } from 'react'
import { futureLabels, type FutureItem, type PillarId, pillarItem } from '../../content/future'
import { regionById } from '../../content/regions'
import { toIndic } from '../../content/quran'
import { ReviewTag, SourceLine } from '../../ui/parts'
import { photo, creditLine } from '../../content/photos'
import { miniPoints, seg } from './geometry'

/* ——— شارات اليقين: أيقونة + نص (لا لون وحده) ——— */
type BadgeKind = 'documented' | 'vision' | 'creative'
export function Badge({ kind, small }: { kind: BadgeKind; small?: boolean }) {
  return (
    <span className={`fbadge fbadge--${kind} ${small ? 'fbadge--s' : ''}`}>
      <svg viewBox="0 0 16 16" width="1.05em" height="1.05em" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden focusable="false">
        {kind === 'documented' && <path d="M3 8.5l3.2 3.2L13 4.6" />}
        {kind === 'vision' && <path d="M8 1.8L14.2 8 8 14.2 1.8 8Z" strokeDasharray="2.2 2" />}
        {kind === 'creative' && <path d="M8 1.5l1.6 4.9 4.9 1.6-4.9 1.6L8 14.5 6.4 9.6 1.5 8l4.9-1.6Z" strokeDasharray="2 1.8" />}
      </svg>
      {futureLabels[kind]}
    </span>
  )
}

/* ——— رموز النجوم (خط 1.5، زوايا حادة — لغة الأيقونات) ——— */
/** نجمة رباعية طويلة الأذرع: نجمة البداية والمحاور الفرعية */
export const Sparkle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="-12 -12 24 24" aria-hidden focusable="false">
    <path d="M0 -11L2 -2 11 0 2 2 0 11-2 2-11 0-2-2Z" fill="currentColor" />
  </svg>
)
/** نجمة ثمانية (مربعان متداخلان): رأس الركيزة */
export const Rub = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="-12 -12 24 24" aria-hidden focusable="false">
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter">
      <rect x="-6.4" y="-6.4" width="12.8" height="12.8" />
      <rect x="-6.4" y="-6.4" width="12.8" height="12.8" transform="rotate(45)" />
    </g>
    <circle r="1.9" fill="currentColor" />
  </svg>
)
/** منارة: نواة ذهبية بحلقة — المشروع على الأرض */
export const Beacon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="-12 -12 24 24" aria-hidden focusable="false">
    <circle r="9" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
    <circle r="4.4" fill="currentColor" />
  </svg>
)
/** حلقة بنجمة: محطة عالمية */
export const RingStar = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="-12 -12 24 24" aria-hidden focusable="false">
    <circle r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M0 -6L1.4 -1.4 6 0 1.4 1.4 0 6-1.4 1.4-6 0-1.4-1.4Z" fill="currentColor" />
  </svg>
)

/* ——— مصغّر الكوكبة داخل زر الركيزة ——— */
export function MiniConstellation({ pillar, on }: { pillar: PillarId; on: boolean }) {
  const { pts, head } = miniPoints(pillar)
  return (
    <svg className={`fmini ${on ? 'is-on' : ''}`} viewBox="0 0 64 40" aria-hidden focusable="false">
      {pts.slice(1).map((q, i) => (
        <path key={i} d={seg(pts[i], q, 3.4)} className="fmini__l" />
      ))}
      {pts.map((q, i) => (
        <circle key={i} cx={q[0]} cy={q[1]} r={q === head ? 3.3 : 2} className={q === head ? 'fmini__h' : 'fmini__s'} />
      ))}
    </svg>
  )
}

/* ——— أرقام مؤرَّخة ——— */
export function Figures({ item }: { item: FutureItem }) {
  if (!item.figures?.length) return null
  return (
    <div className="ffigs" role="list" aria-label="أرقام من الصفحة الرسمية">
      {item.figures.map((f) => (
        <div className="ffig" role="listitem" key={f.label + f.value}>
          <div className="ffig__v num">
            {f.value} <span className="ffig__u">{f.unit}</span>
          </div>
          <div className="ffig__l">{f.label}</div>
          <div className="ffig__m">
            <Badge kind={f.certainty} small />
            <span className="label">{f.asOf}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ——— نص بطاقة العنصر داخل الطبقة ——— */
export function ItemBody({ item, onPillar }: { item: FutureItem; onPillar: (p: PillarId) => void }) {
  const cert = item.certainty ?? 'documented'
  const region = item.regionId ? regionById(item.regionId) : null
  const p = item.photoId ? photo(item.photoId) : null
  return (
    <div className="fbody">
      {p && (
        <figure className="ffig-photo">
          <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" draggable={false} />
          <figcaption className="label">{creditLine(p)}</figcaption>
        </figure>
      )}
      <div className="fbody__meta">
        <Badge kind={cert} />
        <span className="fbody__when num">{item.when ?? toIndic(item.year)}</span>
        <ReviewTag item={item} />
      </div>

      <p className="body-l fbody__text">{item.text}</p>

      {item.commitments && (
        <div className="fbody__block">
          <div className="kicker">{futureLabels.commitments}</div>
          <ul className="fchips fchips--plain">
            {item.commitments.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {item.facts && (
        <ul className="ffacts">
          {item.facts.map((f) => (
            <li key={f.text} className={`ffacts__i ffacts__i--${f.certainty}`}>
              <Badge kind={f.certainty} small />
              <span>{f.text}</span>
            </li>
          ))}
        </ul>
      )}

      <Figures item={item} />

      {(region || item.national) && (
        <p className="fbody__where label">
          {region ? `الموقع: ${region.nameAr}` : `الموقع: ${futureLabels.nationalNote}`}
          {item.where && item.where !== region?.nameAr ? ` — ${item.where}` : ''}
          {region ? ` · ${futureLabels.mapNote}` : ''}
        </p>
      )}

      {item.serves && item.serves.length > 0 && (
        <div className="fbody__block">
          <div className="kicker">{futureLabels.projectsOf}</div>
          <ul className="fchips">
            {item.serves.map((p) => (
              <li key={p}>
                <button className="fchip" onClick={() => onPillar(p)}>
                  <Rub className="fchip__i" />
                  {pillarItem(p).title}
                </button>
              </li>
            ))}
          </ul>
          <p className="label">{futureLabels.projectsNote}</p>
        </div>
      )}

      <SourceLine ids={item.sourceIds} />
    </div>
  )
}

export const cssVar = (o: Record<string, string | number>) => o as unknown as CSSProperties
