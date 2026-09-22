// يُولّد src/content/generated/* من مصادر الحقيقة (لا نسخ يدوي لنصوص عربية):
//  1) tafsir.json  ← مستند الفريق (Level 1) بعد حذف علامات صفحات الطبعة فقط
//  2) verses.json  ← research/_parts/verified_verses.json (متحقَّق من مصدرين)
//  3) map.json     ← geoBoundaries (ODbL) → مسارات SVG مبسّطة + عيّنة نقاط للنهاية
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const app = path.resolve(here, '..')
const root = path.resolve(app, '..')
const out = path.join(app, 'src/content/generated')
fs.mkdirSync(out, { recursive: true })
const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex')

/* ---------- 1) التفسير ---------- */
const teamFile = fs.readdirSync(root).find((f) => f.startsWith('مستند نصي جديد'))
const raw = fs.readFileSync(path.join(root, teamFile), 'utf8').replace(/^﻿/, '')
const strip = (s) =>
  s
    .replace(/[ً-ٰٟۖ-ۭـ]/g, '')
    .replace(/[ٱأإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ء/g, '')
    .replace(/[()﴿﴾]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const blocks = []
let cur = null
for (const line of raw.split(/\r?\n/)) {
  if (/^سارة مساعد, \[/.test(line.trim())) {
    cur = []
    blocks.push(cur)
    continue
  }
  if (cur && line.trim()) cur.push(line.trim())
}
const targets = [
  { id: 'q2-125', surah: 2, ayah: 125, starts: 'وإذ جعلنا البيت مثابه' },
  { id: 'q2-126', surah: 2, ayah: 126, starts: 'وإذ قال ابراهيم رب اجعل هذا بلدا امنا' },
  { id: 'q3-97', surah: 3, ayah: 97, starts: 'فيه ايت بينت' }, // نسخة الفريق برسم المصحف (ألف خنجرية) — تُطبَّع بلا علامات
  { id: 'q14-35', surah: 14, ayah: 35, starts: 'وإذ قال ابراهيم رب اجعل هذا البلد امنا' },
]
const markerRe = /\s*-\[[٠-٩0-9]+\]-\s*/g
const tafsir = targets.map((t) => {
  const b = blocks.find((bl) => strip(bl[0]).startsWith(strip(t.starts)))
  if (!b) throw new Error('block not found for ' + t.id)
  const [verseLine, ...rest] = b
  const originalTafsir = rest.join('\n')
  let removed = 0
  const paragraphs = rest.map((p) =>
    p
      .replace(markerRe, () => {
        removed++
        return ' '
      })
      .replace(/\s+/g, ' ')
      .trim(),
  )
  return { id: t.id, surah: t.surah, ayah: t.ayah, teamVerseLine: verseLine, paragraphs, editionMarkersRemoved: removed, sha256OriginalTafsir: sha(originalTafsir) }
})
fs.writeFileSync(
  path.join(out, 'tafsir.json'),
  JSON.stringify(
    {
      _meta: {
        source: 'مستند نصي جديد (5).txt — مادة الفريق (Level 1)، تيسير الكريم الرحمن للسعدي كما أرسلها الفريق',
        note: 'حُذفت علامات صفحات الطبعة فقط؛ الكلمات لم تُمَسّ. الطبعة غير مسمّاة (SC-10).',
        generatedFrom: teamFile,
      },
      items: tafsir,
    },
    null,
    1,
  ),
)
console.log('tafsir:', tafsir.map((t) => `${t.id} paras=${t.paragraphs.length} markers=${t.editionMarkersRemoved}`).join(' | '))

/* ---------- 2) الآيات المتحقَّق منها ---------- */
const vv = JSON.parse(fs.readFileSync(path.join(root, 'research/_parts/verified_verses.json'), 'utf8'))
fs.writeFileSync(path.join(out, 'verses.json'), JSON.stringify({ _meta: vv._meta, verses: vv.verses }, null, 1))
console.log('verses:', vv.verses.length)

/* ---------- 3) الخريطة ---------- */
const g1 = JSON.parse(fs.readFileSync(path.join(app, 'data/raw/geoBoundaries-SAU-ADM1_simplified.geojson'), 'utf8'))
const g0 = JSON.parse(fs.readFileSync(path.join(app, 'data/raw/geoBoundaries-SAU-ADM0_simplified.geojson'), 'utf8'))
const ISO = {
  'SA-01': 'riyadh',
  'SA-02': 'makkah',
  'SA-03': 'madinah',
  'SA-04': 'eastern',
  'SA-05': 'qassim',
  'SA-06': 'hail',
  'SA-07': 'tabuk',
  'SA-08': 'northern-borders',
  'SA-09': 'jazan',
  'SA-10': 'najran',
  'SA-11': 'bahah',
  'SA-12': 'jawf',
  'SA-14': 'asir',
}
const K = Math.cos((24 * Math.PI) / 180) // مقياس خط الطول عند 24°ش
const polys = (geo) => (geo.type === 'MultiPolygon' ? geo.coordinates : [geo.coordinates])
let minX = Infinity,
  minY = Infinity,
  maxX = -Infinity,
  maxY = -Infinity
const proj = ([lon, lat]) => [lon * K, -lat]
for (const f of g0.features)
  for (const p of polys(f.geometry))
    for (const r of p)
      for (const c of r) {
        const [x, y] = proj(c)
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
const S = 1000 / (maxX - minX) // عرض 1000 وحدة
const P = ([lon, lat]) => {
  const [x, y] = proj([lon, lat])
  return [(x - minX) * S, (y - minY) * S]
}
const H = Math.round((maxY - minY) * S)
function dp(pts, eps) {
  if (pts.length < 3) return pts
  const keep = new Uint8Array(pts.length)
  keep[0] = keep[pts.length - 1] = 1
  const stack = [[0, pts.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()
    let mx = 0,
      idx = -1
    const [ax, ay] = pts[a],
      [bx, by] = pts[b],
      dx = bx - ax,
      dy = by - ay,
      L = Math.hypot(dx, dy) || 1
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / L
      if (d > mx) {
        mx = d
        idx = i
      }
    }
    if (mx > eps && idx > 0) {
      keep[idx] = 1
      stack.push([a, idx], [idx, b])
    }
  }
  return pts.filter((_, i) => keep[i])
}
// الحلقة المغلقة: نقطتا الطرفين متطابقتان فيصفر الخط المرجعي؛ نقسم عند أبعد نقطة أولًا
const dpRing = (pts, eps) => {
  if (pts.length < 5) return pts
  let k = 1,
    best = -1
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1])
    if (d > best) {
      best = d
      k = i
    }
  }
  const a = dp(pts.slice(0, k + 1), eps)
  const b = dp(pts.slice(k), eps)
  return a.concat(b.slice(1))
}
const round = (n) => Math.round(n * 10) / 10
const toPath = (geo, eps) =>
  polys(geo)
    .map((poly) =>
      poly
        .map((ring) => {
          const s = dpRing(ring.map(P), eps)
          return s.length < 4 ? '' : 'M' + s.map((p) => `${round(p[0])} ${round(p[1])}`).join('L') + 'Z'
        })
        .join(''),
    )
    .join('')
const centroid = (geo) => {
  let sx = 0,
    sy = 0,
    sa = 0
  for (const poly of polys(geo)) {
    const ring = poly[0].map(P)
    let a = 0,
      cx = 0,
      cy = 0
    for (let i = 0; i < ring.length - 1; i++) {
      const [x0, y0] = ring[i],
        [x1, y1] = ring[i + 1],
        w = x0 * y1 - x1 * y0
      a += w
      cx += (x0 + x1) * w
      cy += (y0 + y1) * w
    }
    a /= 2
    if (Math.abs(a) > 1e-6) {
      sx += cx / 6
      sy += cy / 6
      sa += a
    }
  }
  return [round(sx / sa), round(sy / sa)]
}
const regions = g1.features.map((f) => ({ code: f.properties.shapeISO, id: ISO[f.properties.shapeISO], d: toPath(f.geometry, 1.1), c: centroid(f.geometry) }))
if (regions.some((r) => !r.id)) throw new Error('unmapped ISO')
const outlineD = toPath(g0.features[0].geometry, 0.9)
// عيّنة 96 نقطة موزّعة بالتساوي على طول محيط أكبر قطعة في المملكة (للنهاية السينمائية)
const ring = dpRing(
  polys(g0.features[0].geometry)
    .sort((a, b) => b[0].length - a[0].length)[0][0]
    .map(P),
  0.6,
)
const seg = []
let total = 0
for (let i = 0; i < ring.length - 1; i++) {
  const l = Math.hypot(ring[i + 1][0] - ring[i][0], ring[i + 1][1] - ring[i][1])
  seg.push(l)
  total += l
}
const pts96 = []
for (let k = 0; k < 96; k++) {
  let d = (k / 96) * total,
    i = 0
  while (i < seg.length - 1 && d > seg[i]) {
    d -= seg[i]
    i++
  }
  const t = d / (seg[i] || 1)
  pts96.push([round(ring[i][0] + (ring[i + 1][0] - ring[i][0]) * t), round(ring[i][1] + (ring[i + 1][1] - ring[i][1]) * t)])
}
fs.writeFileSync(
  path.join(out, 'map.json'),
  JSON.stringify({
    _meta: { source: 'geoBoundaries gbOpen SAU ADM0/ADM1 (simplified) © OpenStreetMap contributors — ODbL 1.0', representationYear: 2017, note: 'للتوضيح فقط، ليست حدودًا رسمية (SC-13)' },
    viewBox: [0, 0, 1000, H],
    regions,
    outline: outlineD,
    points96: pts96,
  }),
)
console.log('map:', regions.length, 'regions; viewBox 1000x' + H, '; region path bytes', regions.reduce((s, r) => s + r.d.length, 0), '; outline bytes', outlineD.length)
