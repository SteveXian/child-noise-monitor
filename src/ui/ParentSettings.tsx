import { useState } from 'react'
import { DEFAULT_THRESHOLDS, MIN_GAP, normalizeThresholds } from '../logic/settings'
import type { Settings, Thresholds } from '../logic/types'

interface Props {
  settings: Settings
  stars: number
  onChange: (s: Settings) => void
  onMeasureRoom: () => Promise<number | null>
  onResetStars: () => void
  onClose: () => void
}

function Slider(props: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="slider">
      <span>{props.label}: {props.value.toFixed(0)}</span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={1}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  )
}

export function ParentSettings({ settings, stars, onChange, onMeasureRoom, onResetStars, onClose }: Props) {
  const [measuring, setMeasuring] = useState(false)
  const [message, setMessage] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const t = settings.thresholds

  const setT = (patch: Partial<Thresholds>) =>
    onChange({ ...settings, thresholds: normalizeThresholds({ ...t, ...patch }) })

  const measure = async () => {
    setMeasuring(true)
    setMessage('Please keep the room quiet for 3 seconds…')
    const db = await onMeasureRoom()
    setMeasuring(false)
    if (db === null) {
      setMessage('Could not hear the microphone. Please check permission.')
    } else {
      onChange({ ...settings, noiseFloorDb: db, calibrated: true })
      setMessage('Room noise saved ✔')
    }
  }

  return (
    <div className="parent" role="dialog" aria-label="Parent settings">
      <div className="parent-card">
        <h2>Parent settings</h2>

        <section>
          <h3>1. Room calibration</h3>
          <p>Keep the room as quiet as usual, then measure the background noise.</p>
          <button className="btn" disabled={measuring} onClick={measure}>
            {measuring ? 'Listening…' : settings.calibrated ? 'Measure again' : 'Measure room noise'}
          </button>
          {message && <p className="note" role="status">{message}</p>}
        </section>

        <section>
          <h3>2. Thresholds (dB above room noise)</h3>
          <Slider label="Normal voice starts" value={t.normal} min={1} max={40} onChange={(v) => setT({ normal: v })} />
          <Slider label="Too loud starts" value={t.loud} min={1 + MIN_GAP} max={50} onChange={(v) => setT({ loud: v })} />
          <Slider label="Very loud starts" value={t.veryLoud} min={1 + 2 * MIN_GAP} max={60} onChange={(v) => setT({ veryLoud: v })} />
          <Slider
            label="Sensitivity (dB)"
            value={settings.sensitivityDb}
            min={-12}
            max={12}
            onChange={(v) => onChange({ ...settings, sensitivityDb: v })}
          />
          <button className="btn small" onClick={() => onChange({ ...settings, thresholds: DEFAULT_THRESHOLDS, sensitivityDb: 0 })}>
            Restore defaults
          </button>
        </section>

        <section>
          <h3>3. Options</h3>
          <label className="check">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onChange({ ...settings, soundEnabled: e.target.checked })}
            />
            Sound effects
          </label>
          {confirmReset ? (
            <p>
              Reset {stars} stars?{' '}
              <button className="btn small danger" onClick={() => { onResetStars(); setConfirmReset(false) }}>Yes, reset</button>{' '}
              <button className="btn small" onClick={() => setConfirmReset(false)}>Cancel</button>
            </p>
          ) : (
            <button className="btn small" onClick={() => setConfirmReset(true)}>Reset stars</button>
          )}
        </section>

        <section>
          <h3>Privacy</h3>
          <p>
            Voice Buddy uses the microphone only to measure how loud it is, right on this device. Sound is never
            recorded, saved or sent anywhere. Only your settings and star count are stored on this device. Levels
            are relative, not exact decibels. You can revoke microphone permission any time in your browser settings.
          </p>
        </section>

        <button className="btn" onClick={onClose}>Done</button>
      </div>
    </div>
  )
}
