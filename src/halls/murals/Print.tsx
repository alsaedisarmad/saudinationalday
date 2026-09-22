import type { Mural } from '../../content/murals'
import { toIndic } from '../../content/quran'
import { ar } from './MuralText'

/** الإطار: خشب داكن بخيط ذهبي، ثم ورق «باسبارتو» كريمي، ثم صورة الصفحة تحت زجاج خفيف الانعكاس */
export function Frame({ m, big = false }: { m: Mural; big?: boolean }) {
  return (
    <span className={`fr ${big ? 'fr--big' : ''}`}>
      <span className="fr__frame">
        <span className="fr__mat">
          <img className="fr__img" src={big ? m.src : m.thumb} width={m.w} height={m.h} alt={m.alt} draggable={false} decoding="async" />
          <span className="fr__glass" aria-hidden />
        </span>
      </span>
    </span>
  )
}

interface PrintProps {
  m: Mural
  total: number
  current: boolean
  onOpen: (id: string) => void
}

/**
 * لوحة معلَّقة: مصباح نحاسي ومخروط ضوء وبقعة ضوء على الجدار، ثم الإطار، ثم لوحة تعريف بالرقم والعنوان.
 * الزر كله هدف لمس واحد (اللوحة + لوحة التعريف).
 */
export function Print({ m, total, current, onOpen }: PrintProps) {
  return (
    <li className="pr" data-id={m.id} data-stop>
      <button
        type="button"
        className="pr__btn"
        data-mural={m.id}
        aria-current={current ? 'true' : undefined}
        aria-label={`الجدارية ${toIndic(m.page)} من ${toIndic(total)}: ${ar(m.label)}. افتحها لقراءتها كاملة`}
        onClick={() => onOpen(m.id)}
      >
        <span className="pr__pool" aria-hidden />
        <span className="pr__beam" aria-hidden />
        <span className="pr__lamp" aria-hidden />
        <Frame m={m} />
        <span className="pr__plaque" aria-hidden>
          <span className="pr__no num">{toIndic(m.page)}</span>
          <span className="pr__lb">{ar(m.label)}</span>
        </span>
      </button>
    </li>
  )
}
