export type VoiceState = 'quiet' | 'normal' | 'loud' | 'veryLoud'

/** Thresholds are expressed in relative dB above the calibrated room noise. */
export interface Thresholds {
  /** At or above this level the voice counts as a normal indoor voice. */
  normal: number
  /** At or above this level the voice is too loud. */
  loud: number
  /** At or above this level the voice is very loud. */
  veryLoud: number
}

export interface Settings {
  thresholds: Thresholds
  /** Measured room background level in dBFS (relative, not dB SPL). */
  noiseFloorDb: number
  /** Extra gain in dB applied to the measured level (sensitivity). */
  sensitivityDb: number
  soundEnabled: boolean
  calibrated: boolean
}
