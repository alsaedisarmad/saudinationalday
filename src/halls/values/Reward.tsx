import { useEffect, useRef, useState } from 'react'
import { valueScenes } from '../../content/valueScenes'
import { identity } from '../../content/values'
import { audio } from '../../audio/engine'

/**
 * لحظة هادئة عند اكتمال القيم الست: تُضاء العبارات الست واحدة تلو الأخرى بنغمة، ثم تتّحد في الشعار.
 * مع تقليل الحركة تُضاء كلها فورًا بلا تتابع.
 */
export function Reward({ reduced, onClose, onMajlis }: { reduced: boolean; onClose: () => void; onMajlis: () => void }) {
  const [lit, setLit] = useState(reduced ? valueScenes.length : 0)
  const [all, setAll] = useState(reduced)
  const main = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (reduced) { audio.chime(5); return }
    const ids: number[] = []
    valueScenes.forEach((_, i) => ids.push(window.setTimeout(() => { setLit(i + 1); audio.chime(i, 0.8) }, 700 + i * 620)))
    ids.push(window.setTimeout(() => { setAll(true); audio.chime(7, 1) }, 700 + valueScenes.length * 620 + 500))
    return () => ids.forEach(clearTimeout)
  }, [reduced])

  useEffect(() => {
    const t = window.setTimeout(() => main.current?.focus(), reduced ? 50 : 700 + valueScenes.length * 620 + 900)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey) }
  }, [reduced, onClose])

  return (
    <div className="rw" role="dialog" aria-label="اكتملت القيم الست">
      <div className="rw__in">
        <ul className="rw__list" aria-label="القيم الست">
          {valueScenes.map((v, i) => (
            <li key={v.id} className={i < lit ? 'on' : ''}>{v.phrase}</li>
          ))}
        </ul>
        <div className={`rw__slogan ${all ? 'on' : ''}`} aria-live="polite">{all ? identity.slogan : ' '}</div>
        <div className={`rw__actions ${all ? 'on' : ''}`}>
          <button ref={main} className="btn btn--primary vbtn" onClick={onMajlis}>ادخل المجلس</button>
          <button className="btn vbtn" onClick={onClose}>تابع التجوّل بين المشاهد</button>
        </div>
      </div>
    </div>
  )
}
