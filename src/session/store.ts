import { create } from 'zustand'
import type { Mode } from '../design/tokens'

/** الاكتشافات: كل عنصر يفتحه الزائر (آية، منطقة، نقطة مجلس، قيمة…). نقاط الـ96 = round(96 × المكتشَف/الكلي) */
interface SettingsState {
  mode: Mode
  sound: boolean
  reducedMotion: boolean
  textMode: boolean
  discovered: string[]
  visitedHalls: string[]
  /** كلمة الزائر «ماذا تقول للسعودية؟» — تبقى في الجلسة فقط ولا تُحفظ ولا تُرسل */
  word: string
  setWord: (w: string) => void
  setMode: (m: Mode) => void
  toggleSound: () => void
  setSound: (on: boolean) => void
  toggleMotion: () => void
  toggleText: () => void
  discover: (id: string) => void
  visitHall: (id: string) => void
  resetVisitor: () => void
}

const sysReduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** على الأجهزة الشخصية فقط نحفظ التقدّم في الجلسة (لا على السبورة المشتركة) */
const persistKey = 'ex96:visitor'
const load = (mode: Mode): Pick<SettingsState, 'discovered' | 'visitedHalls'> => {
  if (mode === 'smartboard') return { discovered: [], visitedHalls: [] }
  try {
    const raw = sessionStorage.getItem(persistKey)
    if (raw) return JSON.parse(raw)
  } catch {
    /* التخزين غير متاح: نكمل بلا حفظ */
  }
  return { discovered: [], visitedHalls: [] }
}
const save = (s: Pick<SettingsState, 'discovered' | 'visitedHalls' | 'mode'>) => {
  if (s.mode === 'smartboard') return
  try {
    sessionStorage.setItem(persistKey, JSON.stringify({ discovered: s.discovered, visitedHalls: s.visitedHalls }))
  } catch {
    /* تجاهل */
  }
}

export const useStore = create<SettingsState>((set, get) => ({
  mode: 'desktop',
  sound: false,
  reducedMotion: sysReduced(),
  textMode: false,
  word: '',
  setWord: (word) => set({ word }),
  ...load('desktop'),
  setMode: (mode) => set({ mode, ...load(mode) }),
  toggleSound: () => set((s) => ({ sound: !s.sound })),
  setSound: (sound) => set({ sound }),
  toggleMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
  toggleText: () => set((s) => ({ textMode: !s.textMode })),
  discover: (id) => {
    if (get().discovered.includes(id)) return
    const discovered = [...get().discovered, id]
    set({ discovered })
    save({ ...get(), discovered })
  },
  visitHall: (id) => {
    if (get().visitedHalls.includes(id)) return
    const visitedHalls = [...get().visitedHalls, id]
    set({ visitedHalls })
    save({ ...get(), visitedHalls })
  },
  resetVisitor: () => {
    set({ discovered: [], visitedHalls: [], word: '' })
    try {
      sessionStorage.removeItem(persistKey)
    } catch {
      /* تجاهل */
    }
  },
}))

/** كشف الوضع: لمس فقط + عرض كبير = سبورة (DESIGN_SYSTEM §1). ?mode= يفرض يدويًا */
export function detectMode(): Mode {
  const forced = new URLSearchParams(location.search).get('mode')
  if (forced === 'board') return 'smartboard'
  if (forced === 'smartboard' || forced === 'desktop' || forced === 'tablet' || forced === 'mobile') return forced
  const coarse = matchMedia('(pointer: coarse)').matches
  const noHover = matchMedia('(hover: none)').matches
  const w = Math.min(window.innerWidth, window.innerHeight * 2.4)
  if (coarse && noHover && window.innerWidth >= 1500) return 'smartboard'
  if (window.innerWidth < 768) return 'mobile'
  if (coarse && window.innerWidth < 1280) return 'tablet'
  return w >= 1280 || !coarse ? 'desktop' : 'tablet'
}
