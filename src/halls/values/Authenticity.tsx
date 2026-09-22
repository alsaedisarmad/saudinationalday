import { useRef, useState } from 'react'
import { useEngine, makeNoise, rng, clamp, lerp, easeInOut, glow, hex, mkCanvas, speckle, TAU, type Engine, type Env } from './kit'
import { toIndic } from '../../content/quran'
import type { SceneProps } from './types'

/**
 * الأصالة — نول سدو: المس خيوط السدى فيعبر المكّوك وينسج صفًّا من نقش هندسي مستوحى من السدو (أربع درجات لونية فقط).
 * السدو يظهر بكثافة هنا فقط (SAUDI_VISUAL_LANGUAGE §3). النقش رسم المعرض وليس نقلًا لنمط بعينه.
 */
const C = 15
const K = 0, RD = 1, WH = 2, GD = 3
const COL = ['#1b1210', '#a5301f', '#e8dcbc', '#c9a45c']
const dashes = () => Array.from({ length: C }, (_, x) => (x % 2 ? K : WH))
const solid = (c: number) => Array.from({ length: C }, () => c)
const chev = (k: number) => Array.from({ length: C }, (_, x) => ((Math.abs(x - 7) + k) % 4 < 2 ? WH : RD))
const diam = (j: number) => Array.from({ length: C }, (_, x) => {
  const cx = [2, 7, 12][Math.floor(x / 5)]
  const d = Math.abs(x - cx) + Math.abs(j - 2)
  return d === 0 ? GD : d === 1 ? WH : d === 2 ? RD : d === 3 ? K : (x + j) % 2 ? RD : K
})
/** الصف 0 هو الأسفل (يُنسج أولًا) */
export const CHART: number[][] = [solid(RD), dashes(), chev(0), chev(1), dashes(), diam(0), diam(1), diam(2), diam(3), diam(4), dashes(), chev(1), chev(0), dashes(), solid(RD)]
const R = CHART.length

class LoomEngine implements Engine {
  W = 0; H = 0; s = 1
  bg = mkCanvas(1, 1); cloth = mkCanvas(1, 1)
  x0 = 0; cw = 0; ch = 0; innerW = 0; yTop = 0; yBase = 0; bt = 0; cx = 0; bottom = 0; hh = 0; yc = 0
  rows = 0
  cursor = 7
  amp = new Array(C).fill(0); ph = new Array(C).fill(0).map((_, i) => i * 1.7)
  weave: { row: number; q: number; dir: 1 | -1; pick: number } | null = null
  pending = 0
  sweep = -1
  finished = false
  motes: { x: number; y: number; v: number; a: number }[] = []
  nz = makeNoise(31)

  constructor(private env: Env) {
    if (env.done) { this.rows = R; this.finished = true }
    const r = rng(3)
    this.motes = Array.from({ length: 34 }, () => ({ x: r(), y: r(), v: 0.004 + r() * 0.01, a: 0.2 + r() * 0.5 }))
  }

  private reserve() {
    return { smartboard: 350, tablet: 290, desktop: 250, mobile: 262 }[this.env.mode]
  }

  resize(w: number, h: number, s: number) {
    this.W = w; this.H = h; this.s = s
    const portrait = w < h
    const top = portrait ? h * 0.4 : h * 0.16
    this.bottom = h - this.reserve()
    this.cx = portrait ? w / 2 : w * 0.36
    this.innerW = portrait ? w * 0.74 : Math.min(w * 0.4, (this.bottom - top) * 0.92)
    this.cw = this.innerW / C
    this.bt = Math.max(14, this.cw * 0.5)
    this.yTop = top
    this.yBase = this.bottom - this.bt
    this.ch = Math.min(this.cw * (portrait ? 0.62 : 0.66), ((this.yBase - top - this.bt) * 0.86) / (R + 2.2))
    this.hh = this.ch * 2.2
    this.yc = this.yBase - this.hh
    this.x0 = this.cx - this.innerW / 2
    this.buildBg()
    this.buildCloth()
  }

