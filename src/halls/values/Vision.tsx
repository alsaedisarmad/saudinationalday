import { useEffect, useRef, useState } from 'react'
import { useEngine, makeNoise, rng, clamp, lerp, smooth, easeOut, hex, glow, mkCanvas, TAU, type Engine, type Env } from './kit'
import { IconBack, IconNext } from '../../ui/icons'
import type { SceneProps } from './types'

/**
 * الرؤية — سماء ليل، وعدسة برونزية تُسحب على النجوم. كلما اقتربت من أشدّ النجوم لمعانًا
 * «تركّزت» الصورة داخل العدسة: تتجمّع النجوم فتصير أفقًا رمزيًا (تصوّر إبداعي، لا يمثّل مشروعًا بعينه).
 */
interface Star { x: number; y: number; r: number; b: number; ph: number; w: number }

class VisionEngine implements Engine {
  W = 0; H = 0; s = 1
  sky = mkCanvas(1, 1)
  stars: Star[] = []
  R = 100
  lx = 0; ly = 0; tx = 0; ty = 0
  fx = 0; fy = 0
  res = 0
  hold = 0
  finished = false
  grab: { id: number; ox: number; oy: number } | null = null
  onLens?: (u: number) => void
  nodes: { sx: number; sy: number; ex: number; ey: number }[] = []
  line: [number, number][] = []
  mull: [number, number, number][] = []
  shoot: { x: number; y: number; vx: number; vy: number; life: number } | null = null
  nextShoot = 6
  nz = makeNoise(4)

  constructor(private env: Env) {
    if (env.done) { this.res = 1; this.finished = true }
    const r = rng(77)
    const N = env.mode === 'mobile' ? 620 : 1000
    for (let i = 0; i < N; i++) {
      const band = i > N * 0.62
      let x = r(); let y = Math.pow(r(), 0.85) * 0.8
      if (band) { const t = r(); const off = (r() + r() + r() - 1.5) * 0.11; x = 0.04 + t * 0.92 + off * 0.3; y = 0.82 - t * 0.74 + off }
      const m = Math.pow(r(), 3.4)
      this.stars.push({ x: clamp(x, 0, 1), y: clamp(y, 0, 0.82), r: 0.35 + m * 1.75, b: 0.28 + m * 0.72, ph: r() * TAU, w: r() })
    }
    this.buildHorizon()
  }

  /** أفق المستقبل الرمزي بإحداثيات محلية (وحدة = نصف قطر العدسة): كتل هندسية، قوس مدبّب، برجان رفيعان */
  private buildHorizon() {
    const y0 = 0.3
    const blocks: [number, number, number, 'flat' | 'tri' | 'arch' | 'spire' | 'step'][] = [
      [-0.95, -0.78, 0.14, 'flat'], [-0.78, -0.6, 0.3, 'step'], [-0.6, -0.42, 0.2, 'tri'], [-0.42, -0.26, 0.48, 'spire'],
      [-0.26, -0.06, 0.26, 'arch'], [-0.06, 0.12, 0.18, 'flat'], [0.12, 0.3, 0.4, 'step'], [0.3, 0.45, 0.24, 'tri'],
      [0.45, 0.6, 0.56, 'spire'], [0.6, 0.78, 0.22, 'flat'], [0.78, 0.95, 0.12, 'tri'],
    ]
    const line: [number, number][] = [[-1.05, y0]]
    const mull: [number, number, number][] = []
    for (const [a, b, h, k] of blocks) {
      const top = y0 - h
      const m = (a + b) / 2
      line.push([a, y0], [a, top])
      if (k === 'tri') line.push([m, top - 0.13])
      else if (k === 'arch') { line.push([a + 0.02, top - 0.05], [m, top - 0.16], [b - 0.02, top - 0.05]) }
      else if (k === 'spire') line.push([m - 0.03, top], [m, top - 0.2], [m + 0.03, top])
      else if (k === 'step') line.push([a + (b - a) * 0.3, top], [a + (b - a) * 0.3, top - 0.08], [b - (b - a) * 0.3, top - 0.08], [b - (b - a) * 0.3, top])
      line.push([b, top], [b, y0])
      for (let x = a + 0.05; x < b - 0.03; x += 0.05) mull.push([x, top + 0.03, y0 - 0.02])
    }
    line.push([1.05, y0])
    this.line = line
    const r = rng(19)
    this.mull = mull
    // كل نقطة على الخط تصير «نجمة» تنجذب إليه: نبدأ من مواضع عشوائية داخل العدسة
    this.nodes = line.filter((_, i) => i % 2 === 1 || i < 2).map(([ex, ey]) => ({ ex, ey, sx: (r() - 0.5) * 1.7, sy: (r() - 0.5) * 1.4 - 0.15 }))
  }

