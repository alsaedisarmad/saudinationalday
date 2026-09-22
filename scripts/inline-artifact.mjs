// يدمج JS/CSS الناتجين في index.html واحد (بلا ملفات فرعية) — لنشره كصفحة مستقلة
import fs from 'node:fs'
import path from 'node:path'
const dir = path.resolve('dist-artifact')
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8')
const read = (rel) => fs.readFileSync(path.join(dir, rel.replace(/^\.\//, '')), 'utf8')
html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_, href) => `<style>${read(href)}</style>`)
const scripts = []
html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, src) => { scripts.push(read(src)); return '' })
const js = scripts.join('\n').replace(/<\/script/gi, '<\/script')
html = html.replace('</body>', () => `<script type="module">${js}</script></body>`)
fs.writeFileSync(path.join(dir, 'standalone.html'), html)
console.log('standalone.html', (html.length / 1048576).toFixed(2), 'MB')
