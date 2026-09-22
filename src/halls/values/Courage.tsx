import { useRef, useState } from 'react'
import { useEngine, makeNoise, rng, clamp, lerp, smooth, hex, mix, css, glow, mkCanvas, speckle, TAU, type Engine, type Env, type RGB } from './kit'
import type { SceneProps } from './types'

/**
 * الشجاعة — فجر على سلسلة جبال، وشعلة صغيرة على منارة حجرية أمام ريح متقطّعة.
 * اضغط باستمرار (أو المس الزر) لتثبيت الشعلة؛ الثبات يملأ الحلقة ثم يطلع الفجر ويظهر السطر الموثّق.
 */
interface Ember { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number }
interface Streak { x: number; y: number; len: number; sp: number; a: number; ph: number }

class CourageEngine implements Engine {
  W = 0; H = 0; s = 1
  nz = makeNoise(11)
  sky0 = mkCanvas(1, 1); sky1 = mkCanvas(1, 1); rid0 = mkCanvas(1, 1); rid1 = mkCanvas(1, 1); fg = mkCanvas(1, 1); lit = mkCanvas(1, 1)
  litR = 0
  fx = 0; fy = 0; fh = 0
  held = false; latched = false
  steady = 0
  progress = 0
  dawn = 0
  finished = false
  embers: Ember[] = []
  streaks: Streak[] = []
  stars: { x: number; y: number; r: number; ph: number }[] = []
  spawn = 0
  constructor(private env: Env) {
    if (env.done) { this.dawn = 1; this.progress = 1; this.steady = 1; this.finished = true }
    const r = rng(5)
    this.stars = Array.from({ length: 90 }, () => ({ x: r(), y: Math.pow(r(), 1.6) * 0.5, r: 0.4 + r() * 1.1, ph: r() * TAU }))
  }

  setSteady(on: boolean, latch = false) {
    if (latch) this.latched = on
    else this.held = on
    if (this.env.reduced && (this.held || this.latched) && !this.finished) this.finish(true)
    this.env.invalidate()
  }
  toggleLatch() {
    this.setSteady(!this.latched, true)
  }
  get isSteady() { return this.held || this.latched }

  finish(instant = false) {
    if (this.finished) return
    this.finished = true
    this.progress = 1
    if (instant) { this.dawn = 1; this.steady = 1 }
    this.env.chime(5)
    this.env.complete()
  }

  resize(w: number, h: number, s: number) {
    this.W = w; this.H = h; this.s = s
    const portrait = w < h
    this.fx = portrait ? w * 0.5 : w * 0.3
    this.fy = portrait ? h * 0.6 : h * 0.66
    this.fh = h * (portrait ? 0.105 : 0.125)
    this.buildSky(); this.buildRidges(); this.buildFg()
    this.litR = h * 0.3
    this.lit = mkCanvas(this.litR * 2, this.litR * 2)
    const r = rng(9)
    this.streaks = Array.from({ length: 22 }, () => ({ x: r() * w, y: h * (0.32 + r() * 0.5), len: 60 + r() * 160, sp: 0.6 + r() * 0.8, a: 0.05 + r() * 0.08, ph: r() * TAU }))
  }

  private buildSky() {
    const { W, H, s } = this
    const mk = (stops: [number, string][]) => {
      const { c, g } = mkCanvas(W * s, H * s)
      g.scale(s, s)
      const gr = g.createLinearGradient(0, 0, 0, H * 0.7)
      for (const [o, col] of stops) gr.addColorStop(o, col)
      g.fillStyle = gr
      g.fillRect(0, 0, W, H)
      return { c, g }
    }
    this.sky0 = mk([[0, '#060b19'], [0.3, '#101a37'], [0.55, '#34335a'], [0.72, '#86526a'], [0.86, '#d98a5c'], [1, '#f6c48a']])
    this.sky1 = mk([[0, '#22345a'], [0.28, '#56699a'], [0.52, '#b8929c'], [0.68, '#f0b487'], [0.84, '#ffd9a3'], [1, '#ffe9c6']])
  }

