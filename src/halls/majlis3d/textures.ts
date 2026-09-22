import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three'

/** خامات إجرائية (Canvas 2D) — بلا صور خارجية. مولّدات مبدئية تُستبدل بأصول حقيقية عبر الفتحات لاحقًا. */
function make(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, color = true): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!, w, h)
  const t = new CanvasTexture(c)
  if (color) t.colorSpace = SRGBColorSpace
  t.anisotropy = 4
  return t
}

let seed = 1
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

/** سجادة سدو: حدود وشرائط هندسية متناظرة (معينات/مثلثات/متدرجة) بألوان محدودة */
export function saduTexture(): Texture {
  seed = 11
  return make(1024, 768, (g, W, H) => {
    const pal = { field: '#6b1a1e', deep: '#2a0d0f', cream: '#e9dcc0', black: '#17100c', gold: '#c9a45c', green: '#0f4a33' }
    g.fillStyle = pal.field
    g.fillRect(0, 0, W, H)
    // نسيج خفيف
    for (let y = 0; y < H; y += 3) { g.fillStyle = `rgba(0,0,0,${0.03 + (y % 6 ? 0 : 0.03)})`; g.fillRect(0, y, W, 1) }
    const band = (y: number, h: number, kind: number, a: string, b: string) => {
      const cell = h
      g.fillStyle = a
      g.fillRect(0, y, W, h)
      const cols = Math.ceil(W / cell)
      for (let i = 0; i < cols; i++) {
        const x = i * cell
        g.fillStyle = b
        if (kind === 0) { g.beginPath(); g.moveTo(x + cell / 2, y + 2); g.lineTo(x + cell - 2, y + h / 2); g.lineTo(x + cell / 2, y + h - 2); g.lineTo(x + 2, y + h / 2); g.closePath(); g.fill() }
        else if (kind === 1) { g.beginPath(); if (i % 2) { g.moveTo(x, y + h); g.lineTo(x + cell, y + h); g.lineTo(x + cell / 2, y) } else { g.moveTo(x, y); g.lineTo(x + cell, y); g.lineTo(x + cell / 2, y + h) } g.closePath(); g.fill() }
        else if (kind === 2) { const s = cell / 4; for (let k = 0; k < 4; k++) g.fillRect(x + k * s, y + (3 - k) * s * 0.9, s * 0.9, s * (k + 1) * 0.9) }
        else { g.fillRect(x + cell * 0.3, y + cell * 0.3, cell * 0.4, cell * 0.4) }
      }
    }
    // حدود خارجية
    g.fillStyle = pal.black; g.fillRect(0, 0, W, 18); g.fillRect(0, H - 18, W, 18)
    band(18, 34, 1, pal.cream, pal.black)
    band(52, 22, 3, pal.deep, pal.gold)
    band(H - 74, 22, 3, pal.deep, pal.gold)
    band(H - 52 - 18, 34, 1, pal.cream, pal.black)
    // حقل مركزي: صفوف هندسية متناظرة
    const rows = [
      [0, 54, pal.cream, pal.black], [1, 40, pal.green, pal.cream], [2, 46, pal.deep, pal.gold], [0, 64, pal.black, pal.cream],
      [3, 30, pal.field, pal.cream], [0, 86, pal.cream, pal.field], [3, 30, pal.field, pal.cream], [0, 64, pal.black, pal.cream],
      [2, 46, pal.deep, pal.gold], [1, 40, pal.green, pal.cream],
    ] as const
    let y = 96
    const tot = rows.reduce((s, r) => s + r[1], 0)
    const gap = Math.max(0, (H - 96 * 2 - tot) / (rows.length + 1))
    for (const r of rows) { y += gap; band(y, r[1], r[0], r[2], r[3]); y += r[1] }
    // حواف صوفية
    g.fillStyle = pal.cream
    for (let x = 0; x < W; x += 6) { g.fillRect(x, 0, 3, 5); g.fillRect(x, H - 5, 3, 5) }
    g.fillStyle = 'rgba(0,0,0,.18)'
    for (let i = 0; i < 4000; i++) g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1)
  })
}

/** شبكة المشربية: alphaMap (الأبيض = خشب معتم، الأسود = فتحة) */
export function latticeTexture(invert = false): Texture {
  const t = make(512, 512, (g, W, H) => {
    g.fillStyle = invert ? '#fff' : '#000'
    g.fillRect(0, 0, W, H)
    g.fillStyle = invert ? '#000' : '#fff'
    const step = 64
    for (let i = 0; i <= W; i += step) { g.fillRect(i - 5, 0, 10, H); g.fillRect(0, i - 5, W, 10) }
    // زخرفة دوّارة عند التقاطعات
    for (let i = 0; i < W; i += step) for (let j = 0; j < H; j += step) {
      g.beginPath(); g.arc(i + step / 2, j + step / 2, 13, 0, Math.PI * 2); g.fill()
      g.beginPath(); g.moveTo(i + step / 2, j + 8); g.lineTo(i + step - 12, j + step / 2); g.lineTo(i + step / 2, j + step - 8); g.lineTo(i + 12, j + step / 2); g.closePath(); g.lineWidth = 5; g.strokeStyle = invert ? '#000' : '#fff'; g.stroke()
    }
  }, false)
  t.wrapS = t.wrapT = RepeatWrapping
  return t
}

