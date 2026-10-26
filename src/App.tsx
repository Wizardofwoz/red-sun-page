import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { CONSTELLATIONS } from './constellations'
import { moonAndRising, NYC } from './astro'
import { AI_NEWS, storyUrl } from './news'
import { playFart } from './fart'

const RAY_COUNT = 12
const BG_STAR_COUNT = 110

// Western zodiac sun signs. Each entry is the first (month, day) of the sign;
// anything before Jan 20 falls back to Capricorn (Dec 22 - Jan 19).
const SIGN_STARTS: ReadonlyArray<readonly [number, number, string]> = [
  [1, 20, 'Aquarius'],
  [2, 19, 'Pisces'],
  [3, 21, 'Aries'],
  [4, 20, 'Taurus'],
  [5, 21, 'Gemini'],
  [6, 21, 'Cancer'],
  [7, 23, 'Leo'],
  [8, 23, 'Virgo'],
  [9, 23, 'Libra'],
  [10, 23, 'Scorpio'],
  [11, 22, 'Sagittarius'],
  [12, 22, 'Capricorn'],
]

const HOROSCOPES: Record<string, string> = {
  Aries: 'Bold moves pay off today. Start the thing you keep putting off.',
  Taurus: 'Slow and steady wins. Treat yourself to something simple and good.',
  Gemini: 'Your curiosity opens a door. Say yes to a surprising conversation.',
  Cancer: 'Trust your instincts and check in with someone you love.',
  Leo: 'You shine without trying. Share the spotlight and watch it grow.',
  Virgo: 'Small details matter today. Tidy one corner and the rest follows.',
  Libra: 'Balance comes from choosing. Decide kindly, then let it go.',
  Scorpio: 'Deep focus brings answers. Keep your plans close a little longer.',
  Sagittarius: 'Adventure is calling. Take the long way and enjoy the view.',
  Capricorn: 'Patience builds the summit. One steady step is plenty today.',
  Aquarius: 'A fresh idea wants out. Try it, even if it seems unusual.',
  Pisces: 'Dream a little, then write it down. Kindness leads the way.',
}

// Short, hand-written lines for the Moon sign (inner mood) and the rising
// sign (first impression).
const MOON_LINES: Record<string, string> = {
  Aries: 'Your feelings spark fast and fade fast.',
  Taurus: 'You find calm in comfort and routine.',
  Gemini: 'You process feelings by talking them out.',
  Cancer: 'Home and loved ones are your safe harbor.',
  Leo: 'You need warmth, praise, and a little play.',
  Virgo: 'You settle your heart by being useful.',
  Libra: 'Peace and harmony keep you steady.',
  Scorpio: 'Your feelings run deep and private.',
  Sagittarius: 'Freedom and laughter lift your mood.',
  Capricorn: 'You keep your feelings steady and proven.',
  Aquarius: 'You need space to feel in your own way.',
  Pisces: 'You soak up the moods around you.',
}

const RISING_LINES: Record<string, string> = {
  Aries: 'You come across as direct and energetic.',
  Taurus: 'People see you as calm and dependable.',
  Gemini: 'You seem curious, quick, and chatty.',
  Cancer: 'You seem gentle, caring, and protective.',
  Leo: 'You walk in with warmth and presence.',
  Virgo: 'You seem modest, sharp, and careful.',
  Libra: 'You come across as charming and fair.',
  Scorpio: 'You seem intense, magnetic, and focused.',
  Sagittarius: 'You seem upbeat, open, and adventurous.',
  Capricorn: 'You come across as poised and capable.',
  Aquarius: 'You seem original, cool, and independent.',
  Pisces: 'You seem dreamy, soft, and kind.',
}

export function zodiacSign(month: number, day: number): string {
  let sign = 'Capricorn'
  for (const [m, d, name] of SIGN_STARTS) {
    if (month > m || (month === m && day >= d)) sign = name
  }
  return sign
}

// Parse "YYYY-MM-DD" as a local date (avoids timezone off-by-one shifts).
function parseDate(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  return { y, m, d, date: new Date(y, m - 1, d) }
}

function formatTime(value: string): string {
  const [h, min] = value.split(':').map(Number)
  return new Date(2000, 0, 1, h, min).toLocaleTimeString(undefined, { timeStyle: 'short' })
}

type Placement = { label: string; sign: string; line: string }
type Result = {
  sign: string
  rising: string
  date: string
  time: string
  placements: Placement[]
  place: string
}

function makeStars() {
  return Array.from({ length: BG_STAR_COUNT }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 5,
    dur: 2 + Math.random() * 3,
  }))
}