  private ridgeY(l: number, x: number) {
    const { H } = this
    const base = H * (0.545 + l * 0.058)
    const amp = H * [0.11, 0.13, 0.16, 0.15, 0.1][l]
    const f = 0.0026 * (1 + l * 0.6)
    if (l === 3) { const v = this.nz.fbm(x * f * 0.55 + 91, 3); return base - amp * (smooth(0.4, 0.62, v) * 0.8 + 0.2 * v) }
    if (l === 4) { const v = this.nz.fbm(x * f * 0.4 + 133, 3); return base - amp * 0.8 * Math.pow(v, 1.3) }
    const v = this.nz.fbm(x * f + l * 31.7, 5)
    const r = 1 - Math.abs(2 * v - 1)
    return base - amp * Math.pow(r, 1.25)
  }

  private buildRidges() {
    const { W, H, s } = this
    const pal: [string[], string[], string][] = [
      [['#5f6288', '#484b6c', '#30344f', '#1e2239', '#0e111f'], ['#e2a982', '#c98a6c', '#93605a', '#4d3646', '#1f171d'], ''],
    ]
    const cols0 = pal[0][0]
    const cols1 = pal[0][1]
    const haze0 = '#7a6a86'
    const haze1 = '#f2be8f'
    for (const [tgt, cols, haze, rim] of [[this.rid0, cols0, haze0, 'rgba(160,170,220,.35)'], [this.rid1, cols1, haze1, 'rgba(255,224,170,.55)']] as const) {
      const { c, g } = mkCanvas(W * s, H * s)
      g.scale(s, s)
      for (let l = 0; l < 5; l++) {
        const top = this.ridgeY(l, 0)
        const path = new Path2D()
        path.moveTo(0, H)
        for (let x = 0; x <= W + 4; x += 3) path.lineTo(x, this.ridgeY(l, x))
        path.lineTo(W, H)
        path.closePath()
        const y0 = H * (0.36 + l * 0.06)
        const gr = g.createLinearGradient(0, y0, 0, H * (0.66 + l * 0.06))
        gr.addColorStop(0, cols[l])
        gr.addColorStop(1, mix(cols[l], haze, l < 3 ? 0.62 : 0.28))
        g.fillStyle = gr
        g.fill(path)
        // ضوء حافّة خفيف
        g.save()
        g.beginPath()
        for (let x = 0; x <= W + 4; x += 3) { const y = this.ridgeY(l, x); if (x === 0) g.moveTo(x, y); else g.lineTo(x, y) }
        g.strokeStyle = rim
        g.lineWidth = l < 2 ? 1 : 1.4
        g.globalAlpha = l < 4 ? 0.5 : 0.25
        g.stroke()
        g.restore()
        // ضباب بين الطبقات
        const mist = g.createLinearGradient(0, H * (0.55 + l * 0.06) - H * 0.06, 0, H * (0.55 + l * 0.06) + H * 0.1)
        mist.addColorStop(0, css(hex(haze), 0))
        mist.addColorStop(0.5, css(hex(haze), l < 4 ? 0.2 : 0.08))
        mist.addColorStop(1, css(hex(haze), 0))
        g.fillStyle = mist
        g.fillRect(0, H * (0.55 + l * 0.06) - H * 0.06, W, H * 0.16)
        void top
      }
      tgt.c = c; tgt.g = g
    }
  }

  private ledgeY(x: number) {
    const { H, fx } = this
    const bump = 0.085 * H * Math.exp(-Math.pow((x - fx) / (0.2 * H), 2))
    return H * 0.845 + (this.nz.fbm(x * 0.006 + 90, 4) - 0.5) * 0.06 * H - bump
  }