  /** يرسم صفًّا واحدًا من الأصواف (خلايا ملوّنة بملمس خيط) */
  private paintRow(g: CanvasRenderingContext2D, j: number, x: number, y: number, cw: number, ch: number, from = 0, to = C) {
    const r = rng(j * 131 + 7)
    for (let i = from; i < to; i++) {
      const c = CHART[j][i]
      g.fillStyle = COL[c]
      g.fillRect(x + i * cw, y, cw + 0.6, ch + 0.6)
      // ألياف
      for (let k = 0; k < 3; k++) {
        g.fillStyle = r() < 0.5 ? 'rgba(255,240,210,.08)' : 'rgba(0,0,0,.14)'
        g.fillRect(x + i * cw + r() * cw * 0.7, y + r() * ch * 0.8, cw * (0.2 + r() * 0.3), Math.max(1, ch * 0.09))
      }
      // خيط السدى بين الخلايا
      g.fillStyle = 'rgba(0,0,0,.24)'
      g.fillRect(x + i * cw, y, Math.max(1, cw * 0.05), ch)
    }
    g.fillStyle = 'rgba(255,255,255,.12)'
    g.fillRect(x + from * cw, y, (to - from) * cw, 1)
    g.fillStyle = 'rgba(0,0,0,.4)'
    g.fillRect(x + from * cw, y + ch - 1, (to - from) * cw, 1.4)
  }

  private buildCloth() {
    const { innerW, ch, cw, s } = this
    const { c, g } = mkCanvas(innerW * s, R * ch * s)
    g.scale(s, s)
    for (let j = 0; j < this.rows; j++) this.paintRow(g, j, 0, (R - 1 - j) * ch, cw, ch)
    this.cloth = { c, g }
  }

