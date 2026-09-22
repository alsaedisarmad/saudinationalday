import { useEffect, useRef, useState } from 'react'
import { mapGeometry } from '../content/regions'
import { identity } from '../content/values'
import { credits } from '../content/credits'
import { toIndic } from '../content/quran'
import { useStore } from '../session/store'
import { useDiscovery, litSet } from '../exhibition/discovery'

/**
 * بطاقة المستكشف: لقطة «قماش» الزائر — نقاط الضوء على هيئة المملكة، المضيئة منها بقدر ما اكتشف.
 * تُرسم على Canvas ثم تُحمَّل صورةً (على الأجهزة الشخصية). لا بيانات شخصية سوى كلمته إن كتبها بنفسه.
 */
const W = 1080
const H = 1350

async function draw(c: HTMLCanvasElement, o: { dots: number; halls: number; stamps: number; stampsTotal: number; count: number; total: number; word: string }) {
  try {
    await Promise.all([document.fonts.load('700 80px Amiri'), document.fonts.load('500 30px "IBM Plex Sans Arabic"')])
  } catch { /* نكمل بالخط الاحتياطي */ }
  const g = c.getContext('2d')!
  c.width = W
  c.height = H
  g.direction = 'rtl'
  const bg = g.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#050908')
  bg.addColorStop(0.55, '#0B1210')
  bg.addColorStop(1, '#16241d')
  g.fillStyle = bg
  g.fillRect(0, 0, W, H)
  // وهج خلف الخريطة
  const glow = g.createRadialGradient(W / 2, 640, 20, W / 2, 640, 520)
  glow.addColorStop(0, 'rgba(231,176,74,.16)')
  glow.addColorStop(1, 'rgba(231,176,74,0)')
  g.fillStyle = glow
  g.fillRect(0, 0, W, H)
  // إطار مزدوج + مثلثات نجدية علوية
  g.strokeStyle = 'rgba(201,164,92,.8)'
  g.lineWidth = 3
  g.strokeRect(44, 44, W - 88, H - 88)
  g.strokeStyle = 'rgba(201,164,92,.3)'
  g.lineWidth = 1.5
  g.strokeRect(62, 62, W - 124, H - 124)
  g.fillStyle = 'rgba(201,164,92,.85)'
  for (let x = 90; x < W - 90; x += 36) {
    g.beginPath()
    g.moveTo(x, 104)
    g.lineTo(x + 18, 80)
    g.lineTo(x + 36, 104)
    g.closePath()
    g.fill()
  }
  g.textAlign = 'center'
  g.fillStyle = '#D8C3A0'
  g.font = '500 30px "IBM Plex Sans Arabic", sans-serif'
  g.fillText(`${identity.attribution.split(' — ')[0]} · ${identity.dateLabel}`, W / 2, 168)
  g.fillStyle = '#F5F0E6'
  g.font = '700 104px Amiri, serif'
  g.fillText('بطاقة المستكشف', W / 2, 290)
  g.fillStyle = 'rgba(201,164,92,.9)'
  g.fillRect(W / 2 - 110, 318, 220, 2)

  // الخريطة من نقاط الضوء
  const [, , vw, vh] = mapGeometry.viewBox
  const S = 0.9
  const ox = (W - vw * S) / 2
  const oy = 380
  const pts = mapGeometry.points96
  const lit = litSet(o.dots)
  pts.forEach(([x, y], i) => {
    const on = lit.has(i)
    const px = ox + x * S
    const py = oy + y * S
    if (on) {
      const r = g.createRadialGradient(px, py, 0, px, py, 26)
      r.addColorStop(0, 'rgba(255,213,138,.95)')
      r.addColorStop(0.35, 'rgba(231,176,74,.5)')
      r.addColorStop(1, 'rgba(231,176,74,0)')
      g.fillStyle = r
      g.beginPath()
      g.arc(px, py, 26, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = '#FFE2A6'
      g.beginPath()
      g.arc(px, py, 6.5, 0, Math.PI * 2)
      g.fill()
    } else {
      g.fillStyle = 'rgba(216,195,160,.32)'
      g.beginPath()
      g.arc(px, py, 4, 0, Math.PI * 2)
      g.fill()
    }
  })

  // الأرقام
  const y0 = oy + vh * S + 60
  g.fillStyle = '#F5F0E6'
  g.font = '700 64px Amiri, serif'
  g.fillText(`أضأتُ ${toIndic(o.dots)} نقطة على خريطة المملكة`, W / 2, y0)
  g.fillStyle = '#D8C3A0'
  g.font = '500 34px "IBM Plex Sans Arabic", sans-serif'
  const line2 = `اكتشفتُ ${toIndic(o.count)} من ${toIndic(o.total)} · زرتُ ${toIndic(o.halls)} قاعة · الأختام ${toIndic(o.stamps)}/${toIndic(o.stampsTotal)}`
  g.fillText(line2, W / 2, y0 + 62)
  if (o.word.trim()) {
    g.fillStyle = '#FFE2A6'
    g.font = '700 54px Amiri, serif'
    g.fillText(`«${o.word.trim().slice(0, 40)}»`, W / 2, y0 + 150)
  }
  g.fillStyle = 'rgba(201,164,92,.95)'
  g.font = '700 70px Amiri, serif'
  g.fillText(`«${identity.slogan}»`, W / 2, H - 170)
  g.fillStyle = '#A79F91'
  g.font = '500 27px "IBM Plex Sans Arabic", sans-serif'
  g.fillText(`${identity.title} · ${credits.school}`, W / 2, H - 112)
}

export function ExplorerCard({ stamps, stampsTotal }: { stamps: number; stampsTotal: number }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const d = useDiscovery()
  const halls = useStore((s) => s.visitedHalls.length)
  const word = useStore((s) => s.word)
  const mode = useStore((s) => s.mode)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (cv.current) void draw(cv.current, { dots: d.dots, halls, stamps, stampsTotal, count: d.count, total: d.total, word })
  }, [d.dots, d.count, d.total, halls, stamps, stampsTotal, word])

  const save = async () => {
    const c = cv.current
    if (!c) return
    setBusy(true)
    try {
      const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/png'))
      if (!blob) return
      const file = new File([blob], 'بطاقة-المستكشف.png', { type: 'image/png' })
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
      if (nav.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'بطاقة المستكشف' }); return } catch { /* ألغى المستخدم أو غير مدعوم: نحمّل */ }
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'بطاقة-المستكشف.png'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } finally {
      setBusy(false)
    }
  }

  return (
    <figure className="xc">
      <canvas ref={cv} className="xc__cv" role="img" aria-label={`بطاقة المستكشف: أضأتَ ${d.dots} نقطة على خريطة المملكة، وزرت ${halls} قاعة`} />
      {mode === 'smartboard' ? (
        <figcaption className="label xc__hint">صوِّر البطاقة بهاتفك لتحتفظ بها</figcaption>
      ) : (
        <button className="btn btn--gold" onClick={save} disabled={busy}>احفظ بطاقتك</button>
      )}
      <style>{`.xc{margin:0;display:grid;justify-items:center;gap:var(--s3)}.xc__cv{width:min(100%,calc(62vh * 0.8));height:auto;aspect-ratio:1080/1350;box-shadow:0 20px 80px rgba(0,0,0,.6);border:1px solid var(--line)}.xc__hint{opacity:.85}`}</style>
    </figure>
  )
}
