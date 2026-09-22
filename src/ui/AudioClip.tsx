import { useEffect, useRef, useState } from 'react'
import type { AudioClipData } from '../content/audio'
import { SourceLine } from './parts'
import { toIndic } from '../content/quran'
import { audio } from '../audio/engine'

const fmt = (t: number) => `${toIndic(Math.floor(t / 60))}:${toIndic(String(Math.floor(t % 60)).padStart(2, '0'))}`

/** مشغّل مقطع صوتي: يبدأ تلقائيًا إن طُلب (بعد إيماءة الزائر في البوابة)، ويخفض بيئة القاعة أثناء التشغيل ويعيدها بعده. */
export function AudioClip({ clip, autoPlay = false }: { clip: AudioClipData; autoPlay?: boolean }) {
  const el = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(clip.seconds)
  const [err, setErr] = useState(false)

  useEffect(() => () => { el.current?.pause(); audio.duck(false) }, [])
  useEffect(() => {
    if (!autoPlay) return
    el.current?.play().catch(() => setErr(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = async () => {
    const a = el.current
    if (!a) return
    if (playing) { a.pause(); return }
    try { await a.play() } catch { setErr(true) }
  }

  return (
    <div className="clip" role="group" aria-label={`مقطع صوتي: ${clip.title}`}>
      <audio
        ref={el}
        src={clip.src}
        preload="none"
        onPlay={() => { setPlaying(true); audio.duck(true) }}
        onPause={() => { setPlaying(false); audio.duck(false) }}
        onEnded={() => { setPlaying(false); setT(0); audio.duck(false) }}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDur(e.currentTarget.duration)}
        onError={() => setErr(true)}
      />
      <button className="btn btn--gold clip__btn" onClick={toggle} aria-pressed={playing} aria-label={playing ? `إيقاف ${clip.title}` : `استمع: ${clip.title}`}>
        <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">{playing ? <path d="M8 5v14M16 5v14" /> : <path d="M8 5l11 7-11 7V5Z" />}</svg>
        <span>{playing ? 'إيقاف' : `استمع: ${clip.title}`}</span>
      </button>
      <div className="clip__bar" aria-hidden><i style={{ width: `${Math.min(100, (t / Math.max(dur, 1)) * 100)}%` }} /></div>
      <span className="label num">{fmt(t)} / {fmt(dur)}</span>
      {err && <span className="label" role="alert">تعذّر تشغيل المقطع على هذا الجهاز.</span>}
      <span className="label clip__credit">{clip.credit}</span>
      <SourceLine ids={clip.sourceIds} label="المصدر" />
      <style>{`.clip{display:grid;justify-items:center;gap:var(--s1);text-align:center}.clip__bar{width:min(70vw,22rem);height:3px;background:rgba(216,195,160,.25)}.clip__bar i{display:block;height:100%;background:var(--gold);float:right;transition:width 250ms linear}.clip__credit{max-width:30rem;opacity:.85}`}</style>
    </div>
  )
}
