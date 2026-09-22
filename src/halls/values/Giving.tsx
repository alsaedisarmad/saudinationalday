import { useRef, useState } from 'react'
import { useEngine, makeNoise, rng, clamp, lerp, smooth, easeInOut, hex, mix, glow, mkCanvas, speckle, TAU, type Engine, type Env } from './kit'
import { toIndic } from '../../content/quran'
import type { SceneProps } from './types'

/**
 * الجود — نخلة عند الغروب: المس النخلة أو اهزّها فيسقط الرطب في السلّة، ثم «شارِك»:
 * يطير الرطب إلى بيوت بعيدة فتُضاء نوافذها، والسلّة تفرغ بلا عودة (عطاء بلا مقابل).
 */
const NEED = 10
interface Frond { A: Path2D; B: Path2D; Rr: Path2D; ph: number; th: number }
interface Att { ax: number; ay: number; ph: number; on: boolean; grow: number; rot: number }
interface Fall { x: number; y: number; vx: number; vy: number; rot: number; vr: number; st: 'fall' | 'slot' | 'ground'; slot: number; bounces: number }
interface Fly { x0: number; y0: number; x1: number; y1: number; t: number; dur: number; house: number; rot: number; trail: [number, number][] }
interface House { x: number; y: number; w: number; lit: number }
interface Spark { x: number; y: number; life: number; vx: number; vy: number }

class GivingEngine implements Engine {
  W = 0; H = 0; s = 1
  bg = mkCanvas(1, 1); trunk = mkCanvas(1, 1); bkBack = mkCanvas(1, 1); bkFront = mkCanvas(1, 1); sprite = mkCanvas(1, 1)
  u = 100; cx = 0; cy = 0; bx = 0; by = 0; gy = 0; hy = 0
  bk = { x: 0, y: 0, w: 0, h: 0, ry: 0 }
  dw = 0; dh = 0
  fronds: Frond[] = []
  att: Att[] = []
  falls: Fall[] = []
  flies: Fly[] = []
  houses: House[] = []
  sparks: Spark[] = []
  sh = 0
  inBasket = 0
  stage = 0
  finished = false
  lastShake = 0
  regrow = 0
  nz = makeNoise(60)
  motes: { x: number; y: number; v: number }[] = []
  private time = 0

  constructor(private env: Env) {
    if (env.done) { this.finished = true; this.stage = 3 }
    const r = rng(2)
    this.motes = Array.from({ length: 28 }, () => ({ x: r(), y: r(), v: 0.006 + r() * 0.01 }))
  }

  resize(w: number, h: number, s: number) {
    this.W = w; this.H = h; this.s = s
    const portrait = w < h
    this.u = portrait ? Math.min(h * 0.16, w * 0.3) : h * 0.185
    const u = this.u
    this.gy = portrait ? h * 0.66 : h * 0.66
    this.hy = portrait ? h * 0.52 : h * 0.555
    this.cx = portrait ? w * 0.42 : w * 0.34
    this.cy = this.gy - u * 2.05
    this.bx = this.cx + u * 0.5
    this.by = this.gy
    this.bk = { x: this.cx - u * 0.18, y: this.gy - u * 0.5, w: u * 0.86, h: u * 0.5, ry: u * 0.11 }
    this.dw = u * 0.085; this.dh = this.dw * 1.6
    this.buildBg(); this.buildTrunk(); this.buildFronds(); this.buildBasket(); this.buildSprite()
    if (!this.att.length) this.buildDates()
    if (this.env.done && !this.falls.length) this.env.progress(2)
  }

  private buildDates() {
    const r = rng(15)
    const u = this.u
    const anchors = [-0.42, -0.14, 0.12]
    anchors.forEach((a) => {
      for (let i = 0; i < 14; i++) {
        const t = r()
        this.att.push({ ax: a * u + (r() - 0.5) * 0.3 * u * (0.5 + t), ay: 0.2 * u + t * 0.42 * u, ph: r() * TAU, on: true, grow: 1, rot: (r() - 0.5) * 0.7 })
      }
    })
    if (this.env.done) this.att.forEach((d) => { d.grow = 1 })
  }