export default function App() {
  const [birthday, setBirthday] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const bgStars = useMemo(makeStars, [])
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [newsOpen, setNewsOpen] = useState(false)
  const newsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (newsOpen) newsRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [newsOpen])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!birthday || !birthTime) {
      setResult(null)
      setError(
        !birthday && !birthTime
          ? 'Please enter your birthday and birth time.'
          : !birthday
            ? 'Please enter your birthday.'
            : 'Please enter your birth time.',
      )
      return
    }
    // Runs inside the submit gesture, so the browser allows the AudioContext to start.
    void playFart()
    const { y, m, d, date } = parseDate(birthday)
    const sign = zodiacSign(m, d)
    const [hh, mm] = birthTime.split(':').map(Number)
    const { moon, rising } = moonAndRising(y, m, d, hh, mm, NYC)
    setError('')
    setNewsOpen(false)
    setResult({
      sign,
      rising,
      date: date.toLocaleDateString(undefined, { dateStyle: 'long' }),
      time: `born at ${formatTime(birthTime)}`,
      placements: [
        { label: 'Sun', sign, line: HOROSCOPES[sign] },
        { label: 'Moon', sign: moon, line: MOON_LINES[moon] },
        { label: 'Rising', sign: rising, line: RISING_LINES[rising] },
      ],
      place: NYC.name,
    })
  }

  function onReset() {
    setBirthday('')
    setBirthTime('')
    setResult(null)
    setError('')
    setNewsOpen(false)
  }

  function onNext() {
    setNewsOpen(true)
  }

  const night = result !== null
  const constellation = result ? CONSTELLATIONS[result.sign] : null
  const sunPlacement = result?.placements[0]
  const lowerPlacements = result ? result.placements.slice(1) : []

  return (
    <main className={night ? 'scene scene--night' : 'scene'}>
      <div className="sky" aria-hidden="true">
        {bgStars.map((st, i) => (
          <span
            key={i}
            className="bgstar"
            style={
              {
                left: `${st.left}%`,
                top: `${st.top}%`,
                width: st.size,
                height: st.size,
                animationDelay: `${st.delay}s`,
                animationDuration: `${st.dur}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {constellation && (
        <figure className="constellation">
          <svg viewBox="0 0 100 70" role="img" aria-label={`${constellation.name} constellation`}>
            {constellation.lines.map(([a, b], i) => (
              <line
                key={i}
                className="cline"
                pathLength={1}
                x1={constellation.stars[a][0]}
                y1={constellation.stars[a][1]}
                x2={constellation.stars[b][0]}
                y2={constellation.stars[b][1]}
              />
            ))}
            {constellation.stars.map(([x, y, r], i) => (
              <circle key={i} className="cstar" cx={x} cy={y} r={r} style={{ animationDelay: `${(i % 5) * 0.4}s` }} />
            ))}
          </svg>
          <figcaption>{constellation.name}</figcaption>
        </figure>
      )}

      <div className="stage">
        <div className="sun">
          <div className="rays" aria-hidden="true">
            {Array.from({ length: RAY_COUNT }, (_, i) => (
              <span
                key={i}
                className="ray"
                style={{ transform: `rotate(${(360 / RAY_COUNT) * i}deg)` }}
              />
            ))}
          </div>
          <div className={error ? 'disc disc--open' : 'disc'} role="status" aria-live="polite">
            {result && sunPlacement && (
              <div className="reading reading--result">
                <p className="label">{sunPlacement.label} sign</p>
                <p className="sign">{sunPlacement.sign}</p>
                <p className="horoscope">{sunPlacement.line}</p>
                <button type="button" className="next" onClick={onNext}>
                  {newsOpen ? 'Again' : 'Next'}
                </button>
              </div>
            )}
            {!result && error && (
              <div className="reading">
                <p className="notice">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {result && (
        <section className="details" aria-label="Your horoscope">
          <p className="meta">
            {result.date} &middot; {result.time}
          </p>
          <ul className="placements">
            {lowerPlacements.map((p) => (
              <li key={p.label}>
                <p className="head">
                  <span className="label">{p.label} sign</span>
                  <span className="sign">{p.sign}</span>
                </p>
                <p className="horoscope">{p.line}</p>
              </li>
            ))}
          </ul>
          <p className="assume">Birthplace assumed: {result.place}</p>

          {newsOpen && (
            <div className="news" aria-live="polite" ref={newsRef}>
              <h2>AI news for your rising sign</h2>
              <p className="news-sub">{result.rising} rising</p>
              <ul>
                {AI_NEWS[result.rising].map((story) => (
                  <li key={story.text}>
                    <span className="story">{story.text}</span>
                    <a
                      className="readmore"
                      href={storyUrl(story)}
                      target="_blank"
                      rel="noopener"
                    >
                      Read more
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {night ? (
        <div className="birthday birthday--night">
          <div className="actions">
            <button type="button" className="primary" onClick={onReset}>
              Reset
            </button>
          </div>
        </div>
      ) : (
      <form className="birthday" onSubmit={onSubmit} noValidate>
        <div className="fields">
          <div className="field">
            <label htmlFor="birthday">Your birthday</label>
            <input
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => {
                setBirthday(e.target.value)
                setError('')
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="birthtime">Birth time</label>
            <input
              id="birthtime"
              type="time"
              required
              value={birthTime}
              onChange={(e) => {
                setBirthTime(e.target.value)
                setError('')
              }}
            />
          </div>
        </div>
        <div className="actions">
          <button type="submit" className="primary">
            Show my sign
          </button>
          <button type="button" className="secondary" onClick={onReset}>
            Reset
          </button>
        </div>
      </form>
      )}
    </main>
  )
}
