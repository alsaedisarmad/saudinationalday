import { useEffect, useRef } from 'react'
import { murals, type Mural } from '../../content/murals'
import { hallById } from '../../exhibition/halls'
import { isReviewMode } from '../../content/types'
import { Layer } from '../../ui/Layer'
import { IconBack, IconNext } from '../../ui/icons'
import { useSession } from '../../session/session'
import { useStore } from '../../session/store'
import { audio } from '../../audio/engine'
import { toIndic } from '../../content/quran'
import { Frame } from './Print'
import { MuralText, ar } from './MuralText'
import { QrBlock } from './QrBlock'

interface ViewerProps {
  /** الجدارية المفتوحة، أو null (تبقى آخر واحدة معروضة أثناء انزلاق الطبقة للإغلاق) */
  m: Mural | null
  last: Mural
  onClose: () => void
  onStep: (dir: 1 | -1) => void
}

/**
 * العارض الكبير: صورة الصفحة في إطارها تحت ضوء المعرض + نصها كـHTML حقيقي + رقم «الجدارية ٣ من ١٣» + السابق/التالي
 * + «افتح القاعة المرتبطة» + «رمز الجدارية» (QR للرابط الحالي).
 * على الهاتف تصير الطبقة ورقة من الأسفل (Layer)، ويُتنقَّل بالسحب الأفقي على الصورة كما بالأزرار.
 */
export function Viewer({ m, last, onClose, onStep }: ViewerProps) {
  const mode = useStore((s) => s.mode)
  const session = useSession()
  const open = m !== null
  const cur = m ?? last
  const idx = murals.findIndex((x) => x.id === cur.id)
  const total = murals.length
  const sheet = mode === 'mobile'
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const textRef = useRef<HTMLDivElement>(null)

  // ← في الاتجاه العربي: «التالي» جهة اليسار
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); onStep(1) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); onStep(-1) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onStep])

  // نبدأ كل جدارية من أول نصها، ونسبق تحميل الجارتين ليكون التنقل فوريًا
  useEffect(() => {
    if (!open) return
    textRef.current?.scrollTo?.({ top: 0 })
    const body = textRef.current?.closest('.layer__body')
    if (body) body.scrollTop = 0
    for (const d of [-1, 1]) {
      const n = murals[idx + d]
      if (n) new Image().src = n.src
    }
  }, [open, cur.id, idx])

  const hall = cur.hallId ? hallById(cur.hallId) : null
  const linked = hall && hall.ready() ? hall : null
  const review = isReviewMode()

  const onPointerDown = (e: React.PointerEvent) => { if (e.pointerType !== 'mouse') swipe.current = { x: e.clientX, y: e.clientY } }
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x, dy = e.clientY - s.y
    // في RTL: إصبع نحو اليمين = التالي (المحتوى يتحرك يمينًا فيظهر ما على يساره)
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.6) onStep(dx > 0 ? 1 : -1)
  }

  const nav = (
    <div className="mv__nav" role="group" aria-label="التنقل بين الجداريات">
      <button className="btn mv__step" disabled={idx <= 0} onClick={() => onStep(-1)} aria-label="الجدارية السابقة">
        <IconBack /> <span className="mv__steplbl">السابقة</span>
      </button>
      <div className="mv__count num" aria-live="polite">
        <span className="sr-only">{`الجدارية ${toIndic(cur.page)} من ${toIndic(total)}: ${ar(cur.label)}`}</span>
        <span aria-hidden>الجدارية {toIndic(cur.page)} من {toIndic(total)}</span>
      </div>
      <button className="btn mv__step" disabled={idx >= total - 1} onClick={() => onStep(1)} aria-label="الجدارية التالية">
        <span className="mv__steplbl">التالية</span> <IconNext />
      </button>
    </div>
  )

  return (
    <Layer open={open} onClose={onClose} title={ar(cur.title)} kicker={`الجدارية ${toIndic(cur.page)} من ${toIndic(total)} · ${ar(cur.label)}`} width="full">
      <div className={`mv ${sheet ? 'mv--sheet' : ''}`} data-id={cur.id}>
        <div className="mv__stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { swipe.current = null }}>
          <div className="mv__view">
            <span className="mv__lamp" aria-hidden />
            <span className="mv__beam" aria-hidden />
            <Frame m={cur} big />
          </div>
          {!sheet && nav}
        </div>

        <article className="mv__text" ref={textRef} aria-label={`نص الجدارية ${toIndic(cur.page)}`}>
          <MuralText m={cur} />

          {linked && (
            <div className="mv__actions">
              <button
                className="btn btn--primary mv__hall"
                onClick={() => { audio.chime(3); session.goto(linked.id) }}
              >
                افتح القاعة المرتبطة: {linked.title} <IconNext />
              </button>
              <p className="label mv__hallnote">{linked.kicker}</p>
            </div>
          )}

          {sheet ? (
            <details className="mv__qrbox">
              <summary className="mv__qrsum">رمز الجدارية</summary>
              <QrBlock id={cur.id} number={cur.page} />
            </details>
          ) : (
            <QrBlock id={cur.id} number={cur.page} />
          )}

          {review && (cur.note || cur.corrections) && (
            <aside className="mv__review" aria-label="ملاحظات الفريق">
              <div className="kicker">⚑ ملاحظات للفريق — تظهر في وضع المراجعة فقط</div>
              {cur.corrections?.map((c) => (
                <p key={c.printed} className="label">تصحيح إملائي: المطبوع «{c.printed}» ← المعروض «{c.shown}» ({c.where})</p>
              ))}
              {cur.note && <p className="label">{cur.note}</p>}
            </aside>
          )}
        </article>
        {sheet && nav}
      </div>
    </Layer>
  )
}
