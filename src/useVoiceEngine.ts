import { useCallback, useEffect, useRef, useState } from 'react'
import { LevelSmoother, relativeDb } from './audio/level'
import { Microphone } from './audio/microphone'
import { playCelebrationSound, playStarSound } from './audio/sfx'
import { LoudnessClassifier } from './logic/classifier'
import { RewardTracker } from './logic/reward'
import { loadStars, saveStars } from './logic/settings'
import type { Settings, VoiceState } from './logic/types'

export type MicStatus = 'idle' | 'listening' | 'denied' | 'unavailable'

type Listener = (level: number, progress: number) => void

/** High-frequency values go through this bus and straight to the DOM, bypassing React renders. */
export class LevelBus {
  private listeners = new Set<Listener>()
  level = 0
  progress = 0
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    fn(this.level, this.progress)
    return () => {
      this.listeners.delete(fn)
    }
  }
  emit(level: number, progress: number): void {
    this.level = level
    this.progress = progress
    this.listeners.forEach((fn) => fn(level, progress))
  }
}

export function useVoiceEngine(settings: Settings) {
  const settingsRef = useRef(settings)
  const [mic] = useState(() => new Microphone())
  const [bus] = useState(() => new LevelBus())
  const [smoother] = useState(() => new LevelSmoother())
  const [classifier] = useState(() => new LoudnessClassifier(settings.thresholds))
  const [reward] = useState(() => new RewardTracker(loadStars()))
  const raf = useRef(0)
  const wantListening = useRef(false)

  const [micStatus, setMicStatus] = useState<MicStatus>('idle')
  const [voice, setVoice] = useState<VoiceState>('quiet')
  const [stars, setStars] = useState(() => reward.stars)
  const [celebrating, setCelebrating] = useState(false)
  const [justEarned, setJustEarned] = useState(0)

  useEffect(() => {
    settingsRef.current = settings
    classifier.setThresholds(settings.thresholds)
  }, [settings, classifier])

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(raf.current)
    raf.current = 0
  }, [])

  const startLoop = useCallback(() => {
    stopLoop()
    let last = performance.now()
    const tick = (now: number) => {
      const s = settingsRef.current
      const db = mic.readDb()
      if (db !== null) {
        const level = smoother.next(relativeDb(db, s.noiseFloorDb, s.sensitivityDb))
        const next = classifier.update(level, now)
        const r = reward.update(next, now - last)
        setVoice((prev) => (prev === next ? prev : next))
        bus.emit(level, r.progress)
        if (r.earnedStar) {
          saveStars(r.stars)
          setStars(r.stars)
          setJustEarned((n) => n + 1)
          if (s.soundEnabled) (r.celebrate ? playCelebrationSound : playStarSound)()
          if (r.celebrate) setCelebrating(true)
        }
      }
      last = now
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }, [stopLoop, mic, smoother, classifier, reward, bus])

  const stop = useCallback(() => {
    wantListening.current = false
    stopLoop()
    mic.stop()
    smoother.reset()
    classifier.reset()
    reward.resetProgress()
    bus.emit(0, 0)
    setVoice('quiet')
    setMicStatus((s) => (s === 'listening' ? 'idle' : s))
  }, [stopLoop, mic, smoother, classifier, reward, bus])

  const start = useCallback(async () => {
    wantListening.current = true
    const err = await mic.start()
    if (!wantListening.current) {
      mic.stop()
      return
    }
    if (err) {
      wantListening.current = false
      setMicStatus(err)
      return
    }
    setMicStatus('listening')
    startLoop()
  }, [mic, startLoop])

  /** Release the microphone when the page is hidden; resume when visible again. */
  useEffect(() => {
    let resume = false
    const onVis = () => {
      if (document.hidden) {
        resume = wantListening.current
        if (resume) {
          stopLoop()
          mic.stop()
          smoother.reset()
        }
      } else if (resume) {
        resume = false
        void start()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      stopLoop()
      mic.stop()
    }
  }, [mic, start, stopLoop, smoother])

  /** Measures the room's background level (median dBFS over a few seconds). */
  const measureRoom = useCallback(
    async (ms = 3000): Promise<number | null> => {
      const startedHere = !mic.active
      if (startedHere) {
        const err = await mic.start()
        if (err) {
          setMicStatus(err)
          return null
        }
      }
      const samples: number[] = []
      await new Promise<void>((resolve) => {
        const id = window.setInterval(() => {
          const db = mic.readDb()
          if (db !== null) samples.push(db)
        }, 50)
        window.setTimeout(() => {
          clearInterval(id)
          resolve()
        }, ms)
      })
      if (startedHere) mic.stop()
      if (samples.length === 0) return null
      samples.sort((a, b) => a - b)
      return samples[Math.floor(samples.length / 2)]
    },
    [mic],
  )

  const resetStars = useCallback(() => {
    reward.resetStars()
    saveStars(0)
    setStars(0)
    bus.emit(bus.level, 0)
  }, [reward, bus])

  const endCelebration = useCallback(() => setCelebrating(false), [])

  return {
    bus,
    voice,
    stars,
    justEarned,
    celebrating,
    micStatus,
    start,
    stop,
    measureRoom,
    resetStars,
    endCelebration,
  }
}
