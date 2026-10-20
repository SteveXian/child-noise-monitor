import { useRef, useState } from 'react'

const HOLD_MS = 1500

/** Gear button that must be held, so young children do not open parent settings by accident. */
export function ParentButton({ onUnlock }: { onUnlock: () => void }) {
  const timer = useRef(0)
  const [holding, setHolding] = useState(false)
  const cancel = () => {
    clearTimeout(timer.current)
    setHolding(false)
  }
  return (
    <button
      className={holding ? 'gear holding' : 'gear'}
      aria-label="Parent settings (press and hold)"
      title="Press and hold"
      onPointerDown={() => {
        setHolding(true)
        timer.current = window.setTimeout(() => {
          setHolding(false)
          onUnlock()
        }, HOLD_MS)
      }}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => e.key === 'Enter' && onUnlock()}
    >
      ⚙️
    </button>
  )
}
