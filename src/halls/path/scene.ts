/**
 * مشهد «طريق الحكاية»: طبقات إجرائية بمنظور حركي (Canvas2D) عند الفجر.
 * سلاسل جبال بعيدة ← هضاب ← كثبان ← نخيل ومبانٍ طينية نجدية ← أرض قريبة يمرّ عليها الخيط الذهبي.
 * رسم رمزي لا يمثّل مكانًا بعينه. لا أصول خارجية، ولا شيء يُنشأ داخل الإطار (كل الأشكال تُبنى مرة عند تغيير الحجم).
 */

export type SceneKind = 'diriyah' | 'riyadh' | 'unity' | 'kingdom' | 'oil' | 'world' | 'vision' | 'heritage' | 'today'

export interface View {
  W: number
  H: number
  /** موضع الكاميرا بوحدات المحطات (عدد كسري) */
  cam: number
  /** المسافة بين المحطات بالبكسل */
  S: number
  /** 0..1 تقدّم الرحلة */
  progress: number
  /** ثواني (يتوقف عند تقليل الحركة) */
  t: number
  animate: boolean
}

/** أعلام الكتابة بالخط الرسومي (أسفل المشهد) */
export const layout = {
  horizon: 0.625,
  ground: 0.685,
  thread: 0.745,
}

/* ───────── أدوات ───────── */
const mulberry = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const mix = (a: [number, number, number], b: [number, number, number], t: number) => `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`

/** ضجيج قيمي أحادي البعد مع تنعيم — لقمم الجبال */
function makeNoise(seed: number) {
  const r = mulberry(seed)
  const v = Array.from({ length: 512 }, () => r())
  const at = (x: number) => {
    const i = Math.floor(x)
    const f = x - i
    const s = f * f * (3 - 2 * f)
    return lerp(v[((i % 512) + 512) % 512], v[(((i + 1) % 512) + 512) % 512], s)
  }
  return (x: number) => at(x) * 0.55 + at(x * 2.1 + 17) * 0.3 + at(x * 4.3 + 41) * 0.15
}

/* ───────── أشكال ───────── */
type Ctx = CanvasRenderingContext2D

function palm(g: Ctx, x: number, y: number, h: number, lean: number, sway: number, seed: number) {
  const r = mulberry(seed)
  const topX = x + lean * h
  const topY = y - h
  // الجذع: منحنى بسماكة متناقصة
  const w0 = h * 0.045
  g.beginPath()
  g.moveTo(x - w0, y)
  g.quadraticCurveTo(x + lean * h * 0.15 - w0 * 0.7, y - h * 0.55, topX - w0 * 0.35 + sway * 0.4, topY)
  g.lineTo(topX + w0 * 0.35 + sway * 0.4, topY)
  g.quadraticCurveTo(x + lean * h * 0.15 + w0 * 0.7, y - h * 0.55, x + w0, y)
  g.closePath()
  g.fill()
  // السعف: أهلّة رقيقة تتدلى
  const n = 11
  for (let i = 0; i < n; i++) {
    const a = (i / (n - 1)) * Math.PI * 1.1 - Math.PI * 0.05 // من اليمين إلى اليسار عبر الأعلى
    const dir = Math.cos(a)
    const up = Math.sin(a)
    const L = h * (0.34 + r() * 0.1)
    const sx = topX + sway * 0.4
    const ex = sx + dir * L
    const ey = topY - up * L * 0.55 + L * (0.32 + Math.abs(dir) * 0.3)
    const cx = sx + dir * L * 0.55
    const cy = topY - up * L * 0.9 - L * 0.05 + sway * 0.2
    const th = h * 0.022
    g.beginPath()
    g.moveTo(sx, topY)
    g.quadraticCurveTo(cx, cy - th, ex, ey)
    g.quadraticCurveTo(cx, cy + th * 1.6, sx, topY + th * 0.4)
    g.closePath()
    g.fill()
  }
}

/** مثلث نجدي مقلوب: نافذة ضوء */
function triWindow(g: Ctx, x: number, y: number, w: number, h: number, lit: number) {
  g.beginPath()
  g.moveTo(x - w / 2, y)
  g.lineTo(x + w / 2, y)
  g.lineTo(x, y + h)
  g.closePath()
  g.fillStyle = `rgba(255,196,118,${0.15 + 0.7 * lit})`
  g.fill()
}