  private buildBg() {
    const { W, H, s } = this
    const { c, g } = mkCanvas(W * s, H * s)
    g.scale(s, s)
    // داخل بيت الشعر: عتمة دافئة
    const gr = g.createLinearGradient(0, 0, 0, H)
    gr.addColorStop(0, '#0c0806'); gr.addColorStop(0.55, '#1a100a'); gr.addColorStop(1, '#0a0605')
    g.fillStyle = gr; g.fillRect(0, 0, W, H)
    // طيّات القماش المعلّق
    const r = rng(12)
    for (let i = 0; i < 16; i++) {
      const x = (i / 15) * W + (r() - 0.5) * W * 0.05
      const fw = W * (0.03 + r() * 0.05)
      const fg = g.createLinearGradient(x - fw, 0, x + fw, 0)
      fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(0.5, `rgba(96,62,36,${0.08 + r() * 0.1})`); fg.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = fg
      g.fillRect(x - fw, 0, fw * 2, this.bottom + this.bt)
    }
    // شعاع نهار من فتحة في الأعلى
    g.globalCompositeOperation = 'lighter'
    const beam = g.createLinearGradient(W * 0.05, 0, W * 0.5, H * 0.8)
    beam.addColorStop(0, 'rgba(255,196,110,.28)'); beam.addColorStop(1, 'rgba(255,170,90,0)')
    g.fillStyle = beam
    g.beginPath(); g.moveTo(W * 0.02, 0); g.lineTo(W * 0.22, 0); g.lineTo(W * 0.72, H * 0.86); g.lineTo(W * 0.3, H * 0.86); g.closePath(); g.fill()
    glow(g, this.cx, this.yc - this.ch * 6, this.innerW * 1.15, hex('#ff9f50'), 0.2)
    g.globalCompositeOperation = 'source-over'
    // أرض: بساط سدو خافت
    const gy = this.bottom + this.bt * 0.4
    const cell = Math.max(8, this.cw * 0.42)
    g.save()
    g.beginPath(); g.rect(0, gy, W, H - gy); g.clip()
    g.globalAlpha = 0.66
    const rugRows = [4, 5, 6, 7, 8, 9, 10]
    rugRows.forEach((rw, k) => {
      for (let x = 0; x < W; x += C * cell) this.paintRow(g, rw, x, gy + this.bt * 0.3 + k * cell, cell, cell)
    })
    g.globalAlpha = 1
    const shade = g.createLinearGradient(0, gy, 0, H)
    shade.addColorStop(0, 'rgba(8,5,4,.55)'); shade.addColorStop(0.5, 'rgba(6,4,3,.82)'); shade.addColorStop(1, 'rgba(4,3,2,.95)')
    g.fillStyle = shade; g.fillRect(0, gy, W, H - gy)
    g.restore()
    // إطار النول: عمودان وعارضتان
    const wood = (x: number, y: number, w: number, h: number, vertical: boolean) => {
      const wg = vertical ? g.createLinearGradient(x, 0, x + w, 0) : g.createLinearGradient(0, y, 0, y + h)
      wg.addColorStop(0, '#5a3a20'); wg.addColorStop(0.35, '#7d5430'); wg.addColorStop(0.7, '#3d2614'); wg.addColorStop(1, '#22150b')
      g.fillStyle = wg; g.fillRect(x, y, w, h)
      const rr = rng(Math.round(x + y))
      g.strokeStyle = 'rgba(20,10,4,.35)'; g.lineWidth = 1
      for (let i = 0; i < 14; i++) {
        g.beginPath()
        if (vertical) { const px = x + rr() * w; g.moveTo(px, y); g.lineTo(px + (rr() - 0.5) * 4, y + h) } else { const py = y + rr() * h; g.moveTo(x, py); g.lineTo(x + w, py + (rr() - 0.5) * 3) }
        g.stroke()
      }
      g.fillStyle = 'rgba(255,220,160,.12)'
      if (vertical) g.fillRect(x, y, 1.5, h); else g.fillRect(x, y, w, 1.5)
    }
    const pw = this.bt * 0.95
    wood(this.x0 - pw - this.cw * 0.2, this.yTop - this.bt * 0.5, pw, this.bottom - this.yTop + this.bt * 1.2, true)
    wood(this.x0 + this.innerW + this.cw * 0.2, this.yTop - this.bt * 0.5, pw, this.bottom - this.yTop + this.bt * 1.2, true)
    wood(this.x0 - this.cw * 0.45, this.yTop, this.innerW + this.cw * 0.9, this.bt, false)
    wood(this.x0 - this.cw * 0.45, this.yBase, this.innerW + this.cw * 0.9, this.bt, false)
    // شريط بداية النسيج (صوف طبيعي) فوق العارضة السفلى
    const hg = g.createLinearGradient(0, this.yc, 0, this.yBase)
    hg.addColorStop(0, '#b9a47c'); hg.addColorStop(1, '#7d6a48')
    g.fillStyle = hg; g.fillRect(this.x0, this.yc, this.innerW, this.hh)
    for (let i = 0; i < C; i++) { g.fillStyle = i % 2 ? 'rgba(255,240,200,.14)' : 'rgba(58,38,18,.22)'; g.fillRect(this.x0 + i * this.cw, this.yc, this.cw * 0.6, this.hh) }
    g.fillStyle = 'rgba(58,38,18,.18)'
    for (let y = this.yc + this.ch * 0.3; y < this.yBase; y += this.ch * 0.3) g.fillRect(this.x0, y, this.innerW, 1)
    g.fillStyle = 'rgba(255,240,200,.3)'; g.fillRect(this.x0, this.yc, this.innerW, 1.5)
    // أوتاد نحاسية صغيرة
    g.fillStyle = '#b48a3f'
    for (const [px, py] of [[this.x0 - this.cw * 0.2, this.yTop + this.bt / 2], [this.x0 + this.innerW + this.cw * 0.2, this.yTop + this.bt / 2], [this.x0 - this.cw * 0.2, this.yBase + this.bt / 2], [this.x0 + this.innerW + this.cw * 0.2, this.yBase + this.bt / 2]]) {
      g.beginPath(); g.arc(px, py, Math.max(2, this.bt * 0.14), 0, TAU); g.fill()
    }
    speckle(g, 0, 0, W, H, 700, 8)
    this.bg = { c, g }
  }