/** جص الجدار الطيني: ضوضاء دافئة مع بقع أفتح */
export function plasterTexture(base = '#a5825d'): Texture {
  seed = 5
  const t = make(512, 512, (g, W, H) => {
    g.fillStyle = base
    g.fillRect(0, 0, W, H)
    for (let i = 0; i < 260; i++) {
      const x = rnd() * W, y = rnd() * H, r = 20 + rnd() * 90
      const gr = g.createRadialGradient(x, y, 0, x, y, r)
      const light = rnd() > 0.5
      gr.addColorStop(0, light ? 'rgba(255,235,200,.10)' : 'rgba(60,30,10,.10)')
      gr.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = gr
      g.fillRect(x - r, y - r, r * 2, r * 2)
    }
    for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(${rnd() > 0.5 ? '255,240,210' : '50,25,10'},${0.05 + rnd() * 0.1})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 2) }
  })
  t.wrapS = t.wrapT = RepeatWrapping
  return t
}

/** المشهد خلف المشربية: سماء دافئة + كثبان + نخلة (بيئة) — تركيب رمزي */
export function windowViewTexture(): Texture {
  return make(768, 512, (g, W, H) => {
    const sky = g.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, '#5f8fb5'); sky.addColorStop(0.55, '#f2d3a0'); sky.addColorStop(1, '#f7b96a')
    g.fillStyle = sky; g.fillRect(0, 0, W, H)
    const sun = g.createRadialGradient(W * 0.72, H * 0.62, 0, W * 0.72, H * 0.62, H * 0.5)
    sun.addColorStop(0, 'rgba(255,245,210,1)'); sun.addColorStop(1, 'rgba(255,220,150,0)')
    g.fillStyle = sun; g.fillRect(0, 0, W, H)
    // كثبان
    const dune = (y: number, amp: number, col: string, ph: number) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, H)
      for (let x = 0; x <= W; x += 8) g.lineTo(x, y + Math.sin(x / W * Math.PI * 2.2 + ph) * amp + Math.sin(x / 47 + ph) * amp * 0.15)
      g.lineTo(W, H); g.closePath(); g.fill()
    }
    dune(H * 0.68, 22, '#d9a866', 0.4); dune(H * 0.78, 30, '#b9803f', 2.1); dune(H * 0.9, 20, '#8f5c2a', 4.4)
    // نخلة
    g.strokeStyle = '#2a1a0e'; g.fillStyle = '#2a1a0e'; g.lineCap = 'round'
    g.lineWidth = 12
    g.beginPath(); g.moveTo(W * 0.3, H * 0.92); g.bezierCurveTo(W * 0.32, H * 0.7, W * 0.29, H * 0.5, W * 0.31, H * 0.33); g.stroke()
    g.lineWidth = 5
    const cx = W * 0.31, cy = H * 0.33
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, L = 96 + (i % 3) * 20
      g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + Math.cos(a) * L * 0.6, cy + Math.sin(a) * L * 0.3 - 30, cx + Math.cos(a) * L, cy + Math.sin(a) * L * 0.6 + 26); g.stroke()
    }
  })
}

/** بشت معلّق: قماش داكن بحواف ومداخل ذهبية (تخطيط رمزي) — شفاف خارج الشكل */
export function bishtTexture(): Texture {
  return make(400, 560, (g, W, H) => {
    g.clearRect(0, 0, W, H)
    const path = () => { g.beginPath(); g.moveTo(W * 0.32, 8); g.quadraticCurveTo(W * 0.5, 34, W * 0.68, 8); g.lineTo(W * 0.94, 60); g.lineTo(W * 0.98, H - 6); g.lineTo(W * 0.02, H - 6); g.lineTo(W * 0.06, 60); g.closePath() }
    path(); const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3a2818'); gr.addColorStop(1, '#231710'); g.fillStyle = gr; g.fill()
    g.save(); path(); g.clip()
    g.strokeStyle = '#c9a45c'; g.lineWidth = 7
    g.beginPath(); g.moveTo(W * 0.32, 8); g.quadraticCurveTo(W * 0.5, 34, W * 0.68, 8); g.stroke()
    g.lineWidth = 5; g.beginPath(); g.moveTo(W * 0.5, 30); g.lineTo(W * 0.5, H); g.stroke()
    g.lineWidth = 9; g.beginPath(); g.moveTo(W * 0.06, 62); g.lineTo(W * 0.02, H - 8); g.moveTo(W * 0.94, 62); g.lineTo(W * 0.98, H - 8); g.stroke()
    g.lineWidth = 6; g.beginPath(); g.moveTo(W * 0.02, H - 12); g.lineTo(W * 0.98, H - 12); g.stroke()
    for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(255,220,150,${rnd() * 0.05})`; g.fillRect(rnd() * W, rnd() * H, 1, 3) }
    g.restore()
  })
}

/** هالة ناعمة للمصابيح/الضوء */
export function haloTexture(): Texture {
  return make(128, 128, (g, W, H) => {
    const r = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2)
    r.addColorStop(0, 'rgba(255,214,140,1)'); r.addColorStop(0.35, 'rgba(255,190,100,.35)'); r.addColorStop(1, 'rgba(255,170,70,0)')
    g.fillStyle = r; g.fillRect(0, 0, W, H)
  })
}