/** شرفات مثلثة نجدية على قمة جدار طيني */
function battlement(g: Ctx, x0: number, x1: number, y: number, tw: number) {
  const n = Math.max(1, Math.round((x1 - x0) / tw))
  const w = (x1 - x0) / n
  g.beginPath()
  for (let i = 0; i < n; i++) {
    g.moveTo(x0 + i * w, y)
    g.lineTo(x0 + (i + 0.5) * w, y - w * 0.62)
    g.lineTo(x0 + (i + 1) * w, y)
  }
  g.closePath()
  g.fill()
}

function fort(g: Ctx, cx: number, y: number, w: number, h: number, lit: number, seed: number, tall = true) {
  const r = mulberry(seed)
  const x0 = cx - w / 2
  // الجدار
  g.beginPath()
  g.moveTo(x0, y)
  g.lineTo(x0 + w * 0.012, y - h * 0.5)
  g.lineTo(x0 + w * 0.988, y - h * 0.5)
  g.lineTo(x0 + w, y)
  g.closePath()
  g.fill()
  battlement(g, x0 + w * 0.012, x0 + w * 0.988, y - h * 0.5, w / 34)
  // أبراج زاوية مائلة الجوانب
  const tower = (tx: number, th: number, tw: number) => {
    g.beginPath()
    g.moveTo(tx - tw / 2, y)
    g.lineTo(tx - tw * 0.36, y - th)
    g.lineTo(tx + tw * 0.36, y - th)
    g.lineTo(tx + tw / 2, y)
    g.closePath()
    g.fill()
    battlement(g, tx - tw * 0.36, tx + tw * 0.36, y - th, tw / 5)
  }
  tower(x0 + w * 0.05, h * (tall ? 0.95 : 0.75), w * 0.11)
  tower(x0 + w * 0.95, h * 0.72, w * 0.1)
  if (tall) tower(cx + w * (r() - 0.5) * 0.25, h * 1.15, w * 0.09)
  // نوافذ مثلثة
  const rows = 2
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < 6; i++) {
      const wx = x0 + w * (0.14 + i * 0.14) + (r() - 0.5) * 4
      if (r() < 0.75) triWindow(g, wx, y - h * (0.4 - j * 0.16), w * 0.018, w * 0.03, lit * (0.5 + r() * 0.5))
    }
  }
  g.fillStyle = FILL
}

function houses(g: Ctx, cx: number, y: number, s: number, lit: number, seed: number) {
  const r = mulberry(seed)
  let x = cx - s * 0.9
  for (let i = 0; i < 6; i++) {
    const w = s * (0.22 + r() * 0.2)
    const h = s * (0.28 + r() * 0.28)
    g.fillStyle = FILL
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(x + w * 0.02, y - h)
    g.lineTo(x + w * 0.98, y - h)
    g.lineTo(x + w, y)
    g.closePath()
    g.fill()
    battlement(g, x + w * 0.02, x + w * 0.98, y - h, w / 5)
    for (let k = 0; k < 2; k++) if (r() < 0.8) triWindow(g, x + w * (0.3 + k * 0.4), y - h * 0.78, w * 0.13, w * 0.2, lit * (0.4 + r() * 0.6))
    x += w * 0.94
    g.fillStyle = FILL
  }
}

function derrick(g: Ctx, cx: number, y: number, h: number, lit: number) {
  g.strokeStyle = FILL
  g.lineWidth = Math.max(1.5, h * 0.018)
  g.beginPath()
  g.moveTo(cx - h * 0.2, y); g.lineTo(cx, y - h); g.lineTo(cx + h * 0.2, y)
  for (let i = 1; i <= 6; i++) {
    const k = i / 7
    const half = h * 0.2 * (1 - k)
    const yy = y - h * k
    g.moveTo(cx - half, yy); g.lineTo(cx + half, yy)
    const k2 = (i + 1) / 7
    const half2 = h * 0.2 * (1 - k2)
    g.moveTo(cx - half, yy); g.lineTo(cx + half2, y - h * k2)
    g.moveTo(cx + half, yy); g.lineTo(cx - half2, y - h * k2)
  }
  g.stroke()
  // خزان وأنابيب على الأرض
  g.fillStyle = FILL
  g.fillRect(cx + h * 0.35, y - h * 0.09, h * 0.3, h * 0.09)
  g.fillRect(cx + h * 0.72, y - h * 0.05, h * 0.28, h * 0.05)
  g.beginPath(); g.arc(cx, y - h, h * 0.02, 0, Math.PI * 2)
  g.fillStyle = `rgba(255,196,118,${0.35 + 0.6 * lit})`
  g.fill()
  g.fillStyle = FILL
}

