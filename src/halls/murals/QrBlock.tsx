import { useEffect, useState } from 'react'
import { muralHash } from '../../content/murals'

/** رابط الجدارية الحالي كما يُفتح على أي جهاز: المضيف والمسار الحاليان + #/mural/<id> */
export const muralUrl = (id: string) => `${location.origin}${location.pathname}${muralHash(id)}`

/**
 * «رمز الجدارية»: QR يُولَّد وقت التشغيل من مكتبة qrcode (تُحمَّل كسولًا فلا تدخل الحزمة الرئيسة).
 * أسود على أبيض بمنطقة هادئة 4 وحدات وتصحيح أخطاء Q — نفس مواصفات رموز الطباعة (scripts/make-qr.mjs).
 */
export function QrBlock({ id, number }: { id: string; number: number }) {
  const url = muralUrl(id)
  const [svg, setSvg] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    setSvg(null)
    setFailed(false)
    import('qrcode')
      .then((q) => q.toString(url, { type: 'svg', errorCorrectionLevel: 'Q', margin: 4, color: { dark: '#0b1210', light: '#ffffff' } }))
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [url])

  return (
    <section className="mq" aria-labelledby={`mq-h-${id}`}>
      <div className="mq__code" role="img" aria-label={`رمز QR يفتح الجدارية ${number} على هاتفك`}>
        {svg ? <div className="mq__svg" dangerouslySetInnerHTML={{ __html: svg }} /> : <div className="mq__wait" aria-hidden>{failed ? '—' : ''}</div>}
      </div>
      <div className="mq__info">
        <h3 id={`mq-h-${id}`} className="mq__h">رمز الجدارية</h3>
        <p className="mq__p">امسح الرمز بكاميرا هاتفك لتحمل هذه الجدارية معك، وهو الرمز نفسه الذي يُطبع على الجدارية في المعرض.</p>
        <bdi className="mq__url label" dir="ltr">{url}</bdi>
      </div>
    </section>
  )
}