  setU(u: number) {
    const [x, y] = this.pathAt(u)
    this.tx = x; this.ty = y
    if (this.env.reduced) { this.lx = x; this.ly = y; this.updateReduced() }
    this.env.invalidate()
  }
  getU() {
    const [x0, x1] = this.xr()
    return clamp((this.lx - x0) / (x1 - x0))
  }
  private xr(): [number, number] {
    return [this.R * 1.05, this.W - this.R * 1.05]
  }
  private pathAt(u: number): [number, number] {
    const [x0, x1] = this.xr()
    const x = lerp(x0, x1, clamp(u))
    const y = this.fy + Math.sin((x - this.fx) / this.W * 2.4) * this.H * 0.13
    return this.clampLens(x, y)
  }
  private clampLens(x: number, y: number): [number, number] {
    const R = this.R
    const top = R * 1.02 + this.H * (this.W < this.H ? 0.3 : 0.16)
    return [clamp(x, R * 1.02, this.W - R * 1.02), clamp(y, top, this.H * 0.8 - R * 0.9)]
  }

  resize(w: number, h: number, s: number) {
    const portrait = w < h
    const keep = this.W ? { u: this.getU() } : null
    this.W = w; this.H = h; this.s = s
    this.R = portrait ? Math.min(w * 0.3, h * 0.15) : h * 0.185
    this.fx = portrait ? w * 0.3 : w * 0.34
    this.fy = portrait ? h * 0.45 : h * 0.37
    const [sx, sy] = this.pathAt(keep ? keep.u : portrait ? 0.72 : 0.52)
    if (!keep || !this.grab) { this.lx = this.tx = sx; this.ly = this.ty = sy }
    if (this.env.done) { this.lx = this.tx = this.fx; this.ly = this.ty = this.fy }
    this.buildSky()
  }

