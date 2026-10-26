## What this is
Single-page React+Vite app: red page, yellow sun, birthday+time form. Submit -> night sky,
zodiac constellation, Sun/Moon/Rising readings inside the sun. All client-side.

## Current state
- Sun sign + horoscope + Next button in the disc; Moon/Rising in a fixed-height scrolling panel under
  the sun. Next opens "AI news for your rising sign" (src/news.ts); each story has a "Read more" link
  (new tab, rel=noopener) to a Google News search for its headline (stories are made up, no real URLs).
- Fart is a Web Audio synth (src/fart.ts), played once from the submit handler on a valid submit.
  No sound buttons/toggle/status anywhere (explicitly removed by request); Next is silent.
- Moon/rising computed in src/astro.ts, birthplace fixed to NYC (note shown in the sun).
- No location input yet; adding one needs a place->lat/lon/tz source (none offline).

## Stack & key choices
- Vite 5 + React 18 + TS, pnpm. Dev server on 0.0.0.0:3000 (sandbox.yaml).
- Disc text sizes use container query units (cqw) so text scales with the disc.
- Moon = truncated Meeus ch.47 series; ASC from sidereal time. No library/API.

## Gotchas & environment facts
- No root/apt; /tmp is noexec. Playwright's own chromium lacks libglib here.
- Working headless browser: `npm i playwright-core @sparticuz/chromium` in /tmp/opencode/pw,
  brotli-extract its bin/{al2023,swiftshader,fonts}.tar.br + chromium.br into
  ~/.cache/pwx (not /tmp), run with LD_LIBRARY_PATH=~/.cache/pwx/lib:~/.cache/pwx.
  Check: ~/.cache/pwx/chromium --version (needs the LD_LIBRARY_PATH above).
- The model can't read screenshots; verify layout with getBoundingClientRect numerics
  (script was /tmp/opencode/pw/fit.mjs: text corner distance / disc radius must be < 1).
- Moon check: moonLongitude(Date.UTC(1992,3,12)) ~ 133.163 (Meeus example 47.a).
- /tmp can be wiped between sessions (npm pkgs gone, ~/.cache/pwx survives). If chromium dies with
  "SkFontMgr ... Not implemented": point fonts.conf <dir>/<cachedir> at ~/.cache/pwx (not /tmp).
- Details panel has a fixed height on purpose: letting it grow shrank the sun and the Next button
  ended up under the news text (click intercepted). Check: scripts measure disc height before/after Next.
- `pnpm build` creates untracked dist/; delete it.
