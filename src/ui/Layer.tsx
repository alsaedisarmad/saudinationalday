import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../session/store'
import { IconClose } from './icons'
import { audio } from '../audio/engine'

interface LayerProps {
  open: boolean
  onClose: () => void
  title: string
  kicker?: string
  children: ReactNode
  /** side: تنزلق من جهة القراءة (يمين في RTL) — الافتراضي على Desktop/سبورة. الهاتف دائمًا من الأسفل. */
  width?: 'narrow' | 'wide' | 'full'
  tone?: 'night' | 'paper'
}

/**
 * طبقة التفاصيل («اكتشف المعنى»): تحبس التركيز وتعيده، Esc + النقر خارجها + زر إغلاق كبير.
 * لا تعرض محتوى طويلًا دفعة واحدة: يُطوى داخلها باستخدام <details> أو أزرار «تابع».
 */
export function Layer({ open, onClose, title, kicker, children, width = 'narrow', tone = 'night' }: LayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnTo = useRef<Element | null>(null)
  const mode = useStore((s) => s.mode)
  const bottom = mode === 'mobile'

  useEffect(() => {
    if (!open) return
    returnTo.current = document.activeElement
    const t = setTimeout(() => closeRef.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button, [href], input, textarea, select, summary, [tabindex]:not([tabindex="-1"])')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey, true)
      ;(returnTo.current as HTMLElement | null)?.focus?.()
    }
  }, [open, onClose])

  // بوابة إلى body: تعلو شريط HUD (لا تُحبس داخل سياق تكديس القاعة)
  return createPortal(
    <div className={`layer ${open ? 'layer--open' : ''}`} data-bottom={bottom} data-width={width} data-tone={tone} aria-hidden={!open}>
      <div className="layer__scrim" onClick={onClose} />
      <div ref={ref} className="layer__panel" role="dialog" aria-modal="true" aria-label={title} {...(!open ? { inert: true } : {})}>
        <header className="layer__head">
          <div>
            {kicker && <div className="kicker">{kicker}</div>}
            <h2 className="display-m layer__title">{title}</h2>
          </div>
          <button ref={closeRef} className="btn btn--icon" onClick={() => { audio.tick(); onClose() }} aria-label="إغلاق">
            <IconClose />
          </button>
        </header>
        <div className="layer__body">{open ? children : null}</div>
      </div>
      <style>{css}</style>
    </div>,
    document.body,
  )
}

const css = `
.layer{position:fixed;inset:0;z-index:40;pointer-events:none}
.layer--open{pointer-events:auto}
.layer__scrim{position:absolute;inset:0;background:rgba(3,6,5,.55);opacity:0;transition:opacity 420ms var(--ease-cine);backdrop-filter:blur(2px)}
.layer--open .layer__scrim{opacity:1}
.layer__panel{position:absolute;top:0;bottom:0;inset-inline-start:0;width:min(46rem,92vw);background:linear-gradient(180deg,rgba(15,24,20,.97),rgba(10,16,14,.98));border-inline-end:1px solid var(--line);box-shadow:0 0 80px rgba(0,0,0,.6);transform:translateX(-102%);transition:transform 520ms var(--ease-cine);display:flex;flex-direction:column;overflow:hidden}
[dir=rtl] .layer__panel{transform:translateX(102%)}
.layer:not(.layer--open){visibility:hidden;transition:visibility 0s 540ms}
.layer[data-width=wide] .layer__panel{width:min(64rem,96vw)}
.layer[data-width=full] .layer__panel{width:100vw;border:0}
.layer--open .layer__panel{transform:none}
.layer[data-bottom=true] .layer__panel{inset:auto 0 0 0;width:100%;height:min(92dvh,100%);border:0;border-top:1px solid var(--line);transform:translateY(102%);border-radius:0}
.layer[data-bottom=true].layer--open .layer__panel{transform:none}
.layer[data-tone=paper] .layer__panel{background:linear-gradient(180deg,#F5F0E6,#EDE4D0);color:var(--charcoal)}
.layer__head{display:flex;justify-content:space-between;align-items:flex-start;gap:var(--s3);padding:var(--s4) var(--s4) var(--s2);flex:0 0 auto}
.layer__title{margin-top:.15em}
.layer__body{padding:var(--s2) var(--s4) var(--s6);overflow:auto;flex:1;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.layer__body p+p{margin-top:1em}
`
