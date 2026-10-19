import { rms, toDb } from './level'

export type MicError = 'denied' | 'unavailable'

/**
 * Reads microphone loudness locally via the Web Audio API. Samples are only
 * analysed in memory; they are never recorded, stored, played or sent anywhere.
 */
export class Microphone {
  private ctx: AudioContext | null = null
  private stream: MediaStream | null = null
  private analyser: AnalyserNode | null = null
  private buffer: Float32Array<ArrayBuffer> | null = null

  get active(): boolean {
    return this.stream !== null
  }

  /** Starts listening. Resolves to null on success or an error kind. */
  async start(): Promise<MicError | null> {
    if (this.active) return null
    if (!navigator.mediaDevices?.getUserMedia) return 'unavailable'
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      const Ctor = window.AudioContext
      const ctx = new Ctor()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      ctx.createMediaStreamSource(stream).connect(analyser)
      this.stream = stream
      this.ctx = ctx
      this.analyser = analyser
      this.buffer = new Float32Array(analyser.fftSize)
      if (ctx.state === 'suspended') await ctx.resume()
      return null
    } catch (e) {
      const name = e instanceof DOMException ? e.name : ''
      return name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable'
    }
  }

  /** Current instantaneous level in dBFS, or null when not listening. */
  readDb(): number | null {
    if (!this.analyser || !this.buffer) return null
    this.analyser.getFloatTimeDomainData(this.buffer)
    return toDb(rms(this.buffer))
  }

  /** Releases the microphone and audio resources. */
  stop(): void {
    this.stream?.getTracks().forEach((t) => t.stop())
    void this.ctx?.close()
    this.stream = null
    this.ctx = null
    this.analyser = null
    this.buffer = null
  }
}