  private buildSprite() {
    const { c, g } = mkCanvas(this.dw * 3 * this.s, this.dh * 3 * this.s)
    g.scale(this.s, this.s)
    const w = this.dw * 3, h = this.dh * 3
    const cx = w / 2, cy = h / 2
    g.translate(cx, cy)
    const gr = g.createRadialGradient(-this.dw * 0.18, -this.dh * 0.18, this.dw * 0.05, 0, 0, this.dh * 0.6)
    gr.addColorStop(0, '#f0a24c'); gr.addColorStop(0.35, '#c4681e'); gr.addColorStop(0.8, '#7a3210'); gr.addColorStop(1, '#3d1806')
    g.fillStyle = gr
    g.beginPath(); g.ellipse(0, 0, this.dw / 2, this.dh / 2, 0, 0, TAU); g.fill()
    g.fillStyle = 'rgba(255,236,190,.55)'
    g.beginPath(); g.ellipse(-this.dw * 0.16, -this.dh * 0.16, this.dw * 0.09, this.dh * 0.17, 0.25, 0, TAU); g.fill()
    g.fillStyle = '#3a1c0a'
    g.beginPath(); g.ellipse(0, -this.dh * 0.47, this.dw * 0.16, this.dh * 0.06, 0, 0, TAU); g.fill()
    this.sprite = { c, g }
  }

