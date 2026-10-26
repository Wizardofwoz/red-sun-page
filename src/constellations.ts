// Simplified, approximate constellation shapes for the 12 zodiac signs.
// Coordinates live in a 100 x 70 box (east on the left, like a sky chart).
// `stars` are [x, y, radius]; `lines` connect star indices.
export type Constellation = {
  name: string
  stars: ReadonlyArray<readonly [number, number, number]>
  lines: ReadonlyArray<readonly [number, number]>
}

const chain = (...ids: number[]): Array<readonly [number, number]> =>
  ids.slice(1).map((id, i) => [ids[i], id] as const)

export const CONSTELLATIONS: Record<string, Constellation> = {
  Aries: {
    name: 'Aries',
    stars: [[10, 52, 2], [30, 42, 2.4], [62, 30, 3.4], [86, 26, 2.2]],
    lines: chain(0, 1, 2, 3),
  },
  Taurus: {
    name: 'Taurus',
    stars: [
      [8, 8, 2.6], [26, 26, 2], [42, 38, 3.8], [26, 50, 2], [12, 62, 2.6],
      [58, 44, 2.2], [70, 52, 2.2], [80, 16, 2], [84, 20, 1.6], [78, 21, 1.6],
    ],
    lines: [...chain(0, 1, 2, 3, 4), ...chain(2, 5, 6)],
  },
  Gemini: {
    name: 'Gemini',
    stars: [
      [30, 8, 3], [44, 12, 3.4], [28, 28, 2], [46, 30, 2.2],
      [20, 48, 2.2], [52, 46, 2], [12, 60, 2.2], [60, 58, 2.6],
    ],
    lines: [...chain(0, 2, 4, 6), ...chain(1, 3, 5, 7), [2, 3] as const],
  },
  Cancer: {
    name: 'Cancer',
    stars: [[48, 34, 2.2], [62, 12, 2.2], [28, 14, 2], [40, 58, 2.2], [74, 52, 2]],
    lines: [[0, 1], [0, 2], [0, 3], [0, 4]],
  },
  Leo: {
    name: 'Leo',
    stars: [
      [22, 58, 3.8], [20, 44, 2], [26, 32, 2.6], [34, 22, 2], [46, 18, 2.4],
      [46, 8, 2], [64, 24, 2.4], [62, 42, 2], [90, 34, 3],
    ],
    lines: [...chain(0, 1, 2, 3, 4, 5), ...chain(2, 7, 6, 8, 7), [4, 6] as const],
  },
  Virgo: {
    name: 'Virgo',
    stars: [
      [54, 62, 3.8], [48, 46, 2], [40, 36, 2.6], [22, 32, 2], [10, 40, 2],
      [62, 26, 2.2], [78, 14, 2.4], [26, 14, 1.8],
    ],
    lines: [...chain(0, 1, 2, 3, 4), ...chain(2, 5, 6), [3, 7] as const],
  },
  Libra: {
    name: 'Libra',
    stars: [[22, 50, 3], [50, 16, 3], [80, 30, 2.4], [56, 52, 2.2], [36, 62, 1.8]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4]],
  },
  Scorpio: {
    name: 'Scorpio',
    stars: [
      [22, 10, 2.2], [14, 20, 2], [18, 32, 2.2], [36, 26, 3.8], [50, 38, 2],
      [60, 50, 2.2], [72, 58, 2.2], [86, 54, 2.2], [90, 42, 2.2], [82, 36, 2.4],
    ],
    lines: [...chain(0, 3, 4, 5, 6, 7, 8, 9), [1, 3] as const, [2, 3] as const],
  },
  Sagittarius: {
    name: 'Sagittarius',
    stars: [
      [38, 22, 2.2], [54, 20, 2.4], [58, 40, 2.4], [42, 44, 2.2],
      [22, 38, 2.2], [70, 32, 2], [62, 10, 2], [46, 58, 2],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 0], [1, 5], [5, 2], [1, 6], [3, 7]],
  },
  Capricorn: {
    name: 'Capricorn',
    stars: [
      [10, 14, 2.4], [18, 22, 2], [34, 46, 2.2], [56, 58, 2.2],
      [70, 52, 2], [88, 26, 2.2], [70, 22, 2.4], [40, 28, 1.8],
    ],
    lines: [...chain(0, 1, 2, 3, 4, 5, 6, 7, 1)],
  },
  Aquarius: {
    name: 'Aquarius',
    stars: [
      [18, 20, 2.4], [30, 28, 2.2], [38, 16, 2.4], [48, 34, 2],
      [60, 42, 2], [54, 54, 2.2], [72, 58, 2], [86, 48, 2.2],
    ],
    lines: [...chain(0, 1, 2), ...chain(1, 3, 4, 5, 6, 7)],
  },
  Pisces: {
    name: 'Pisces',
    stars: [
      [10, 42, 2], [14, 32, 2], [24, 30, 2.2], [28, 40, 2], [18, 48, 2],
      [48, 52, 2.4], [66, 38, 2], [76, 24, 2.2], [86, 12, 2.2], [92, 22, 2],
    ],
    lines: [...chain(0, 1, 2, 3, 4, 0), ...chain(3, 5, 6, 7, 8, 9, 7)],
  },
}
