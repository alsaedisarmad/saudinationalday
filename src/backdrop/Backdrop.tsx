import { useEffect, useRef, useState } from 'react'
import { grades, rgb, type LightGrade } from '../design/tokens'
import { useStore } from '../session/store'
import { vert, frag } from './shader'

/** حالة قابلة للتعديل من القاعات (GSAP يحرّكها) — خارج React لتفادي إعادة التصيير */
export const backdrop = {
  grade: 'gate',
  thread: 0, // 0..1 من اليمين إلى اليسار
  threadY: 0.42,
  pulse: 0,
  bright: 1,
  /** قاعات بمشهد ثلاثي الأبعاد كامل الشاشة (المجلس) توقف الخلفية لتوفير الـGPU */
  paused: false,
  mouse: [0, 0] as [number, number],
}

type V3 = [number, number, number]
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

interface Cur {
  top: V3; mid: V3; bot: V3; ridge: V3; haze: V3; glow: V3
  horizon: number; stars: number; moon: number; ridges: number; dust: number
}
const fromGrade = (g: LightGrade): Cur => ({ top: rgb(g.top), mid: rgb(g.mid), bot: rgb(g.bottom), ridge: rgb(g.ridge), haze: rgb(g.haze), glow: rgb(g.glow), horizon: g.horizon, stars: g.stars, moon: g.moon, ridges: g.ridges, dust: g.dust })

export function Backdrop() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)
  const mode = useStore((s) => s.mode)
  const reduced = useStore((s) => s.reducedMotion)
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return // بعد الفشل نعرض تدرّجًا CSS بلا canvas: لا شيء نرسمه
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false })
    if (!gl) {
      setFailed(true)
      return
    }
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
      return s
    }
    let prog: WebGLProgram
    try {
      prog = gl.createProgram()!
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert))
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag))
      gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link')
    } catch (e) {
      console.warn('[backdrop] shader failed → CSS fallback', e)
      setFailed(true)
      return
    }
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = (n: string) => gl.getUniformLocation(prog, n)
    const u = { res: U('uRes'), time: U('uTime'), mouse: U('uMouse'), top: U('uTop'), mid: U('uMid'), bot: U('uBot'), ridge: U('uRidge'), haze: U('uHaze'), glow: U('uGlow'), horizon: U('uHorizon'), stars: U('uStars'), moon: U('uMoon'), ridges: U('uRidges'), dust: U('uDust'), thread: U('uThread'), threadY: U('uThreadY'), grain: U('uGrain'), pulse: U('uPulse'), bright: U('uBright') }

    let cur = fromGrade(grades[backdrop.grade])
    let quality = mode === 'mobile' ? 0.5 : mode === 'smartboard' ? 0.75 : 1 // معامل الدقة الداخلية
    let raf = 0
    let last = performance.now()
    let t = 0
    let slow = 0
    let frames = 0
    let mx = 0
    let my = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, mode === 'mobile' ? 1.25 : 2)
      const cap = 1080 / Math.max(canvas.clientHeight, 1) // سقف داخلي ≈ 1080p (السبورات 4K ضعيفة الرسوميات)
      const s = Math.max(0.4, Math.min(dpr, cap) * quality)
      canvas.width = Math.max(2, Math.floor(canvas.clientWidth * s))
      canvas.height = Math.max(2, Math.floor(canvas.clientHeight * s))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    const onLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
      setFailed(true)
    }
    canvas.addEventListener('webglcontextlost', onLost)

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const red = reducedRef.current
      if (backdrop.paused) { last = now; return }
      if (red && frames % 6 !== 0) { frames++; return } // ~10fps عند تقليل الحركة
      t += dt * (red ? 0.15 : 1)
      frames++
      // انسياب نحو تعليم الضوء الحالي
      const tg = fromGrade(grades[backdrop.grade] ?? grades.courtyard)
      const k = 1 - Math.exp(-dt * (red ? 8 : 1.7))
      cur = {
        top: lerp3(cur.top, tg.top, k), mid: lerp3(cur.mid, tg.mid, k), bot: lerp3(cur.bot, tg.bot, k),
        ridge: lerp3(cur.ridge, tg.ridge, k), haze: lerp3(cur.haze, tg.haze, k), glow: lerp3(cur.glow, tg.glow, k),
        horizon: lerp(cur.horizon, tg.horizon, k), stars: lerp(cur.stars, tg.stars, k), moon: lerp(cur.moon, tg.moon, k), ridges: lerp(cur.ridges, tg.ridges, k), dust: lerp(cur.dust, tg.dust, k),
      }
      backdrop.mouse[0] = lerp(backdrop.mouse[0], red ? 0 : mx, 0.04)
      backdrop.mouse[1] = lerp(backdrop.mouse[1], red ? 0 : my, 0.04)
      gl.uniform2f(u.res, canvas.width, canvas.height)
      gl.uniform1f(u.time, t)
      gl.uniform2f(u.mouse, backdrop.mouse[0], backdrop.mouse[1])
      gl.uniform3fv(u.top, cur.top); gl.uniform3fv(u.mid, cur.mid); gl.uniform3fv(u.bot, cur.bot)
      gl.uniform3fv(u.ridge, cur.ridge); gl.uniform3fv(u.haze, cur.haze); gl.uniform3fv(u.glow, cur.glow)
      gl.uniform1f(u.horizon, cur.horizon); gl.uniform1f(u.stars, cur.stars); gl.uniform1f(u.moon, cur.moon)
      gl.uniform1f(u.ridges, mode === 'mobile' ? Math.min(cur.ridges, 2) : cur.ridges); gl.uniform1f(u.dust, cur.dust)
      gl.uniform1f(u.thread, backdrop.thread); gl.uniform1f(u.threadY, backdrop.threadY ?? cur.horizon)
      gl.uniform1f(u.grain, 0.05); gl.uniform1f(u.pulse, backdrop.pulse); gl.uniform1f(u.bright, backdrop.bright)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      // ضبط الجودة تلقائيًا: إن تجاوز الإطار 26ms لفترة نخفّض الدقة الداخلية
      if (!red) {
        if (dt > 0.026) slow++
        else slow = Math.max(0, slow - 1)
        if (slow > 18 && quality > 0.3) { quality *= 0.8; slow = 0; resize() }
      }
    }
    raf = requestAnimationFrame(frame)
    const onVis = () => { if (document.hidden) cancelAnimationFrame(raf); else { last = performance.now(); raf = requestAnimationFrame(frame) } }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('webglcontextlost', onLost)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [mode])

  if (failed) {
    const g = grades[backdrop.grade] ?? grades.courtyard
    return <div className="layer-fill" style={{ background: `linear-gradient(to bottom, ${g.top}, ${g.mid} 55%, ${g.bottom})` }} aria-hidden />
  }
  return <canvas ref={ref} className="layer-fill" style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden />
}
