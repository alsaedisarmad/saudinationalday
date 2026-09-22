import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { backdrop } from '../backdrop/Backdrop'
import { valueScenes, valueDoneKey } from '../content/valueScenes'
import { identity } from '../content/values'
import { toIndic } from '../content/quran'
import { Layer } from '../ui/Layer'
import { ReviewTag, SourceLine } from '../ui/parts'
import { photo, creditLine } from '../content/photos'
import { IconSource } from '../ui/icons'
import { useStore } from '../session/store'
import { useSession } from '../session/session'
import { discoverIds } from '../exhibition/discovery'
import { audio } from '../audio/engine'
import { Stepper } from './values/Stepper'
import { Reward } from './values/Reward'
import { css } from './values/css'
import type { SceneProps } from './values/types'
import Courage from './values/Courage'
import Vision from './values/Vision'
import Authenticity from './values/Authenticity'
import Ambition from './values/Ambition'
import Giving from './values/Giving'
import Generosity from './values/Generosity'

/**
 * عزّنا بطبعنا: ست قيم = ست بيئات، لكل بيئة ضوؤها وتفاعلها (لا بطاقات).
 * الشجاعة (شعلة أمام الريح) · الرؤية (عدسة على النجوم) · الأصالة (نول سدو) · الهمّة (صعود) · الجود (نخلة) · الكرم (قهوة).
 * المحتوى في content/valueScenes.ts؛ اكتمال المشهد يُسجَّل كاكتشاف، وحين تكتمل الست تُضاء العبارات معًا.
 */
const SCENES: Record<string, ComponentType<SceneProps>> = {
  courage: Courage,
  vision: Vision,
  authenticity: Authenticity,
  ambition: Ambition,
  giving: Giving,
  generosity: Generosity,
}

export default function Values() {
  const session = useSession()
  const reduced = useStore((s) => s.reducedMotion)
  const mode = useStore((s) => s.mode)
  const discovered = useStore((s) => s.discovered)
  const start = valueScenes.findIndex((v) => v.id === session.focus)
  const [idx, setIdx] = useState(start >= 0 ? start : 0)
  const [layer, setLayer] = useState(false)
  const [reward, setReward] = useState(false)
  const [say, setSay] = useState('')

  const scene = valueScenes[idx]
  const doneIds = valueScenes.filter((v) => discovered.includes(valueDoneKey(v.id))).map((v) => v.id)
  const isDone = doneIds.includes(scene.id)
  const count = doneIds.length
  const total = valueScenes.length

  useEffect(() => {
    backdrop.grade = 'values'
    backdrop.thread = 0
    backdrop.threadY = 0.35
    backdrop.paused = true // كل مشهد لوحة كاملة معتمة: لا حاجة لرسم الخلفية تحته
    return () => { backdrop.paused = false }
  }, [])

  // اكتشاف القاعة نفسها يسجّله المسرح؛ هنا نسجّل القيمة عند اكتمال تفاعلها أو فتح دلالتها
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const complete = useCallback((id: string, i: number) => {
    const st = useStore.getState()
    const first = !st.discovered.includes(valueDoneKey(id))
    st.discover(discoverIds.value(id))
    st.discover(valueDoneKey(id))
    if (!first) return
    audio.chime(i)
    timers.current.push(window.setTimeout(() => audio.chime(i + 2), 160))
    setSay(`اكتمل مشهد ${valueScenes[i].word}`)
  }, [])

  // لحظة المكافأة عند اكتمال السادس فقط (لا عند العودة والقيم مكتملة أصلًا)
  const prev = useRef(count)
  useEffect(() => {
    const was = prev.current
    prev.current = count
    if (count === total && was < total) {
      const t = window.setTimeout(() => setReward(true), useStore.getState().reducedMotion ? 400 : 2400)
      timers.current.push(t)
    }
  }, [count, total])

  const go = (i: number) => {
    if (i < 0 || i >= total || i === idx) return
    audio.tick()
    setReward(false)
    setLayer(false)
    setIdx(i)
    setSay(`القيمة ${toIndic(i + 1)} من ${toIndic(total)}: ${valueScenes[i].word}`)
  }
  const openMeaning = () => {
    audio.chime(2)
    useStore.getState().discover(discoverIds.value(scene.id))
    setLayer(true)
  }
  const toMajlis = () => { audio.chime(4); session.goto('majlis') }

  const Scene = SCENES[scene.id]
  const props: SceneProps = {
    data: scene,
    reduced,
    mode,
    done: isDone,
    onComplete: () => complete(scene.id, idx),
    chime: (s, v) => audio.chime(s, v),
    tick: () => audio.tick(),
    pour: () => audio.pour(),
    onMajlis: toMajlis,
  }

  return (
    <section className="vals" data-scene={scene.id} aria-label={identity.slogan}>
      <div className="vsc" key={scene.id}>
        <Scene {...props} />
      </div>
      <div className="vals__vig" aria-hidden />
      <div className="grain vals__grain" aria-hidden />

      <header className="vt">
        <div className="kicker vt__kicker">
          <i aria-hidden />
          <span>القيمة {toIndic(idx + 1)} من {toIndic(total)}</span>
          <ReviewTag item={scene} />
        </div>
        <h1 className="vt__word" id="vals-word">{scene.word}</h1>
        <p className="vt__phrase">{scene.phrase}</p>
        <p className="vt__cue body-l">{scene.cue}</p>
        {scene.creative && <span className="vt__badge" role="note">◌ {scene.creative.label} — أفق رمزي</span>}
        {isDone && (
          <div className="vt__reveal" aria-live="polite">
            <span className="label">من الحكاية</span>
            <p>{scene.reveal}</p>
          </div>
        )}
        <button className="btn btn--gold vt__meaning" onClick={openMeaning} aria-haspopup="dialog">
          <IconSource /> الدلالة
        </button>
      </header>

      <Stepper idx={idx} done={doneIds} mobile={mode === 'mobile'} onGo={go} onReplay={() => setReward(true)} />
      {reward && <Reward reduced={reduced} onClose={() => setReward(false)} onMajlis={toMajlis} />}

      <Layer open={layer} onClose={() => setLayer(false)} title="الدلالة" kicker={`${scene.word} — ${scene.phrase}`}>
        <div className="vd">
          {scene.photoId && (() => {
            const p = photo(scene.photoId!)
            return (
              <figure className="vd__fig">
                <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" draggable={false} />
                <figcaption className="label">{creditLine(p)}</figcaption>
              </figure>
            )
          })()}
          <div className="kicker vd__date">{scene.anchor.dateLabel}</div>
          <h3 className="display-m">{scene.anchor.title}</h3>
          <p className="body-l">{scene.anchor.text}</p>
          {scene.creative && <p className="body-l"><span className="vt__badge">◌ {scene.creative.label}</span> {scene.creative.note}</p>}
          {scene.disclaimer && <p className="label">{scene.disclaimer}</p>}
          <p className="vd__reading body-l"><span className="label">قراءة المعرض</span>{scene.reading}</p>
          <SourceLine ids={scene.sourceIds} />
        </div>
      </Layer>

      <div className="sr-only" aria-live="polite">{say}</div>
      <style>{css}</style>
    </section>
  )
}