  private buildBg() {
    const { W, H, s, hy } = this
    const { c, g } = mkCanvas(W * s, H * s)
    g.scale(s, s)
    const sky = g.createLinearGradient(0, 0, 0, hy)
    sky.addColorStop(0, '#26365c'); sky.addColorStop(0.38, '#6d6a8c'); sky.addColorStop(0.68, '#dc9862'); sky.addColorStop(0.9, '#f5c98c'); sky.addColorStop(1, '#fbdfae')
    g.fillStyle = sky; g.fillRect(0, 0, W, hy + 2)
    // شمس منخفضة
    const sx = W * (W < H ? 0.78 : 0.14), sy = hy - H * 0.03
    g.globalCompositeOperation = 'lighter'
    glow(g, sx, sy, H * 0.7, hex('#ffb060'), 0.5)
    glow(g, sx, sy, H * 0.16, hex('#fff2d0'), 0.9)
    g.globalCompositeOperation = 'source-over'
    g.fillStyle = '#fff6dc'
    g.beginPath(); g.arc(sx, sy, H * 0.03, 0, TAU); g.fill()
    // بستان بعيد: صفّان من النخيل بضباب
    const r = rng(6)
    for (let layer = 0; layer < 2; layer++) {
      const n = 30
      const col = layer === 0 ? '#a68272' : '#5f4a48'
      g.strokeStyle = col; g.fillStyle = col
      for (let i = 0; i < n; i++) {
        const x = (i + r() * 0.8) / n * W * 1.02
        const hh = H * (0.05 + r() * 0.05) * (layer ? 1.35 : 1)
        const y = hy + (layer ? 5 : 0)
        g.lineWidth = layer ? 2 : 1.4
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - hh); g.stroke()
        g.lineWidth = 1
        const tx = x, ty = y - hh
        for (let k = 0; k < 7; k++) {
          const a = -Math.PI * 0.9 + (k / 6) * Math.PI * 0.8
          const L = hh * 0.55
          g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * L * 0.6, ty + Math.sin(a) * L * 0.6 - L * 0.1, tx + Math.cos(a) * L, ty + Math.sin(a) * L + L * 0.3); g.stroke()
        }
      }
      if (!layer) { const hz = g.createLinearGradient(0, hy - H * 0.1, 0, hy + 4); hz.addColorStop(0, 'rgba(250,210,160,0)'); hz.addColorStop(1, 'rgba(250,210,160,.5)'); g.fillStyle = hz; g.fillRect(0, hy - H * 0.1, W, H * 0.1 + 4) }
    }
    // بيوت بعيدة (طين) — وجهات العطاء
    const hp: [number, number][] = W < H ? [[0.1, 0], [0.24, 0.012], [0.86, 0], [0.7, 0.012], [0.53, 0.006]] : [[0.05, 0], [0.13, 0.012], [0.57, 0.004], [0.66, 0.014], [0.78, 0.004]]
    this.houses = hp.map(([fx, dy]) => ({ x: fx * W, y: hy + dy * H + 4, w: Math.max(26, this.u * 0.26), lit: this.env.done ? 1 : 0 }))
    for (const hs of this.houses) {
      const hh = hs.w * 0.62
      g.fillStyle = '#3c2a28'
      g.fillRect(hs.x - hs.w / 2, hs.y - hh, hs.w, hh)
      g.beginPath()
      const tw = hs.w / 6
      for (let i = 0; i < 6; i++) { g.moveTo(hs.x - hs.w / 2 + i * tw, hs.y - hh); g.lineTo(hs.x - hs.w / 2 + i * tw + tw / 2, hs.y - hh - tw * 0.6); g.lineTo(hs.x - hs.w / 2 + (i + 1) * tw, hs.y - hh) }
      g.fill()
      g.fillStyle = '#1a100d'
      g.fillRect(hs.x - hs.w * 0.12, hs.y - hh * 0.62, hs.w * 0.24, hh * 0.62)
    }
    // الأرض: رمل دافئ يعتم نحو الأسفل
    g.fillStyle = '#c9935a'; g.fillRect(0, hy, W, H - hy)
    const gd = g.createLinearGradient(0, hy, 0, H)
    gd.addColorStop(0, '#c9935a'); gd.addColorStop(0.3, '#8a5b34'); gd.addColorStop(0.7, '#3d2614'); gd.addColorStop(1, '#170d07')
    g.fillStyle = gd
    g.beginPath(); g.moveTo(0, H)
    for (let x = 0; x <= W + 4; x += 4) g.lineTo(x, hy + 2 + (this.nz.fbm(x * 0.004 + 3, 3) - 0.4) * H * 0.03)
    g.lineTo(W, H); g.closePath(); g.fill()
    speckle(g, 0, hy, W, H - hy, 1400, 17, 'rgba(255,220,170,', 'rgba(20,8,2,')
    // ظلّ طويل للنخلة نحو اليمين
    g.save()
    g.globalAlpha = 0.16
    g.fillStyle = '#1a0d05'
    g.beginPath(); g.moveTo(this.bx - this.u * 0.1, this.gy + 3); g.lineTo(this.bx + this.u * 0.1, this.gy + 3); g.lineTo(W * 0.98, this.gy + this.u * 0.25); g.lineTo(W * 0.9, this.gy + this.u * 0.1); g.closePath(); g.fill()
    g.restore()
    this.bg = { c, g }
  }

  private buildTrunk() {
    const { W, H, s, u } = this
    const { c, g } = mkCanvas(W * s, H * s)
    g.scale(s, s)
    const N = 30
    const P0 = { x: this.bx, y: this.by + 2 }, P2 = { x: this.cx, y: this.cy }, P1 = { x: this.bx + u * 0.25, y: (this.by + this.cy) / 2 }
    const pts: { x: number; y: number; nx: number; ny: number; w: number }[] = []
    for (let i = 0; i <= N; i++) {
      const t = i / N
      const x = (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x
      const y = (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y
      const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x)
      const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y)
      const l = Math.hypot(dx, dy)
      const w = u * (0.085 - 0.03 * t + (t < 0.06 ? 0.04 * (1 - t / 0.06) : 0) + (t > 0.94 ? 0.02 * ((t - 0.94) / 0.06) : 0))
      pts.push({ x, y, nx: -dy / l, ny: dx / l, w })
    }
    g.beginPath()
    pts.forEach((p, i) => (i ? g.lineTo(p.x - p.nx * p.w, p.y - p.ny * p.w) : g.moveTo(p.x - p.nx * p.w, p.y - p.ny * p.w)))
    for (let i = N; i >= 0; i--) g.lineTo(pts[i].x + pts[i].nx * pts[i].w, pts[i].y + pts[i].ny * pts[i].w)
    g.closePath()
    const tg = g.createLinearGradient(this.cx - u * 0.2, 0, this.bx + u * 0.3, 0)
    tg.addColorStop(0, '#a8763f'); tg.addColorStop(0.35, '#6b4527'); tg.addColorStop(0.75, '#301c10'); tg.addColorStop(1, '#170c06')
    g.fillStyle = tg
    g.fill()
    g.save(); g.clip()
    // جذع بنقش معيّنات (قواعد السعف المقطوع)
    const r = rng(23)
    for (let i = 1; i < N * 2; i++) {
      const t = i / (N * 2)
      const k = Math.min(N - 1, Math.floor(t * N))
      const p = pts[k]
      const off = (i % 2) * 0.5
      const ww = p.w
      g.strokeStyle = 'rgba(18,9,4,.55)'; g.lineWidth = 1.4
      for (let j = -1; j <= 1; j++) {
        const px = p.x + p.nx * ww * (j * 0.66 + off * 0.66)
        const py = p.y + p.ny * ww * (j * 0.66 + off * 0.66)
        g.beginPath(); g.moveTo(px - ww * 0.36, py - u * 0.02); g.lineTo(px, py + u * 0.012); g.lineTo(px + ww * 0.36, py - u * 0.02); g.stroke()
      }
      g.strokeStyle = `rgba(255,214,150,${0.05 + r() * 0.06})`; g.lineWidth = 1
      g.beginPath(); g.moveTo(p.x - p.nx * ww, p.y - p.ny * ww + 1); g.lineTo(p.x + p.nx * ww, p.y + p.ny * ww + 1); g.stroke()
    }
    g.restore()
    // بؤرة ضوء دافئ على الجهة المواجهة للشمس
    g.strokeStyle = 'rgba(255,196,120,.32)'; g.lineWidth = 2
    g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x - p.nx * p.w * 0.9, p.y - p.ny * p.w * 0.9) : g.moveTo(p.x - p.nx * p.w * 0.9, p.y - p.ny * p.w * 0.9))); g.stroke()
    this.trunk = { c, g }
  }

  private buildFronds() {
    const u = this.u
    const mob = this.env.mode === 'mobile'
    const n = mob ? 13 : 16
    const steps = mob ? 15 : 21
    const r = rng(90)
    this.fronds = []
    for (let i = 0; i < n; i++) {
      const th = (i / (n - 1) - 0.5) * 5.1
      const L = u * (0.95 + r() * 0.2) * (1 - 0.22 * Math.abs(th) / 2.55)
      const dx = Math.sin(th), dy = -Math.cos(th)
      const droop = L * (0.15 + 0.7 * Math.abs(Math.sin(th) * 0.9) + (Math.abs(th) > 1.9 ? 0.35 : 0))
      const pt = (t: number): [number, number] => [dx * L * t, dy * L * t + droop * t * t]
      const A = new Path2D(), B = new Path2D(), Rr = new Path2D()
      Rr.moveTo(0, 0)
      for (let k = 1; k <= 12; k++) { const [x, y] = pt(k / 12); Rr.lineTo(x, y) }
      for (let k = 0; k < steps; k++) {
        const t = 0.1 + 0.88 * k / (steps - 1)
        const [x, y] = pt(t)
        const [x2, y2] = pt(t + 0.01)
        let tx = x2 - x, ty = y2 - y
        const tl = Math.hypot(tx, ty) || 1
        tx /= tl; ty /= tl
        const nx = -ty, ny = tx
        const ll = u * 0.31 * Math.pow(Math.sin(Math.PI * (0.12 + 0.88 * t)), 0.7) * (1 - 0.4 * t)
        for (const side of [1, -1] as const) {
          const a = 0.95
          const ex = x + (tx * Math.cos(a) + nx * side * Math.sin(a)) * ll
          const ey = y + (ty * Math.cos(a) + ny * side * Math.sin(a)) * ll + ll * 0.35
          const P = side === 1 ? A : B
          P.moveTo(x, y); P.lineTo(ex, ey)
        }
      }
      this.fronds.push({ A, B, Rr, ph: r() * TAU, th })
    }
  }

  private buildBasket() {
    const { bk } = this
    const mk = () => mkCanvas(bk.w * 1.4 * this.s, (bk.h + bk.ry * 4) * this.s)
    const ox = bk.w * 0.2
    const oy = bk.ry * 2
    // الخلف: باطن مظلم
    const back = mk()
    back.g.scale(this.s, this.s)
    back.g.translate(ox, oy)
    back.g.fillStyle = '#1a0d06'
    back.g.beginPath(); back.g.ellipse(bk.w / 2, 0, bk.w / 2, bk.ry, 0, 0, TAU); back.g.fill()
    this.bkBack = back
    // الأمام: جدار مضفور
    const fr = mk()
    const g = fr.g
    g.scale(this.s, this.s)
    g.translate(ox, oy)
    const bottomW = bk.w * 0.74
    g.beginPath()
    g.moveTo(0, 0)
    g.ellipse(bk.w / 2, 0, bk.w / 2, bk.ry, 0, Math.PI, 0, true)
    g.lineTo(bk.w / 2 + bottomW / 2, bk.h)
    g.quadraticCurveTo(bk.w / 2, bk.h + bk.ry * 1.6, bk.w / 2 - bottomW / 2, bk.h)
    g.closePath()
    const wg = g.createLinearGradient(0, 0, bk.w, 0)
    wg.addColorStop(0, '#c99a58'); wg.addColorStop(0.5, '#96683a'); wg.addColorStop(1, '#4b2c15')
    g.fillStyle = wg; g.fill()
    g.save(); g.clip()
    const rows = 12
    for (let j = 0; j < rows; j++) {
      const y0 = (j / rows) * (bk.h + bk.ry)
      const y1 = ((j + 1) / rows) * (bk.h + bk.ry)
      const step = bk.w / 11
      for (let i = -1; i < 13; i++) {
        const x = i * step + (j % 2) * step * 0.5
        g.fillStyle = (i + j) % 2 ? 'rgba(60,32,14,.32)' : 'rgba(255,220,160,.16)'
        g.beginPath(); g.moveTo(x, y0); g.lineTo(x + step * 0.5, y0 + (y1 - y0) * 0.5); g.lineTo(x, y1); g.lineTo(x - step * 0.5, y0 + (y1 - y0) * 0.5); g.closePath(); g.fill()
      }
      g.strokeStyle = 'rgba(30,14,5,.5)'; g.lineWidth = 1
      g.beginPath(); g.moveTo(0, y1); g.lineTo(bk.w, y1); g.stroke()
    }
    g.restore()
    // حافة
    g.strokeStyle = '#e0b878'; g.lineWidth = Math.max(2, bk.w * 0.02)
    g.beginPath(); g.ellipse(bk.w / 2, 0, bk.w / 2, bk.ry, 0, 0, TAU); g.stroke()
    g.strokeStyle = 'rgba(40,20,8,.6)'; g.lineWidth = 1
    g.beginPath(); g.ellipse(bk.w / 2, 0, bk.w / 2 - 3, bk.ry - 2, 0, 0, Math.PI); g.stroke()
    this.bkFront = fr
  }

  // ————— تفاعل —————
  private dateWorld(a: Att, t: number): [number, number] {
    const sw = Math.sin(t * 1.1 + a.ph) * 2 * (0.4 + a.ay / this.u) + Math.sin(t * 13 + a.ph) * this.sh * 3
    return [this.cx + a.ax + sw, this.cy + a.ay + Math.abs(this.sh) * 2]
  }

  shake(n = 4) {
    const now = performance.now()
    if (now - this.lastShake < 180) return
    this.lastShake = now
    this.sh = 1
    this.env.tick()
    if (this.stage >= 2) return
    const pool = this.att.map((d, i) => ({ d, i })).filter((o) => o.d.on && o.d.grow > 0.9)
    for (let k = 0; k < n && pool.length; k++) {
      const j = Math.floor(Math.random() * pool.length)
      const { d } = pool.splice(j, 1)[0]
      d.on = false
      const [x, y] = this.dateWorld(d, this.time)
      const f: Fall = { x, y, vx: (Math.random() - 0.5) * 30, vy: 0, rot: d.rot, vr: (Math.random() - 0.5) * 6, st: 'fall', slot: -1, bounces: 0 }
      if (this.env.reduced) this.land(f, true)
      this.falls.push(f)
      if (this.env.reduced) break
    }
    if (this.env.reduced) {
      // بلا حركة: تصل كل الدفعة فورًا
      const rest = pool.slice(0, Math.max(0, n - 1))
      for (const { d } of rest) { d.on = false; const [x, y] = this.dateWorld(d, 0); const f: Fall = { x, y, vx: 0, vy: 0, rot: d.rot, vr: 0, st: 'fall', slot: -1, bounces: 0 }; this.land(f, true); this.falls.push(f) }
    }
    this.env.invalidate()
  }

  private slotPos(k: number): [number, number] {
    const { bk, dw } = this
    const cols = 6
    return [bk.x + ((k % cols) - (cols - 1) / 2) * dw * 0.98 + Math.sin(k * 7.3) * dw * 0.12, bk.y + bk.ry * 0.2 - Math.floor(k / cols) * dw * 0.72]
  }

  private land(f: Fall, force = false) {
    const inside = Math.abs(f.x - this.bk.x) < this.bk.w * 0.4
    if (inside || force) {
      f.st = 'slot'
      f.slot = this.inBasket++
      if (this.env.reduced) { const [x, y] = this.slotPos(f.slot); f.x = x; f.y = y }
      this.env.chime(f.slot % 8, 0.5)
      this.report()
    } else f.st = 'ground'
  }

  private report() {
    const v = this.stage >= 3 ? 2 : Math.min(1, this.inBasket / NEED)
    if (this.inBasket >= NEED && this.stage === 0) this.stage = 1
    this.env.progress(v)
  }

  share() {
    if (this.stage >= 2 || this.inBasket === 0) return
    this.stage = 2
    const slots = this.falls.filter((f) => f.st === 'slot')
    this.env.chime(3)
    slots.forEach((f, i) => {
      const hs = this.houses[i % this.houses.length]
      if (this.env.reduced) { hs.lit = Math.min(1, hs.lit + 0.25); return }
      this.flies.push({ x0: f.x, y0: f.y, x1: hs.x, y1: hs.y - hs.w * 0.3, t: -i * 0.11, dur: 1.5 + (i % 3) * 0.15, house: i % this.houses.length, rot: f.rot, trail: [] })
    })
    this.falls = this.falls.filter((f) => f.st !== 'slot')
    this.inBasket = 0
    if (this.env.reduced) this.finish()
    this.env.invalidate()
  }

  private finish() {
    this.stage = 3
    this.finished = true
    this.att.forEach((d) => { d.on = true; d.grow = this.env.reduced ? 1 : 0 })
    this.env.progress(2)
    this.env.chime(5)
    this.env.complete()
  }

  frame(g: CanvasRenderingContext2D, t: number, dt: number) {
    const { W, H, u } = this
    const reduced = this.env.reduced
    this.time = t
    this.sh = reduced ? 0 : Math.max(0, this.sh - dt * 0.9)
    const sh = this.sh
    g.globalAlpha = 1
    g.globalCompositeOperation = 'source-over'
    g.drawImage(this.bg.c, 0, 0, W, H)

    // إضاءة البيوت
    g.globalCompositeOperation = 'lighter'
    for (const hs of this.houses) {
      const lit = hs.lit
      if (lit <= 0.01) continue
      const hh = hs.w * 0.62
      glow(g, hs.x, hs.y - hh * 0.3, hs.w * 2.4, hex('#ffb45a'), 0.5 * lit)
      g.fillStyle = `rgba(255,214,140,${0.95 * lit})`
      g.fillRect(hs.x - hs.w * 0.12, hs.y - hh * 0.62, hs.w * 0.24, hh * 0.62)
    }
    // أشعة الشمس عبر السعف
    const sx = W * (W < H ? 0.78 : 0.14)
    for (let i = 0; i < 4; i++) {
      const a = 0.09 + i * 0.07 + (reduced ? 0 : Math.sin(t * 0.2 + i) * 0.01)
      const gr = g.createLinearGradient(sx, this.hy, sx + Math.cos(a) * W, this.hy + Math.sin(a) * W)
      gr.addColorStop(0, 'rgba(255,214,150,.09)'); gr.addColorStop(1, 'rgba(255,214,150,0)')
      g.fillStyle = gr
      g.beginPath(); g.moveTo(sx, this.hy - 10); g.lineTo(sx + Math.cos(a - 0.03) * W * 1.4, this.hy + Math.sin(a - 0.03) * W * 1.4); g.lineTo(sx + Math.cos(a + 0.03) * W * 1.4, this.hy + Math.sin(a + 0.03) * W * 1.4); g.closePath(); g.fill()
    }
    g.globalCompositeOperation = 'source-over'

    g.drawImage(this.trunk.c, 0, 0, W, H)

    // عذوق التمر المعلّقة
    this.regrow = this.stage === 3 && !reduced ? Math.min(1, this.regrow + dt * 0.12) : this.regrow
    for (const d of this.att) {
      if (!d.on) continue
      if (!reduced && d.grow < 1) d.grow = Math.min(1, d.grow + dt * 0.28)
      const [x, y] = this.dateWorld(d, t)
      this.sprite_(g, x, y, d.rot + Math.sin(t * 1.1 + d.ph) * 0.06, d.grow)
    }

    // التاج والسعف
    const ox = reduced ? 0 : Math.sin(t * 13) * sh * 2
    g.save()
    g.translate(this.cx + ox, this.cy)
    g.lineCap = 'round'
    g.fillStyle = '#1d1208'
    g.beginPath(); g.ellipse(0, u * 0.03, u * 0.13, u * 0.1, 0, 0, TAU); g.fill()
    for (const f of this.fronds) {
      const sway = reduced ? 0 : Math.sin(t * 0.8 + f.ph) * 0.022 + Math.sin(t * 13 + f.ph * 2) * sh * 0.07
      g.save()
      g.rotate(sway)
      g.lineWidth = Math.max(2, u * 0.014); g.strokeStyle = '#2a3a1c'; g.stroke(f.Rr)
      g.lineWidth = Math.max(1.6, u * 0.011)
      g.strokeStyle = '#26401f'; g.stroke(f.A)
      g.strokeStyle = '#7c9c3e'; g.globalAlpha = 0.9; g.stroke(f.B)
      g.globalAlpha = 1
      g.restore()
    }
    g.restore()
    g.lineCap = 'butt'

    // السلّة وما فيها
    this.drawImg(g, this.bkBack, this.bk.x - this.bk.w / 2 - this.bk.w * 0.2, this.bk.y - this.bk.ry * 2, this.bk.w * 1.4, this.bk.ry * 4 + this.bk.h)
    // تمر على الأرض
    const grounds = this.falls.filter((f) => f.st === 'ground')
    for (const f of grounds) this.sprite_(g, f.x, f.y, f.rot, 1)
    for (const f of this.falls) if (f.st === 'slot') this.sprite_(g, f.x, f.y, f.rot, 1)
    this.drawImg(g, this.bkFront, this.bk.x - this.bk.w / 2 - this.bk.w * 0.2, this.bk.y - this.bk.ry * 2, this.bk.w * 1.4, this.bk.ry * 4 + this.bk.h)

    // فيزياء السقوط
    const grav = 2100 * (H / 1080)
    if (!reduced) {
      for (const f of this.falls) {
        if (f.st === 'fall') {
          f.vy += grav * dt; f.y += f.vy * dt; f.x += f.vx * dt; f.rot += f.vr * dt
          if (f.y > this.bk.y - this.bk.ry * 0.2 && Math.abs(f.x - this.bk.x) < this.bk.w * 0.4) this.land(f)
          else if (f.y > this.gy + this.u * 0.06 * (0.6 + ((f.x * 7) % 1) * 0.6)) {
            f.y = this.gy + this.u * 0.06; f.vy *= -0.28; f.vx *= 0.5; f.bounces++
            if (f.bounces > 2) f.st = 'ground'
          }
        } else if (f.st === 'slot') {
          const [tx, ty] = this.slotPos(f.slot)
          const k = 1 - Math.exp(-dt * 16)
          f.x += (tx - f.x) * k; f.y += (ty - f.y) * k; f.rot *= 1 - k * 0.6
        }
      }
      if (grounds.length > 22) this.falls.splice(this.falls.indexOf(grounds[0]), 1)
      // الطيران إلى البيوت
      for (let i = this.flies.length - 1; i >= 0; i--) {
        const fl = this.flies[i]
        fl.t += dt / fl.dur
        if (fl.t < 0) { this.sprite_(g, fl.x0, fl.y0, fl.rot, 1); continue }
        const e = easeInOut(clamp(fl.t))
        const x = lerp(fl.x0, fl.x1, e)
        const y = lerp(fl.y0, fl.y1, e) - Math.sin(Math.PI * e) * Math.hypot(fl.x1 - fl.x0, fl.y1 - fl.y0) * 0.28
        fl.trail.push([x, y]); if (fl.trail.length > 12) fl.trail.shift()
        g.globalCompositeOperation = 'lighter'
        fl.trail.forEach(([tx, ty], k) => { const a = k / fl.trail.length; g.fillStyle = `rgba(255,200,110,${a * 0.35})`; g.beginPath(); g.arc(tx, ty, 1 + a * 2.4, 0, TAU); g.fill() })
        g.globalCompositeOperation = 'source-over'
        this.sprite_(g, x, y, fl.rot + e * 5, lerp(1, 0.45, e))
        if (fl.t >= 1) {
          const hs = this.houses[fl.house]
          hs.lit = Math.min(1, hs.lit + 0.25)
          for (let k = 0; k < 6; k++) this.sparks.push({ x, y, life: 1, vx: (Math.random() - 0.5) * 90, vy: -Math.random() * 80 })
          this.env.chime((i + 3) % 8, 0.4)
          this.flies.splice(i, 1)
          if (!this.flies.length && this.stage === 2) this.finish()
        }
      }
    } else {
      for (const f of this.falls) if (f.st === 'slot') { const [x, y] = this.slotPos(f.slot); f.x = x; f.y = y }
    }
    // شرارات وصول
    g.globalCompositeOperation = 'lighter'
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i]
      p.life -= dt * 1.4; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 120 * dt
      if (p.life <= 0) { this.sparks.splice(i, 1); continue }
      g.fillStyle = `rgba(255,214,140,${p.life})`; g.beginPath(); g.arc(p.x, p.y, 1.6, 0, TAU); g.fill()
    }
    // غبار ذهبي
    if (!reduced) {
      for (const m of this.motes) {
        m.y -= m.v * dt; if (m.y < 0) { m.y = 1; m.x = Math.random() }
        g.fillStyle = `rgba(255,222,160,${0.35 * Math.sin(Math.PI * m.y)})`
        g.beginPath(); g.arc(m.x * W + Math.sin(t * 0.5 + m.y * 6) * 12, m.y * H * 0.8, 1.2, 0, TAU); g.fill()
      }
    }
    g.globalCompositeOperation = 'source-over'
    if (this.stage === 1 && !reduced) {
      // دعوة المشاركة: هالة ناعمة على السلّة
      const p = 0.5 + 0.5 * Math.sin(t * 3)
      g.globalCompositeOperation = 'lighter'
      glow(g, this.bk.x, this.bk.y, this.bk.w * (0.9 + 0.2 * p), hex('#ffcf7a'), 0.32)
      g.globalCompositeOperation = 'source-over'
    }
    void smooth; void mix
  }

  private sprite_(g: CanvasRenderingContext2D, x: number, y: number, rot: number, sc: number) {
    if (sc <= 0.01) return
    const w = this.dw * 3, h = this.dh * 3
    g.save()
    g.translate(x, y); g.rotate(rot); g.scale(sc, sc)
    g.drawImage(this.sprite.c, -w / 2, -h / 2, w, h)
    g.restore()
  }
  private drawImg(g: CanvasRenderingContext2D, o: { c: HTMLCanvasElement }, x: number, y: number, w: number, h: number) {
    g.drawImage(o.c, x, y, w, h)
  }
}

