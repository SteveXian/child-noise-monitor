import { useCallback, useEffect, useState } from 'react'
import { loadSettings, saveSettings } from './logic/settings'
import type { Settings } from './logic/types'
import { Celebration } from './ui/Celebration'
import { Dino } from './ui/Dino'
import { Meter } from './ui/Meter'
import { ParentButton } from './ui/ParentButton'
import { ParentSettings } from './ui/ParentSettings'
import { Stars } from './ui/Stars'
import { useVoiceEngine } from './useVoiceEngine'

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [showParent, setShowParent] = useState(false)
  const engine = useVoiceEngine(settings)
  const { micStatus, start, stop } = engine

  const update = useCallback((s: Settings) => {
    setSettings(s)
    saveSettings(s)
  }, [])

  // Release the microphone while parent settings are open.
  useEffect(() => {
    if (showParent) stop()
  }, [showParent, stop])

  const listening = micStatus === 'listening'
  const blocked = micStatus === 'denied' || micStatus === 'unavailable'

  return (
    <main className={`app voice-${engine.voice}`}>
      <header>
        <Stars bus={engine.bus} stars={engine.stars} justEarned={engine.justEarned} />
        <ParentButton onUnlock={() => setShowParent(true)} />
      </header>

      <section className="stage">
        <Dino state={engine.voice} />
      </section>

      <Meter bus={engine.bus} thresholds={settings.thresholds} />

      <footer>
        {blocked ? (
          <div className="blocked" role="alert">
            <p>
              {micStatus === 'denied'
                ? '🎤🚫 Microphone is off. A grown-up can allow it in the browser settings.'
                : '🎤❓ No microphone found.'}
            </p>
            <button className="btn big" onClick={start}>Try again</button>
          </div>
        ) : listening ? (
          <button className="btn big stop" onClick={stop} aria-label="Pause">⏸️</button>
        ) : (
          <button className="btn big play" onClick={start} aria-label="Start">🎤 ▶️</button>
        )}
      </footer>

      {engine.celebrating && <Celebration onDone={engine.endCelebration} />}
      {showParent && (
        <ParentSettings
          settings={settings}
          stars={engine.stars}
          onChange={update}
          onMeasureRoom={engine.measureRoom}
          onResetStars={engine.resetStars}
          onClose={() => setShowParent(false)}
        />
      )}
    </main>
  )
}
