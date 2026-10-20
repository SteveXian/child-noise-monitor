import { useEffect } from 'react'

const COLORS = ['#ff6b6b', '#ffd84d', '#4fd283', '#4dabf7', '#b197fc', '#ff9ab5']

/** Gentle confetti burst; dismisses itself. */
export function Celebration({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 4000)
    return () => clearTimeout(id)
  }, [onDone])
  return (
    <div className="celebration" onClick={onDone} aria-hidden="true">
      {Array.from({ length: 40 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 10) * 0.12}s`,
            animationDuration: `${2 + (i % 5) * 0.4}s`,
          }}
        />
      ))}
      <div className="celebration-text">🎉 ⭐⭐⭐⭐⭐ 🎉</div>
    </div>
  )
}
