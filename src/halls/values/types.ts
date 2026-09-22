import type { Mode } from '../../design/tokens'
import type { ValueScene } from '../../content/valueScenes'

/** واجهة موحّدة لكل مشهد: يرسم لوحته الخاصة وأدوات التحكم، ويستدعي onComplete عند اكتمال التفاعل. */
export interface SceneProps {
  data: ValueScene
  reduced: boolean
  mode: Mode
  /** اكتمل التفاعل سابقًا (يبدأ المشهد بحالته المكتملة) */
  done: boolean
  onComplete: () => void
  chime: (step: number, vel?: number) => void
  tick: () => void
  pour: () => void
  /** الكرم فقط: الانتقال إلى قاعة المجلس */
  onMajlis?: () => void
}
