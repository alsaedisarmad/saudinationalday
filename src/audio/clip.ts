import wataniSrc from '../assets/audio/watani-ana.mp3'
import { audio } from './engine'

/**
 * مشغّل مقطع «وطني أنا» الحقيقي: عنصر <audio> واحد مستقل عن دورة حياة React،
 * فيبقى يعمل عبر الانتقال بين القاعات (Stage.tsx لا يُعيد تركيبه). يبدأ تلقائيًا مرة واحدة
 * من زر «ابدأ الرحلة» في البوابة (إيماءة الزائر نفسها التي تُطلق صوت المعرض)، ويخفض بيئة
 * القاعة الإجرائية أثناء تشغيله (يُعيدها تلقائيًا عند الإيقاف أو الانتهاء).
 */
class ClipPlayer {
  private el: HTMLAudioElement | null = null
  private started = false

  private ensure() {
    if (this.el) return this.el
    const el = new Audio(wataniSrc)
    el.preload = 'none'
    el.addEventListener('play', () => audio.duck(true))
    el.addEventListener('pause', () => audio.duck(false))
    el.addEventListener('ended', () => audio.duck(false))
    this.el = el
    return el
  }

  /** يُشغَّل مرة واحدة فقط تلقائيًا؛ نداءات لاحقة بلا أثر (الزائر يتحكم بعدها بزر الاستماع) */
  playOnce() {
    if (this.started) return
    this.started = true
    this.ensure().play().catch(() => { /* رفض تلقائي من المتصفح — يبقى زر «استمع» اليدوي بديلًا */ })
  }

  toggle() {
    const el = this.ensure()
    if (el.paused) void el.play()
    else el.pause()
  }

  setMuted(muted: boolean) {
    if (this.el) this.el.muted = muted
  }

  get element() { return this.ensure() }
  get playing() { return !!this.el && !this.el.paused }
}

export const clipPlayer = new ClipPlayer()
