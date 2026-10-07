import { useEffect, useState } from 'react';

// Record rows are stored compactly as arrays; these indexes name the columns.
export const LAT = 0;
export const LON = 1;
export const DATE = 2;
export const MUNICIPALITY = 3;
export const LOCALITY = 4;
export const COUNT = 5;
export const ACCURACY = 6;

let metaPromise;
const recordCache = new Map();

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

export function loadMeta() {
  metaPromise ??= fetchJson('/data/species.json');
  return metaPromise;
}

let outlinePromise;
export function loadOutline() {
  outlinePromise ??= fetchJson('/data/uppsala-lan.geojson');
  return outlinePromise;
}

export function loadRecords(slug) {
  if (!recordCache.has(slug)) recordCache.set(slug, fetchJson(`/data/records/${slug}.json`));
  return recordCache.get(slug);
}

// Small hook for promise-based loading with loading/error state.
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((error) => active && setState({ data: null, error, loading: false }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export function yearOf(row) {
  return Number(row[DATE].slice(0, 4));
}

// Records with only a year (or a date range) were saved with the range start,
// 1 January. Treat every 1 January date as "year known, date unknown".
// A few real 1 January sightings are affected; the About page says so.
export function isDateUnknown(row) {
  return row[DATE].slice(5, 10) === '01-01';
}
