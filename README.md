# Red Sun Page

Built by **Kaelyn** at Walk & Hack, the AI Tinkerers NYC × Twilio build-while-you-walk event in Central Park on October 24, 2026. The app was built by texting a coding agent from the park; this repo is the code that came out, packaged so it runs on your own machine.

A red page with a yellow sun. Enter your birthday and time: the page turns to night sky with your zodiac constellation, and Sun, Moon and Rising readings appear inside the sun, followed by made-up AI news for your rising sign. A synthesized fart plays on submit, by request. Everything runs in the browser.

## Run it

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. `pnpm build` writes `dist/`.

## Layout

- `src/App.tsx` the page and form; `src/index.css` the styling (disc text scales with container query units).
- `src/astro.ts` Moon position (truncated Meeus chapter 47 series) and the ascendant from sidereal time, birthplace fixed to NYC. No library, no API.
- `src/constellations.ts` the star maps; `src/news.ts` the fake stories; `src/fart.ts` the Web Audio synth.
- `NOTES.md` the builder's working notes from the event, kept as-is.
