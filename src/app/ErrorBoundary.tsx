import { Component, type ReactNode } from 'react'

/**
 * حاجز أخطاء: أي عطل داخل قاعة أو الخلفية لا يُسقط المعرض كله؛ رسالة هادئة وزر رجوع (TECHNICAL_ARCHITECTURE §11).
 * يُعاد ضبطه عند تغيّر `resetKey` (القاعة الجديدة).
 */
interface Props { children: ReactNode; resetKey?: string; label?: string; silent?: boolean; onBack?: () => void }
interface State { failed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }
  static getDerivedStateFromError(): State { return { failed: true } }
  componentDidCatch(err: unknown) { console.warn('[exhibition] hall crashed', err) }
  componentDidUpdate(prev: Props) { if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false }) }
  render() {
    if (!this.state.failed) return this.props.children
    if (this.props.silent) return null
    return (
      <div role="alert" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24, gap: 16 }}>
        <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
          <div className="display-m">تعذّر عرض {this.props.label ?? 'هذه القاعة'} على هذا الجهاز</div>
          <p className="body-l" style={{ maxWidth: '30rem', opacity: 0.85 }}>يمكنك العودة إلى الفناء أو فتح النسخة النصية المبسّطة من زر القائمة في الأعلى.</p>
          {this.props.onBack && <button className="btn btn--primary" onClick={this.props.onBack}>العودة إلى الفناء</button>}
        </div>
      </div>
    )
  }
}