function skyline(g: Ctx, cx: number, y: number, s: number, lit: number, count: number, seed: number) {
  const r = mulberry(seed)
  let x = cx - s * 0.5
  for (let i = 0; i < count; i++) {
    const w = s * (0.06 + r() * 0.06)
    const h = s * (0.1 + r() * 0.3) * (i % 5 === 2 ? 1.4 : 1)
    g.fillStyle = FILL
    g.fillRect(x, y - h, w, h)
    if (i % 5 === 2) { // برج رفيع بقمة مدبّبة
      g.beginPath(); g.moveTo(x + w * 0.2, y - h); g.lineTo(x + w * 0.5, y - h - s * 0.1); g.lineTo(x + w * 0.8, y - h); g.closePath(); g.fill()
    }
    const cols = Math.max(1, Math.floor(w / (s * 0.02)))
    const rows = Math.max(1, Math.floor(h / (s * 0.035)))
    for (let a = 0; a < cols; a++) for (let b = 0; b < rows; b++) {
      if (r() < 0.16 * lit) {
        g.fillStyle = `rgba(255,205,130,${0.4 + r() * 0.5})`
        g.fillRect(x + (a + 0.3) * (w / cols), y - h + (b + 0.35) * (h / rows), (w / cols) * 0.4, (h / rows) * 0.36)
      }
    }
    x += w + s * 0.012
  }
  g.fillStyle = FILL
}

function camel(g: Ctx, x: number, y: number, s: number, phase: number) {
  const sw = Math.sin(phase) * 0.22
  g.lineWidth = s * 0.05
  g.lineCap = 'round'
  g.strokeStyle = FILL
  const leg = (lx: number, off: number) => {
    g.beginPath()
    g.moveTo(x + lx * s, y - s * 0.4)
    g.lineTo(x + lx * s + Math.sin(phase + off) * s * 0.12, y)
    g.stroke()
  }
  leg(-0.2, 0); leg(-0.3, Math.PI); leg(0.22, Math.PI); leg(0.32, 0)
  g.save()
  g.translate(x, y)
  g.scale(s / 100, s / 100)
  g.rotate(sw * 0.02)
  g.beginPath()
  g.moveTo(46, -44)
  g.quadraticCurveTo(44, -64, 24, -66)
  g.quadraticCurveTo(14, -68, 8, -82)
  g.quadraticCurveTo(0, -70, -14, -64)
  g.quadraticCurveTo(-28, -60, -34, -70)
  g.quadraticCurveTo(-46, -90, -56, -98)
  g.lineTo(-62, -100)
  g.quadraticCurveTo(-72, -98, -76, -90)
  g.lineTo(-72, -86)
  g.quadraticCurveTo(-62, -90, -54, -84)
  g.quadraticCurveTo(-42, -64, -34, -46)
  g.quadraticCurveTo(-30, -36, -20, -36)
  g.lineTo(30, -36)
  g.quadraticCurveTo(44, -36, 46, -44)
  g.closePath()
  g.fillStyle = FILL
  g.fill()
  g.restore()
}

function shrub(g: Ctx, x: number, y: number, s: number, seed: number) {
  const r = mulberry(seed)
  g.beginPath()
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.1 + 0.8 * (i / 6)) + (r() - 0.5) * 0.3
    const L = s * (0.5 + r() * 0.5)
    g.moveTo(x, y)
    g.quadraticCurveTo(x + Math.cos(a) * L * 0.5, y + Math.sin(a) * L * 0.9, x + Math.cos(a) * L, y + Math.sin(a) * L)
    g.lineTo(x + Math.cos(a) * L * 0.9 + 1.5, y + Math.sin(a) * L * 0.9)
    g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + 1, y + Math.sin(a) * L * 0.5, x + 1.5, y)
  }
  g.fill()
}

