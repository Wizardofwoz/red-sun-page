// Synthesized "fart" sound effect using the Web Audio API.
// No audio files, no network. The AudioContext is created / resumed
// synchronously inside a click handler, which is what lets browsers start it.
//
// Phone speakers barely reproduce anything below ~200 Hz, so the sound is built
// from a sawtooth/square pair with plenty of harmonics (fundamental ~110-260 Hz)
// plus filtered noise, instead of a deep sub-bass rumble.

export type AudioResult = 'on' | 'blocked' | 'unsupported'

type AudioWindow = typeof window & { webkitAudioContext?: typeof AudioContext }

let ctx: AudioContext | null = null
let out: AudioNode | null = null

// Shared output chain: gain -> limiter-ish compressor -> speakers. Keeps loud
// bursts from clipping on small phone speakers. Exported so it can be tested offline.
export function buildOutput(ac: BaseAudioContext): AudioNode {
  const gain = ac.createGain()
  gain.gain.value = 1.0
  const comp = ac.createDynamicsCompressor()
  comp.threshold.value = -18
  comp.knee.value = 6
  comp.ratio.value = 12
  comp.attack.value = 0.002
  comp.release.value = 0.1
  const post = ac.createGain()
  post.gain.value = 1.6
  gain.connect(comp)
  comp.connect(post)
  post.connect(ac.destination)
  return gain
}

function getContext(): AudioContext | null {
  if (ctx) return ctx
  const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  out = buildOutput(ctx)
  return ctx
}

// Soft-clip curve for a bit of grit (louder on tiny speakers).
function makeCurve(amount = 3): Float32Array {
  const n = 1024
  const curve = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1
    curve[i] = Math.tanh(x * amount)
  }
  return curve
}

// Schedule a few wobbly bursts starting at `t0`. Returns total duration (s).
// Takes any BaseAudioContext so it can be rendered offline for testing.
export function scheduleFart(ac: BaseAudioContext, dest: AudioNode, t0: number, rand: () => number = Math.random): number {
  const bursts = 2 + Math.floor(rand() * 3) // 2-4 bursts
  const shaper = ac.createWaveShaper()
  shaper.curve = makeCurve(3) as Float32Array<ArrayBuffer>
  shaper.oversample = '2x'
  shaper.connect(dest)

  let t = t0
  for (let i = 0; i < bursts; i++) {
    const last = i === bursts - 1
    const dur = last ? 0.35 + rand() * 0.35 : 0.1 + rand() * 0.16
    const f0 = 190 + rand() * 90 // starting pitch
    const f1 = last ? 95 + rand() * 20 : f0 * (0.7 + rand() * 0.15)
    const end = t + dur

    // Envelope: fast attack, short hold, sagging tail.
    const env = ac.createGain()
    env.gain.setValueAtTime(0.0001, t)
    env.gain.exponentialRampToValueAtTime(0.9, t + 0.012)
    env.gain.setValueAtTime(0.9, t + dur * 0.55)
    env.gain.exponentialRampToValueAtTime(0.0001, end)

    // Keep it buzzy: lowpass sweeps down but stays well into the audible range.
    const lp = ac.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(1800, t)
    lp.frequency.exponentialRampToValueAtTime(600, end)
    lp.Q.value = 4
    lp.connect(env)
    env.connect(shaper)

    // Pitch: sawtooth + square an octave up, both sliding down with wobble.
    const wobble = ac.createOscillator()
    wobble.frequency.value = 22 + rand() * 12
    const wobbleDepth = ac.createGain()
    wobbleDepth.gain.value = f0 * 0.12
    wobble.connect(wobbleDepth)

    // Amplitude flutter (the "brrrp").
    const flutter = ac.createGain()
    flutter.gain.value = 0.6
    const flutterLfo = ac.createOscillator()
    flutterLfo.type = 'square'
    flutterLfo.frequency.setValueAtTime(40, t)
    flutterLfo.frequency.exponentialRampToValueAtTime(16, end)
    const flutterDepth = ac.createGain()
    flutterDepth.gain.value = 0.4
    flutterLfo.connect(flutterDepth)
    flutterDepth.connect(flutter.gain)
    flutter.connect(lp)

    const voices: OscillatorNode[] = []
    for (const [type, mult, level] of [['sawtooth', 1, 0.7], ['square', 2, 0.25]] as const) {
      const osc = ac.createOscillator()
      osc.type = type
      osc.frequency.setValueAtTime(f0 * mult, t)
      osc.frequency.exponentialRampToValueAtTime(f1 * mult, end)
      wobbleDepth.connect(osc.frequency)
      const g = ac.createGain()
      g.gain.value = level
      osc.connect(g)
      g.connect(flutter)
      voices.push(osc)
    }

    // Breathy noise through a band that sits where phones can reproduce it.
    const frames = Math.max(1, Math.ceil(ac.sampleRate * dur))
    const buf = ac.createBuffer(1, frames, ac.sampleRate)
    const data = buf.getChannelData(0)
    for (let k = 0; k < frames; k++) data[k] = rand() * 2 - 1
    const noise = ac.createBufferSource()
    noise.buffer = buf
    const band = ac.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 420
    band.Q.value = 0.9
    const ng = ac.createGain()
    ng.gain.value = 0.3
    noise.connect(band)
    band.connect(ng)
    ng.connect(flutter)

    for (const n of [...voices, wobble, flutterLfo, noise]) {
      n.start(t)
      n.stop(end + 0.05)
    }
    t = end + (last ? 0 : 0.04 + rand() * 0.07)
  }
  return t - t0
}

// Create/resume the context. MUST be called synchronously from a click handler
// (before any `await`). Also plays one silent sample, which unlocks iOS Safari.
function unlock(): AudioContext | null {
  const ac = getContext()
  if (!ac) return null
  if (ac.state !== 'running') void ac.resume().catch(() => {})
  try {
    const src = ac.createBufferSource()
    src.buffer = ac.createBuffer(1, 1, 22050)
    src.connect(ac.destination)
    src.start(0)
  } catch {
    /* ignore */
  }
  return ac
}

async function settle(ac: AudioContext): Promise<AudioResult> {
  if (ac.state !== 'running') {
    // resume() can stay pending forever when the browser blocks it.
    await Promise.race([
      ac.resume().catch(() => {}),
      new Promise((r) => setTimeout(r, 400)),
    ])
  }
  return ac.state === 'running' ? 'on' : 'blocked'
}

/** Unlock audio without making noise (call from a click). */
export function enableAudio(): Promise<AudioResult> {
  const ac = unlock()
  return ac ? settle(ac) : Promise.resolve('unsupported')
}

/** Play one fart (call from a click). Resolves with whether audio is actually running. */
export function playFart(): Promise<AudioResult> {
  const ac = unlock()
  if (!ac || !out) return Promise.resolve('unsupported')
  scheduleFart(ac, out, ac.currentTime + 0.02)
  return settle(ac)
}
