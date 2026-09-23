import { useRef, useState } from 'react'
import { useEngine, makeNoise, rng, clamp, lerp, easeInOut, hex, glow, mkCanvas, speckle, TAU, type Engine, type Env } from './kit'
import { toIndic } from '../../content/quran'
import type { SceneProps } from './types'

/**
 * الكرم — مدخل المجلس عند الغسق: باب مقوّس يسيل منه الضوء الذهبي، وأمامه دلّة وفناجين.
 * اسحب الدلّة فوق فنجان لتصبّ القهوة، أو المس «اسكب». حين تمتلئ الفناجين يُفتح الطريق إلى قاعة المجلس.
 */
const CUPS = 5
interface Cup { x: number; fill: number; sounded: boolean; full: boolean }
interface Auto { cup: number; ph: 0 | 1 | 2 | 3; t: number; from: [number, number] }

class GenerosityEngine implements Engine {
  W = 0; H = 0; s = 1
  bg = mkCanvas(1, 1)
  U = 100; gy = 0; wallTop = 0; dcx = 0; dw = 0; dh = 0
  trayX = 0; trayY = 0; trayW = 0; cupW = 0; cupH = 0; rimY = 0
  home: [number, number] = [0, 0]
  dx = 0; dy = 0; tilt = 0
  cups: Cup[] = []
  drag: { id: number; ox: number; oy: number } | null = null
  auto: Auto | null = null
  finished = false
  glowBoost = 0
  embers: { x: number; y: number; vx: number; vy: number; life: number }[] = []
  motes: { x: number; y: number; v: number }[] = []
  nz = makeNoise(77)
  pouring = -1
  private time = 0

  constructor(private env: Env) {
    this.cups = Array.from({ length: CUPS }, () => ({ x: 0, fill: 0, sounded: false, full: false }))
    if (env.done) { this.cups.forEach((c) => { c.fill = 1; c.full = true }); this.finished = true; this.glowBoost = 1 }
    const r = rng(7)
    this.motes = Array.from({ length: 30 }, () => ({ x: r(), y: r(), v: 0.004 + r() * 0.008 }))
  }

  get filled() { return this.cups.filter((c) => c.full).length }

  resize(w: number, h: number, s: number) {
    this.W = w; this.H = h; this.s = s
    const portrait = w < h
    this.U = portrait ? Math.min(h * 0.09, w * 0.2) : h * 0.115
    this.gy = h * (portrait ? 0.5 : 0.55)
    this.wallTop = h * (portrait ? 0.27 : 0.15)
    const wallH = this.gy - this.wallTop
    this.dh = wallH * 0.82
    this.dw = Math.min(portrait ? w * 0.3 : w * 0.16, this.dh * 0.62)
    this.dcx = portrait ? w * 0.5 : w * 0.33
    this.trayW = portrait ? w * 0.8 : w * 0.31
    this.trayX = portrait ? w * 0.46 : this.dcx
    this.trayY = this.gy + (portrait ? h * 0.075 : h * 0.085)
    this.cupW = this.trayW * 0.105
    this.cupH = this.cupW * 0.86
    this.rimY = this.trayY - this.cupH - this.trayW * 0.01
    this.cups.forEach((c, i) => { c.x = this.trayX + (i - (CUPS - 1) / 2) * this.trayW * 0.17 })
    this.home = [portrait ? w * 0.84 : this.trayX + this.trayW * 0.62, this.trayY + this.trayW * 0.02]
    if (!this.drag && !this.auto) { this.dx = this.home[0]; this.dy = this.home[1] }
    this.buildBg()
  }

