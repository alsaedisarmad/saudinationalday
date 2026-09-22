import type { Gated } from './types'

/**
 * أعمال الطالبات. تُضاف هنا حين يسلّمها الفريق (بعد إذن النشر): ضع الصورة في src/assets/students/ ثم أضف عنصرًا.
 * لا تُنشر أسماء الطالبات رقميًا إلا بعد موافقة صريحة (SC-04): اترك studentName فارغًا لعرض الصف فقط.
 */
export interface StudentWork extends Gated {
  id: string
  title: string
  /** اسم الملف داخل src/assets/students/ */
  file: string
  classLabel?: string
  /** يُعرض الاسم فقط إن كانت consent=true (موافقة صريحة من الطالبة وولي أمرها/المدرسة) */
  studentName?: string
  consent?: boolean
  medium?: string
  description?: string
  alt: string
}

/**
 * مثال (احذف علامات التعليق بعد وضع الصورة):
 * { id: 'w01', title: 'عنوان العمل', file: 'w01.jpg', classLabel: 'الصف ٣/١', medium: 'رسم بالألوان', description: 'وصف قصير', alt: 'وصف الصورة للمكفوفين', status: 'verified', sourceIds: ['team-students'] }
 */
export const works: StudentWork[] = []

export const studentFiles = import.meta.glob('../assets/students/*.{webp,jpg,jpeg,png}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
export const workUrl = (w: StudentWork) => studentFiles[`../assets/students/${w.file}`]
