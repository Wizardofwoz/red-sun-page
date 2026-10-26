// Small client-side astronomy helpers: moon sign and rising (ascendant) sign.
// Tropical zodiac, geocentric. Accuracy is a few hundredths of a degree for the
// Moon (truncated Meeus ch. 47 series) and well under a degree for the
// ascendant, which is plenty for picking a 30-degree sign.

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const

export type Place = { name: string; lat: number; lon: number; tz: string }

// Default birthplace assumption when no location is known.
export const NYC: Place = {
  name: 'New York City, US',
  lat: 40.7128,
  lon: -74.006,
  tz: 'America/New_York',
}

const RAD = Math.PI / 180
const norm = (deg: number) => ((deg % 360) + 360) % 360
const sinD = (deg: number) => Math.sin(deg * RAD)
const cosD = (deg: number) => Math.cos(deg * RAD)

export function signOfLongitude(lon: number): string {
  return SIGNS[Math.floor(norm(lon) / 30) % 12]
}

// Offset (ms) of `tz` from UTC at the given instant.
function tzOffsetMs(utcMs: number, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
  }).formatToParts(new Date(utcMs))
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  return asUtc - Math.floor(utcMs / 1000) * 1000
}

// Wall-clock time in `tz` -> UTC milliseconds (handles DST, including history).
export function localToUtcMs(y: number, mo: number, d: number, h: number, mi: number, tz: string): number {
  const naive = Date.UTC(y, mo - 1, d, h, mi)
  let utc = naive - tzOffsetMs(naive, tz)
  utc = naive - tzOffsetMs(utc, tz)
  return utc
}

const julianDay = (utcMs: number) => utcMs / 86400000 + 2440587.5

// Each row: [D, M, M', F, coefficient in 1e-6 degrees]
const MOON_TERMS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314],
  [0, 0, 2, 0, 213618], [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332],
  [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066], [2, 0, 1, 0, 53322],
  [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528],
  [0, 0, 1, -2, 10980], [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034],
  [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888], [2, 1, 0, 0, -6766],
  [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665],
  [0, 1, -2, 0, -2689], [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390],
  [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
]

// Apparent-ish geocentric ecliptic longitude of the Moon, degrees.
export function moonLongitude(utcMs: number): number {
  const T = (julianDay(utcMs) - 2451545) / 36525
  const Lp = norm(218.3164477 + 481267.88123421 * T)
  const D = norm(297.8501921 + 445267.1114034 * T)
  const M = norm(357.5291092 + 35999.0502909 * T)
  const Mp = norm(134.9633964 + 477198.8675055 * T)
  const F = norm(93.272095 + 483202.0175233 * T)
  const E = 1 - 0.002516 * T - 0.0000074 * T * T
  let sum = 0
  for (const [d, m, mp, f, c] of MOON_TERMS) {
    const arg = d * D + m * M + mp * Mp + f * F
    sum += c * E ** Math.abs(m) * sinD(arg)
  }
  const A1 = 119.75 + 131.849 * T
  const A2 = 53.09 + 479264.29 * T
  sum += 3958 * sinD(A1) + 1962 * sinD(Lp - F) + 318 * sinD(A2)
  return norm(Lp + sum / 1e6)
}

// Ecliptic longitude of the ascendant, degrees.
export function ascendantLongitude(utcMs: number, latDeg: number, lonDeg: number): number {
  const jd = julianDay(utcMs)
  const T = (jd - 2451545) / 36525
  const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000)
  const ramc = norm(gmst + lonDeg) // local sidereal time in degrees (east lon positive)
  const eps = 23.439291 - 0.0130042 * T
  const y = cosD(ramc)
  const x = -(sinD(ramc) * cosD(eps) + Math.tan(latDeg * RAD) * sinD(eps))
  return norm(Math.atan2(y, x) / RAD)
}

export function moonAndRising(y: number, mo: number, d: number, h: number, mi: number, place: Place = NYC) {
  const utc = localToUtcMs(y, mo, d, h, mi, place.tz)
  return {
    moon: signOfLongitude(moonLongitude(utc)),
    rising: signOfLongitude(ascendantLongitude(utc, place.lat, place.lon)),
  }
}
