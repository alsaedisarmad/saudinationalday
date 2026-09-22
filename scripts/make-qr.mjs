// رموز QR للجداريات المطبوعة.
//   node scripts/make-qr.mjs <baseUrl>          مثال: node scripts/make-qr.mjs https://school.example/96
// يكتب في ../deliverables/qr/ : SVG + PNG (1024px) لكل جدارية، وورقة طباعة index.html (A4)، وقائمة qr-manifest.json.
// محتوى كل رمز: <baseUrl>/#/mural/<id>  ← نفس الرابط العميق الذي يقرؤه التطبيق (session.parseHash).
// العناوين من src/content/generated/mural-index.json (المصدر نفسه الذي يقرؤه التطبيق) فلا يختلف الاسم بين الشاشة والمطبوع.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'

const here = path.dirname(fileURLToPath(import.meta.url))
const app = path.resolve(here, '..')
const root = path.resolve(app, '..')
const outDir = path.join(root, 'deliverables', 'qr')

const EC = 'Q' // تصحيح أخطاء ~25%: يتحمّل خدوش الطباعة وانعكاس الإضاءة
const QUIET = 4 // المنطقة الهادئة (وحدات) — الحد الأدنى في المواصفة
const PX = 1024
const DARK = '#000000'
const LIGHT = '#ffffff'

/* ---------- المدخلات ---------- */
const arg = process.argv[2]
if (!arg || arg === '-h' || arg === '--help') {
  console.error('الاستعمال: node scripts/make-qr.mjs <baseUrl>\nمثال: node scripts/make-qr.mjs https://school.example/96')
  process.exit(arg ? 0 : 1)
}
let base
try {
  const u = new URL(arg)
  if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error('proto')
  u.hash = ''
  u.search = ''
  base = u.toString().replace(/\/+$/, '')
} catch {
  console.error(`رابط غير صالح: «${arg}» — يجب أن يبدأ بـ https:// (أو http://) ويكون عنوان الموقع الذي سيُنشر عليه المعرض.`)
  process.exit(1)
}
const placeholder = /EXAMPLE|example\.(com|org|net)$|localhost|127\.0\.0\.1/i.test(new URL(base).host)

const index = JSON.parse(fs.readFileSync(path.join(app, 'src/content/generated/mural-index.json'), 'utf8')).items
const indic = (v) => String(v).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

