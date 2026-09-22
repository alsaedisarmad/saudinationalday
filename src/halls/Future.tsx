import { useCallback, useEffect, useRef, useState } from 'react'
import { backdrop } from '../backdrop/Backdrop'
import { Layer } from '../ui/Layer'
import { useStore } from '../session/store'
import { useSession } from '../session/session'
import { discoverIds } from '../exhibition/discovery'
import { audio } from '../audio/engine'
import { visible } from '../content/types'
import { futureById, futureItems, futurePillarOrder, pillarItem, type FutureItem, type PillarId } from '../content/future'
import { Starfield } from './future/Starfield'
import { Stage } from './future/Stage'
import { Closing, Panel } from './future/Panel'
import { ItemBody } from './future/parts'
import { css } from './future/css'

/**
 * نحو المستقبل — «ليل النجوم»: الركائز الثلاث كوكبات؛ لمس رأس الركيزة يرسم خيط ضوئها ويكشف محاورها،
 * ثم يهبط الخيط إلى مشاريعها على خريطة المملكة (نقاط على مستوى المنطقة فقط). كل بطاقة: نص موثّق بمصدره + شارة «موثّق/مستهدف».
 * البيانات كلها في content/future.ts. التصوّر الفني (النجوم والخيوط) موسوم «تصوّر إبداعي».
 */
const STACK_Q = '(max-aspect-ratio: 1/1), (max-width: 820px)'

function useStacked() {
  const mode = useStore((s) => s.mode)
  const [q, setQ] = useState(() => (typeof matchMedia !== 'undefined' ? matchMedia(STACK_Q).matches : false))
  useEffect(() => {
    const m = matchMedia(STACK_Q)
    const on = () => setQ(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return q || mode === 'mobile'
}

const kickerOf = (it: FutureItem) => {
  if (it.kind === 'theme' && it.pillar) return `${pillarItem(it.pillar).title}..`
  if (it.kind === 'project') return 'مشروع على الأرض'
  if (it.kind === 'milestone') return 'محطة عالمية'
  if (it.kind === 'pillar') return 'ركيزة'
  return 'رؤية ٢٠٣٠'
}

const isPillarId = (s: string): s is PillarId => (futurePillarOrder as string[]).includes(s)

export default function Future() {
  const session = useSession()
  const discovered = useStore((s) => s.discovered)
  const reduced = useStore((s) => s.reducedMotion)
  const stacked = useStacked()
  const [pillar, setPillar] = useState<PillarId | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const lastOpen = useRef<FutureItem | null>(null)

  useEffect(() => {
    backdrop.grade = 'future'
    backdrop.thread = 0
    backdrop.threadY = 0.3
  }, [])

  const seen = useCallback((id: string) => discovered.includes(discoverIds.future(id)), [discovered])

  const selectPillar = useCallback((p: PillarId | null) => {
    setPillar(p)
    if (!p) return
    const it = pillarItem(p)
    audio.chime(futurePillarOrder.indexOf(p) + 1)
    useStore.getState().discover(discoverIds.future(it.id))
  }, [])

  const openItem = useCallback(
    (id: string) => {
      const it = futureById(id)
      if (!it || !visible(it)) return
      if (it.kind === 'pillar' && it.pillar) {
        selectPillar(it.pillar)
        return
      }
      if (it.pillar) setPillar(it.pillar)
      audio.chime(Math.max(0, futureItems.indexOf(it)) % 8)
      useStore.getState().discover(discoverIds.future(it.id))
      lastOpen.current = it
      setOpenId(it.id)
    },
    [selectPillar],
  )

  // الرابط العميق: #/hall/future/exhibit/<id> (عنصر أو ركيزة)
  useEffect(() => {
    const f = session.focus
    if (!f) return
    if (isPillarId(f)) selectPillar(f)
    else openItem(f)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cur = openId ? futureById(openId) ?? null : lastOpen.current

  return (
    <div className={`fut ${reduced ? 'is-still' : ''} ${stacked ? 'is-stacked' : ''}`}>
      <Starfield />
      <div className="fut__body">
        <Panel pillar={pillar} stacked={stacked} seen={seen} onPillar={selectPillar} onOpen={openItem} />
        <Stage pillar={pillar} stacked={stacked} seen={seen} onPillar={selectPillar} onOpen={openItem} />
      </div>
      {!stacked && <Closing band />}
      <Layer open={!!openId} onClose={() => setOpenId(null)} title={cur?.title ?? 'نحو المستقبل'} kicker={cur ? kickerOf(cur) : undefined}>
        {cur && (
          <ItemBody
            item={cur}
            onPillar={(p) => {
              setOpenId(null)
              selectPillar(p)
            }}
          />
        )}
      </Layer>
      <style>{css}</style>
    </div>
  )
}