  private buildFg() {
    const { W, H, s, fx, fy } = this
    const { c, g } = mkCanvas(W * s, H * s)
    g.scale(s, s)
    const path = new Path2D()
    path.moveTo(0, H)
    for (let x = 0; x <= W + 3; x += 3) path.lineTo(x, this.ledgeY(x))
    path.lineTo(W, H)
    path.closePath()
    const gr = g.createLinearGradient(0, H * 0.76, 0, H)
    gr.addColorStop(0, '#171319')
    gr.addColorStop(1, '#07070b')
    g.fillStyle = gr
    g.fill(path)
    g.save()
    g.clip(path)
    // وجوه صخرية: مضلّعات بحواف أفتح
    const r = rng(21)
    for (let i = 0; i < 34; i++) {
      const px = r() * W
      const py = this.ledgeY(px) + r() * H * 0.14
      const sz = H * (0.02 + r() * 0.06)
      g.beginPath()
      g.moveTo(px, py)
      g.lineTo(px + sz * (0.6 + r()), py + sz * (r() - 0.3))
      g.lineTo(px + sz * (0.3 + r()), py + sz * (0.7 + r() * 0.6))
      g.lineTo(px - sz * 0.3, py + sz * 0.5)
      g.closePath()
      g.fillStyle = `rgba(${24 + r() * 20},${20 + r() * 16},${28 + r() * 18},${0.28 + r() * 0.22})`
      g.fill()
      g.strokeStyle = 'rgba(190,170,190,.05)'
      g.lineWidth = 1
      g.stroke()
    }
    g.beginPath()
    for (let x = 0; x <= W + 3; x += 3) { const y = this.ledgeY(x); if (x === 0) g.moveTo(x, y); else g.lineTo(x, y) }
    g.strokeStyle = 'rgba(200,180,200,.16)'
    g.lineWidth = 1.6
    g.stroke()
    speckle(g, 0, H * 0.7, W, H * 0.3, 900, 3)
    g.restore()
    // المنارة: أحجار متراكبة
    const baseY = this.ledgeY(fx) + 6
    const topY = fy + this.fh * 0.05
    const tot = baseY - topY
    const rr = rng(33)
    const n = 6
    for (let i = 0; i < n; i++) {
      const t0 = i / n
      const y1 = baseY - tot * t0
      const y0 = baseY - tot * (i + 1) / n
      const wBase = lerp(H * 0.075, H * 0.04, t0 + 0.05)
      const wTop = lerp(H * 0.075, H * 0.04, (i + 1) / n + 0.05)
      const jx = (rr() - 0.5) * H * 0.008
      g.beginPath()
      g.moveTo(fx - wBase + jx, y1)
      g.lineTo(fx - wTop + jx * 0.6, y0)
      g.lineTo(fx + wTop + jx * 0.6, y0 + (rr() - 0.5) * 3)
      g.lineTo(fx + wBase + jx, y1)
      g.closePath()
      const lg = g.createLinearGradient(fx - wBase, 0, fx + wBase, 0)
      lg.addColorStop(0, '#2a2530'); lg.addColorStop(0.5, '#1a171f'); lg.addColorStop(1, '#0b0a10')
      g.fillStyle = lg
      g.fill()
      g.strokeStyle = 'rgba(210,190,200,.12)'
      g.lineWidth = 1
      g.stroke()
    }
    // الوعاء
    const bw = H * 0.058
    g.beginPath()
    g.moveTo(fx - bw, topY - 2)
    g.quadraticCurveTo(fx - bw * 0.85, topY + bw * 0.9, fx, topY + bw * 0.95)
    g.quadraticCurveTo(fx + bw * 0.85, topY + bw * 0.9, fx + bw, topY - 2)
    g.closePath()
    const bg = g.createLinearGradient(fx - bw, 0, fx + bw, 0)
    bg.addColorStop(0, '#3a3030'); bg.addColorStop(0.45, '#1b1616'); bg.addColorStop(1, '#0a0808')
    g.fillStyle = bg
    g.fill()
    g.beginPath()
    g.ellipse(fx, topY - 2, bw, bw * 0.16, 0, 0, TAU)
    g.fillStyle = '#0a0808'
    g.fill()
    g.strokeStyle = 'rgba(232,196,140,.5)'
    g.lineWidth = 1.5
    g.stroke()
    this.fg = { c, g }
  }