export default function Giving(p: SceneProps) {
  const [v, setV] = useState(p.done ? 2 : 0)
  const last = useRef(-1)
  const drag = useRef({ x: 0, acc: 0 })
  const { canvas, api } = useEngine((env) => new GivingEngine(env), {
    reduced: p.reduced, mode: p.mode, done: p.done, onComplete: p.onComplete, chime: p.chime, tick: p.tick, pour: p.pour,
    onProgress: (x) => { const k = Math.round(x * 100); if (k !== last.current) { last.current = k; setV(x) } },
  })
  const count = Math.min(NEED, Math.round(Math.min(v, 1) * NEED))
  const ready = v >= 1 && v < 2
  const shared = v >= 2
  const hint = shared ? '' : ready ? 'امتلأت السلّة. شارِك ما جادت به النخلة، ولا تنتظر مقابلًا.' : `${p.data.action} — ${toIndic(count)} من ${toIndic(NEED)}`
  return (
    <>
      <canvas
        ref={canvas}
        className="vsc-canvas vsc-press"
        role="img"
        aria-label="نخلة عند الغروب يتدلّى منها الرطب، وسلّة من سعف تحتها؛ عند اهتزاز النخلة يسقط الرطب في السلّة"
        onPointerDown={(e) => { drag.current = { x: e.clientX, acc: 0 }; ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); api.current?.shake(4) }}
        onPointerMove={(e) => {
          if (!e.buttons && e.pointerType !== 'touch') return
          drag.current.acc += Math.abs(e.clientX - drag.current.x)
          drag.current.x = e.clientX
          if (drag.current.acc > 70) { drag.current.acc = 0; api.current?.shake(2) }
        }}
      />
      <div className="vc">
        {hint && <p className="vc__hint" aria-live="polite">{hint}</p>}
        {!shared && (
          <div className="vc__row">
            {ready && <button className="btn btn--primary vbtn" onClick={() => api.current?.share()}>شارِك</button>}
            <button className="btn btn--gold vbtn" onClick={() => api.current?.shake(4)}>{p.data.altLabel}</button>
          </div>
        )}
      </div>
    </>
  )
}
