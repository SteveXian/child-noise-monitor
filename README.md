# Voice Buddy

An interactive loudness game for children ages 3–7. Dino reacts to how loudly the child speaks, and
a star is earned for every 10 continuous seconds of a great indoor voice (a celebration every 5 stars).

Built with React, TypeScript and Vite. Audio is analysed locally with the Web Audio API and is
never recorded, stored or transmitted. Levels are relative dB (not dB SPL).

```
npm install
npm run dev     # start the app (microphone needs localhost or HTTPS)
npm test        # threshold and reward logic tests
npm run build
```

## Structure
- `src/audio/` – microphone access, RMS/dB maths, smoothing, optional sound effects
- `src/logic/` – loudness classifier (hysteresis + sustain), reward tracker, settings
- `src/useVoiceEngine.ts` – ties them together; high-frequency levels bypass React renders
- `src/ui/` – Dino, meter, stars, celebration, parent settings (press and hold the gear)