/* ---------- PNG أحادي البت بحجم 1024×1024 بالضبط (وحدات صحيحة الحجم ← حواف حادة للطباعة) ---------- */
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
function pngOf(qr) {
  const n = qr.modules.size
  const scale = Math.floor(PX / (n + QUIET * 2)) // أكبر وحدة صحيحة تُبقي ≥ 4 وحدات منطقة هادئة
  const side = n * scale
  const off = Math.floor((PX - side) / 2)
  const rowBytes = PX / 8
  const raw = Buffer.alloc((rowBytes + 1) * PX, 0xff) // 1 = أبيض؛ أول بايت في كل صف = مرشّح 0
  for (let y = 0; y < PX; y++) raw[y * (rowBytes + 1)] = 0
  for (let my = 0; my < n; my++) {
    for (let mx = 0; mx < n; mx++) {
      if (!qr.modules.get(my, mx)) continue // فاتح
      for (let dy = 0; dy < scale; dy++) {
        const y = off + my * scale + dy
        for (let dx = 0; dx < scale; dx++) {
          const x = off + mx * scale + dx
          raw[y * (rowBytes + 1) + 1 + (x >> 3)] &= ~(0x80 >> (x & 7)) // 0 = أسود
        }
      }
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(PX, 0)
  ihdr.writeUInt32BE(PX, 4)
  ihdr[8] = 1 // عمق البت
  ihdr[9] = 0 // تدرّج رمادي
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ---------- التوليد ---------- */
fs.mkdirSync(outDir, { recursive: true })
for (const f of fs.readdirSync(outDir)) if (/^m\d\d-.*\.(svg|png)$/.test(f) || f === 'index.html' || f === 'qr-manifest.json') fs.rmSync(path.join(outDir, f))

const opts = { errorCorrectionLevel: EC, margin: QUIET, color: { dark: DARK, light: LIGHT } }
const items = []
for (const m of index) {
  const url = `${base}/#/mural/${m.id}`
  const qr = QRCode.create(url, { errorCorrectionLevel: EC })
  let svg = await QRCode.toString(url, { ...opts, type: 'svg' })
  svg = svg.replace('<svg ', `<svg width="${PX}" height="${PX}" role="img" aria-label="${esc(`رمز QR — الجدارية ${indic(m.page)}: ${m.label}`)}" `)
  fs.writeFileSync(path.join(outDir, `${m.id}.svg`), svg, 'utf8')
  fs.writeFileSync(path.join(outDir, `${m.id}.png`), pngOf(qr))
  items.push({ id: m.id, page: m.page, title: m.title, label: m.label, url, svg: `${m.id}.svg`, png: `${m.id}.png`, modules: qr.modules.size, errorCorrection: EC, quietZoneModules: QUIET, inlineSvg: svg.replace(/<\?xml[^>]*\?>\s*/, '') })
}

/* ---------- ورقة الطباعة (A4، 3×3 في الصفحة) ---------- */
const PER_PAGE = 9
const pages = []
for (let i = 0; i < items.length; i += PER_PAGE) pages.push(items.slice(i, i + PER_PAGE))
const cell = (it) => `<figure class="cell">
  <div class="qr">${it.inlineSvg}</div>
  <figcaption>
    <div class="no">الجدارية ${indic(it.page)} من ${indic(items.length)}</div>
    <div class="lb">${esc(it.label.replace(/\d+/g, indic))}</div>
    <div class="tt">${esc(it.title.replace(/\d+/g, indic))}</div>
    <div class="url" dir="ltr">${esc(it.url)}</div>
  </figcaption>
</figure>`
const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>رموز QR للجداريات — «السعودية… حكاية وطن»</title>
<style>
@page{size:A4;margin:10mm}
*{box-sizing:border-box}
body{margin:0;background:#f4efe3;color:#141210;font-family:"Amiri","Noto Naskh Arabic","Traditional Arabic","Segoe UI",Tahoma,serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:190mm;min-height:277mm;margin:8mm auto;background:#fff;padding:8mm;box-shadow:0 2px 14px rgba(0,0,0,.18);break-after:page;position:relative}
.page:last-child{break-after:auto}
header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:.6mm solid #7d5f22;padding-bottom:3mm;margin-bottom:5mm}
header h1{margin:0;font-size:19pt;color:#0a3d2a}
header p{margin:0;font-size:9.5pt;color:#5b5346}
header .base{direction:ltr;font:8pt/1.4 ui-monospace,Consolas,monospace;color:#7d5f22;text-align:left}
.warn{background:#fff3cd;border:.4mm solid #c9a45c;color:#6b4e00;padding:2.5mm 4mm;margin-bottom:5mm;font-size:10pt}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}
.cell{margin:0;border:.3mm dashed #b9a56c;padding:4mm 3mm 3mm;text-align:center;break-inside:avoid}
.qr svg{display:block;width:100%;height:auto}
.no{font-size:9.5pt;color:#7d5f22;margin-top:2mm}
.lb{font-size:13pt;font-weight:700;line-height:1.3;color:#0a3d2a}
.tt{font-size:9pt;color:#5b5346;line-height:1.35;min-height:2.7em}
.url{font:6.2pt/1.3 ui-monospace,Consolas,monospace;color:#6f675a;word-break:break-all;margin-top:1mm;text-align:center}
footer{position:absolute;inset-inline:8mm;bottom:5mm;font-size:8pt;color:#8a8170;text-align:center}
@media print{body{background:#fff}.page{margin:0;box-shadow:none;width:auto;min-height:0;padding:0}footer{display:none}}
</style>
</head>
<body>
${pages
  .map(
    (pg, i) => `<section class="page">
${
  i === 0
    ? `<header><div><h1>رموز QR للجداريات</h1><p>معرض «السعودية… حكاية وطن» — كل رمز يفتح جدارية المجلة المقابلة على الهاتف · ${indic(items.length)} جدارية · تصحيح أخطاء ${EC} · منطقة هادئة ${indic(QUIET)} وحدات</p></div><div class="base">${esc(base)}</div></header>${placeholder ? `<div class="warn"><strong>تنبيه:</strong> هذه الرموز مبنيّة على عنوان تجريبي (${esc(base)}) ولا تصلح للطباعة. أعد التوليد بعنوان الموقع الحقيقي: <bdi dir="ltr">node scripts/make-qr.mjs https://عنوانكم</bdi></div>` : ''}`
    : ''
}
<div class="grid">
${pg.map(cell).join('\n')}
</div>
<footer>امسح الرمز بكاميرا الهاتف — صفحة ${indic(i + 1)} من ${indic(pages.length)}</footer>
</section>`,
  )
  .join('\n')}
</body>
</html>
`
fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8')

/* ---------- القائمة ---------- */
const manifest = {
  _meta: {
    purpose: 'رموز QR للجداريات المطبوعة — كل رمز يفتح #/mural/<id> في المعرض الرقمي',
    baseUrl: base,
    placeholderBase: placeholder,
    generatedAt: new Date().toISOString(),
    errorCorrection: EC,
    quietZoneModules: QUIET,
    pngSizePx: PX,
    colors: { dark: DARK, light: LIGHT },
    regenerate: 'node scripts/make-qr.mjs <baseUrl> (من مجلد app)',
  },
  items: items.map(({ inlineSvg, ...rest }) => rest),
}
fs.writeFileSync(path.join(outDir, 'qr-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')

console.log(`تم: ${items.length} رمزًا (SVG + PNG ${PX}px) + index.html + qr-manifest.json → ${outDir}`)
console.log(`مثال: ${items[3].url}`)
if (placeholder) console.log('تنبيه: العنوان تجريبي — لا تطبع هذه الرموز.')