  private wind(t: number) {
    const v = smooth(0.32, 0.72, this.nz.fbm(t * 0.34 + 3.1, 3))
    return this.finished ? Math.min(v, 0.12) : v
  }

  frame(g: CanvasRenderingContext2D, t: number, dt: number) {
    const { W, H, fx, fy } = this
    const reduced = this.env.reduced
    const want = this.isSteady || this.finished ? 1 : 0
    this.steady += (want - this.steady) * (reduced ? 1 : 1 - Math.exp(-dt * 5))
    if (!this.finished && !reduced) {
      if (this.steady > 0.8) this.progress += dt * 0.3
      else this.progress = Math.max(0, this.progress - dt * 0.09)
      if (this.progress >= 1) this.finish()
    }
    if (this.finished) this.dawn = Math.min(1, this.dawn + (reduced ? 1 : dt * 0.32))
    this.env.progress(this.progress)
    const wind = reduced ? (this.finished ? 0.05 : 0.35) : this.wind(t)
    const ex = wind * (1 - 0.88 * this.steady)
    const flick = reduced ? 0.5 : this.nz.fbm(t * 6.3 + 7, 2)
    const vigor = clamp((1 - 0.5 * ex) * (0.9 + 0.2 * flick) * (1 + 0.2 * this.steady), 0.58, 1.3)
    const fh = this.fh * vigor
    const lean = -(ex * 0.6 + (reduced ? 0 : (this.nz.fbm(t * 1.3 + 2, 2) - 0.5) * 0.12 * (1 - this.steady * 0.7)))
    const fyc = fy - this.fh * 0.35

    // سماء
    g.globalCompositeOperation = 'source-over'
    g.globalAlpha = 1
    g.drawImage(this.sky0.c, 0, 0, W, H)
    if (this.dawn > 0.001) { g.globalAlpha = this.dawn; g.drawImage(this.sky1.c, 0, 0, W, H); g.globalAlpha = 1 }
    // نجوم أخيرة قبل الفجر
    const sa = 1 - this.dawn
    if (sa > 0.02) {
      for (const st of this.stars) {
        const a = sa * (0.35 + 0.45 * (reduced ? 0.6 : Math.sin(t * 1.4 + st.ph) * 0.5 + 0.5)) * (1 - st.y * 1.2)
        if (a <= 0) continue
        g.fillStyle = `rgba(230,236,255,${a.toFixed(3)})`
        g.beginPath(); g.arc(st.x * W, st.y * H, st.r, 0, TAU); g.fill()
      }
    }
    // شمس خلف الجبال
    if (this.dawn > 0.001) {
      const d = smooth(0, 1, this.dawn)
      const sx = W * (W < H ? 0.3 : 0.27)
      const sy = H * 0.6 - d * H * 0.075
      g.globalCompositeOperation = 'lighter'
      glow(g, sx, sy, H * 0.75, hex('#ffb56a'), 0.5 * d)
      glow(g, sx, sy, H * 0.22, hex('#fff0c8'), 0.85 * d)
      g.save()
      g.translate(sx, sy)
      const rays = 8
      for (let i = 0; i < rays; i++) {
        const a0 = -Math.PI * 0.95 + (i / rays) * Math.PI * 0.9 + (reduced ? 0 : Math.sin(t * 0.1 + i) * 0.02)
        const gr = g.createLinearGradient(0, 0, Math.cos(a0) * H, Math.sin(a0) * H)
        gr.addColorStop(0, `rgba(255,225,170,${0.09 * d})`)
        gr.addColorStop(1, 'rgba(255,225,170,0)')
        g.fillStyle = gr
        g.beginPath()
        g.moveTo(0, 0)
        g.lineTo(Math.cos(a0 - 0.05) * H * 1.3, Math.sin(a0 - 0.05) * H * 1.3)
        g.lineTo(Math.cos(a0 + 0.05) * H * 1.3, Math.sin(a0 + 0.05) * H * 1.3)
        g.closePath()
        g.fill()
      }
      g.restore()
      g.globalCompositeOperation = 'source-over'
      g.fillStyle = css(hex('#fff6dc'), d)
      g.beginPath(); g.arc(sx, sy, H * 0.036, 0, TAU); g.fill()
    }
    // جبال
    g.drawImage(this.rid0.c, 0, 0, W, H)
    if (this.dawn > 0.001) { g.globalAlpha = this.dawn; g.drawImage(this.rid1.c, 0, 0, W, H); g.globalAlpha = 1 }

    // خطوط الريح
    if (!reduced) {
      for (const k of this.streaks) {
        k.x -= (wind * 420 + 30) * k.sp * dt
        if (k.x < -k.len) { k.x = W + k.len * 0.2; k.y = H * (0.32 + Math.random() * 0.5) }
        const dx = k.x - fx
        const dy = k.y - fyc
        const d = Math.hypot(dx, dy)
        const R2 = this.fh * 1.9
        if (this.steady > 0.15 && d < R2) k.y += (dy >= 0 ? 1 : -1) * Math.pow(1 - d / R2, 2) * 150 * dt * this.steady
        const a = k.a * (0.25 + wind * 1.3) * (1 - this.dawn * 0.4)
        const gr = g.createLinearGradient(k.x, 0, k.x + k.len, 0)
        gr.addColorStop(0, 'rgba(255,238,215,0)')
        gr.addColorStop(0.5, `rgba(255,238,215,${a})`)
        gr.addColorStop(1, 'rgba(255,238,215,0)')
        g.strokeStyle = gr
        g.lineWidth = 1.2
        g.beginPath()
        g.moveTo(k.x, k.y)
        g.lineTo(k.x + k.len, k.y + Math.sin(t * 0.8 + k.ph) * 5)
        g.stroke()
      }
    }

    // الحافة الأمامية والمنارة
    g.drawImage(this.fg.c, 0, 0, W, H)

    // توهّج الشعلة
    const glowA = 0.55 * vigor
    g.globalCompositeOperation = 'lighter'
    glow(g, fx, fyc, this.fh * 4.2, hex('#ff8a3a'), 0.16 * glowA)
    glow(g, fx, fyc, this.fh * 1.8, hex('#ffb04c'), 0.34 * glowA)
    // إضاءة الصخر
    const R = this.litR
    const lg = this.lit.g
    lg.globalCompositeOperation = 'source-over'
    lg.clearRect(0, 0, R * 2, R * 2)
    glow(lg, R, fyc - (fy - R), this.fh * 2.6, hex('#ffb060'), 0.9 * glowA)
    lg.globalCompositeOperation = 'destination-in'
    lg.drawImage(this.fg.c, (fx - R) * this.s, (fy - R) * this.s, R * 2 * this.s, R * 2 * this.s, 0, 0, R * 2, R * 2)
    lg.globalCompositeOperation = 'source-over'
    g.drawImage(this.lit.c, fx - R, fy - R)

    // اللهب
    this.drawFlame(g, fx, fy, fh, lean, t, vigor)
    // جمرات
    if (!reduced) this.ember(g, fx, fy, fh, lean, dt, vigor, wind)
    g.globalCompositeOperation = 'source-over'

    // الحلقة والدرع
    this.drawRing(g, fx, fyc, t)
    g.globalCompositeOperation = 'source-over'
    g.globalAlpha = 1
  }

