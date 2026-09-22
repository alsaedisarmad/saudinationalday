import { setup, assign, createActor } from 'xstate'
import { useSyncExternalStore } from 'react'
import type { HallId } from '../exhibition/halls'
import { hallById } from '../exhibition/halls'

/**
 * آلة حالات الجلسة (docs/TECHNICAL_ARCHITECTURE.md §5): INTRO → LOBBY → HALL، مع انتقال سينمائي بينها.
 * الانتقال مرحلة صريحة (transitioning) يقودها مكوّن Stage ثم يرسل ARRIVED — فيمكن إلغاؤه/اختباره.
 */
interface Ctx {
  hall: HallId // القاعة الحالية
  to: HallId | null // وجهة الانتقال الجاري
  from: HallId | null
  focus: string | null // القطعة المفتوحة (deep link mural → exhibit)
}
type Ev = { type: 'GOTO'; to: HallId; focus?: string } | { type: 'ARRIVED' } | { type: 'BACK' } | { type: 'RESET' }

export const machine = setup({
  types: { context: {} as Ctx, events: {} as Ev },
  guards: { toLobby: ({ context }) => context.to === 'courtyard', toGate: ({ context }) => context.to === 'gate' },
  actions: {
    begin: assign(({ context, event }) => (event.type === 'GOTO' ? { from: context.hall, to: event.to, focus: event.focus ?? null } : {})),
    arrive: assign(({ context }) => ({ hall: context.to ?? context.hall, from: context.hall, to: null })),
    reset: assign({ hall: 'gate' as HallId, to: null, from: null, focus: null }),
  },
}).createMachine({
  id: 'exhibition',
  initial: 'intro',
  context: { hall: 'gate', to: null, from: null, focus: null },
  on: { RESET: { target: '.intro', actions: 'reset' } },
  states: {
    intro: { on: { GOTO: { target: 'transitioning', actions: 'begin' } } },
    lobby: { on: { GOTO: { target: 'transitioning', actions: 'begin' } } },
    hall: {
      on: {
        GOTO: { target: 'transitioning', actions: 'begin' },
        BACK: { target: 'transitioning', actions: assign({ from: ({ context }) => context.hall, to: 'courtyard' as HallId, focus: null }) },
      },
    },
    transitioning: {
      on: {
        ARRIVED: [
          { guard: 'toGate', target: 'intro', actions: 'arrive' },
          { guard: 'toLobby', target: 'lobby', actions: 'arrive' },
          { target: 'hall', actions: 'arrive' },
        ],
      },
    },
  },
})

export const actor = createActor(machine)
actor.start()

export type SessionSnapshot = ReturnType<typeof actor.getSnapshot>

export function useSession() {
  const snap = useSyncExternalStore(
    (cb) => {
      const sub = actor.subscribe(cb)
      return () => sub.unsubscribe()
    },
    () => actor.getSnapshot(),
  )
  const phase = snap.value as 'intro' | 'lobby' | 'hall' | 'transitioning'
  return {
    phase,
    hall: snap.context.hall,
    to: snap.context.to,
    from: snap.context.from,
    focus: snap.context.focus,
    goto: (to: HallId, focus?: string) => actor.send({ type: 'GOTO', to, focus }),
    back: () => actor.send({ type: 'BACK' }),
    arrived: () => actor.send({ type: 'ARRIVED' }),
    reset: () => actor.send({ type: 'RESET' }),
  }
}

/** الروابط العميقة: #/hall/:id  ·  #/hall/:id/exhibit/:exhibitId  ·  #/mural/:id  ·  #/text */
export function parseHash(hash = location.hash): { hall?: HallId; focus?: string; text?: boolean } {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'text') return { text: true }
  if (parts[0] === 'mural' && parts[1]) return { hall: 'murals', focus: parts[1] }
  if (parts[0] === 'hall' && parts[1]) {
    if (!hallById(parts[1] as HallId)) return {}
    return { hall: parts[1] as HallId, focus: parts[2] === 'exhibit' ? parts[3] : undefined }
  }
  return {}
}

export function writeHash(hall: HallId, focus?: string | null) {
  const h = hall === 'gate' || hall === 'courtyard' ? '#/' : hall === 'murals' && focus ? `#/mural/${focus}` : `#/hall/${hall}${focus ? `/exhibit/${focus}` : ''}`
  if (location.hash !== h) history.replaceState(null, '', h)
}
