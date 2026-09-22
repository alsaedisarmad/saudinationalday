import { useEffect, useRef } from 'react'
import { useEngine, makeNoise, rng, clamp, lerp, smooth, hex, mix, css, glow, mkCanvas, TAU, type Engine, type Env } from './kit'
import { IconBack } from '../../ui/icons'
import type { SceneProps } from './types'

/**
 * الهمّة — صعود: مدينة طينية على الطراز النجدي (مثلّثات وشرفات مسنّنة) تنمو وتتحوّل كلما صعدت إلى أبراج حديثة مضيئة،
 * والسماء تنتقل من غسق دافئ إلى ليل. اسحب إلى أعلى، أو استعمل «اصعد/انزل» أو مقبض الخيط.
 */
interface B { x: number; w: number; oldH: number; newH: number; layer: 0 | 1 | 2; o: number; kind: number; seed: number }

class AmbitionEngine implements Engine {
  W = 0; H = 0; s = 1
  p = 0; tp = 0
  finished = false
  bs: B[] = []
  tiles: CanvasPattern[] = []
  motes: { x: number; y: number; v: number; a: number }[] = []
  stars: { x: number; y: number; r: number; ph: number }[] = []
  drag: { id: number; y0: number; p0: number } | null = null
  nz = makeNoise(8)
  onP?: (p: number) => void
  palms = mkCanvas(1, 1)

  constructor(private env: Env) {
    if (env.done) { this.p = this.tp = 1; this.finished = true }
    const r = rng(41)
    const mob = env.mode === 'mobile'
    const per: [0 | 1 | 2, number][] = [[0, mob ? 11 : 22], [1, mob ? 8 : 15], [2, mob ? 5 : 11]]
    for (const [layer, n] of per) {
      for (let i = 0; i < n; i++) {
        const x = (i + 0.2 + r() * 0.6) / n
        const oldH = [0.06, 0.09, 0.12][layer] + r() * [0.08, 0.1, 0.17][layer]
        const newH = [0.2, 0.32, 0.5][layer] + r() * [0.16, 0.2, 0.34][layer]
        this.bs.push({ x, w: (1 / n) * (0.62 + r() * 0.3), oldH, newH, layer, o: 0.42 * (1 - x) + r() * 0.1, kind: Math.floor(r() * 4), seed: r() })
      }
    }
    this.stars = Array.from({ length: 150 }, () => ({ x: r(), y: r() * 0.7, r: 0.4 + r() * 1.2, ph: r() * TAU }))
    this.motes = Array.from({ length: 46 }, () => ({ x: r(), y: r(), v: 0.01 + r() * 0.03, a: 0.25 + r() * 0.5 }))
  }

  climb(d: number) {
    this.tp = clamp(this.tp + d)
    if (this.env.reduced) { this.p = this.tp; this.check() }
    this.env.invalidate()
  }
  setP(v: number) {
    this.tp = clamp(v)
    if (this.env.reduced) { this.p = this.tp; this.check() }
    this.env.invalidate()
  }
  down(y: number, id: number) { this.drag = { id, y0: y, p0: this.tp } }
  move(y: number) {
    if (!this.drag) return
    this.setP(this.drag.p0 + (this.drag.y0 - y) / (this.H * 0.62))
  }
  up() { this.drag = null }

  private check() {
    if (this.finished || this.p < 0.985) return
    this.finished = true
    this.env.chime(5)
    this.env.complete()
  }

