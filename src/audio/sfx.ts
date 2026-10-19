let ctx: AudioContext | null = null

/** Soft, pleasant chime made of rising sine notes. No microphone data involved. */
export function playChime(notes: number[] = [523.25, 659.25, 783.99]): void {
  try {
    ctx ??= new AudioContext()
    const c = ctx
    void c.resume()
    notes.forEach((f, i) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      const t = c.currentTime + i * 0.12
      osc.type = 'sine'
      osc.frequency.value = f
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.15, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      osc.connect(gain).connect(c.destination)
      osc.start(t)
      osc.stop(t + 0.45)
    })
  } catch {
    /* sound is optional */
  }
}

export const playStarSound = () => playChime()
export const playCelebrationSound = () => playChime([523.25, 659.25, 783.99, 1046.5, 1318.5])