  private drawFlame(g: CanvasRenderingContext2D, fx: number, fy: number, fh: number, lean: number, t: number, vigor: number) {
    const layers = [
      { sw: 1, sh: 1, a: 0.85, c0: 'rgba(255,120,30,', c1: 'rgba(255,60,10,' },
      { sw: 0.66, sh: 0.8, a: 0.9, c0: 'rgba(255,180,60,', c1: 'rgba(255,120,30,' },
      { sw: 0.34, sh: 0.56, a: 0.95, c0: 'rgba(255,246,196,', c1: 'rgba(255,214,120,' },
    ]
    const N = 16
    g.globalCompositeOperation = 'lighter'
    layers.forEach((L, li) => {
      const H0 = fh * L.sh
      const W0 = this.fh * 0.36 * L.sw * (0.75 + 0.25 * vigor)
      const left: [number, number][] = []
      const right: [number, number][] = []
      for (let i = 0; i <= N; i++) {
        const u = i / N
        const wob = this.env.reduced ? 0 : (this.nz.fbm(t * 3.4 + u * 2.5 + li * 9, 2) - 0.5) * 0.22 * H0 * u
        const cx = fx + lean * H0 * u * u * 1.3 + wob
        const cy = fy - H0 * u
        const wd = W0 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.62)), 1.15) * (1 - 0.35 * u)
        left.push([cx - wd, cy]); right.push([cx + wd, cy])
      }
      g.beginPath()
      g.moveTo(left[0][0], left[0][1])
      for (let i = 1; i <= N; i++) g.lineTo(left[i][0], left[i][1])
      for (let i = N; i >= 0; i--) g.lineTo(right[i][0], right[i][1])
      g.closePath()
      const gr = g.createLinearGradient(0, fy, 0, fy - H0)
      gr.addColorStop(0, L.c0 + L.a + ')')
      gr.addColorStop(0.55, L.c0 + L.a * 0.7 + ')')
      gr.addColorStop(1, L.c1 + '0)')
      g.fillStyle = gr
      g.fill()
    })
    g.globalCompositeOperation = 'source-over'
  }

  private ember(g: CanvasRenderingContext2D, fx: number, fy: number, fh: number, lean: number, dt: number, vigor: number, wind: number) {
    this.spawn += dt * (14 + 26 * vigor * (0.4 + wind))
    while (this.spawn > 1) {
      this.spawn -= 1
      if (this.embers.length > 90) break
      const max = 1.2 + Math.random() * 1.8
      this.embers.push({ x: fx + (Math.random() - 0.5) * this.fh * 0.3, y: fy - fh * (0.3 + Math.random() * 0.5), vx: (Math.random() - 0.5) * 20 + lean * 90, vy: -(30 + Math.random() * 70), life: max, max, s: 0.7 + Math.random() * 1.5 })
    }
    g.globalCompositeOperation = 'lighter'
    for (let i = this.embers.length - 1; i >= 0; i--) {
      const e = this.embers[i]
      e.life -= dt
      if (e.life <= 0) { this.embers.splice(i, 1); continue }
      e.vx += (-wind * 150 - 20) * dt * (1 - this.steady * 0.5)
      e.x += e.vx * dt
      e.y += e.vy * dt
      const k = e.life / e.max
      g.fillStyle = `rgba(255,${Math.round(120 + 110 * k)},${Math.round(40 + 60 * k)},${(k * 0.9).toFixed(3)})`
      g.beginPath(); g.arc(e.x, e.y, e.s * (0.5 + k * 0.7), 0, TAU); g.fill()
    }
  }

  private drawRing(g: CanvasRenderingContext2D, fx: number, cy: number, t: number) {
    const R = this.fh * 1.55
    const show = clamp(this.progress * 6 + this.steady * 0.7, 0, 1) * (this.finished ? 0.75 : 1)
    if (show <= 0.01) return
    g.lineCap = 'round'
    // مسار خافت
    g.strokeStyle = `rgba(232,196,140,${0.16 * show})`
    g.lineWidth = 1
    g.beginPath(); g.arc(fx, cy, R, 0, TAU); g.stroke()
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU - Math.PI / 2
      const l = i % 6 === 0 ? 8 : 4
      g.beginPath()
      g.moveTo(fx + Math.cos(a) * (R + 4), cy + Math.sin(a) * (R + 4))
      g.lineTo(fx + Math.cos(a) * (R + 4 + l), cy + Math.sin(a) * (R + 4 + l))
      g.strokeStyle = `rgba(232,196,140,${0.22 * show})`
      g.stroke()
    }
    // التقدّم
    g.strokeStyle = `rgba(255,218,150,${0.92 * show})`
    g.lineWidth = 2.4
    g.beginPath()
    g.arc(fx, cy, R, -Math.PI / 2, -Math.PI / 2 - this.progress * TAU, true)
    g.stroke()
    // درع الثبات: هلال في وجه الريح + موجة
    if (this.steady > 0.05) {
      g.strokeStyle = `rgba(255,224,170,${0.5 * this.steady})`
      g.lineWidth = 1.6
      const R2 = this.fh * 0.95
      g.beginPath(); g.arc(fx, cy, R2, -Math.PI * 0.42, Math.PI * 0.42); g.stroke()
      g.beginPath(); g.arc(fx, cy, R2 * 1.12, -Math.PI * 0.3, Math.PI * 0.3); g.stroke()
      if (!this.env.reduced) {
        const f = (t * 0.7) % 1
        g.strokeStyle = `rgba(255,224,170,${0.28 * this.steady * (1 - f)})`
        g.beginPath(); g.arc(fx, cy, R2 + f * this.fh * 0.7, 0, TAU); g.stroke()
      }
    }
    g.lineCap = 'butt'
  }
}

