import type { ReactNode } from 'react'
import type { Mural, MuralBlock } from '../../content/murals'
import { SourceLine } from '../../ui/parts'
import { toIndic } from '../../content/quran'

/** الأرقام تُعرض هندية في النص العربي (BUILD_CONVENTIONS §2)؛ النص المخزَّن يبقى كما طُبع */
export const ar = (s: string) => s.replace(/\d+/g, (d) => toIndic(d))

/** آية الجدارية: النص من مصدرين مُتحقَّق منهما لا من صورة الصفحة؛ المقطع الذي اقتبسته المجلة مُضاء والتكملة أخفت */
function Verse({ m, refLabel }: { m: Mural; refLabel: string }) {
  const v = m.verse
  if (!v) {
    // لا نص آية بلا مصدرين متطابقين: نعرض المرجع فقط
    return <p className="mt__p mt__ref">{ar(refLabel)}</p>
  }
  const words = v.text.split(' ')
  const n = v.quotedTokens
  return (
    <figure className="mt__verse">
      <blockquote className="quran mt__quran" lang="ar" dir="rtl" cite="https://quran.com/4/59">
        <span className="mt__quoted">{words.slice(0, n).join(' ')}</span>{' '}
        <span className="mt__rest">{words.slice(n).join(' ')}</span>
        <span className="mt__end"> ۝{toIndic(v.ayah)}</span>
      </blockquote>
      <figcaption className="label mt__vref">
        سورة {v.surahName} · الآية {toIndic(v.ayah)}
        <span className="mt__vnote"> — المقطع المُضاء هو ما اقتبسته المجلة في الجدارية المطبوعة.</span>
      </figcaption>
      <SourceLine ids={v.sourceIds} label="نصّ الآية" />
    </figure>
  )
}

function Block({ b, m }: { b: MuralBlock; m: Mural }): ReactNode {
  switch (b.t) {
    case 'h':
      return <h3 className="mt__h">{ar(b.text)}</h3>
    case 'p':
      return <p className="mt__p">{ar(b.text)}</p>
    case 'li':
      return (
        <p className="mt__p mt__li">
          <strong>{ar(b.label)}</strong>
          <span className="mt__colon">: </span>
          {ar(b.text)}
        </p>
      )
    case 'line':
      return <p className="mt__line">{ar(b.text)}</p>
    case 'list':
      return (
        <ul className="mt__tags" role="list">
          {b.items.map((it) => (
            <li key={it}>{ar(it)}</li>
          ))}
        </ul>
      )
    case 'strong':
      return <p className="mt__strong">{ar(b.text)}</p>
    case 'verse':
      return <Verse m={m} refLabel={b.ref} />
  }
}

/** نص الجدارية كما طُبع، HTML حقيقي: قابل للتحديد وقارئ الشاشة، بترتيب الصفحة */
export function MuralText({ m }: { m: Mural }) {
  return (
    <div className="mt" lang="ar">
      {m.blocks.map((b, i) => (
        <Block key={i} b={b} m={m} />
      ))}
      <SourceLine ids={m.sourceIds} label="المصدر" />
    </div>
  )
}
