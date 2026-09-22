import { valueScenes } from '../../content/valueScenes'
import { IconBack, IconNext } from '../../ui/icons'

/**
 * الخيط السفلي: ست عُقد (الكلمات) على خيط واحد؛ كل مشهد يكتمل يُضيء عقدته ويُضيء سدس الشعار «عزّنا بطبعنا».
 * السابق على اليمين (اتجاه القراءة) والتالي على اليسار. في الهاتف تصير العُقد مؤشرًا فقط (أهداف اللمس للسابق/التالي).
 */
export function Stepper({ idx, done, mobile, onGo, onReplay }: { idx: number; done: string[]; mobile: boolean; onGo: (i: number) => void; onReplay: () => void }) {
  const total = valueScenes.length
  const count = done.length
  const full = count === total
  const Slogan = full ? 'button' : 'div'
  return (
    <nav className="vs" aria-label="مشاهد القيم الست">
      <button className="btn btn--icon vs__nav vs__prev" disabled={idx === 0} onClick={() => onGo(idx - 1)} aria-label="القيمة السابقة">
        <IconBack />
      </button>
      <div className="vs__mid">
        <Slogan
          className={`vs__slogan ${full ? 'is-full' : ''}`}
          style={{ ['--fill' as string]: `${(count / total) * 100}%` }}
          {...(full ? { onClick: onReplay, 'aria-label': 'عزّنا بطبعنا — اكتملت القيم الست، شاهد الخلاصة' } : { 'aria-label': `عزّنا بطبعنا — اكتمل ${count} من ${total}`, role: 'img' })}
        >
          عزّنا بطبعنا
        </Slogan>
        <ol className="vs__dots">
          {valueScenes.map((v, i) => {
            const isDone = done.includes(v.id)
            const cls = `vs__dot ${i === idx ? 'is-cur' : ''} ${isDone ? 'is-done' : ''}`
            const inner = (
              <>
                <i aria-hidden />
                <span>{v.word}</span>
              </>
            )
            return (
              <li key={v.id}>
                {mobile ? (
                  <span className={cls} aria-hidden>{inner}</span>
                ) : (
                  <button className={cls} onClick={() => onGo(i)} aria-current={i === idx ? 'step' : undefined} aria-label={`${v.word}${isDone ? ' — اكتملت' : ''}`}>
                    {inner}
                  </button>
                )}
              </li>
            )
          })}
        </ol>
      </div>
      <button className="btn btn--icon vs__nav vs__next" disabled={idx === total - 1} onClick={() => onGo(idx + 1)} aria-label="القيمة التالية">
        <IconNext />
      </button>
    </nav>
  )
}