  private buildSky() {
    const { W, H, s } = this
    const { c, g } = mkCanvas(W * s, H * s)
    g.scale(s, s)
    const sky = g.createLinearGradient(0, 0, 0, H * 0.82)
    sky.addColorStop(0, '#02060c'); sky.addColorStop(0.5, '#08132a'); sky.addColorStop(0.85, '#182848'); sky.addColorStop(1, '#2a3458')
    g.fillStyle = sky
    g.fillRect(0, 0, W, H)
    // درب التبانة: توهّج خافت على قطر الشاشة
    g.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 16; i++) {
      const t = i / 15
      glow(g, W * (0.04 + t * 0.92), H * (0.82 - t * 0.74) + Math.sin(t * 9) * H * 0.02, H * (0.16 + 0.08 * Math.sin(t * 3.1)), hex('#8fa6d8'), 0.045)
    }
    for (const st of this.stars) {
      const px = st.x * W; const py = st.y * H
      const warm = st.w > 0.7
      g.fillStyle = warm ? `rgba(255,232,196,${st.b})` : `rgba(214,226,255,${st.b})`
      g.beginPath(); g.arc(px, py, st.r * (W < H ? 0.85 : 1), 0, TAU); g.fill()
      if (st.r > 1.5) glow(g, px, py, st.r * 5, warm ? hex('#ffe2b0') : hex('#c8d8ff'), 0.22)
    }
    g.globalCompositeOperation = 'source-over'
    // كثبان
    const dune = (base: number, amp: number, seed: number, col: string) => {
      g.beginPath(); g.moveTo(0, H)
      for (let x = 0; x <= W + 4; x += 4) g.lineTo(x, H * base - amp * H * (this.nz.fbm(x * 0.0022 + seed, 3) - 0.3))
      g.lineTo(W, H); g.closePath(); g.fillStyle = col; g.fill()
    }
    const haze = g.createLinearGradient(0, H * 0.7, 0, H * 0.88)
    haze.addColorStop(0, 'rgba(90,110,160,0)'); haze.addColorStop(1, 'rgba(120,120,150,.22)')
    g.fillStyle = haze; g.fillRect(0, H * 0.7, W, H * 0.2)
    dune(0.86, 0.09, 5, '#0a1220')
    dune(0.94, 0.08, 40, '#03060a')
    this.sky = { c, g }
  }

  private updateReduced() {
    const d = Math.hypot(this.lx - this.fx, this.ly - this.fy)
    this.res = 1 - smooth(this.R * 0.28, this.R * 2.2, d)
    if (this.res > 0.97) { this.res = 1; this.done() }
  }

  private done() {
    if (this.finished) return
    this.finished = true
    this.env.chime(5)
    this.env.complete()
  }

  down(x: number, y: number, id: number) {
    const inside = Math.hypot(x - this.lx, y - this.ly) < this.R * 1.05
    this.grab = { id, ox: inside ? this.lx - x : 0, oy: inside ? this.ly - y : 0 }
    this.move(x, y)
  }
  move(x: number, y: number) {
    if (!this.grab) return
    const [tx, ty] = this.clampLens(x + this.grab.ox, y + this.grab.oy)
    this.tx = tx; this.ty = ty
    if (this.env.reduced) { this.lx = tx; this.ly = ty; this.updateReduced() }
    this.env.invalidate()
  }
  up() { this.grab = null }

  frame(g: CanvasRenderingContext2D, t: number, dt: number) {
    const { W, H, R } = this
    const reduced = this.env.reduced
    if (!reduced) {
      const k = 1 - Math.exp(-dt * 13)
      this.lx += (this.tx - this.lx) * k
      this.ly += (this.ty - this.ly) * k
      const d = Math.hypot(this.lx - this.fx, this.ly - this.fy)
      const target = 1 - smooth(R * 0.28, R * 2.2, d)
      this.res += (target - this.res) * (1 - Math.exp(-dt * (target > this.res ? 3.2 : 2)))
      if (this.res > 0.985) { this.hold += dt; if (this.hold > 0.7) this.done() } else this.hold = 0
      this.onLens?.(this.getU())
    }
    this.env.progress(this.res)
    g.globalAlpha = 1
    g.globalCompositeOperation = 'source-over'
    g.drawImage(this.sky.c, 0, 0, W, H)

    // وميض النجوم اللامعة + شهاب
    if (!reduced) {
      g.globalCompositeOperation = 'lighter'
      for (let i = 0; i < this.stars.length; i += 6) {
        const st = this.stars[i]
        if (st.r < 1) continue
        const a = 0.18 * Math.sin(t * (1 + st.w * 2.4) + st.ph)
        if (a > 0) glow(g, st.x * W, st.y * H, st.r * 6, hex('#cfe0ff'), a)
      }
      this.nextShoot -= dt
      if (this.nextShoot <= 0 && !this.shoot) { this.shoot = { x: W * (0.5 + Math.random() * 0.45), y: H * (0.06 + Math.random() * 0.2), vx: -W * 0.5, vy: H * 0.2, life: 0.9 }; this.nextShoot = 9 + Math.random() * 8 }
      if (this.shoot) {
        const sh = this.shoot
        sh.life -= dt; sh.x += sh.vx * dt; sh.y += sh.vy * dt
        const gr = g.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 0.22, sh.y - sh.vy * 0.22)
        gr.addColorStop(0, `rgba(255,245,220,${clamp(sh.life)})`); gr.addColorStop(1, 'rgba(255,245,220,0)')
        g.strokeStyle = gr; g.lineWidth = 1.6
        g.beginPath(); g.moveTo(sh.x, sh.y); g.lineTo(sh.x - sh.vx * 0.22, sh.y - sh.vy * 0.22); g.stroke()
        if (sh.life <= 0) this.shoot = null
      }
      g.globalCompositeOperation = 'source-over'
    }

    // نجم الاتجاه
    this.drawGuide(g, t)
    this.drawLens(g, t)
  }

  private drawGuide(g: CanvasRenderingContext2D, t: number) {
    const { fx, fy, R } = this
    const p = this.env.reduced ? 0.6 : 0.5 + 0.5 * Math.sin(t * 1.6)
    const a = 1 - this.res * 0.7
    g.globalCompositeOperation = 'lighter'
    glow(g, fx, fy, R * 0.85, hex('#ffe3a8'), (0.16 + 0.1 * p) * a)
    glow(g, fx, fy, R * 0.22, hex('#fff4d6'), 0.9 * a)
    g.strokeStyle = `rgba(255,236,190,${0.55 * a})`
    g.lineWidth = 1
    const L = R * (0.32 + 0.08 * p)
    g.beginPath()
    g.moveTo(fx - L, fy); g.lineTo(fx + L, fy); g.moveTo(fx, fy - L); g.lineTo(fx, fy + L)
    g.stroke()
    g.globalCompositeOperation = 'source-over'
  }

  private drawLens(g: CanvasRenderingContext2D, t: number) {
    const { W, H, R, lx, ly } = this
    const r = this.res
    const rr = easeOut(r)
    const M = 1.55
    g.save()
    g.beginPath(); g.arc(lx, ly, R, 0, TAU); g.clip()
    // سماء مكبّرة
    g.translate(lx, ly); g.scale(M, M); g.translate(-lx, -ly)
    g.drawImage(this.sky.c, 0, 0, W, H)
    g.globalCompositeOperation = 'lighter'
    g.globalAlpha = 0.55
    g.drawImage(this.sky.c, 0, 0, W, H)
    g.globalAlpha = 1
    g.globalCompositeOperation = 'source-over'
    g.setTransform(this.s, 0, 0, this.s, 0, 0)
    g.fillStyle = 'rgba(8,16,34,.16)'
    g.fillRect(lx - R, ly - R, R * 2, R * 2)
    // سماء المستقبل: يتحوّل الليل إلى فجر عند الأفق
    if (r > 0.01) {
      const fs = g.createLinearGradient(0, ly - R, 0, ly + R)
      fs.addColorStop(0, '#08142a'); fs.addColorStop(0.5, '#1b3550'); fs.addColorStop(0.72, '#6f6a62'); fs.addColorStop(0.86, '#d29a62'); fs.addColorStop(1, '#f0c98c')
      g.globalAlpha = r * 0.9
      g.fillStyle = fs
      g.fillRect(lx - R, ly - R, R * 2, R * 2)
      g.globalAlpha = 1
      // الأفق
      g.save()
      g.translate(lx, ly); g.scale(R, R)
      g.globalAlpha = smooth(0.25, 0.9, r)
      // أرض
      g.fillStyle = 'rgba(6,12,20,.92)'
      g.fillRect(-1.2, 0.3, 2.4, 1)
      // خطوط
      g.lineJoin = 'miter'
      g.lineWidth = 1.6 / R
      g.strokeStyle = 'rgba(255,226,166,.95)'
      g.beginPath()
      this.line.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
      g.stroke()
      g.lineWidth = 1 / R
      g.strokeStyle = 'rgba(143,208,169,.5)'
      g.beginPath()
      for (const [x, y0, y1] of this.mull) { g.moveTo(x, y0); g.lineTo(x, y1) }
      g.stroke()
      // خط الأفق الممتد وانعكاس
      g.strokeStyle = 'rgba(255,226,166,.5)'
      g.beginPath(); g.moveTo(-1.2, 0.3); g.lineTo(1.2, 0.3); g.stroke()
      g.strokeStyle = 'rgba(255,226,166,.14)'
      for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(-1 + i * 0.05, 0.3 + i * 0.07); g.lineTo(1 - i * 0.05, 0.3 + i * 0.07); g.stroke() }
      g.restore()
      // النجوم تستقرّ على رؤوس الخط
      g.globalCompositeOperation = 'lighter'
      for (const n of this.nodes) {
        const e = rr
        const x = lx + lerp(n.sx, n.ex, e) * R
        const y = ly + lerp(n.sy, n.ey, e) * R
        const rad = lerp(1.2, 2.4, e)
        glow(g, x, y, rad * 5, hex('#ffe2a8'), 0.55 * r)
        g.fillStyle = `rgba(255,246,220,${0.5 + 0.5 * r})`
        g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill()
      }
      g.globalCompositeOperation = 'source-over'
    }
    // تركيز: حلقة متقطعة تنكمش
    g.strokeStyle = `rgba(255,226,166,${0.55 - 0.3 * r})`
    g.lineWidth = 1
    g.setLineDash([3, 6])
    g.beginPath(); g.arc(lx, ly, lerp(R * 0.55, R * 0.2, rr), 0, TAU); g.stroke()
    g.setLineDash([])
    // لمعة الزجاج
    const sh = g.createLinearGradient(lx - R, ly - R, lx + R * 0.2, ly + R * 0.2)
    sh.addColorStop(0, 'rgba(255,255,255,.12)'); sh.addColorStop(0.35, 'rgba(255,255,255,.02)'); sh.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = sh
    g.fillRect(lx - R, ly - R, R * 2, R * 2)
    const vg = g.createRadialGradient(lx, ly, R * 0.7, lx, ly, R)
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.4)')
    g.fillStyle = vg
    g.fillRect(lx - R, ly - R, R * 2, R * 2)
    g.restore()

    // الحلقة البرونزية
    const ring = g.createLinearGradient(lx - R, ly - R, lx + R, ly + R)
    ring.addColorStop(0, '#f4dda6'); ring.addColorStop(0.45, '#9a7433'); ring.addColorStop(0.7, '#e2c27c'); ring.addColorStop(1, '#6b4d1c')
    g.lineWidth = Math.max(5, R * 0.05)
    g.strokeStyle = '#120c06'
    g.beginPath(); g.arc(lx, ly, R + g.lineWidth * 0.25, 0, TAU); g.stroke()
    g.lineWidth = Math.max(3.5, R * 0.036)
    g.strokeStyle = ring
    g.beginPath(); g.arc(lx, ly, R + 1, 0, TAU); g.stroke()
    g.lineWidth = 1
    g.strokeStyle = 'rgba(232,196,140,.55)'
    g.beginPath(); g.arc(lx, ly, R + R * 0.095, 0, TAU); g.stroke()
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * TAU
      const l = i % 6 === 0 ? R * 0.07 : R * 0.032
      g.beginPath()
      g.moveTo(lx + Math.cos(a) * (R + R * 0.095), ly + Math.sin(a) * (R + R * 0.095))
      g.lineTo(lx + Math.cos(a) * (R + R * 0.095 + l), ly + Math.sin(a) * (R + R * 0.095 + l))
      g.strokeStyle = 'rgba(232,196,140,.5)'
      g.stroke()
    }
    // معيّنات على الجهات الأربع (نقش هندسي خفيف)
    g.fillStyle = '#e8c98a'
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU
      const cx = lx + Math.cos(a) * (R + R * 0.06)
      const cy = ly + Math.sin(a) * (R + R * 0.06)
      const d = R * 0.045
      g.beginPath(); g.moveTo(cx, cy - d); g.lineTo(cx + d, cy); g.lineTo(cx, cy + d); g.lineTo(cx - d, cy); g.closePath(); g.fill()
    }
    // وسم «تصوّر إبداعي» يرافق العدسة
    const a = smooth(0.12, 0.55, r)
    if (a > 0.01) {
      const fs = Math.max(13, Math.round(H * 0.017))
      g.font = `600 ${fs}px "IBM Plex Sans Arabic", sans-serif`
      g.direction = 'rtl'
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      const label = 'تصوّر إبداعي'
      const tw = g.measureText(label).width + fs * 1.6
      const bx = lx
      const by = ly + R + R * 0.28
      g.globalAlpha = a
      g.fillStyle = 'rgba(4,8,14,.82)'
      g.fillRect(bx - tw / 2, by - fs * 0.85, tw, fs * 1.7)
      g.setLineDash([4, 4])
      g.strokeStyle = '#E7C77A'
      g.lineWidth = 1
      g.strokeRect(bx - tw / 2, by - fs * 0.85, tw, fs * 1.7)
      g.setLineDash([])
      g.fillStyle = '#F3DCA0'
      g.fillText(label, bx, by + 1)
      g.globalAlpha = 1
    }
    void t
  }
}

