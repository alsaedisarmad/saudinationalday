import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { regions, mapGeometry, regionById } from '../../content/regions'
import {
  futureIntro,
  futureItems,
  futureLabels,
  futurePillarOrder,
  pillarItem,
  projectsServing,
  themesOf,
  type FutureItem,
  type PillarId,
} from '../../content/future'
import { visible } from '../../content/types'
import { toIndic } from '../../content/quran'
import { Badge, Beacon, RingStar, Rub, Sparkle, cssVar } from './parts'
import { VB_FULL, VB_TIGHT, arc, constellations, originPos, pct, seg, starPos, stackedSide, type Box, type V } from './geometry'

interface StageProps {
  pillar: PillarId | null
  stacked: boolean
  seen: (id: string) => boolean
  onPillar: (p: PillarId | null) => void
  onOpen: (id: string) => void
}

/** يُقيس الحاوية ويحسب أكبر إطار بنسبة الـviewBox يتّسع فيها (لتنطبق تسميات HTML على الرسم تمامًا) */
function useFit(vb: Box) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0, k: 1 })
  useEffect(() => {
    const el = ref.current!
    const fit = () => {
      const r = el.getBoundingClientRect()
      if (r.width < 2 || r.height < 2) return
      const s = Math.min(r.width / vb.w, r.height / vb.h)
      setBox({ w: Math.floor(vb.w * s), h: Math.floor(vb.h * s), k: 1 / s })
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [vb.w, vb.h])
  return [ref, box] as const
}

const isMappable = (i: FutureItem) => (i.kind === 'project' || i.kind === 'milestone') && !!starPos[i.id]

export function Stage({ pillar, stacked, seen, onPillar, onOpen }: StageProps) {
  const vb = stacked ? VB_TIGHT : VB_FULL
  const [ref, box] = useFit(vb)
  const items = useMemo(() => futureItems.filter(visible), [])
  const stars = items.filter(isMappable)
  const regionsWithStars = new Set(stars.map((s) => s.regionId).filter(Boolean) as string[])
  const active = pillar ? new Set(projectsServing(pillar).map((p) => p.id)) : null
  const litRegions = new Set(stars.filter((s) => active?.has(s.id)).map((s) => s.regionId))
  const origin = items.find((i) => i.kind === 'origin')
  const posOf = (p: PillarId, id: string): V => (id === 'head' ? constellations[p].head : constellations[p].themes[id].p)

  return (
    <div className="fut__stage">
      <div ref={ref} className="fut__fit">
      <div className="fut__frame" role="group" aria-label="خريطة المملكة ليلًا: نجوم المشاريع في مناطقها" style={cssVar({ width: box.w, height: box.h, '--k': box.k })}>
        <svg className="fut__svg" viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} aria-hidden focusable="false">
          <defs>
            <radialGradient id="fglow" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#4FA779" stopOpacity=".2" />
              <stop offset="1" stopColor="#4FA779" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="fland" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0f3636" />
              <stop offset="1" stopColor="#081d20" />
            </linearGradient>
          </defs>

          <ellipse cx="500" cy="420" rx="640" ry="540" fill="url(#fglow)" />

          <g className="fmap">
            {regions.map((r) => (
              <path key={r.id} d={r.d} className={`fmap__r ${regionsWithStars.has(r.id) ? 'has' : ''} ${litRegions.has(r.id) ? 'is-lit' : ''}`} />
            ))}
            <path d={mapGeometry.outline} className="fmap__glow" pathLength={1} />
            <path d={mapGeometry.outline} className="fmap__line" pathLength={1} />
          </g>

          {/* خيوط الكوكبات: نقطية خافتة دائمًا، وتُرسم بالضوء حين تُلمس الركيزة */}
          {!stacked &&
            futurePillarOrder.map((p) => {
              const c = constellations[p]
              const on = pillar === p
              return (
                <g key={p}>
                  {c.chain.slice(1).map((id, i) => (
                    <path key={`d${id}`} d={seg(posOf(p, c.chain[i]), posOf(p, id), 15)} className="fchain" />
                  ))}
                  {c.chain.slice(1).map((id, i) => {
                    const d = seg(posOf(p, c.chain[i]), posOf(p, id), 15)
                    return (
                      <Fragment key={`t${id}`}>
                        <path d={d} pathLength={1} className={`fthread fthread--wide ${on ? 'is-on' : ''}`} style={cssVar({ '--d': `${i * 260}ms` })} />
                        <path d={d} pathLength={1} className={`fthread fthread--core ${on ? 'is-on' : ''}`} style={cssVar({ '--d': `${i * 260}ms` })} />
                      </Fragment>
                    )
                  })}
                  {projectsServing(p).map((it, i) => {
                    const sp = starPos[it.id]
                    if (!sp) return null
                    const d = arc(posOf(p, c.chain[c.chain.length - 1]), sp.p, 22, 20, p === 'economy' ? 0.14 : 0.2)
                    const delay = `${c.chain.length * 260 + i * 200}ms`
                    return (
                      <Fragment key={`p${it.id}`}>
                        <path d={d} pathLength={1} className={`fthread fthread--gold fthread--wide ${on ? 'is-on' : ''}`} style={cssVar({ '--d': delay })} />
                        <path d={d} pathLength={1} className={`fthread fthread--gold fthread--core ${on ? 'is-on' : ''}`} style={cssVar({ '--d': delay })} />
                      </Fragment>
                    )
                  })}
                </g>
              )
            })}
        </svg>

        {/* نجمة البداية: ٢٠١٦ (سطح المكتب والسبورة فقط؛ على الهاتف زرّها في اللوحة) */}
        {!stacked && origin && (
          <button
            className={`fstar fstar--origin ${seen(origin.id) ? 'is-seen' : ''}`}
            style={pct(originPos.p, vb)}
            onClick={() => onOpen(origin.id)}
            aria-label={`${origin.title} — ${origin.when}`}
          >
            <Sparkle className="fstar__g" />
            <span className="fstar__label fstar__label--r">
              <strong className="num">{toIndic(origin.year)}</strong>
              <small>{origin.title}</small>
            </span>
          </button>
        )}

        {/* الكوكبات: رأس الركيزة + نجوم محاورها */}
        {!stacked &&
          futurePillarOrder.map((p) => {
            const c = constellations[p]
            const pi = pillarItem(p)
            const on = pillar === p
            return (
              <Fragment key={p}>
                <button
                  className={`fstar fstar--head ${on ? 'is-on' : ''} ${seen(pi.id) ? 'is-seen' : ''}`}
                  style={pct(c.head, vb)}
                  onClick={() => onPillar(on ? null : p)}
                  aria-pressed={on}
                  aria-label={`ركيزة ${pi.title}`}
                >
                  <Rub className="fstar__g" />
                  <span className={`fstar__label fstar__label--${c.headSide}`}>
                    <strong>{pi.title}</strong>
                  </span>
                </button>
                {themesOf(p)
                  .filter(visible)
                  .map((t) => {
                    const tp = c.themes[t.id]
                    if (!tp) return null
                    return (
                      <button
                        key={t.id}
                        className={`fstar fstar--theme ${on ? 'is-on' : ''} ${seen(t.id) ? 'is-seen' : ''}`}
                        style={pct(tp.p, vb)}
                        onClick={() => onOpen(t.id)}
                        aria-label={`${t.title} — من محاور ${pi.title}`}
                      >
                        <Sparkle className="fstar__g" />
                        <span className={`fstar__label fstar__label--${tp.side}`}>{t.title}</span>
                      </button>
                    )
                  })}
              </Fragment>
            )
          })}

        {/* المشاريع والمحطات: نقاط على مستوى المنطقة */}
        {stars.map((it, i) => {
          const sp = starPos[it.id]
          const lit = !!active?.has(it.id)
          const dim = !!active && active.size > 0 && !lit && it.kind === 'project'
          const region = it.regionId ? regionById(it.regionId) : null
          return (
            <button
              key={it.id}
              className={`fstar fstar--${it.kind} ${lit ? 'is-lit' : ''} ${dim ? 'is-dim' : ''} ${seen(it.id) ? 'is-seen' : ''}`}
              style={cssVar({ ...pct(sp.p, vb), '--i': i })}
              onClick={() => onOpen(it.id)}
              aria-label={`${it.title} — ${it.tag ?? ''} — ${region ? region.nameAr : futureLabels.nationalNote}${region ? ` (${futureLabels.mapNote})` : ''}`}
            >
              {it.kind === 'project' ? <Beacon className="fstar__g" /> : <RingStar className="fstar__g" />}
              <span className={`fstar__label fstar__label--${(stacked && stackedSide[it.id]) || sp.side}`}>
                <strong>{it.title}</strong>
                {it.tag && <small>{it.tag}</small>}
              </span>
            </button>
          )
        })}

        {!stacked && <Notes />}
      </div>
      </div>
      {stacked && <Notes flow />}
    </div>
  )
}

/** ملاحظات المسرح: التصوّر الإبداعي، مفتاح الرموز، «الموقع تقريبي على مستوى المنطقة»، ونسب الحدود (ODbL) */
function Notes({ flow }: { flow?: boolean }) {
  return (
    <>
      <p className={`fut__creative label ${flow ? 'is-flow' : ''}`}>
        <Badge kind="creative" small /> {futureIntro.creative}
      </p>
      <div className={`fut__notes label ${flow ? 'is-flow' : ''}`}>
        <div className="fut__key">
          <span><Beacon className="fut__keyi fut__keyi--gold" /> مشروع</span>
          <span><RingStar className="fut__keyi fut__keyi--star" /> محطة عالمية</span>
        </div>
        <div>{futureLabels.mapNote}</div>
        <div className="fut__attr">{mapGeometry.attribution}</div>
      </div>
    </>
  )
}
