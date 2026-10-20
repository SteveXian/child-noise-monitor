/** Root-mean-square amplitude of a block of samples (-1..1). */
export function rms(samples: ArrayLike<number>): number {
  if (samples.length === 0) return 0
  let sum = 0
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i]
  return Math.sqrt(sum / samples.length)
}

export const MIN_DB = -100

/** Level in dB relative to digital full scale. This is not dB SPL. */
export function toDb(amplitude: number): number {
  return amplitude <= 0 ? MIN_DB : Math.max(MIN_DB, 20 * Math.log10(amplitude))
}

/** Relative level in dB above the room noise floor, with sensitivity gain; never negative. */
export function relativeDb(db: number, noiseFloorDb: number, sensitivityDb = 0): number {
  return Math.max(0, db - noiseFloorDb + sensitivityDb)
}

/** Fast attack, slow release smoothing to limit flicker. */
export class LevelSmoother {
  private value = 0
  private attack: number
  private release: number

  constructor(attack = 0.35, release = 0.08) {
    this.attack = attack
    this.release = release
  }

  next(input: number): number {
    const k = input > this.value ? this.attack : this.release
    this.value += (input - this.value) * k
    return this.value
  }

  reset(): void {
    this.value = 0
  }
}