  // ————— تفاعل —————
  private threadAt(x: number) { return clamp(Math.floor((x - this.x0) / this.cw), 0, C - 1) }

  tap(x: number, y: number) {
    if (x < this.x0 - this.cw * 1.4 || x > this.x0 + this.innerW + this.cw * 1.4 || y < this.yTop - this.bt || y > this.bottom + this.bt) return
    this.pick(this.threadAt(x))
  }

  /** ينسج الصف التالي؛ الخيط i هو ما لُمس فيرتفع ويهتزّ */
  pick(i: number) {
    this.cursor = i
    this.pluck(i, 1)
    this.env.tick()
    if (this.finished || this.rows >= R) return
    if (this.weave) { this.pending = Math.min(1, this.pending + 1); return }
    this.start(i)
  }
  private pluck(i: number, a: number) {
    for (let k = -3; k <= 3; k++) {
      const n = i + k
      if (n < 0 || n >= C) continue
      this.amp[n] = Math.max(this.amp[n], a * this.cw * 0.55 * Math.pow(0.55, Math.abs(k)))
    }
  }
  private start(i: number) {
    if (this.env.reduced) { this.rows++; this.afterRow(); return }
    this.weave = { row: this.rows, q: 0, dir: this.rows % 2 ? -1 : 1, pick: i }
  }
  private afterRow() {
    const j = this.rows - 1
    this.paintRow(this.cloth.g, j, 0, (R - 1 - j) * this.ch, this.cw, this.ch)
    this.env.chime(j % 8, 0.6)
    this.env.progress(this.rows / R)
    this.cursor = (this.rows * 4 + 3) % C
    if (this.rows >= R) {
      this.finished = true
      this.sweep = 0
      this.env.chime(5)
      this.env.complete()
    }
    this.env.invalidate()
  }
  move(d: number) { this.cursor = clamp(this.cursor + d, 0, C - 1); this.env.invalidate() }
  get count() { return this.rows }