  resize(w: number, h: number, s: number) {
    this.W = w; this.H = h; this.s = s
    this.tiles = [0, 1, 2].map((k) => {
      const { c, g } = mkCanvas(48, 72)
      const r = rng(200 + k)
      for (let cx = 0; cx < 6; cx++) {
        for (let cy = 0; cy < 6; cy++) {
          if (r() > [0.28, 0.4, 0.52][k]) continue
          const warm = r() < 0.82
          g.fillStyle = warm ? (r() < 0.5 ? '#ffd58a' : '#ffe9b8') : '#bfe4ff'
          g.fillRect(cx * 8 + 2, cy * 12 + 3, 4, 6)
        }
      }
      return g.createPattern(c, 'repeat')!
    })
    // نخيل خافت في الأرض القديمة
    const { c, g } = mkCanvas(w * s, h * s)
    g.scale(s, s)
    const r = rng(5)
    g.fillStyle = '#0c0805'
    for (const fx of [0.05, 0.16, 0.84, 0.95]) {
      const x = fx * w
      const top = h * (0.64 + r() * 0.03)
      g.strokeStyle = '#0c0805'; g.lineWidth = Math.max(4, h * 0.008)
      g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + (r() - 0.5) * 24, (top + h) / 2, x, top); g.stroke()
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI * 0.97 + (i / 8) * Math.PI * 0.94
        const L = h * (0.075 + r() * 0.025)
        const ex = x + Math.cos(a) * L, ey = top + Math.sin(a) * L + L * 0.38
        g.beginPath(); g.moveTo(x, top)
        g.quadraticCurveTo(x + Math.cos(a) * L * 0.6, top + Math.sin(a) * L * 0.6 - L * 0.24, ex, ey)
        g.quadraticCurveTo(x + Math.cos(a) * L * 0.6, top + Math.sin(a) * L * 0.6 - L * 0.02, x, top + 2)
        g.fill()
      }
    }
    this.palms = { c, g }
  }

  frame(g: CanvasRenderingContext2D, t: number, dt: number) {
    const { W, H } = this
    const reduced = this.env.reduced
    if (!reduced) {
      this.p += (this.tp - this.p) * (1 - Math.exp(-dt * 5.5))
      if (Math.abs(this.tp - this.p) < 0.0004) this.p = this.tp
      this.check()
    }
    this.onP?.(this.p)
    this.env.progress(this.p)
    const p = this.p
    const night = smooth(0.15, 0.85, p)
    g.globalAlpha = 1
    g.globalCompositeOperation = 'source-over'

    // السماء: غسق دافئ ← ليل
    const sky = g.createLinearGradient(0, 0, 0, H * 0.85)
    sky.addColorStop(0, mix('#2f2d55', '#040915', night))
    sky.addColorStop(0.45, mix('#8a5566', '#0b1a33', night))
    sky.addColorStop(0.75, mix('#e08f5d', '#173453', night))
    sky.addColorStop(1, mix('#f6c98a', '#28506a', night))
    g.fillStyle = sky
    g.fillRect(0, 0, W, H)
    // نجوم
    const sa = smooth(0.3, 0.9, p)
    if (sa > 0.01) {
      for (const st of this.stars) {
        const a = sa * (0.3 + 0.5 * (reduced ? 0.6 : 0.5 + 0.5 * Math.sin(t * 1.3 + st.ph)))
        g.fillStyle = `rgba(226,234,255,${a * (1 - st.y * 0.8)})`
        g.beginPath(); g.arc(st.x * W, st.y * H, st.r, 0, TAU); g.fill()
      }
    }
    // شمس الغروب تغيب وهي تبتعد
    const sunA = 1 - smooth(0.05, 0.55, p)
    g.globalCompositeOperation = 'lighter'
    if (sunA > 0.01) {
      const sx = W * 0.22, sy = H * (0.68 + p * 0.25)
      glow(g, sx, sy, H * 0.7, hex('#ffa960'), 0.42 * sunA)
      glow(g, sx, sy, H * 0.16, hex('#fff1cc'), 0.8 * sunA)
    }
    glow(g, W * 0.5, H * 0.86, W * 0.55, hex('#4fa6a0'), 0.12 * night)
    g.globalCompositeOperation = 'source-over'

    // المدينة: ثلاث طبقات بعمق
    const cam = easeCam(p) * H * 0.17
    for (let layer = 0; layer < 3; layer++) {
      const base = H * [0.72, 0.79, 0.86][layer] + cam * [0.45, 0.75, 1.1][layer]
      const haze = [0.55, 0.28, 0]
      for (const b of this.bs) {
        if (b.layer !== layer) continue
        const e = smooth(b.o, b.o + 0.5, p)
        const h = lerp(b.oldH, b.newH, e) * H
        this.building(g, b, base, h, e, night, haze[layer])
      }
      // ضباب بين الطبقات
      if (layer < 2) {
        const mg = g.createLinearGradient(0, base - H * 0.16, 0, base + H * 0.04)
        mg.addColorStop(0, css(hex(mixHex('#f0b98a', '#1c3a58', night)), 0))
        mg.addColorStop(1, css(hex(mixHex('#f0b98a', '#1c3a58', night)), 0.3))
        g.fillStyle = mg
        g.fillRect(0, base - H * 0.16, W, H * 0.2)
      }
    }
    // أرض أمامية ونخيل يخفت
    g.fillStyle = mix('#140d09', '#060a10', night)
    g.fillRect(0, H * 0.86 + cam * 1.1, W, H)
    g.globalAlpha = 1 - smooth(0.05, 0.5, p)
    g.drawImage(this.palms.c, 0, cam * 1.1, W, H)
    g.globalAlpha = 1

    // شُهب الهمّة: ذرّات ذهبية صاعدة
    if (!reduced) {
      g.globalCompositeOperation = 'lighter'
      const speed = 1 + Math.abs(this.tp - this.p) * 30
      for (const m of this.motes) {
        m.y -= m.v * dt * speed
        if (m.y < -0.02) { m.y = 1.02; m.x = Math.random() }
        g.fillStyle = `rgba(255,214,140,${m.a * (0.4 + 0.6 * Math.sin(Math.PI * clamp(m.y)))})`
        g.beginPath(); g.arc(m.x * W + Math.sin(t * 0.7 + m.y * 8) * 8, m.y * H, 1.3, 0, TAU); g.fill()
      }
      g.globalCompositeOperation = 'source-over'
    }
    // وهج القمة عند الاكتمال
    if (p > 0.9) {
      g.globalCompositeOperation = 'lighter'
      glow(g, W * 0.5, H * 0.25, H * 0.7, hex('#ffe0a0'), 0.12 * smooth(0.9, 1, p))
      g.globalCompositeOperation = 'source-over'
    }
  }

  private building(g: CanvasRenderingContext2D, b: B, base: number, h: number, e: number, night: number, haze: number) {
    const { W, H } = this
    const w = b.w * W
    const x = b.x * W - w / 2
    const top = base - h
    const s = smooth(0.35, 0.8, e)
    const hazeC = mixHex('#c98a6a', '#1d3a56', night)
    // طين نجدي: جدران مائلة قليلًا وشرفات مثلثة
    if (s < 0.99) {
      const a = 1 - s
      g.globalAlpha = a
      const mud = g.createLinearGradient(x, 0, x + w, 0)
      mud.addColorStop(0, mix(mixHex('#b07a52', '#2b3a58', night * 0.7), hazeC, haze))
      mud.addColorStop(0.6, mix(mixHex('#7a4c32', '#1b2740', night * 0.7), hazeC, haze))
      mud.addColorStop(1, mix(mixHex('#4a2c1e', '#0f1626', night * 0.7), hazeC, haze))
      g.fillStyle = mud
      const inset = w * 0.04
      g.beginPath()
      g.moveTo(x, base + 4); g.lineTo(x + inset, top); g.lineTo(x + w - inset, top); g.lineTo(x + w, base + 4); g.closePath(); g.fill()
      // طبقة علوية أصغر لبعض الأبنية (طابق مرتد)
      const up = b.kind % 2 === 0 ? h * 0.22 : 0
      // شرفات مثلثة
      const tw = Math.max(6, H * 0.016)
      const n = Math.max(2, Math.floor((w - inset * 2) / tw))
      const ww = (w - inset * 2) / n
      g.beginPath()
      for (let i = 0; i < n; i++) { g.moveTo(x + inset + i * ww, top + 1); g.lineTo(x + inset + i * ww + ww / 2, top - tw * 0.85); g.lineTo(x + inset + (i + 1) * ww, top + 1) }
      g.fill()
      if (up > 0) {
        const ux = x + w * 0.2, uw = w * 0.6
        g.fillRect(ux, top - up, uw, up + 1)
        const un = Math.max(2, Math.floor(uw / tw)), uww = uw / un
        g.beginPath()
        for (let i = 0; i < un; i++) { g.moveTo(ux + i * uww, top - up + 1); g.lineTo(ux + i * uww + uww / 2, top - up - tw * 0.85); g.lineTo(ux + (i + 1) * uww, top - up + 1) }
        g.fill()
      }
      g.fillStyle = 'rgba(0,0,0,.1)'
      for (let k = 0; k < 2; k++) g.fillRect(x + inset, top + h * (0.33 + 0.3 * k), w - inset * 2, 1.5)
      g.fillStyle = `rgba(14,8,5,${0.7 * (1 - haze)})`
      // نوافذ مثلثة مقلوبة
      const rows = Math.floor(h / (H * 0.075))
      const cols = Math.max(1, Math.floor(w / (H * 0.07)))
      const wt = Math.min(w / (cols * 2), H * 0.009)
      g.fillStyle = `rgba(14,8,5,${0.7 * (1 - haze)})`
      for (let ry = 0; ry < rows; ry++) {
        for (let cx = 0; cx < cols; cx++) {
          const px = x + (cx + 0.5) * (w / cols) - wt
          const py = top + (ry + 0.55) * (H * 0.075) - wt
          g.beginPath(); g.moveTo(px, py); g.lineTo(px + wt * 2, py); g.lineTo(px + wt, py + wt * 1.9); g.closePath(); g.fill()
          if (b.seed * 10 % 1 > 0.55 && (cx + ry) % 3 === 0 && night > 0.05) {
            g.fillStyle = `rgba(255,190,100,${0.55 * night * (1 - haze)})`
            g.beginPath(); g.moveTo(px, py); g.lineTo(px + wt * 2, py); g.lineTo(px + wt, py + wt * 1.9); g.closePath(); g.fill()
            g.fillStyle = `rgba(14,8,5,${0.7 * (1 - haze)})`
          }
        }
      }
      g.globalAlpha = 1
    }
    // زجاج حديث
    if (s > 0.01) {
      g.globalAlpha = s
      const gl = g.createLinearGradient(x, top, x + w, base)
      gl.addColorStop(0, mix(mixHex('#3a5878', '#1f3a5a', night), hazeC, haze))
      gl.addColorStop(0.5, mix(mixHex('#22364f', '#0f2035', night), hazeC, haze))
      gl.addColorStop(1, mix(mixHex('#0f1a2a', '#070d18', night), hazeC, haze * 0.6))
      g.fillStyle = gl
      const k = b.kind
      g.beginPath()
      g.moveTo(x, base + 4); g.lineTo(x, top + (k === 1 ? w * 0.35 : 0))
      if (k === 1) g.lineTo(x + w, top); else g.lineTo(x + w, top)
      g.lineTo(x + w, base + 4); g.closePath(); g.fill()
      if (k === 2) { g.fillRect(x + w * 0.3, top - H * 0.04, w * 0.4, H * 0.04); g.fillRect(x + w * 0.44, top - H * 0.1, w * 0.12, H * 0.06) }
      if (k === 3) { g.fillRect(x + w * 0.47, top - H * 0.08, Math.max(2, w * 0.05), H * 0.08) }
      // نوافذ مضيئة
      g.globalAlpha = s * (0.15 + 0.85 * night) * (1 - haze * 0.7)
      g.fillStyle = this.tiles[Math.floor(b.seed * 3) % 3]
      g.save(); g.translate(x, top); g.fillRect(0, 0, w, h + 4); g.restore()
      g.globalAlpha = s * 0.14
      g.fillStyle = '#cfe8ff'
      for (let mx = x + w * 0.25; mx < x + w; mx += w * 0.25) g.fillRect(mx, top, 1, h)
      g.globalAlpha = 1
    }
  }
}

