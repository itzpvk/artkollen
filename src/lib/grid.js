import { LAT, LON, MUNICIPALITY } from './data.js';

// Groups records into roughly 5 × 5 km squares. Uses a simple equirectangular
// projection centred on Uppsala län (about 60° N), which is accurate enough
// at county scale for a display grid.
const CELL_KM = 5;
const KM_PER_DEG_LAT = 111.32;
const KM_PER_DEG_LON = 111.32 * Math.cos((60 * Math.PI) / 180);

export function toGrid(rows) {
  const cells = new Map();
  for (const row of rows) {
    const gx = Math.floor((row[LON] * KM_PER_DEG_LON) / CELL_KM);
    const gy = Math.floor((row[LAT] * KM_PER_DEG_LAT) / CELL_KM);
    const key = `${gx}:${gy}`;
    let cell = cells.get(key);
    if (!cell) cells.set(key, (cell = { gx, gy, count: 0, municipalities: {} }));
    cell.count++;
    const m = row[MUNICIPALITY];
    if (m) cell.municipalities[m] = (cell.municipalities[m] ?? 0) + 1;
  }
  return [...cells.values()].map((c) => ({
    ...c,
    bounds: [
      [(c.gy * CELL_KM) / KM_PER_DEG_LAT, (c.gx * CELL_KM) / KM_PER_DEG_LON],
      [((c.gy + 1) * CELL_KM) / KM_PER_DEG_LAT, ((c.gx + 1) * CELL_KM) / KM_PER_DEG_LON],
    ],
  }));
}

// Five classes from the cell counts, using quantiles so every species gets a
// readable spread. Returns upper bounds, e.g. [1, 3, 8, 20, 140].
export function classBreaks(cells) {
  if (!cells.length) return [];
  const counts = cells.map((c) => c.count).sort((a, b) => a - b);
  const breaks = [0.2, 0.4, 0.6, 0.8, 1].map((q) => counts[Math.min(counts.length - 1, Math.ceil(q * counts.length) - 1)]);
  return [...new Set(breaks)];
}

export function classOf(count, breaks) {
  const i = breaks.findIndex((b) => count <= b);
  return i === -1 ? breaks.length - 1 : i;
}