  frame(g: CanvasRenderingContext2D, t: number, dt: number) {
    const { W, H, x0, cw, ch, innerW, yTop, bt } = this
    const reduced = this.env.reduced
    g.globalAlpha = 1
    g.globalCompositeOperation = 'source-over'
    g.drawImage(this.bg.c, 0, 0, W, H)

    // تقدّم النسج
    const wv = this.weave
    if (wv && !reduced) {
      wv.q += dt / 0.62
      if (wv.q >= 1) { this.weave = null; this.rows++; this.afterRow(); if (this.pending && !this.finished) { this.pending = 0; this.start(this.cursor) } }
    }
    for (let i = 0; i < C; i++) this.amp[i] *= reduced ? 0 : Math.exp(-dt * 2.4)

    // خيوط السدى فوق القماش (الزوجية قبل عصا الفتحة والفردية بعدها ليتشابك العبور)
    const clothTop = this.yc - this.rows * ch
    const rodY = yTop + bt + (this.yc - R * ch - yTop - bt) * 0.42
    g.lineCap = 'round'
    const drawThread = (i: number) => {
      const x = x0 + (i + 0.5) * cw
      const picked = wv && wv.pick === i
      g.beginPath()
      const segs = 12
      for (let k = 0; k <= segs; k++) {
        const v = k / segs
        const y = lerp(yTop + bt, this.yc, v)
        const dx = this.amp[i] * Math.sin(Math.PI * v) * Math.cos(this.ph[i] + t * 26) + (picked ? -cw * 0.18 * Math.sin(Math.PI * v) : 0)
        if (k === 0) g.moveTo(x + dx, y); else g.lineTo(x + dx, y)
      }
      g.strokeStyle = picked ? 'rgba(255,226,160,.98)' : this.finished ? 'rgba(240,222,176,.92)' : i % 3 === 0 ? 'rgba(206,188,150,.8)' : 'rgba(226,210,172,.8)'
      g.lineWidth = Math.max(1.2, cw * 0.055)
      g.stroke()
    }
    for (let i = 0; i < C; i += 2) drawThread(i)
    const rh = Math.max(4, bt * 0.34)
    const rg = g.createLinearGradient(0, rodY, 0, rodY + rh)
    rg.addColorStop(0, '#8a5c30'); rg.addColorStop(0.5, '#5a3818'); rg.addColorStop(1, '#2a180a')
    g.fillStyle = rg
    g.fillRect(x0 - cw * 0.3, rodY, innerW + cw * 0.6, rh)
    for (let i = 1; i < C; i += 2) drawThread(i)
    g.fillStyle = 'rgba(214,196,158,.75)'
    for (let i = 0; i < C; i++) { g.beginPath(); g.arc(x0 + (i + 0.5) * cw, yTop + bt, Math.max(1.4, cw * 0.06), 0, TAU); g.fill() }

    // القماش
    g.drawImage(this.cloth.c, x0, this.yc - R * ch, innerW, R * ch)
    // الصف الجاري نسجه
    if (wv) {
      const q = easeInOut(clamp(wv.q))
      const y = this.yc - (wv.row + 1) * ch
      const sx = wv.dir === 1 ? x0 + q * innerW : x0 + (1 - q) * innerW
      g.save()
      g.beginPath()
      if (wv.dir === 1) g.rect(x0, y - 2, sx - x0, ch + 4); else g.rect(sx, y - 2, x0 + innerW - sx, ch + 4)
      g.clip()
      this.paintRow(g, wv.row, x0, y, cw, ch)
      g.restore()
      this.shuttle(g, sx, y + ch / 2, wv.dir)
    }

    // مؤشّر الخيط التالي
    if (!this.finished && !wv) {
      const px = x0 + (this.cursor + 0.5) * cw
      const py = clothTop - ch * 0.5
      const p = reduced ? 0.7 : 0.5 + 0.5 * Math.sin(t * 3.2)
      g.globalCompositeOperation = 'lighter'
      glow(g, px, py, cw * (1.6 + 0.5 * p), hex('#ffcf7a'), 0.55)
      g.globalCompositeOperation = 'source-over'
      g.fillStyle = '#ffe2a6'
      g.beginPath(); g.arc(px, py, Math.max(3, cw * 0.11), 0, TAU); g.fill()
      g.strokeStyle = `rgba(255,226,166,${0.5 + 0.3 * p})`
      g.lineWidth = 1.2
      g.beginPath(); g.arc(px, py, Math.max(7, cw * 0.28), 0, TAU); g.stroke()
    }

    // لمعة الاكتمال
    if (this.sweep >= 0) {
      if (!reduced) this.sweep += dt / 1.6
      const q = reduced ? 0.5 : this.sweep
      if (q < 1.2) {
        g.save()
        g.beginPath(); g.rect(x0, this.yc - R * ch, innerW, R * ch); g.clip()
        g.globalCompositeOperation = 'lighter'
        const bx = x0 + (q * 1.3 - 0.15) * innerW
        const sg = g.createLinearGradient(bx - cw * 3, 0, bx + cw * 3, 0)
        sg.addColorStop(0, 'rgba(255,220,150,0)'); sg.addColorStop(0.5, 'rgba(255,220,150,.42)'); sg.addColorStop(1, 'rgba(255,220,150,0)')
        g.fillStyle = sg
        g.fillRect(x0, this.yc - R * ch, innerW, R * ch)
        g.restore()
      }
    }
    if (this.finished) {
      g.globalCompositeOperation = 'lighter'
      glow(g, this.cx, this.yc - (R * ch) / 2, innerW * 0.8, hex('#ffb864'), 0.1 + (reduced ? 0 : 0.03 * Math.sin(t * 1.4)))
      g.globalCompositeOperation = 'source-over'
    }

    // غبار في الشعاع
    if (!reduced) {
      g.globalCompositeOperation = 'lighter'
      for (const m of this.motes) {
        m.y -= m.v * dt * 0.8
        m.x += Math.sin(t * 0.3 + m.y * 9) * 0.0004
        if (m.y < 0) { m.y = 1; m.x = Math.random() }
        const px = (0.05 + m.x * 0.5) * W + m.y * W * 0.1
        const py = m.y * H * 0.85
        g.fillStyle = `rgba(255,214,150,${m.a * 0.5 * Math.sin(m.y * Math.PI)})`
        g.beginPath(); g.arc(px, py, 1.2, 0, TAU); g.fill()
      }
      g.globalCompositeOperation = 'source-over'
    }
    void this.nz
  }

