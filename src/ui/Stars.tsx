import { useEffect, useRef } from 'react'
import { CELEBRATION_EVERY } from '../logic/reward'
import type { LevelBus } from '../useVoiceEngine'

const R = 46
const C = 2 * Math.PI * R

/** Star collection plus a ring showing progress to the next star. */
export function Stars({ bus, stars, justEarned }: { bus: LevelBus; stars: number; justEarned: number }) {
  const ring = useRef<SVGCircleElement>(null)
  useEffect(
    () =>
      bus.subscribe((_l, progress) => {
        ring.current?.setAttribute('stroke-dashoffset', String(C * (1 - progress)))
      }),
    [bus],
  )
  const row = stars % CELEBRATION_EVERY
  const rounds = Math.floor(stars / CELEBRATION_EVERY)

  return (
    <div className="stars" aria-label={`${stars} stars`}>
      <div className="ring">
        <svg viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={R} className="ring-bg" />
          <circle ref={ring} cx="55" cy="55" r={R} className="ring-fg" strokeDasharray={C} strokeDashoffset={C} />
        </svg>
        <span key={justEarned} className="ring-star">⭐</span>
      </div>
      <div className="star-row">
        {Array.from({ length: CELEBRATION_EVERY }, (_, i) => (
          <span key={i} className={i < row ? 'star on' : 'star'}>⭐</span>
        ))}
      </div>
      {rounds > 0 && <div className="trophies">{'🏆'.repeat(Math.min(rounds, 5))}{rounds > 5 ? `+${rounds - 5}` : ''}</div>}
    </div>
  )
}
