import type { VoiceState } from '../logic/types'

/** Original cartoon dinosaur whose face, arms and motion follow the voice state. */
export function Dino({ state }: { state: VoiceState }) {
  const eyes =
    state === 'loud' ? (
      <g stroke="#2b2350" strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M108 112 l22 8 l-22 8" />
        <path d="M192 112 l-22 8 l22 8" />
      </g>
    ) : (
      <g>
        {[125, 175].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="118" rx={state === 'veryLoud' ? 17 : 12} ry={state === 'veryLoud' ? 21 : 14} fill="#fff" />
            <circle cx={x} cy={state === 'veryLoud' ? 118 : 120} r={state === 'veryLoud' ? 5 : 7} fill="#2b2350" />
            <circle cx={x + 2} cy="115" r="2.5" fill="#fff" />
          </g>
        ))}
        {state === 'quiet' && (
          <g stroke="#2b2350" strokeWidth="4" strokeLinecap="round" fill="none">
            <path d="M110 100 q15 -8 30 0" />
            <path d="M160 100 q15 -8 30 0" />
          </g>
        )}
      </g>
    )

  const mouth = {
    quiet: <path d="M128 152 q22 18 44 0" stroke="#2b2350" strokeWidth="5" strokeLinecap="round" fill="none" />,
    normal: <path d="M122 148 q28 36 56 0 z" fill="#b8325a" stroke="#2b2350" strokeWidth="4" strokeLinejoin="round" />,
    loud: <path d="M126 158 q6 -8 12 0 t12 0 t12 0 t12 0" stroke="#2b2350" strokeWidth="5" strokeLinecap="round" fill="none" />,
    veryLoud: <ellipse cx="150" cy="160" rx="16" ry="22" fill="#b8325a" stroke="#2b2350" strokeWidth="4" />,
  }[state]

  return (
    <div className={`dino dino-${state}`} role="img" aria-label="Dino the dinosaur">
      <svg viewBox="0 0 300 320" width="100%" height="100%">
        <g className="dino-body">
          <g className="dino-tail">
            <path d="M80 240 C30 250 20 210 10 200 C40 200 55 215 90 205 Z" fill="#3fbf6e" />
          </g>
          <g fill="#ffb347">
            <path d="M138 28 l12 -22 l12 22 z" />
            <path d="M110 40 l8 -20 l14 20 z" />
            <path d="M168 40 l14 -20 l8 20 z" />
            <path d="M92 130 l-26 -6 l22 -18 z" transform="translate(0 70)" />
          </g>
          <ellipse cx="150" cy="235" rx="72" ry="68" fill="#4fd283" />
          <ellipse cx="150" cy="250" rx="46" ry="48" fill="#d8f7b0" />
          <rect x="108" y="285" width="30" height="26" rx="13" fill="#3fbf6e" />
          <rect x="162" y="285" width="30" height="26" rx="13" fill="#3fbf6e" />
          <ellipse cx="150" cy="120" rx="76" ry="72" fill="#4fd283" />
          <circle cx="100" cy="150" r="12" fill="#ff9ab5" opacity="0.6" />
          <circle cx="200" cy="150" r="12" fill="#ff9ab5" opacity="0.6" />
          {eyes}
          {mouth}
          <g className="dino-arm dino-arm-left">
            <ellipse cx="86" cy="225" rx="14" ry="26" fill="#3fbf6e" />
          </g>
          <g className="dino-arm dino-arm-right">
            <ellipse cx="214" cy="225" rx="14" ry="26" fill="#3fbf6e" />
          </g>
        </g>
        {state === 'veryLoud' && (
          <g fill="#ffd84d" stroke="#2b2350" strokeWidth="3">
            <path d="M40 60 l6 14 l15 2 l-11 10 l3 15 l-13 -8 l-13 8 l3 -15 l-11 -10 l15 -2 z" transform="scale(.6) translate(10 0)" />
            <path d="M260 40 l6 14 l15 2 l-11 10 l3 15 l-13 -8 l-13 8 l3 -15 l-11 -10 l15 -2 z" transform="scale(.6) translate(280 20)" />
          </g>
        )}
      </svg>
    </div>
  )
}
