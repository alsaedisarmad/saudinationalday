// مصدر واحد للقيم التصميمية (docs/DESIGN_SYSTEM.md): يُحقن كمتغيرات CSS وقت التشغيل ويُستهلك من الـShader/Canvas.
export const palette = {
  night: '#0B1210',
  night2: '#131D19',
  charcoal: '#1C2421',
  saudiGreen: '#005430', // أخضر العلم الرسمي: RGB(0,84,48) — الدليل الإرشادي للعلم، وزارة الثقافة 1444هـ (research/01 R-FLAG)
  saudiGreenMid: '#006C35',
  saudiGreenDark: '#0A3D2A',
  saudiGreenLight: '#4FA779',
  sand: '#D8C3A0',
  stone: '#A79F91',
  clay: '#9E6248',
  clayLight: '#C58A6B',
  museumWhite: '#F5F0E6',
  gold: '#C9A45C',
  goldDeep: '#7D5F22',
  dusk: '#24304A',
  starlight: '#EDE6D3',
} as const

export type Mode = 'smartboard' | 'desktop' | 'tablet' | 'mobile'

/** وحدة الأساس px، حدّ الهدف اللمسي، حجم نص الأساس — DESIGN_SYSTEM §1 */
export const modeScale: Record<Mode, { u: number; target: number; base: number }> = {
  smartboard: { u: 12, target: 72, base: 30 },
  desktop: { u: 8, target: 44, base: 19 },
  tablet: { u: 9, target: 52, base: 21 },
  mobile: { u: 8, target: 48, base: 17 },
}

export const motion = {
  easeCine: 'cubic-bezier(.22,.61,.36,1)',
  easeInOut: 'cubic-bezier(.65,0,.35,1)',
  fast: 160,
  base: 420,
  slow: 900,
  cine: 1800,
} as const

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}
export const rgb = hex

/** «تعليم الضوء» لكل قاعة: يوم كامل من الضوء (EXHIBITION_CONCEPT §2) */
export interface LightGrade {
  top: string
  mid: string
  bottom: string
  ridge: string // لون طبقات الجبال القريبة
  haze: string // لون الضباب الجوي
  horizon: number // 0..1 من الأسفل
  stars: number
  moon: number
  ridges: number // 0 بلا جبال
  dust: number
  glow: string // لون توهج الخيط/الضوء الرئيس
  accent: string
}

export const grades: Record<string, LightGrade> = {
  gate: { top: '#050908', mid: '#0B1210', bottom: '#0B1210', ridge: '#0d1a15', haze: '#12201a', horizon: 0.42, stars: 0.35, moon: 0, ridges: 0, dust: 0.25, glow: '#4FA779', accent: '#C9A45C' },
  courtyard: { top: '#141b30', mid: '#3a3550', bottom: '#8a5a48', ridge: '#2a2230', haze: '#a4705a', horizon: 0.5, stars: 0.4, moon: 0.6, ridges: 2, dust: 0.5, glow: '#E7B04A', accent: '#C9A45C' },
  roots: { top: '#050a14', mid: '#0c1a2c', bottom: '#1d2b3a', ridge: '#0a1420', haze: '#1e3346', horizon: 0.3, stars: 0.85, moon: 0.9, ridges: 1, dust: 0.3, glow: '#E7C77A', accent: '#C9A45C' },
  safe: { top: '#04070d', mid: '#0e1626', bottom: '#243147', ridge: '#0a111d', haze: '#2a3a55', horizon: 0.34, stars: 0.75, moon: 0.5, ridges: 2, dust: 0.35, glow: '#E7B04A', accent: '#8FD0A9' },
  path: { top: '#2b3550', mid: '#8a6a63', bottom: '#e0b98a', ridge: '#4a3b46', haze: '#d5a27c', horizon: 0.4, stars: 0.12, moon: 0, ridges: 3, dust: 0.6, glow: '#FFD58A', accent: '#7D5F22' },
  land: { top: '#3d6079', mid: '#9db8c0', bottom: '#e8dcc0', ridge: '#8a7a64', haze: '#e3d2b0', horizon: 0.32, stars: 0, moon: 0, ridges: 3, dust: 0.45, glow: '#ffffff', accent: '#006C35' },
  majlis: { top: '#1a1108', mid: '#3a2410', bottom: '#6e4318', ridge: '#2a190a', haze: '#8a5a24', horizon: 0.3, stars: 0, moon: 0, ridges: 0, dust: 0.7, glow: '#FFC864', accent: '#C9A45C' },
  values: { top: '#082a1f', mid: '#0A3D2A', bottom: '#14523a', ridge: '#0a3324', haze: '#1c6244', horizon: 0.35, stars: 0.2, moon: 0, ridges: 2, dust: 0.4, glow: '#8FD0A9', accent: '#E7B04A' },
  challenge: { top: '#0d1512', mid: '#1b2a24', bottom: '#2a3c33', ridge: '#131f1a', haze: '#334a3e', horizon: 0.34, stars: 0.3, moon: 0, ridges: 1, dust: 0.3, glow: '#EDE6D3', accent: '#C9A45C' },
  future: { top: '#02070c', mid: '#07161c', bottom: '#0d2a2a', ridge: '#04101a', haze: '#123a3a', horizon: 0.3, stars: 1, moon: 0.2, ridges: 2, dust: 0.35, glow: '#8FD0A9', accent: '#E7B04A' },
  murals: { top: '#1a1712', mid: '#2b251b', bottom: '#3c3223', ridge: '#221c14', haze: '#4a3e2a', horizon: 0.3, stars: 0.1, moon: 0, ridges: 1, dust: 0.3, glow: '#E7C77A', accent: '#C9A45C' },
  students: { top: '#1c1410', mid: '#3a2418', bottom: '#6a4126', ridge: '#2a1a10', haze: '#8a5a34', horizon: 0.3, stars: 0.05, moon: 0, ridges: 0, dust: 0.5, glow: '#FFC864', accent: '#C9A45C' },
  wall: { top: '#0a0e1c', mid: '#161e36', bottom: '#2a3050', ridge: '#0e1428', haze: '#30375a', horizon: 0.3, stars: 1, moon: 0.4, ridges: 1, dust: 0.3, glow: '#EDE6D3', accent: '#8FD0A9' },
  finale: { top: '#02040a', mid: '#0b1220', bottom: '#1f2b3d', ridge: '#070d18', haze: '#1e2c44', horizon: 0.28, stars: 1, moon: 0.7, ridges: 1, dust: 0.5, glow: '#EDE6D3', accent: '#C9A45C' },
  about: { top: '#0d1512', mid: '#131d19', bottom: '#1c2c25', ridge: '#0e1814', haze: '#233830', horizon: 0.3, stars: 0.4, moon: 0, ridges: 1, dust: 0.25, glow: '#C9A45C', accent: '#C9A45C' },
}

export function injectTokens(mode: Mode, root: HTMLElement = document.documentElement) {
  const s = root.style
  for (const [k, v] of Object.entries(palette)) s.setProperty('--' + k.replace(/[A-Z0-9]/g, (m) => '-' + m.toLowerCase()), v)
  const m = modeScale[mode]
  s.setProperty('--u', m.u + 'px')
  s.setProperty('--target', m.target + 'px')
  s.setProperty('--base', m.base + 'px')
  s.setProperty('--ease-cine', motion.easeCine)
  s.setProperty('--ease-in-out', motion.easeInOut)
  root.dataset.mode = mode
}
