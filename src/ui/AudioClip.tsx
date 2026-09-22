import { useEffect, useState } from 'react'
import type { AudioClipData } from '../content/audio'
import { SourceLine } from './parts'
import { toIndic } from '../content/quran'
import { clipPlayer } from '../audio/clip'

const fmt = (t: number) => `${toIndic(Math.floor(t / 60))}:${toIndic(String(Math.floor(t % 60)).padStart(2, '0'))}`

/** يعرض حالة مقطع «وطني أنا» المشغَّل تلقائيًا من البوابة (audio/clip.ts) ويتيح إيقافه/استئنافه. */
export function AudioClip({ clip }: { clip: AudioClipData }) {
  const [playing, setPlaying] = useState(clipPlayer.playing)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(clip.seconds)
  const [err, setErr] = useState(false)

  useEffect(() => {
    const el = clipPlayer.element
    const onTime = () => setT(el.currentTime)
    const onMeta = () => Number.isFinite(el.duration) && setDur(el.duration)
    const onErr = () => setErr(true)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('error', onErr)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onPause)
    setPlaying(!el.paused)
    setT(el.currentTime)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('error', onErr)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onPause)
    }
  }, [])

  return (
    <div className="clip" role="group" aria-label={`مقطع صوتي: ${clip.title}`}>
      <button className="btn btn--gold clip__btn" onClick={() => clipPlayer.toggle()} aria-pressed={playing} aria-label={playing ? `إيقاف ${clip.title}` : `استمع: ${clip.title}`}>
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
