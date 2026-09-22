// محرّك صوت إجرائي (Web Audio) — بلا ملفات: بيئة لكل قاعة + مؤثرات تفاعل صغيرة. لا صوت قبل إيماءة (TECHNICAL_ARCHITECTURE §9).
type AmbientSpec = {
  osc: { f: number; type?: OscillatorType; g: number; det?: number }[]
  noise?: { cutoff: number; g: number; q?: number }
  lfo?: number // سرعة تحريك المرشّح (Hz)
  reverb?: number // 0..1
}

const A: Record<string, AmbientSpec> = {
  gate: { osc: [{ f: 55, g: 0.5 }, { f: 82.4, g: 0.22 }, { f: 110, g: 0.1, det: 6 }], noise: { cutoff: 420, g: 0.16 }, lfo: 0.05, reverb: 0.5 },
  courtyard: { osc: [{ f: 110, g: 0.3 }, { f: 164.8, g: 0.16, det: -5 }, { f: 220, g: 0.1, det: 4 }], noise: { cutoff: 700, g: 0.12 }, lfo: 0.07, reverb: 0.55 },
  roots: { osc: [{ f: 73.4, g: 0.45 }, { f: 146.8, g: 0.2, det: 3 }, { f: 293.7, g: 0.07, det: -4 }, { f: 440, g: 0.03 }], noise: { cutoff: 260, g: 0.08 }, lfo: 0.04, reverb: 0.85 },
  safe: { osc: [{ f: 65.4, g: 0.4 }, { f: 98, g: 0.2 }, { f: 196, g: 0.08, det: 5 }], noise: { cutoff: 380, g: 0.1 }, lfo: 0.06, reverb: 0.7 },
  path: { osc: [{ f: 98, g: 0.26 }, { f: 147, g: 0.18, det: -4 }, { f: 196, g: 0.12 }, { f: 392, g: 0.04, det: 5 }], noise: { cutoff: 900, g: 0.09 }, lfo: 0.08, reverb: 0.5 },
  land: { osc: [{ f: 130.8, g: 0.22 }, { f: 196, g: 0.15 }, { f: 261.6, g: 0.08, det: 4 }], noise: { cutoff: 1200, g: 0.08 }, lfo: 0.1, reverb: 0.4 },
  majlis: { osc: [{ f: 87.3, g: 0.34 }, { f: 130.8, g: 0.2, det: 3 }, { f: 174.6, g: 0.1 }], noise: { cutoff: 520, g: 0.13 }, lfo: 0.09, reverb: 0.35 },
  values: { osc: [{ f: 110, g: 0.3 }, { f: 165, g: 0.2 }, { f: 220, g: 0.15, det: 4 }, { f: 330, g: 0.06 }], noise: { cutoff: 600, g: 0.08 }, lfo: 0.06, reverb: 0.55 },
  challenge: { osc: [{ f: 98, g: 0.2 }, { f: 147, g: 0.12 }], noise: { cutoff: 800, g: 0.05 }, lfo: 0.05, reverb: 0.3 },
  future: { osc: [{ f: 65.4, g: 0.34 }, { f: 130.8, g: 0.16, det: 3 }, { f: 261.6, g: 0.08, det: -6 }, { f: 523, g: 0.03 }], noise: { cutoff: 1500, g: 0.06 }, lfo: 0.07, reverb: 0.8 },
  murals: { osc: [{ f: 98, g: 0.24 }, { f: 147, g: 0.14, det: 3 }], noise: { cutoff: 600, g: 0.05 }, lfo: 0.05, reverb: 0.5 },
  students: { osc: [{ f: 110, g: 0.26 }, { f: 165, g: 0.16 }, { f: 220, g: 0.08, det: 4 }], noise: { cutoff: 700, g: 0.06 }, lfo: 0.06, reverb: 0.45 },
  wall: { osc: [{ f: 82.4, g: 0.3 }, { f: 123.5, g: 0.16 }, { f: 247, g: 0.08, det: -5 }], noise: { cutoff: 500, g: 0.08 }, lfo: 0.05, reverb: 0.8 },
  finale: { osc: [{ f: 55, g: 0.44 }, { f: 82.4, g: 0.26 }, { f: 165, g: 0.14, det: 4 }, { f: 330, g: 0.06 }], noise: { cutoff: 700, g: 0.1 }, lfo: 0.04, reverb: 0.9 },
  about: { osc: [{ f: 98, g: 0.2 }, { f: 147, g: 0.12 }], noise: { cutoff: 500, g: 0.05 }, lfo: 0.05, reverb: 0.5 },
}

