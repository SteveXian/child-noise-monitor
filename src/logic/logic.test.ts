import { describe, expect, it } from 'vitest'
import { LevelSmoother, relativeDb, rms, toDb } from '../audio/level'
import { LoudnessClassifier, zoneFor } from './classifier'
import { RewardTracker } from './reward'
import { DEFAULT_THRESHOLDS, normalizeThresholds } from './settings'

const T = DEFAULT_THRESHOLDS // 8 / 22 / 34

describe('audio level', () => {
  it('computes rms and dB', () => {
    expect(rms([0.5, -0.5, 0.5, -0.5])).toBeCloseTo(0.5)
    expect(toDb(1)).toBeCloseTo(0)
    expect(toDb(0)).toBe(-100)
  })
  it('computes non-negative relative dB', () => {
    expect(relativeDb(-40, -60)).toBe(20)
    expect(relativeDb(-70, -60)).toBe(0)
    expect(relativeDb(-40, -60, 5)).toBe(25)
  })
  it('smooths with fast attack and slow release', () => {
    const s = new LevelSmoother()
    const up = s.next(10)
    const down = s.next(0) - up
    expect(up).toBeGreaterThan(Math.abs(down))
  })
})

describe('zoneFor', () => {
  it('maps levels to zones', () => {
    expect(zoneFor(0, T)).toBe('quiet')
    expect(zoneFor(8, T)).toBe('normal')
    expect(zoneFor(22, T)).toBe('loud')
    expect(zoneFor(40, T)).toBe('veryLoud')
  })
  it('normalizes thresholds to stay ordered', () => {
    const n = normalizeThresholds({ normal: 20, loud: 10, veryLoud: 5 })
    expect(n.loud).toBeGreaterThan(n.normal)
    expect(n.veryLoud).toBeGreaterThan(n.loud)
  })
})

describe('LoudnessClassifier', () => {
  it('ignores brief noises shorter than the sustain time', () => {
    const c = new LoudnessClassifier(T)
    c.update(0, 0)
    c.update(40, 100)
    expect(c.update(0, 200)).toBe('quiet')
  })
  it('adopts a state after it is sustained', () => {
    const c = new LoudnessClassifier(T)
    c.update(15, 0)
    expect(c.update(15, 300)).toBe('normal')
  })
  it('uses hysteresis when stepping down', () => {
    const c = new LoudnessClassifier(T)
    c.update(15, 0)
    c.update(15, 300)
    // just under the threshold but inside the hysteresis band stays normal
    c.update(7, 400)
    expect(c.update(7, 1000)).toBe('normal')
    // well below drops to quiet
    c.update(3, 1100)
    expect(c.update(3, 1500)).toBe('quiet')
  })
})

describe('RewardTracker', () => {
  const run = (r: RewardTracker, state: 'normal' | 'quiet' | 'loud', seconds: number) => {
    let last = r.update(state, 0)
    for (let i = 0; i < seconds * 10; i++) {
      const res = r.update(state, 100)
      if (res.earnedStar) last = res
    }
    return last
  }
  it('awards a star after 10 continuous seconds', () => {
    const r = new RewardTracker()
    expect(run(r, 'normal', 9).stars).toBe(0)
    expect(r.update('normal', 500).earnedStar).toBe(false)
    expect(r.update('normal', 500).earnedStar).toBe(true)
    expect(r.stars).toBe(1)
  })
  it('restarts progress when the voice leaves the normal zone, never losing stars', () => {
    const r = new RewardTracker(2)
    run(r, 'normal', 9)
    expect(r.update('loud', 100).progress).toBe(0)
    expect(r.stars).toBe(2)
  })
  it('does not count huge frame gaps', () => {
    const r = new RewardTracker()
    expect(r.update('normal', 60000).earnedStar).toBe(false)
  })
  it('celebrates on every 5th star', () => {
    const r = new RewardTracker(4)
    const res = run(r, 'normal', 10)
    expect(res.stars).toBe(5)
    expect(res.celebrate).toBe(true)
    expect(run(r, 'normal', 10).celebrate).toBe(false)
  })
  it('only resets stars explicitly', () => {
    const r = new RewardTracker(3)
    r.resetStars()
    expect(r.stars).toBe(0)
  })
})
