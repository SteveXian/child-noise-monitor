import type { Settings, Thresholds } from './types'

export const DEFAULT_THRESHOLDS: Thresholds = { normal: 8, loud: 22, veryLoud: 34 }

export const DEFAULT_SETTINGS: Settings = {
  thresholds: DEFAULT_THRESHOLDS,
  noiseFloorDb: -60,
  sensitivityDb: 0,
  soundEnabled: true,
  calibrated: false,
}

/** Minimum gap in dB kept between neighbouring thresholds. */
export const MIN_GAP = 3

/** Keeps thresholds ordered with a minimum gap between them. */
export function normalizeThresholds(t: Thresholds): Thresholds {
  const normal = Math.max(1, t.normal)
  const loud = Math.max(normal + MIN_GAP, t.loud)
  const veryLoud = Math.max(loud + MIN_GAP, t.veryLoud)
  return { normal, loud, veryLoud }
}

const KEY = 'voice-buddy-settings'
const STARS_KEY = 'voice-buddy-stars'

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

/** Only settings and the star count are stored. Audio is never stored. */
export function loadSettings(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Settings> | null
    if (!raw) return DEFAULT_SETTINGS
    const t: Partial<Thresholds> = raw.thresholds ?? {}
    return {
      thresholds: normalizeThresholds({
        normal: num(t.normal, DEFAULT_THRESHOLDS.normal),
        loud: num(t.loud, DEFAULT_THRESHOLDS.loud),
        veryLoud: num(t.veryLoud, DEFAULT_THRESHOLDS.veryLoud),
      }),
      noiseFloorDb: num(raw.noiseFloorDb, DEFAULT_SETTINGS.noiseFloorDb),
      sensitivityDb: num(raw.sensitivityDb, 0),
      soundEnabled: raw.soundEnabled !== false,
      calibrated: raw.calibrated === true,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* storage unavailable; ignore */
  }
}

export function loadStars(): number {
  try {
    const n = Number(localStorage.getItem(STARS_KEY))
    return Number.isInteger(n) && n > 0 ? n : 0
  } catch {
    return 0
  }
}

export function saveStars(n: number): void {
  try {
    localStorage.setItem(STARS_KEY, String(n))
  } catch {
    /* ignore */
  }
}
