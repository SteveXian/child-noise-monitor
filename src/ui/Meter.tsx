import { useEffect, useRef } from 'react'
import type { LevelBus } from '../useVoiceEngine'
import type { Thresholds } from '../logic/types'

/** Width of the meter in relative dB beyond the "very loud" threshold. */
const HEADROOM_DB = 10

/** Three-zone loudness meter. The marker is moved directly in the DOM to avoid React re-renders. */
export function Meter({ bus, thresholds }: { bus: LevelBus; thresholds: Thresholds }) {
  const marker = useRef<HTMLDivElement>(null)
  const max = thresholds.veryLoud + HEADROOM_DB
  const pct = (v: number) => `${(v / max) * 100}%`

  useEffect(
    () =>
      bus.subscribe((level) => {
        if (marker.current) marker.current.style.left = `${Math.min(1, level / max) * 100}%`
      }),
    [bus, max],
  )

  return (
    <div className="meter" role="meter" aria-label="Voice loudness">
      <div className="meter-track">
        <div className="zone zone-quiet" style={{ width: pct(thresholds.normal) }}>🤫</div>
        <div className="zone zone-good" style={{ width: pct(thresholds.loud - thresholds.normal) }}>😀</div>
        <div className="zone zone-loud" style={{ width: pct(max - thresholds.loud) }}>🙉</div>
        <div className="meter-marker" ref={marker} />
      </div>
    </div>
  )
}