function mixHex(a: string, b: string, t: number) {
  const A = hex(a); const B = hex(b)
  const c = [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)].map((v) => Math.round(v))
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
}
const easeCam = (p: number) => p * p * (3 - 2 * p)

export default function Ambition(p: SceneProps) {
  const rail = useRef<HTMLDivElement>(null)
  const bead = useRef<HTMLButtonElement>(null)
  const { canvas, api, point } = useEngine((env) => new AmbitionEngine(env), {
    reduced: p.reduced, mode: p.mode, done: p.done, onComplete: p.onComplete, chime: p.chime, tick: p.tick, pour: p.pour,
  })
  useEffect(() => {
    const e = api.current
    if (!e) return
    const set = (v: number) => {
      rail.current?.style.setProperty('--p', String(v))
      bead.current?.setAttribute('aria-valuenow', String(Math.round(v * 100)))
      bead.current?.setAttribute('aria-valuetext', `الارتفاع ${Math.round(v * 100)}٪`)
    }
    e.onP = set
    set(e.p)
    if (p.reduced) return
    const el = canvas.current
    const wheel = (ev: WheelEvent) => { ev.preventDefault(); e.climb(-ev.deltaY / 1400) }
    el?.addEventListener('wheel', wheel, { passive: false })
    return () => el?.removeEventListener('wheel', wheel)
  }, [api, canvas, p.reduced, p.mode])

  const railDrag = useRef(false)
  const fromRail = (ev: React.PointerEvent) => {
    const r = rail.current!.getBoundingClientRect()
    const v = 1 - (ev.clientY - r.top) / r.height
    api.current?.setP(v)
  }
  const key = (ev: React.KeyboardEvent) => {
    const e = api.current
    if (!e) return
    const m: Record<string, number> = { ArrowUp: 0.1, ArrowRight: 0.1, PageUp: 0.25, ArrowDown: -0.1, ArrowLeft: -0.1, PageDown: -0.25 }
    if (ev.key in m) { ev.preventDefault(); e.climb(m[ev.key]); p.tick() }
    else if (ev.key === 'Home') { ev.preventDefault(); e.setP(0) }
    else if (ev.key === 'End') { ev.preventDefault(); e.setP(1) }
  }

  return (
    <>
      <canvas
        ref={canvas}
        className="vsc-canvas vsc-drag"
        role="img"
        aria-label="مدينة طينية على الطراز النجدي تنمو أثناء الصعود وتتحوّل إلى أبراج حديثة مضيئة عند حلول الليل"
        onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); api.current?.down(point(e).y, e.pointerId) }}
        onPointerMove={(e) => { if (e.buttons || e.pointerType === 'touch') api.current?.move(point(e).y) }}
        onPointerUp={() => api.current?.up()}
        onPointerCancel={() => api.current?.up()}
      />
      <div className="amb__rail" ref={rail} style={{ ['--p' as string]: p.done ? 1 : 0 }} aria-hidden={false}>
        <span className="amb__lab amb__lab--top label">الأبراج</span>
        <div className="amb__thread" onPointerDown={(e) => { railDrag.current = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); fromRail(e) }} onPointerMove={(e) => { if (railDrag.current) fromRail(e) }} onPointerUp={() => { railDrag.current = false }} onPointerCancel={() => { railDrag.current = false }}>
          <i className="amb__line" />
          {[0, 1, 2, 3, 4, 5].map((k) => <i key={k} className="amb__tick" style={{ bottom: `calc(${k * 20}% )` }} />)}
          <button ref={bead} className="amb__bead" role="slider" aria-orientation="vertical" aria-label="الارتفاع: من الطين إلى الأبراج" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.done ? 100 : 0} onKeyDown={key}>
            <span aria-hidden />
          </button>
        </div>
        <span className="amb__lab amb__lab--bot label">الطين</span>
      </div>
      <div className="vc">
        {!p.done && <p className="vc__hint">{p.data.action}</p>}
        <div className="vc__row">
          <button className="btn btn--gold vbtn" onClick={() => { api.current?.climb(0.17); p.tick() }}>
            <span className="amb__chev amb__chev--up" aria-hidden><IconBack /></span>{p.data.altLabel}
          </button>
          <button className="btn vbtn" onClick={() => { api.current?.climb(-0.17); p.tick() }} aria-label="انزل">
            <span className="amb__chev amb__chev--dn" aria-hidden><IconBack /></span>انزل
          </button>
        </div>
      </div>
      <style>{`
.vsc-drag{cursor:grab}.vsc-drag:active{cursor:grabbing}
.amb__rail{position:absolute;z-index:4;inset-inline-end:var(--s4);top:var(--vtop);bottom:calc(var(--vs-bottom) + var(--vs-h) + var(--s3));width:calc(var(--target) * 1.4);display:grid;grid-template-rows:auto 1fr auto;justify-items:center;gap:var(--s1);pointer-events:none}
.amb__rail>*{pointer-events:auto}
.amb__lab{color:var(--sand);text-shadow:0 1px 10px rgba(0,0,0,.9);font-size:.72rem}
.amb__thread{position:relative;width:calc(var(--target) * 1.1);height:100%;touch-action:none;cursor:pointer}
.amb__line{position:absolute;inset-block:calc(var(--target) * .5);inset-inline:0;margin-inline:auto;width:2px;background:linear-gradient(to top,#c58a6b,var(--gold) 60%,#EDE6D3);box-shadow:0 0 12px rgba(231,176,74,.4)}
.amb__tick{position:absolute;inset-inline:0;margin-inline:auto;width:14px;height:1px;background:rgba(216,195,160,.5);margin-bottom:calc(var(--target) * .5)}
.amb__bead{position:absolute;inset-inline:0;margin-inline:auto;width:var(--target);height:var(--target);border-radius:50%;bottom:calc(var(--p) * (100% - var(--target)));display:grid;place-items:center;background:rgba(6,10,12,.72);border:1.5px solid var(--gold);box-shadow:0 0 26px rgba(231,176,74,.45)}
.amb__bead span{width:34%;height:34%;border-radius:50%;background:radial-gradient(circle,#fff1cf,#e7b04a);box-shadow:0 0 16px #e7b04a}
.amb__chev{display:inline-grid;place-items:center}
.amb__chev--up{transform:rotate(-90deg)}.amb__chev--dn{transform:rotate(90deg)}
[data-mode=mobile] .amb__rail{inset-inline-end:var(--s1);top:calc(var(--vtop) + 5.5rem)}
`}</style>
    </>
  )
}

