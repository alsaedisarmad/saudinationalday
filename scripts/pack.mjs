// يبني نسختي التسليم ويضعهما في ../deliverables:
//   web/                        مجلد للاستضافة (عنوانه يُوضع في QR الجداريات)
//   المعرض-للسبورة.html        ملف واحد يعمل من القرص بلا إنترنت (للسبورة)
// الاستعمال: npm run pack
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
const app = path.resolve(import.meta.dirname, '..')
const out = path.resolve(app, '..', 'deliverables')
const run = (c) => execSync(c, { cwd: app, stdio: 'inherit' })
run('npx tsc --noEmit')
run('npx vite build')
run('npx vite build --config vite.artifact.config.ts')
run('node scripts/inline-artifact.mjs')
fs.mkdirSync(out, { recursive: true })
fs.rmSync(path.join(out, 'web'), { recursive: true, force: true })
fs.cpSync(path.join(app, 'dist'), path.join(out, 'web'), { recursive: true })
fs.copyFileSync(path.join(app, 'dist-artifact', 'standalone.html'), path.join(out, 'المعرض-للسبورة.html'))
const mb = (f) => (fs.statSync(f).size / 1048576).toFixed(1) + ' MB'
console.log('web/ ✓ · المعرض-للسبورة.html', mb(path.join(out, 'المعرض-للسبورة.html')))