  private shuttle(g: CanvasRenderingContext2D, x: number, y: number, dir: number) {
    const sw = this.cw * 2.3
    const sh = this.cw * 0.36
    g.save()
    g.translate(x, y)
    g.rotate(dir * 0.03)
    g.beginPath()
    g.moveTo(-sw / 2, 0)
    g.quadraticCurveTo(0, -sh, sw / 2, 0)
    g.quadraticCurveTo(0, sh, -sw / 2, 0)
    const wg = g.createLinearGradient(0, -sh, 0, sh)
    wg.addColorStop(0, '#c99a5c'); wg.addColorStop(0.5, '#7a4e26'); wg.addColorStop(1, '#3a220f')
    g.fillStyle = wg
    g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 8; g.shadowOffsetY = 3
    g.fill()
    g.shadowBlur = 0; g.shadowOffsetY = 0
    g.fillStyle = '#d6b06a'
    g.beginPath(); g.arc(-sw / 2 + 2, 0, sh * 0.28, 0, TAU); g.arc(sw / 2 - 2, 0, sh * 0.28, 0, TAU); g.fill()
    g.restore()
  }
}

export default function Authenticity(p: SceneProps) {
  const last = useRef(p.done ? R : 0)
  const [rows, setRows] = useState(p.done ? R : 0)
  const { canvas, api, point } = useEngine((env) => new LoomEngine(env), {
    reduced: p.reduced, mode: p.mode, done: p.done, onComplete: p.onComplete, chime: p.chime, tick: p.tick, pour: p.pour,
    onProgress: (v) => { const n = Math.round(v * R); if (n !== last.current) { last.current = n; setRows(n) } },
  })
  const key = (e: React.KeyboardEvent) => {
    const a = api.current
    if (!a) return
    if (e.key === 'ArrowLeft') { e.preventDefault(); a.move(1) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); a.move(-1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.pick(a.cursor) }
  }
  const fin = rows >= R
  return (
    <>
      <canvas
        ref={canvas}
        className="vsc-canvas vsc-press"
        tabIndex={0}
        role="group"
        aria-roledescription="نول"
        aria-label={`نول سدو: ${toIndic(rows)} من ${toIndic(R)} صفًّا. استعمل الأسهم للتنقل بين الخيوط وEnter للنسج`}
        onPointerDown={(e) => { const q = point(e); api.current?.tap(q.x, q.y) }}
        onKeyDown={key}
      />
      <div className="vc">
        <p className="vc__hint" aria-live="polite">{p.done || fin ? '' : rows === 0 ? p.data.action : `الصف ${toIndic(rows)} من ${toIndic(R)} — تابع اللمس`}</p>
        <button className="btn btn--gold vbtn" disabled={fin} onClick={() => api.current?.pick(api.current.cursor)}>
          {p.data.altLabel}
        </button>
      </div>
    </>
  )
}