  private buildBg() {
    const { W, H, s, gy, wallTop, dcx, dw, dh } = this
    const { c, g } = mkCanvas(W * s, H * s)
    g.scale(s, s)
    // سماء الغسق
    const sky = g.createLinearGradient(0, 0, 0, gy)
    sky.addColorStop(0, '#050a18'); sky.addColorStop(0.5, '#0f1a34'); sky.addColorStop(1, '#2b2c4c')
    g.fillStyle = sky; g.fillRect(0, 0, W, H)
    const r = rng(9)
    for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(225,232,255,${0.2 + r() * 0.5})`; g.beginPath(); g.arc(r() * W, r() * wallTop * 1.1, 0.5 + r() * 1.1, 0, TAU); g.fill() }
    // رؤوس نخيل خلف الجدار
    g.strokeStyle = '#070a12'
    for (const fx of [0.66, 0.8, 0.93]) {
      const x = fx * W, top = wallTop - H * (0.02 + r() * 0.05)
      g.lineWidth = 1.6
      for (let k = 0; k < 9; k++) {
        const a = -Math.PI * 0.95 + (k / 8) * Math.PI * 0.9
        const L = H * (0.07 + r() * 0.03)
        g.beginPath(); g.moveTo(x, top + H * 0.05); g.quadraticCurveTo(x + Math.cos(a) * L * 0.6, top + Math.sin(a) * L * 0.6, x + Math.cos(a) * L, top + Math.sin(a) * L + L * 0.4); g.stroke()
      }
      g.lineWidth = 4; g.beginPath(); g.moveTo(x, wallTop + 4); g.lineTo(x, top + H * 0.05); g.stroke()
    }
    // الجدار الطيني
    const wall = g.createLinearGradient(0, wallTop, 0, gy)
    wall.addColorStop(0, '#4d372a'); wall.addColorStop(1, '#2c1e17')
    g.fillStyle = wall
    g.fillRect(0, wallTop, W, gy - wallTop + 2)
    // برج زاوية بشرفات مثلثة
    const tw = Math.max(8, W / 46)
    g.fillStyle = '#4d372a'
    const towerW = W * (W < H ? 0.16 : 0.1), towerTop = wallTop - H * 0.07
    g.fillRect(0, towerTop, towerW, gy - towerTop)
    g.beginPath()
    for (let x = 0; x < towerW; x += tw) { g.moveTo(x, towerTop + 1); g.lineTo(x + tw / 2, towerTop - tw * 0.8); g.lineTo(x + tw, towerTop + 1) }
    g.fill()
    g.fillStyle = '#4d372a'
    g.beginPath()
    for (let x = towerW; x < W; x += tw) { g.moveTo(x, wallTop + 1); g.lineTo(x + tw / 2, wallTop - tw * 0.8); g.lineTo(x + tw, wallTop + 1) }
    g.fill()
    // ملمس الطين: ضربات المالج
    g.save(); g.beginPath(); g.rect(0, wallTop - 20, W, gy - wallTop + 20); g.clip()
    for (let i = 0; i < 520; i++) {
      const x = r() * W, y = wallTop + r() * (gy - wallTop), l = 20 + r() * 90
      g.strokeStyle = r() < 0.5 ? `rgba(255,210,160,${0.02 + r() * 0.035})` : `rgba(0,0,0,${0.04 + r() * 0.08})`
      g.lineWidth = 1 + r() * 2
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y + (r() - 0.5) * 6, x + l, y + (r() - 0.5) * 4); g.stroke()
    }
    speckle(g, 0, wallTop, W, gy - wallTop, 1400, 14)
    g.restore()
    // نوافذ مثلثة فوق الباب (نجدية)
    const triY = gy - dh - H * 0.075
    const th = Math.min(H * 0.05, dw * 0.28)
    const tri = (x: number, y: number, w: number, h: number) => { g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.lineTo(x, y + h); g.closePath() }
    const trisX = [-2, -1, 0, 1, 2].map((k) => dcx + k * dw * 0.36)
    this.tris = trisX.map((x, i) => ({ x, y: triY + (Math.abs(i - 2) === 2 ? th * 0.2 : 0), w: th * (i === 2 ? 1.05 : 0.85), h: th * (i === 2 ? 1.1 : 0.9) }))
    for (const t of this.tris) { g.fillStyle = '#100907'; tri(t.x, t.y - 4, t.w + 8, t.h + 6); g.fill(); g.fillStyle = '#3b1e0c'; tri(t.x, t.y, t.w, t.h); g.fill() }
    // إطار الباب المقوّس
    const arch = (cx: number, base: number, w: number, h: number) => {
      const p = new Path2D()
      const spring = base - h + w / 2
      p.moveTo(cx - w / 2, base); p.lineTo(cx - w / 2, spring); p.arc(cx, spring, w / 2, Math.PI, 0); p.lineTo(cx + w / 2, base); p.closePath()
      return p
    }
    const fr = dw * 0.14
    g.fillStyle = '#6a4d3a'
    g.fill(arch(dcx, gy, dw + fr * 2, dh + fr))
    g.fillStyle = '#382519'
    g.fill(arch(dcx, gy, dw + fr * 1.1, dh + fr * 0.5))
    // داخل المجلس
    const op = arch(dcx, gy, dw, dh)
    g.save(); g.clip(op)
    const ig = g.createRadialGradient(dcx, gy - dh * 0.4, 2, dcx, gy - dh * 0.4, dh * 0.75)
    ig.addColorStop(0, '#ffe2a0'); ig.addColorStop(0.35, '#f0a850'); ig.addColorStop(0.7, '#a85a20'); ig.addColorStop(1, '#3a1a08')
    g.fillStyle = ig; g.fillRect(dcx - dw, gy - dh - 4, dw * 2, dh + 8)
    // أرضية وجدار خلفي ومساند
    g.fillStyle = 'rgba(70,32,10,.55)'; g.fillRect(dcx - dw / 2, gy - dh * 0.14, dw, dh * 0.14)
    g.strokeStyle = 'rgba(70,32,10,.6)'; g.lineWidth = 1
    for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(dcx - dw / 2, gy - dh * 0.14 + k * dh * 0.035); g.lineTo(dcx + dw / 2, gy - dh * 0.14 + k * dh * 0.035); g.stroke() }
    const cush = ['#7a2418', '#5a2a18', '#8a3a1c']
    cush.forEach((col, i) => { g.fillStyle = col; const x = dcx - dw * 0.42 + i * dw * 0.29; g.beginPath(); g.roundRect(x, gy - dh * 0.3, dw * 0.26, dh * 0.17, 5); g.fill() })
    // فانوس معلّق داخل المجلس
    g.strokeStyle = '#2a1408'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(dcx, gy - dh - 4); g.lineTo(dcx, gy - dh * 0.78); g.stroke()
    g.fillStyle = '#2a1408'; g.beginPath(); g.roundRect(dcx - dw * 0.045, gy - dh * 0.78, dw * 0.09, dh * 0.1, 3); g.fill()
    g.restore()
    // ضلفتا الباب المفتوحتان
    for (const sgn of [-1, 1]) {
      const x = dcx + sgn * (dw / 2 - dw * 0.045)
      const lg = g.createLinearGradient(x - dw * 0.05, 0, x + dw * 0.05, 0)
      lg.addColorStop(0, '#2a180d'); lg.addColorStop(0.5, '#4d2f18'); lg.addColorStop(1, '#1c1009')
      g.fillStyle = lg
      g.fillRect(x - dw * 0.045, gy - dh * 0.82, dw * 0.09, dh * 0.82)
      g.fillStyle = '#b08840'
      for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(x, gy - dh * 0.05 - k * dh * 0.09, Math.max(1.6, dw * 0.012), 0, TAU); g.fill() }
    }
    g.fillStyle = '#231a15'; g.fillRect(0, gy, W, H * 0.03)
    // عتبة ودرجتان
    for (let k = 0; k < 2; k++) {
      const w2 = dw + fr * 2 + (k + 1) * dw * 0.24
      const st = g.createLinearGradient(0, gy + k * H * 0.012, 0, gy + (k + 1) * H * 0.012)
      st.addColorStop(0, k ? '#3a2e27' : '#4a3b32'); st.addColorStop(1, '#1d1612')
      g.fillStyle = st; g.fillRect(dcx - w2 / 2, gy + k * H * 0.012, w2, H * 0.012)
    }
    // الأرض
    const gd = g.createLinearGradient(0, gy + H * 0.024, 0, H)
    gd.addColorStop(0, '#231a15'); gd.addColorStop(1, '#0a0705')
    g.fillStyle = gd; g.fillRect(0, gy + H * 0.024, W, H - gy)
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1
    for (let k = 0; k < 9; k++) {
      const y = gy + H * 0.03 + Math.pow(k / 9, 1.6) * (H - gy)
      g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke()
    }
    speckle(g, 0, gy, W, H - gy, 900, 21)
    this.bg = { c, g }
  }
  tris: { x: number; y: number; w: number; h: number }[] = []

  // ————— الدلّة —————
  private P() { return [this.U * 0.6, -this.U * 0.62] as const }
  /** طرف المنقار في الإحداثيات العالمية */
  tip(dx: number, dy: number, tilt: number): [number, number] {
    const U = this.U
    const [px, py] = this.P()
    const vx = -1.12 * U - px, vy = -1.19 * U - py
    const c = Math.cos(tilt), s = Math.sin(tilt)
    return [dx + px + vx * c + vy * s, dy + py - vx * s + vy * c]
  }
  private overCup(dx: number, dy: number): number {
    const [tx, ty] = this.tip(dx, dy, 0.42)
    for (let i = 0; i < CUPS; i++) {
      const c = this.cups[i]
      if (c.full) continue
      if (Math.abs(tx - c.x) < this.cupW * 0.75 && ty > this.rimY - this.U * 1.05 && ty < this.rimY + this.cupH * 0.2) return i
    }
    return -1
  }

  down(x: number, y: number, id: number) {
    if (this.auto || this.finished) return
    const cx = this.dx, cy = this.dy - this.U * 0.7
    if (Math.hypot(x - cx, y - cy) > this.U * 1.45) return
    this.drag = { id, ox: this.dx - x, oy: this.dy - y }
    this.env.tick()
  }
  move(x: number, y: number) {
    if (!this.drag) return
    this.dx = clamp(x + this.drag.ox, this.W * 0.06, this.W * 0.94)
    this.dy = clamp(y + this.drag.oy, this.trayY - this.U * 2.0, this.trayY + this.U * 0.4)
    if (this.env.reduced) {
      const i = this.overCup(this.dx, this.dy)
      if (i >= 0) this.fillCup(i)
      this.env.invalidate()
    }
  }
  up() { this.drag = null; this.env.invalidate() }

  private fillCup(i: number) {
    const c = this.cups[i]
    c.fill = 1; c.full = true
    this.env.chime(i, 0.6)
    this.env.progress(this.filled / CUPS)
    if (this.filled === CUPS) this.finish()
  }

  private finish() {
    if (this.finished) return
    this.finished = true
    this.env.chime(5)
    this.env.complete()
    this.pouring = -1
  }

  /** زر «اسكب»: يصبّ في الفنجان التالي بلا سحب */
  pourNext() {
    if (this.finished || this.auto) return
    const i = this.cups.findIndex((c) => !c.full)
    if (i < 0) return
    if (this.env.reduced) { this.fillCup(i); this.env.invalidate(); return }
    this.drag = null
    this.auto = { cup: i, ph: 0, t: 0, from: [this.dx, this.dy] }
  }

  private target(i: number): [number, number] {
    const [tx, ty] = this.tip(0, 0, 0.42)
    return [this.cups[i].x - tx, this.rimY - this.U * 0.28 - ty]
  }

  frame(g: CanvasRenderingContext2D, t: number, dt: number) {
    const { W, H, U } = this
    const reduced = this.env.reduced
    this.time = t
    let wantTilt = 0
    this.pouring = -1

    if (this.auto) {
      const a = this.auto
      a.t += dt
      const [tx, ty] = this.target(a.cup)
      if (a.ph === 0) {
        const q = easeInOut(a.t / 0.6)
        this.dx = lerp(a.from[0], tx, q); this.dy = lerp(a.from[1], ty, q)
        if (a.t >= 0.6) { a.ph = 1; a.t = 0 }
      } else if (a.ph === 1) {
        wantTilt = 0.42 * clamp(a.t / 0.35)
        this.tilt = wantTilt
        if (a.t >= 0.35) { a.ph = 2; a.t = 0; this.env.pour(); this.cups[a.cup].sounded = true }
      } else if (a.ph === 2) {
        wantTilt = 0.42; this.tilt = 0.42
        this.pouring = a.cup
        this.cups[a.cup].fill = Math.min(1, this.cups[a.cup].fill + dt / 1.3)
        if (this.cups[a.cup].fill >= 1) { a.ph = 3; a.t = 0; this.pouring = -1; this.cups[a.cup].full = true; this.env.chime(a.cup, 0.6); this.env.progress(this.filled / CUPS) }
      } else {
        this.tilt = 0.42 * (1 - clamp(a.t / 0.3))
        if (a.t >= 0.3) { this.tilt = 0; this.auto = null; if (this.filled === CUPS) this.finish() }
      }
    } else if (this.drag && !reduced) {
      const i = this.overCup(this.dx, this.dy)
      wantTilt = i >= 0 ? 0.42 : 0
      this.tilt += (wantTilt - this.tilt) * (1 - Math.exp(-dt * 9))
      if (i >= 0 && this.tilt > 0.34) {
        this.pouring = i
        const c = this.cups[i]
        if (!c.sounded) { c.sounded = true; this.env.pour() }
        c.fill = Math.min(1, c.fill + dt / 1.3)
        if (c.fill >= 1) { c.full = true; this.env.chime(i, 0.6); this.env.progress(this.filled / CUPS); this.pouring = -1; if (this.filled === CUPS) this.finish() }
      }
    } else if (!reduced) {
      this.tilt += (0 - this.tilt) * (1 - Math.exp(-dt * 9))
      if (this.finished) { this.dx += (this.home[0] - this.dx) * (1 - Math.exp(-dt * 3)); this.dy += (this.home[1] - this.dy) * (1 - Math.exp(-dt * 3)) }
    }
    if (reduced) { this.tilt = 0; if (this.finished) { this.dx = this.home[0]; this.dy = this.home[1] } }
    if (this.finished && !reduced) this.glowBoost = Math.min(1, this.glowBoost + dt * 0.5)
    if (reduced && this.finished) this.glowBoost = 1

    g.globalAlpha = 1
    g.globalCompositeOperation = 'source-over'
    g.drawImage(this.bg.c, 0, 0, W, H)

    // ضوء المجلس: يتراقص بلطف ويزداد بعد الاكتمال
    const fl = reduced ? 0 : (this.nz.fbm(t * 2.2, 2) - 0.5) * 0.18 + Math.sin(t * 7) * 0.02
    const L = 0.85 + fl + this.glowBoost * 0.25
    g.globalCompositeOperation = 'lighter'
    glow(g, this.dcx, this.gy - this.dh * 0.4, this.dh * 1.15, hex('#ffb35a'), 0.3 * L)
    glow(g, this.dcx, this.gy + this.H * 0.03, this.dw * 2.1, hex('#ffbe6a'), 0.2 * L)
    for (const tr of this.tris) {
      glow(g, tr.x, tr.y + tr.h * 0.4, tr.w * 1.8, hex('#ffb040'), 0.4 * L)
      g.fillStyle = `rgba(255,205,120,${0.75 * L})`
      g.beginPath(); g.moveTo(tr.x - tr.w / 2, tr.y); g.lineTo(tr.x + tr.w / 2, tr.y); g.lineTo(tr.x, tr.y + tr.h); g.closePath(); g.fill()
    }
    // بقعة ضوء على الأرض
    const gs = g.createLinearGradient(0, this.gy, 0, H)
    gs.addColorStop(0, `rgba(255,190,100,${0.34 * L})`); gs.addColorStop(1, 'rgba(255,170,80,0)')
    g.fillStyle = gs
    g.beginPath(); g.moveTo(this.dcx - this.dw * 0.62, this.gy + 4); g.lineTo(this.dcx + this.dw * 0.62, this.gy + 4); g.lineTo(this.dcx + this.dw * 2.1, H * 0.98); g.lineTo(this.dcx - this.dw * 2.1, H * 0.98); g.closePath(); g.fill()
    g.globalCompositeOperation = 'source-over'

    this.tray(g, t)
    this.mangal(g, t, dt)
    this.dallah(g, t)

    // غبار في الضوء
    if (!reduced) {
      g.globalCompositeOperation = 'lighter'
      for (const m of this.motes) {
        m.y -= m.v * dt; if (m.y < 0) { m.y = 1; m.x = Math.random() }
        const px = this.dcx + (m.x - 0.5) * this.dw * 3
        g.fillStyle = `rgba(255,214,150,${0.4 * Math.sin(Math.PI * m.y)})`
        g.beginPath(); g.arc(px, this.gy - m.y * this.dh, 1.2, 0, TAU); g.fill()
      }
      g.globalCompositeOperation = 'source-over'
    }
    void U; void lerp
  }

  private tray(g: CanvasRenderingContext2D, t: number) {
    const { trayX, trayY, trayW } = this
    const rx = trayW / 2, ry = rx * 0.2
    g.fillStyle = 'rgba(0,0,0,.4)'
    g.beginPath(); g.ellipse(trayX + 4, trayY + ry * 0.55, rx * 1.02, ry * 1.1, 0, 0, TAU); g.fill()
    const bg = g.createLinearGradient(trayX - rx, 0, trayX + rx, 0)
    bg.addColorStop(0, '#6b4c1c'); bg.addColorStop(0.3, '#d8b566'); bg.addColorStop(0.6, '#a5782c'); bg.addColorStop(1, '#4e3510')
    g.fillStyle = bg
    g.beginPath(); g.ellipse(trayX, trayY, rx, ry, 0, 0, TAU); g.fill()
    g.fillStyle = '#2c1c0a'
    g.beginPath(); g.ellipse(trayX, trayY, rx * 0.92, ry * 0.8, 0, 0, TAU); g.fill()
    g.strokeStyle = 'rgba(232,196,120,.55)'; g.lineWidth = 1
    g.beginPath(); g.ellipse(trayX, trayY, rx * 0.86, ry * 0.7, 0, 0, TAU); g.stroke()
    for (let i = 0; i < CUPS; i++) this.cup(g, i, t)
  }

  private cup(g: CanvasRenderingContext2D, i: number, t: number) {
    const c = this.cups[i]
    const { cupW: w, cupH: h } = this
    const x = c.x, y = this.trayY + h * 0.05
    const ry = w * 0.14
    g.fillStyle = 'rgba(0,0,0,.4)'
    g.beginPath(); g.ellipse(x + 3, y + 2, w * 0.36, ry * 0.8, 0, 0, TAU); g.fill()
    // الجسم
    g.beginPath()
    g.moveTo(x - w / 2, y - h)
    g.bezierCurveTo(x - w * 0.5, y - h * 0.3, x - w * 0.32, y - h * 0.05, x - w * 0.2, y)
    g.lineTo(x + w * 0.2, y)
    g.bezierCurveTo(x + w * 0.32, y - h * 0.05, x + w * 0.5, y - h * 0.3, x + w / 2, y - h)
    g.closePath()
    const cg = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0)
    cg.addColorStop(0, '#d9ceb2'); cg.addColorStop(0.3, '#fbf5e4'); cg.addColorStop(0.75, '#cfc3a4'); cg.addColorStop(1, '#8c8168')
    g.fillStyle = cg; g.fill()
    g.strokeStyle = '#b8323a'; g.lineWidth = Math.max(1, w * 0.03)
    g.beginPath(); g.moveTo(x - w * 0.46, y - h * 0.62); g.quadraticCurveTo(x, y - h * 0.5, x + w * 0.46, y - h * 0.62); g.stroke()
    // فم الفنجان وسطح القهوة
    g.fillStyle = '#1a0e08'
    g.beginPath(); g.ellipse(x, y - h, w / 2, ry, 0, 0, TAU); g.fill()
    if (c.fill > 0.01) {
      const lv = y - h + ry * (1.0 - c.fill * 0.75) + (1 - c.fill) * h * 0.18
      const rx2 = w / 2 * (0.94 - (1 - c.fill) * 0.14)
      g.fillStyle = '#4c260e'
      g.beginPath(); g.ellipse(x, lv, rx2, ry * 0.86, 0, 0, TAU); g.fill()
      g.fillStyle = 'rgba(232,170,100,.45)'
      g.beginPath(); g.ellipse(x - rx2 * 0.3, lv - ry * 0.15, rx2 * 0.32, ry * 0.2, 0, 0, TAU); g.fill()
    }
    g.strokeStyle = '#d9b45c'; g.lineWidth = Math.max(1.4, w * 0.03)
    g.beginPath(); g.ellipse(x, y - h, w / 2, ry, 0, 0, TAU); g.stroke()
    // بخار
    if (c.full && !this.env.reduced) {
      for (let k = 0; k < 2; k++) {
        g.strokeStyle = `rgba(255,232,196,${0.16 + 0.06 * Math.sin(t + k)})`; g.lineWidth = 2
        g.beginPath()
        for (let j = 0; j <= 10; j++) {
          const v = j / 10
          const px = x + (k - 0.5) * w * 0.3 + Math.sin(t * 1.2 + v * 5 + i + k * 2) * w * 0.12 * v
          const py = y - h - ry - v * h * 1.6
          if (j) g.lineTo(px, py); else g.moveTo(px, py)
        }
        g.stroke()
      }
    }
  }

  private mangal(g: CanvasRenderingContext2D, t: number, dt: number) {
    const [hx, hy] = this.home
    const U = this.U
    g.fillStyle = 'rgba(0,0,0,.4)'
    g.beginPath(); g.ellipse(hx, hy + U * 0.05, U * 0.66, U * 0.14, 0, 0, TAU); g.fill()
    const sg = g.createLinearGradient(hx - U * 0.5, 0, hx + U * 0.5, 0)
    sg.addColorStop(0, '#3a2a20'); sg.addColorStop(0.4, '#1a120e'); sg.addColorStop(1, '#080504')
    g.fillStyle = sg
    g.beginPath(); g.moveTo(hx - U * 0.55, hy - U * 0.08); g.lineTo(hx - U * 0.4, hy + U * 0.06); g.lineTo(hx + U * 0.4, hy + U * 0.06); g.lineTo(hx + U * 0.55, hy - U * 0.08); g.closePath(); g.fill()
    g.fillStyle = '#0c0705'
    g.beginPath(); g.ellipse(hx, hy - U * 0.08, U * 0.55, U * 0.11, 0, 0, TAU); g.fill()
    // جمر
    g.globalCompositeOperation = 'lighter'
    const p = this.env.reduced ? 0.7 : 0.6 + 0.4 * Math.sin(t * 2.3)
    glow(g, hx, hy - U * 0.1, U * 0.9, hex('#ff7a2a'), 0.32 * p)
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4
      g.fillStyle = `rgba(255,${120 + (i % 3) * 30},40,${0.75 * (0.6 + 0.4 * Math.sin(t * 3 + i))})`
      g.beginPath(); g.ellipse(hx + Math.cos(a) * U * 0.3 * ((i % 4) / 4 + 0.3), hy - U * 0.09 + Math.sin(a) * U * 0.035, U * 0.04, U * 0.022, 0, 0, TAU); g.fill()
    }
    if (!this.env.reduced) {
      if (Math.random() < dt * 5) this.embers.push({ x: hx + (Math.random() - 0.5) * U * 0.6, y: hy - U * 0.1, vx: (Math.random() - 0.5) * 10, vy: -20 - Math.random() * 30, life: 1 })
      for (let i = this.embers.length - 1; i >= 0; i--) {
        const e = this.embers[i]
        e.life -= dt * 0.9; e.x += e.vx * dt; e.y += e.vy * dt
        if (e.life <= 0) { this.embers.splice(i, 1); continue }
        g.fillStyle = `rgba(255,170,70,${e.life})`; g.beginPath(); g.arc(e.x, e.y, 1.3, 0, TAU); g.fill()
      }
    }
    g.globalCompositeOperation = 'source-over'
  }

  private dallah(g: CanvasRenderingContext2D, t: number) {
    const U = this.U
    const [px, py] = this.P()
    // تلميح: نبض حول الدلّة قبل الاستعمال
    if (!this.finished && !this.drag && !this.auto && !this.cups.some((c) => c.fill > 0) && !this.env.reduced) {
      const k = (t * 0.8) % 1
      g.strokeStyle = `rgba(255,222,150,${0.45 * (1 - k)})`; g.lineWidth = 1.5
      g.beginPath(); g.arc(this.dx, this.dy - U * 0.7, U * (1.1 + k * 0.5), 0, TAU); g.stroke()
    }
    g.save()
    g.translate(this.dx, this.dy)
    g.translate(px, py); g.rotate(-this.tilt); g.translate(-px, -py)
    g.fillStyle = 'rgba(0,0,0,.35)'
    g.beginPath(); g.ellipse(0, 2, U * 0.6, U * 0.09, 0, 0, TAU); g.fill()
    const brass = g.createLinearGradient(-U * 0.75, 0, U * 0.75, 0)
    brass.addColorStop(0, '#5a3d10'); brass.addColorStop(0.28, '#e8c86a'); brass.addColorStop(0.5, '#b8862e'); brass.addColorStop(0.8, '#7a5418'); brass.addColorStop(1, '#3e290a')
    // المنقار
    g.beginPath()
    g.moveTo(-0.52 * U, -0.3 * U)
    g.bezierCurveTo(-0.9 * U, -0.4 * U, -1.0 * U, -0.8 * U, -1.16 * U, -1.18 * U)
    g.lineTo(-1.08 * U, -1.2 * U)
    g.bezierCurveTo(-0.94 * U, -0.92 * U, -0.8 * U, -0.62 * U, -0.46 * U, -0.56 * U)
    g.closePath()
    g.fillStyle = brass; g.fill(); g.strokeStyle = '#2a1a08'; g.lineWidth = 1.2; g.stroke()
    // اليد
    g.strokeStyle = '#2a1a08'; g.lineWidth = U * 0.07
    g.beginPath(); g.moveTo(0.43 * U, -0.95 * U); g.bezierCurveTo(0.95 * U, -1.0 * U, 0.95 * U, -0.3 * U, 0.6 * U, -0.22 * U); g.stroke()
    g.strokeStyle = '#c9a14a'; g.lineWidth = U * 0.045; g.stroke()
    // الجسم
    g.beginPath()
    g.moveTo(-0.5 * U, 0)
    g.bezierCurveTo(-0.72 * U, -0.05 * U, -0.74 * U, -0.5 * U, -0.42 * U, -0.78 * U)
    g.bezierCurveTo(-0.28 * U, -0.9 * U, -0.22 * U, -1.0 * U, -0.2 * U, -1.2 * U)
    g.lineTo(-0.2 * U, -1.32 * U)
    g.bezierCurveTo(-0.3 * U, -1.36 * U, -0.28 * U, -1.5 * U, 0, -1.56 * U)
    g.bezierCurveTo(0.28 * U, -1.5 * U, 0.3 * U, -1.36 * U, 0.2 * U, -1.32 * U)
    g.lineTo(0.2 * U, -1.2 * U)
    g.bezierCurveTo(0.22 * U, -1.0 * U, 0.28 * U, -0.9 * U, 0.42 * U, -0.78 * U)
    g.bezierCurveTo(0.74 * U, -0.5 * U, 0.72 * U, -0.05 * U, 0.5 * U, 0)
    g.closePath()
    g.fillStyle = brass; g.fill(); g.strokeStyle = '#2a1a08'; g.lineWidth = 1.4; g.stroke()
    // حلقات ونقش
    g.strokeStyle = 'rgba(58,34,8,.6)'; g.lineWidth = 1.2
    for (const y of [-0.22, -0.58, -0.95, -1.3]) {
      const half = y === -0.22 ? 0.66 : y === -0.58 ? 0.66 : y === -0.95 ? 0.24 : 0.2
      g.beginPath(); g.ellipse(0, y * U, half * U, half * U * 0.1, 0, 0, Math.PI); g.stroke()
    }
    g.fillStyle = 'rgba(58,34,8,.55)'
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.arc(k * U * 0.17, -0.4 * U + Math.abs(k) * U * 0.012, U * 0.018, 0, TAU); g.fill() }
    g.strokeStyle = 'rgba(255,240,190,.45)'; g.lineWidth = U * 0.03
    g.beginPath(); g.moveTo(-0.5 * U, -0.2 * U); g.bezierCurveTo(-0.62 * U, -0.36 * U, -0.5 * U, -0.6 * U, -0.36 * U, -0.74 * U); g.stroke()
    g.fillStyle = '#e0bc62'; g.beginPath(); g.arc(0, -1.63 * U, U * 0.05, 0, TAU); g.fill()
    g.restore()

    // خيط القهوة
    if (this.pouring >= 0) {
      const c = this.cups[this.pouring]
      const [tx, ty] = this.tip(this.dx, this.dy, this.tilt)
      const ex = c.x, ey = this.rimY + this.cupW * 0.1
      g.lineCap = 'round'
      g.strokeStyle = '#2f1608'; g.lineWidth = Math.max(3, U * 0.032)
      g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(lerp(tx, ex, 0.5), ty + (ey - ty) * 0.15, ex, ey); g.stroke()
      g.strokeStyle = 'rgba(232,170,100,.75)'; g.lineWidth = Math.max(1, U * 0.01)
      g.beginPath(); g.moveTo(tx - 1, ty); g.quadraticCurveTo(lerp(tx, ex, 0.5) - 1, ty + (ey - ty) * 0.15, ex - 1, ey); g.stroke()
      g.lineCap = 'butt'
      if (!this.env.reduced) {
        g.strokeStyle = 'rgba(232,170,100,.4)'; g.lineWidth = 1
        const k = (this.time * 3) % 1
        g.beginPath(); g.ellipse(ex, ey, this.cupW * 0.12 + k * this.cupW * 0.2, this.cupW * 0.03 + k * this.cupW * 0.05, 0, 0, TAU); g.stroke()
      }
    }
  }
}

export default function Generosity(p: SceneProps) {
  const [n, setN] = useState(p.done ? CUPS : 0)
  const [fin, setFin] = useState(p.done)
  const last = useRef(-1)
  const { canvas, api, point } = useEngine((env) => new GenerosityEngine(env), {
    reduced: p.reduced, mode: p.mode, done: p.done,
    onComplete: () => { setFin(true); p.onComplete() },
    chime: p.chime, tick: p.tick, pour: p.pour,
    onProgress: (v) => { const k = Math.round(v * CUPS); if (k !== last.current) { last.current = k; setN(k) } },
  })
  const hint = fin ? 'تفضّل... المجلس مفتوح لضيوفك.' : `${p.data.action} — ${toIndic(n)} من ${toIndic(CUPS)}`
  return (
    <>
      <canvas
        ref={canvas}
        className="vsc-canvas vsc-drag"
        role="img"
        aria-label="مدخل مجلس عند الغسق: باب مقوّس مضيء، وأمامه صينية عليها خمسة فناجين ودلّة قهوة سعودية"
        onPointerDown={(e) => { const q = point(e); api.current?.down(q.x, q.y, e.pointerId); ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }}
        onPointerMove={(e) => { if (e.buttons || e.pointerType === 'touch') { const q = point(e); api.current?.move(q.x, q.y) } }}
        onPointerUp={() => api.current?.up()}
        onPointerCancel={() => api.current?.up()}
      />
      <div className="vc">
        <p className="vc__hint" aria-live="polite">{hint}</p>
        <div className="vc__row">
          {fin ? (
            <button className="btn btn--primary vbtn" onClick={() => p.onMajlis?.()}>ادخل المجلس</button>
          ) : (
            <button className="btn btn--gold vbtn" onClick={() => api.current?.pourNext()}>{p.data.altLabel}</button>
          )}
        </div>
      </div>
      <style>{`.vsc-drag{cursor:grab}.vsc-drag:active{cursor:grabbing}`}</style>
    </>
  )
}