class Engine {
  private ctx?: AudioContext
  private master?: GainNode
  private verb?: ConvolverNode
  private verbSend?: GainNode
  private cur?: { gain: GainNode; stop: () => void; name: string }
  private enabled = false
  private want = 'gate'
  private noiseBuf?: AudioBuffer

  /** يجب استدعاؤها من داخل معالج إيماءة (لمس/نقر) */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0
      this.master.connect(this.ctx.destination)
      this.verb = this.ctx.createConvolver()
      this.verb.buffer = this.impulse(3.4)
      this.verbSend = this.ctx.createGain()
      this.verbSend.gain.value = 1
      this.verbSend.connect(this.verb)
      this.verb.connect(this.master)
      this.noiseBuf = this.makeNoise()
    }
    void this.ctx.resume()
  }

  private impulse(sec: number) {
    const c = this.ctx!
    const len = Math.floor(c.sampleRate * sec)
    const b = c.createBuffer(2, len, c.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
    }
    return b
  }
  private makeNoise() {
    const c = this.ctx!
    const b = c.createBuffer(1, c.sampleRate * 4, c.sampleRate)
    const d = b.getChannelData(0)
    let last = 0
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1
      last = (last + 0.02 * w) / 1.02 // ضوضاء بنّية ناعمة
      d[i] = last * 3.2
    }
    return b
  }

  /** يخفض بيئة القاعة أثناء تشغيل مقطع صوتي (الأداء الصوتي أولًا) ثم يعيدها */
  duck(on: boolean) {
    if (!this.ctx || !this.master || !this.enabled) return
    const t = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setTargetAtTime(on ? 0.08 : 0.55, t, 0.4)
  }

  setEnabled(on: boolean) {
    this.enabled = on
    if (!this.ctx || !this.master) return
    const t = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setTargetAtTime(on ? 0.55 : 0, t, 0.35)
    if (on) this.ambient(this.want)
  }

  /** بيئة صوتية للقاعة: تدرّج متبادل 1.6 ثانية */
  ambient(name: string) {
    this.want = name
    const c = this.ctx
    if (!c || !this.master || !this.enabled) return
    if (this.cur?.name === name) return
    const spec = A[name] ?? A.courtyard
    const out = c.createGain()
    out.gain.value = 0
    const dry = c.createGain()
    dry.gain.value = 1 - (spec.reverb ?? 0) * 0.55
    const wet = c.createGain()
    wet.gain.value = spec.reverb ?? 0.4
    out.connect(dry).connect(this.master)
    out.connect(wet).connect(this.verbSend!)
    const nodes: AudioScheduledSourceNode[] = []
    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 900
    filter.connect(out)
    for (const o of spec.osc) {
      const osc = c.createOscillator()
      osc.type = o.type ?? 'sine'
      osc.frequency.value = o.f
      osc.detune.value = o.det ?? 0
      const g = c.createGain()
      g.gain.value = o.g * 0.12
      osc.connect(g).connect(filter)
      osc.start()
      nodes.push(osc)
    }
    if (spec.noise) {
      const n = c.createBufferSource()
      n.buffer = this.noiseBuf!
      n.loop = true
      const nf = c.createBiquadFilter()
      nf.type = 'lowpass'
      nf.frequency.value = spec.noise.cutoff
      nf.Q.value = spec.noise.q ?? 0.6
      const ng = c.createGain()
      ng.gain.value = spec.noise.g * 0.22
      n.connect(nf).connect(ng).connect(out)
      n.start()
      nodes.push(n)
    }
    if (spec.lfo) {
      const l = c.createOscillator()
      l.frequency.value = spec.lfo
      const lg = c.createGain()
      lg.gain.value = 260
      l.connect(lg).connect(filter.frequency)
      l.start()
      nodes.push(l)
    }
    const t = c.currentTime
    out.gain.setTargetAtTime(1, t, 0.7)
    const prev = this.cur
    if (prev) {
      prev.gain.gain.setTargetAtTime(0, t, 0.5)
      setTimeout(prev.stop, 2600)
    }
    this.cur = { gain: out, name, stop: () => nodes.forEach((n) => { try { n.stop() } catch { /* منتهٍ */ } }) }
  }

  private ok() {
    return !!this.ctx && this.enabled && !!this.master
  }

  /** نغمة جرس ناعمة (سلم بنتاتوني) */
  chime(step = 0, vel = 1) {
    if (!this.ok()) return
    const c = this.ctx!
    const scale = [0, 2, 4, 7, 9, 12, 14, 16]
    const f = 392 * Math.pow(2, scale[step % scale.length] / 12)
    const t = c.currentTime
    for (const [mul, g, dec] of [[1, 0.16, 1.8], [2.01, 0.05, 1.0], [3.98, 0.02, 0.6]] as const) {
      const o = c.createOscillator()
      o.type = 'sine'
      o.frequency.value = f * mul
      const gn = c.createGain()
      gn.gain.setValueAtTime(0, t)
      gn.gain.linearRampToValueAtTime(g * vel, t + 0.012)
      gn.gain.exponentialRampToValueAtTime(0.0001, t + dec)
      o.connect(gn)
      gn.connect(this.master!)
      gn.connect(this.verbSend!)
      o.start(t)
      o.stop(t + dec + 0.05)
    }
  }

  /** «هسيس» الخيط: ضوضاء عبر مرشّح ممرِّر نطاق يمسح تردّدًا */
  whoosh(dur = 1.4) {
    if (!this.ok()) return
    const c = this.ctx!
    const t = c.currentTime
    const n = c.createBufferSource()
    n.buffer = this.noiseBuf!
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 1.2
    bp.frequency.setValueAtTime(240, t)
    bp.frequency.exponentialRampToValueAtTime(2400, t + dur * 0.7)
    const g = c.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.5, t + dur * 0.4)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    n.connect(bp).connect(g)
    g.connect(this.master!)
    g.connect(this.verbSend!)
    n.start(t)
    n.stop(t + dur + 0.05)
  }

  /** صبّ سائل (قهوة): ضوضاء ترددها يهبط */
  pour(dur = 1.6) {
    if (!this.ok()) return
    const c = this.ctx!
    const t = c.currentTime
    const n = c.createBufferSource()
    n.buffer = this.noiseBuf!
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 3
    bp.frequency.setValueAtTime(1800, t)
    bp.frequency.exponentialRampToValueAtTime(700, t + dur)
    const g = c.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.45, t + 0.1)
    g.gain.setValueAtTime(0.45, t + dur - 0.3)
    g.gain.linearRampToValueAtTime(0, t + dur)
    n.connect(bp).connect(g).connect(this.master!)
    n.start(t)
    n.stop(t + dur + 0.05)
  }

  /** نقرة ناعمة */
  tick() {
    if (!this.ok()) return
    const c = this.ctx!
    const t = c.currentTime
    const o = c.createOscillator()
    o.type = 'triangle'
    o.frequency.setValueAtTime(880, t)
    o.frequency.exponentialRampToValueAtTime(440, t + 0.06)
    const g = c.createGain()
    g.gain.setValueAtTime(0.12, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08)
    o.connect(g).connect(this.master!)
    o.start(t)
    o.stop(t + 0.1)
  }
}

export const audio = new Engine()