export default function Courage(p: SceneProps) {
  const { canvas, api, point } = useEngine((env) => new CourageEngine(env), { reduced: p.reduced, mode: p.mode, done: p.done, onComplete: p.onComplete, chime: p.chime, tick: p.tick, pour: p.pour })
  const [steady, setSteady] = useState(false)
  const t0 = useRef(0)
  const pid = useRef(-1)
  void point

  const down = (e: React.PointerEvent) => {
    if (pid.current !== -1) return
    pid.current = e.pointerId
    t0.current = performance.now()
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    api.current?.setSteady(true)
    setSteady(true)
    p.tick()
  }
  const up = (e: React.PointerEvent) => {
    if (e.pointerId !== pid.current) return
    pid.current = -1
    const quick = performance.now() - t0.current < 260
    const a = api.current
    if (!a) return
    a.setSteady(false)
    if (quick) a.toggleLatch()
    setSteady(a.isSteady)
  }
  const key = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (e.repeat) return
      const a = api.current
      if (!a) return
      a.toggleLatch()
      p.tick()
      setSteady(a.isSteady)
    }
  }
  const click = (e: React.MouseEvent) => {
    // تفعيل من قارئ الشاشة (بلا مؤشر ولا لوحة مفاتيح)
    if (e.detail !== 0) return
    const a = api.current
    if (!a) return
    a.toggleLatch()
    setSteady(a.isSteady)
  }

  return (
    <>
      <canvas ref={canvas} className="vsc-canvas vsc-press" role="img" aria-label="مشهد: جبال عند الفجر، وعلى منارة حجرية شعلة صغيرة تقاوم الريح" onPointerDown={down} onPointerUp={up} onPointerCancel={up} />
      <div className="vc">
        <p className="vc__hint" aria-live="polite">{p.done ? p.data.cue : p.data.action}</p>
        <button className={`btn btn--gold vbtn ${steady ? 'is-on' : ''}`} aria-pressed={steady} onPointerDown={down} onPointerUp={up} onPointerCancel={up} onKeyDown={key} onClick={click}>
          {p.data.altLabel}
        </button>
      </div>
    </>
  )
}

export type { RGB }