export default function Vision(p: SceneProps) {
  const [bucket, setBucket] = useState(0)
  const last = useRef(0)
  const range = useRef<HTMLInputElement>(null)
  const { canvas, api, point } = useEngine((env) => new VisionEngine(env), {
    reduced: p.reduced, mode: p.mode, done: p.done, onComplete: p.onComplete, chime: p.chime, tick: p.tick, pour: p.pour,
    onProgress: (v) => { const b = Math.round(v * 4); if (b !== last.current) { last.current = b; setBucket(b) } },
  })
  useEffect(() => {
    const e = api.current
    if (e) e.onLens = (u) => { if (range.current && document.activeElement !== range.current) range.current.value = String(Math.round(u * 100)) }
    if (e && range.current) range.current.value = String(Math.round(e.getU() * 100))
  }, [api, p.reduced, p.mode])

  const step = (d: number) => {
    const e = api.current
    if (!e) return
    e.setU(clamp(e.getU() + d))
    p.tick()
    if (range.current) range.current.value = String(Math.round(e.getU() * 100))
  }
  const txt = ['العدسة بعيدة عن النجم المضيء', 'اقتربت قليلًا من النجم المضيء', 'العدسة قريبة: الصورة تتضح', 'كادت الصورة تتركّز', 'تركّزت الصورة: أفقٌ رمزي داخل العدسة'][bucket]

  return (
    <>
      <canvas
        ref={canvas}
        className="vsc-canvas vsc-drag"
        role="img"
        aria-label="سماء ليل مرصّعة بالنجوم وعدسة برونزية يمكن سحبها؛ داخل العدسة تتجمّع النجوم في أفق رمزي (تصوّر إبداعي)"
        onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); const q = point(e); api.current?.down(q.x, q.y, e.pointerId); p.tick() }}
        onPointerMove={(e) => { if (e.buttons || e.pointerType === 'touch') { const q = point(e); api.current?.move(q.x, q.y) } }}
        onPointerUp={() => api.current?.up()}
        onPointerCancel={() => api.current?.up()}
      />
      <div className="vc">
        {!p.done && <p className="vc__hint">{p.data.action}</p>}
        <div className="vis__row" dir="ltr">
          <button className="btn btn--icon" onClick={() => step(-0.08)} aria-label="حرّك العدسة إلى اليسار"><IconNext /></button>
          <input
            ref={range}
            className="vis__range"
            type="range"
            min={0}
            max={100}
            step={1}
            defaultValue={80}
            aria-label={p.data.altLabel}
            aria-valuetext={txt}
            onChange={(e) => { api.current?.setU(Number(e.target.value) / 100) }}
          />
          <button className="btn btn--icon" onClick={() => step(0.08)} aria-label="حرّك العدسة إلى اليمين"><IconBack /></button>
        </div>
        <span className="sr-only" aria-live="polite">{txt}</span>
      </div>
      <style>{`
.vsc-drag{cursor:grab}
.vsc-drag:active{cursor:grabbing}
.vis__row{display:flex;align-items:center;gap:var(--s2);width:min(86vw,38rem)}
.vis__range{flex:1;height:calc(var(--target)*.9);accent-color:#E7B04A;background:transparent;cursor:pointer}
`}</style>
    </>
  )
}
