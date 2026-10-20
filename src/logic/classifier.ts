import type { Thresholds, VoiceState } from './types'

const ORDER: VoiceState[] = ['quiet', 'normal', 'loud', 'veryLoud']

export interface ClassifierOptions {
  /** dB the level must fall below a threshold before stepping back down. */
  hysteresisDb: number
  /** How long a new state must persist before it is adopted (ms). */
  sustainMs: number
}

export const DEFAULT_CLASSIFIER_OPTIONS: ClassifierOptions = {
  hysteresisDb: 2,
  sustainMs: 250,
}

/** Pure zone lookup without hysteresis. */
export function zoneFor(level: number, t: Thresholds): VoiceState {
  if (level >= t.veryLoud) return 'veryLoud'
  if (level >= t.loud) return 'loud'
  if (level >= t.normal) return 'normal'
  return 'quiet'
}

/**
 * Classifies loudness with hysteresis (to avoid flapping at boundaries) and a
 * short sustain time (so brief noises do not trigger a reaction).
 */
export class LoudnessClassifier {
  private current: VoiceState = 'quiet'
  private candidate: VoiceState | null = null
  private candidateSince = 0

  private thresholds: Thresholds
  private options: ClassifierOptions

  constructor(thresholds: Thresholds, options: ClassifierOptions = DEFAULT_CLASSIFIER_OPTIONS) {
    this.thresholds = thresholds
    this.options = options
  }

  get state(): VoiceState {
    return this.current
  }

  setThresholds(t: Thresholds): void {
    this.thresholds = t
  }

  reset(): void {
    this.current = 'quiet'
    this.candidate = null
  }

  /** Target state given the current state, applying hysteresis. */
  private target(level: number): VoiceState {
    const { thresholds: t, options } = this
    const cur = ORDER.indexOf(this.current)
    const raw = ORDER.indexOf(zoneFor(level, t))
    if (raw >= cur) return ORDER[raw]
    // Going down: the level must drop below the lower edge of the current zone minus hysteresis.
    const edges = [0, t.normal, t.loud, t.veryLoud]
    let idx = cur
    while (idx > 0 && level < edges[idx] - options.hysteresisDb) idx--
    return ORDER[Math.max(idx, raw)]
  }

  update(level: number, nowMs: number): VoiceState {
    const target = this.target(level)
    if (target === this.current) {
      this.candidate = null
    } else if (target !== this.candidate) {
      this.candidate = target
      this.candidateSince = nowMs
    } else if (nowMs - this.candidateSince >= this.options.sustainMs) {
      this.current = target
      this.candidate = null
    }
    return this.current
  }
}