let FILL = '#2a1a1c'

/* ───────── المشهد ───────── */
interface Item { kind: 'palm' | 'fort' | 'houses' | 'derrick' | 'skyline' | 'camels' | 'palms'; x: number; s: number; seed: number; lit: number; n?: number }

export interface Scene {
  draw(g: Ctx, v: View): void
}

export function createScene(kinds: (SceneKind | undefined)[], W: number, H: number, S: number, opts: { lay?: typeof layout; unit?: number } = {}): Scene {
  const lay = opts.lay ?? layout
  const N = kinds.length
  const n1 = makeNoise(11), n2 = makeNoise(29), n3 = makeNoise(53)
  const rnd = mulberry(1727)
  const hy = lay.horizon * H
  const gy = lay.ground * H
  const ty = lay.thread * H
  const U = opts.unit ?? H / 1080

  // عناصر الطبقة المتوسطة (k=0.5) مرتبطة بمواضع المحطات
  const K_STRUCT = 0.5
  const items: Item[] = []
  const at = (i: number, off = 0) => W * 0.5 - i * S * K_STRUCT + off
  for (let i = -1; i < N; i++) {
    const k = i >= 0 ? kinds[i] : undefined
    const seed = 100 + i * 17
    switch (k) {
      case 'diriyah':
        items.push({ kind: 'houses', x: at(i, -W * 0.16), s: 300 * U, seed, lit: 0.6 })
        items.push({ kind: 'palms', x: at(i, W * 0.13), s: 150 * U, seed, lit: 0, n: 5 })
        break
      case 'riyadh':
        items.push({ kind: 'fort', x: at(i, -W * 0.15), s: 300 * U, seed, lit: 0.8 })
        items.push({ kind: 'palms', x: at(i, W * 0.14), s: 140 * U, seed, lit: 0, n: 4 })
        break
      case 'unity':
        items.push({ kind: 'camels', x: at(i, -W * 0.14), s: 92 * U, seed, lit: 0, n: 5 })
        items.push({ kind: 'fort', x: at(i, W * 0.17), s: 190 * U, seed, lit: 0.7 })
        break
      case 'kingdom':
        items.push({ kind: 'fort', x: at(i, -W * 0.17), s: 360 * U, seed, lit: 1 })
        items.push({ kind: 'houses', x: at(i, W * 0.14), s: 240 * U, seed, lit: 0.9 })
        break
      case 'oil':
        items.push({ kind: 'derrick', x: at(i, -W * 0.15), s: 300 * U, seed, lit: 0.9 })
        items.push({ kind: 'palms', x: at(i, W * 0.16), s: 120 * U, seed, lit: 0, n: 3 })
        break
      case 'world':
        items.push({ kind: 'fort', x: at(i, -W * 0.15), s: 250 * U, seed, lit: 0.9, n: 0 })
        items.push({ kind: 'skyline', x: at(i, W * 0.16), s: 220 * U, seed, lit: 0.5, n: 7 })
        break
      case 'vision':
        items.push({ kind: 'skyline', x: at(i, -W * 0.15), s: 420 * U, seed, lit: 0.9, n: 13 })
        break
      case 'heritage':
        items.push({ kind: 'houses', x: at(i, -W * 0.16), s: 280 * U, seed, lit: 0.8 })
        items.push({ kind: 'palms', x: at(i, W * 0.14), s: 150 * U, seed, lit: 0, n: 6 })
        break
      case 'today':
        items.push({ kind: 'skyline', x: at(i, -W * 0.15), s: 520 * U, seed, lit: 1.2, n: 16 })
        items.push({ kind: 'palms', x: at(i, W * 0.17), s: 140 * U, seed, lit: 0, n: 4 })
        break
      default:
        if (i >= 0) items.push({ kind: 'palms', x: at(i, 0), s: 130 * U, seed, lit: 0, n: 4 })
    }
    // نخيل تعبئة بين المحطات
    items.push({ kind: 'palms', x: at(i + 0.5, (rnd() - 0.5) * W * 0.1), s: (90 + rnd() * 50) * U, seed: seed + 3, lit: 0, n: 2 + Math.floor(rnd() * 3) })
  }

  // شجيرات القريب (k=1.3)
  const K_NEAR = 1.3
  const near = Array.from({ length: N * 6 + 8 }, (_, i) => ({ x: W * 0.5 + W * 0.7 - (i / 6) * S * K_NEAR + (rnd() - 0.5) * 200, s: (14 + rnd() * 26) * U, seed: i * 7 + 2 }))

  const drawRidge = (g: Ctx, v: View, k: number, base: number, amp: number, freq: number, noise: (x: number) => number, top: string, bot: string, plateau = 1, rim = 0) => {
    const off = v.cam * v.S * k
    const step = 14
    g.beginPath()
    g.moveTo(-10, H)
    for (let sx = -10; sx <= W + step; sx += step) {
      const lx = sx - off
      let h = noise(lx * freq)
      h = Math.min(h, plateau)
      g.lineTo(sx, base - h * amp)
    }
    g.lineTo(W + step, H)
    g.closePath()
    const gr = g.createLinearGradient(0, base - amp, 0, base + 40)
    gr.addColorStop(0, top)
    gr.addColorStop(1, bot)
    g.fillStyle = gr
    g.fill()
    if (rim > 0) {
      g.beginPath()
      for (let sx = -10; sx <= W + step; sx += step) {
        const lx = sx - off
        const h = Math.min(noise(lx * freq), plateau)
        if (sx === -10) g.moveTo(sx, base - h * amp)
        else g.lineTo(sx, base - h * amp)
      }
      g.strokeStyle = `rgba(255,205,140,${rim})`
      g.lineWidth = 1.5
      g.stroke()
    }
  }

  const drawItems = (g: Ctx, v: View, off: number, layerScale: number) => {
    for (const it of items) {
      const sx = it.x + off
      if (sx < -it.s * 1.2 || sx > W + it.s * 1.2) continue
      g.fillStyle = FILL
      switch (it.kind) {
        case 'fort': fort(g, sx, gy - 4 * U, it.s, it.s * 0.36, it.lit, it.seed, it.n !== 0); break
        case 'houses': houses(g, sx, gy - 4 * U, it.s, it.lit, it.seed); break
        case 'derrick': derrick(g, sx, gy - 4 * U, it.s, it.lit); break
        case 'skyline': skyline(g, sx, gy - 4 * U, it.s, it.lit, it.n ?? 8, it.seed); break
        case 'camels': {
          const walk = v.animate ? v.t * 2.4 : 0
          for (let c = 0; c < (it.n ?? 4); c++) camel(g, sx + c * it.s * 1.15, gy - 3 * U, it.s * (0.9 + (c % 2) * 0.1), walk + c * 0.9)
          break
        }
        case 'palms': {
          const r = mulberry(it.seed)
          for (let p = 0; p < (it.n ?? 3); p++) {
            const px = sx + (p - ((it.n ?? 3) - 1) / 2) * it.s * 0.5 + (r() - 0.5) * it.s * 0.34
            const sway = v.animate ? Math.sin(v.t * 0.7 + p * 1.7 + it.seed) * it.s * 0.02 : 0
            palm(g, px, gy - 4 * U, it.s * (0.55 + r() * 0.85), (r() - 0.5) * 0.3, sway, it.seed + p)
          }
          break
        }
      }
    }
    void layerScale
  }

  const draw = (g: Ctx, v: View) => {
    const { cam, S: sp, progress: pr } = v
    g.clearRect(0, 0, W, H)
    const warm = clamp01(pr)

    // ضوء الفجر: توهج الشمس أمام المسافر (يسار) ترتفع قليلًا مع التقدّم
    const sunX = W * 0.43 + cam * sp * 0.005
    const sunY = hy - (0.025 + 0.07 * warm) * H
    const glow = g.createRadialGradient(sunX, sunY, 0, sunX, sunY, H * (0.85 + 0.2 * warm))
    glow.addColorStop(0, `rgba(255,214,150,${0.5 + 0.2 * warm})`)
    glow.addColorStop(0.22, `rgba(255,170,110,${0.24 + 0.08 * warm})`)
    glow.addColorStop(0.6, 'rgba(196,110,110,0.09)')
    glow.addColorStop(1, 'rgba(120,70,110,0)')
    g.fillStyle = glow
    g.fillRect(0, 0, W, H)
    // قرص الشمس
    g.beginPath(); g.arc(sunX, sunY, H * 0.028, 0, Math.PI * 2)
    g.fillStyle = 'rgba(255,240,205,0.92)'; g.fill()

    // جبال بعيدة/هضاب/كثبان
    const cA: [number, number, number] = [104, 84, 116], cB: [number, number, number] = [150, 100, 106]
    drawRidge(g, v, 0.06, hy - 8 * U, H * 0.2, 0.0016, n1, mix(cA, cB, warm * 0.7), 'rgba(196,140,130,0.9)', 1, 0.16)
    const dA: [number, number, number] = [86, 64, 88], dB: [number, number, number] = [124, 80, 84]
    drawRidge(g, v, 0.14, hy + 16 * U, H * 0.17, 0.0021, n2, mix(dA, dB, warm * 0.7), 'rgba(150,96,98,0.95)', 0.66, 0.2)
    const eA: [number, number, number] = [110, 70, 72], eB: [number, number, number] = [150, 92, 76]
    drawRidge(g, v, 0.26, hy + 46 * U, H * 0.085, 0.0034, n3, mix(eA, eB, warm), 'rgba(96,58,58,1)', 1, 0.28)

    // ضباب جوي بين الطبقات
    const haze = g.createLinearGradient(0, hy - H * 0.06, 0, gy)
    haze.addColorStop(0, 'rgba(232,170,130,0)')
    haze.addColorStop(0.7, `rgba(232,170,130,${0.16 + 0.1 * warm})`)
    haze.addColorStop(1, 'rgba(232,170,130,0.05)')
    g.fillStyle = haze
    g.fillRect(0, hy - H * 0.06, W, gy - hy + H * 0.06)

    // طبقة البناء والنخيل (ظلال داكنة بحافة دافئة)
    FILL = 'rgba(38,24,28,0.96)'
    drawItems(g, v, cam * sp * K_STRUCT, 1)

    // الأرض
    const gg = g.createLinearGradient(0, gy - 4, 0, H)
    gg.addColorStop(0, '#3b2827')
    gg.addColorStop(0.16, '#2a1b1b')
    gg.addColorStop(1, '#120b0b')
    g.fillStyle = gg
    g.beginPath()
    const offG = cam * sp
    g.moveTo(-10, H)
    for (let sx = -10; sx <= W + 20; sx += 20) g.lineTo(sx, gy + Math.sin((sx - offG) * 0.004) * 3 * U + n1((sx - offG) * 0.01) * 5 * U)
    g.lineTo(W + 20, H)
    g.closePath()
    g.fill()
    // حافة ضوء على الأرض
    g.beginPath()
    for (let sx = -10; sx <= W + 20; sx += 20) {
      const yy = gy + Math.sin((sx - offG) * 0.004) * 3 * U + n1((sx - offG) * 0.01) * 5 * U
      if (sx === -10) g.moveTo(sx, yy); else g.lineTo(sx, yy)
    }
    g.strokeStyle = 'rgba(255,205,140,0.28)'; g.lineWidth = 1.2; g.stroke()

    // شريط سدو مقتصد: مثلثات متبادلة تحت الخيط
    drawSadu(g, v, ty + 34 * U, 9 * U, offG)

    // الخيط الذهبي
    drawThread(g, v, ty, U)

    // شجيرات قريبة (منظور أسرع)
    FILL = 'rgba(14,8,9,0.96)'
    g.fillStyle = FILL
    const offN = cam * sp * K_NEAR
    for (const b of near) {
      const sx = b.x + offN
      if (sx < -60 || sx > W + 60) continue
      shrub(g, sx, H - (0.045 + (b.seed % 5) * 0.012) * H, b.s * 1.4, b.seed)
    }

    // تظليل الحواف
    const vg = g.createRadialGradient(W / 2, H * 0.5, H * 0.35, W / 2, H * 0.5, Math.max(W, H) * 0.75)
    vg.addColorStop(0, 'rgba(10,6,10,0)')
    vg.addColorStop(1, 'rgba(10,6,10,0.42)')
    g.fillStyle = vg
    g.fillRect(0, 0, W, H)
  }

  function drawSadu(g: Ctx, v: View, y: number, h: number, off: number) {
    const w = h * 1.7
    const start = -(((off % (w * 2)) + w * 2) % (w * 2)) - w * 2
    g.beginPath()
    for (let x = start; x < W + w * 2; x += w * 2) {
      g.moveTo(x, y + h); g.lineTo(x + w / 2, y); g.lineTo(x + w, y + h)
      g.moveTo(x + w, y); g.lineTo(x + w * 1.5, y + h); g.lineTo(x + w * 2, y)
    }
    g.strokeStyle = 'rgba(201,164,92,0.34)'
    g.lineWidth = 1.2
    g.stroke()
    void v
  }

  function drawThread(g: Ctx, v: View, y: number, u: number) {
    const { cam, S: sp, t, animate } = v
    const off = cam * sp
    const cx = W / 2
    const xStart = (i: number) => W / 2 - i * sp + off
    const x0 = xStart(0) + W * 0.6 // يخرج من أقصى اليمين
    const x1 = xStart(N - 1) - W * 0.6
    const wob = (x: number) => Math.sin((x - off) * 0.006 + (animate ? t * 0.5 : 0)) * 1.2 * u
    // الجزء المتبقي (أمامك): خط رقيق متقطع
    g.save()
    g.lineCap = 'round'
    g.beginPath()
    g.setLineDash([2 * u, 10 * u])
    for (let x = Math.min(cx, x0); x >= Math.max(x1, -20); x -= 8) {
      const yy = y + wob(x)
      if (x === Math.min(cx, x0)) g.moveTo(x, yy); else g.lineTo(x, yy)
    }
    g.strokeStyle = 'rgba(255,213,138,0.5)'
    g.lineWidth = 2 * u
    g.stroke()
    g.setLineDash([])
    g.restore()
    // الجزء المقطوع: ذهبي متوهج من اليمين حتى رأس الكاميرا
    const from = Math.min(W + 30, x0)
    g.save()
    g.beginPath()
    for (let x = from; x >= cx; x -= 8) {
      const yy = y + wob(x)
      if (x === from) g.moveTo(x, yy); else g.lineTo(x, yy)
    }
    g.lineTo(cx, y + wob(cx))
    g.strokeStyle = 'rgba(255,213,138,0.22)'; g.lineWidth = 12 * u; g.lineCap = 'round'; g.stroke()
    g.strokeStyle = 'rgba(255,213,138,0.95)'; g.lineWidth = 3 * u; g.stroke()
    g.restore()
    // نبضة تسافر على الخيط
    if (animate) {
      const px = cx + ((1 - ((t * 0.16) % 1)) * (from - cx))
      const pg = g.createRadialGradient(px, y, 0, px, y, 30 * u)
      pg.addColorStop(0, 'rgba(255,236,190,0.5)'); pg.addColorStop(1, 'rgba(255,236,190,0)')
      g.fillStyle = pg
      g.fillRect(px - 34 * u, y - 34 * u, 68 * u, 68 * u)
    }
    // العُقد: حلقة لكل محطة
    for (let i = 0; i < N; i++) {
      const x = xStart(i)
      if (x < -40 || x > W + 40) continue
      const d = Math.abs(cam - i)
      const passed = i <= cam + 0.02
      const act = clamp01(1 - d * 1.4)
      const yy = y + wob(x)
      const r = (8 + 8 * act) * u
      if (act > 0.02) {
        const hg = g.createRadialGradient(x, yy, 0, x, yy, r * (4 + (animate ? Math.sin(t * 2) * 0.6 : 0)))
        hg.addColorStop(0, `rgba(255,213,138,${0.55 * act})`); hg.addColorStop(1, 'rgba(255,213,138,0)')
        g.fillStyle = hg
        g.fillRect(x - r * 5, yy - r * 5, r * 10, r * 10)
      }
      // معيّن نجدي بدل دائرة
      g.beginPath()
      g.moveTo(x, yy - r); g.lineTo(x + r * 0.8, yy); g.lineTo(x, yy + r); g.lineTo(x - r * 0.8, yy); g.closePath()
      g.fillStyle = passed ? '#FFD58A' : '#1a1110'
      g.fill()
      g.strokeStyle = passed ? 'rgba(255,240,205,0.95)' : 'rgba(255,213,138,0.7)'
      g.lineWidth = 1.6 * u
      g.stroke()
    }
  }

  return { draw }
}
