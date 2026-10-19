import type { VoiceState } from './types'

export const STAR_SECONDS = 10
export const CELEBRATION_EVERY = 5
/** Longest frame gap counted, so a paused tab cannot award stars. */
const MAX_DT_MS = 500

export interface RewardResult {
  stars: number
  /** Progress towards the next star, 0..1. */
  progress: number
  earnedStar: boolean
  celebrate: boolean
}

/**
 * Awards a star after STAR_SECONDS of continuous normal indoor voice.
 * Stars are never removed (only an explicit parent reset clears them).
 */
export class RewardTracker {
  private goodMs = 0
  stars: number
  private starMs: number

  constructor(stars = 0, starMs = STAR_SECONDS * 1000) {
    this.stars = stars
    this.starMs = starMs
  }

  update(state: VoiceState, dtMs: number): RewardResult {
    let earnedStar = false
    if (state === 'normal') {
      this.goodMs += Math.min(Math.max(dtMs, 0), MAX_DT_MS)
      if (this.goodMs >= this.starMs) {
        this.goodMs = 0
        this.stars += 1
        earnedStar = true
      }
    } else {
      this.goodMs = 0
    }
    return {
      stars: this.stars,
      progress: this.goodMs / this.starMs,
      earnedStar,
      celebrate: earnedStar && this.stars % CELEBRATION_EVERY === 0,
    }
  }

  /** Clears the in-progress timer without touching earned stars. */
  resetProgress(): void {
    this.goodMs = 0
  }

  /** Parent-only action. */
  resetStars(): void {
    this.stars = 0
    this.goodMs = 0
  }
}
