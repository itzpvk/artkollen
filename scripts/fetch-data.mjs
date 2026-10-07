// One-time data fetch: Artportalen observations in Uppsala län via the GBIF API.
// Writes public/data/species.json (metadata + exact yearly, monthly and
// per-municipality counts) and
// public/data/records/<slug>.json (a sample of individual records per species).
//
// Run with: npm run fetch-data

import { mkdir, writeFile } from 'node:fs/promises';

const API = 'https://api.gbif.org/v1';
const ARTPORTALEN = '38b4c89f-584c-41bb-bd8f-cd1def33e92f';
const UPPSALA_LAN = 'SWE.16_1';
const FIRST_YEAR = 2000;
const LAST_YEAR = 2025; // last complete year
const RECORDS_PER_YEAR = 200; // sample size per species and year for map + table

const SPECIES = [
  { slug: 'blasippa', scientific: 'Hepatica nobilis', sv: 'Blåsippa', en: 'Liverleaf', group: 'plant' },
  { slug: 'vitsippa', scientific: 'Anemone nemorosa', sv: 'Vitsippa', en: 'Wood anemone', group: 'plant' },
  { slug: 'gullviva', scientific: 'Primula veris', sv: 'Gullviva', en: 'Cowslip', group: 'plant' },
  { slug: 'blomsterlupin', scientific: 'Lupinus polyphyllus', sv: 'Blomsterlupin', en: 'Garden lupin', group: 'plant', invasive: true },
  { slug: 'spansk-skogssnigel', scientific: 'Arion vulgaris', sv: 'Spansk skogssnigel', en: 'Spanish slug', group: 'mollusc', invasive: true },
  { slug: 'citronfjaril', scientific: 'Gonepteryx rhamni', sv: 'Citronfjäril', en: 'Brimstone', group: 'insect' },
  { slug: 'sanglarka', scientific: 'Alauda arvensis', sv: 'Sånglärka', en: 'Skylark', group: 'bird' },
  { slug: 'trana', scientific: 'Grus grus', sv: 'Trana', en: 'Common crane', group: 'bird' },
  { slug: 'tornseglare', scientific: 'Apus apus', sv: 'Tornseglare', en: 'Common swift', group: 'bird' },
  { slug: 'alg', scientific: 'Alces alces', sv: 'Älg', en: 'Moose', group: 'mammal' },
];

const base = {
  datasetKey: ARTPORTALEN,
  gadmLevel1Gid: UPPSALA_LAN,
  occurrenceStatus: 'PRESENT',
};

async function get(path, params = {}) {
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(params)) {
    for (const value of [v].flat()) url.searchParams.append(k, value);
  }
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (attempt === 4) throw new Error(`${res.status} ${url}`);
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
}

async function yearlyCounts(extra = {}) {
  const data = await get('/occurrence/search', {
    ...base,
    ...extra,
    year: `${FIRST_YEAR},${LAST_YEAR}`,
    limit: 0,
    facet: 'year',
    facetLimit: 100,
  });
  const counts = Object.fromEntries(data.facets[0]?.counts.map((c) => [c.name, c.count]) ?? []);
  const years = [];
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) years.push({ year: y, count: counts[y] ?? 0 });
  return { total: data.count, years };
}

// GBIF returns a year's records roughly in date order, so taking the first N
// would only cover the start of the year. Instead take SLICES evenly spaced
// pages across all of that year's records.
const SLICES = 5;

async function recordsForYear(taxonKey, year) {
  const query = { ...base, taxonKey, year, hasCoordinate: true, hasGeospatialIssue: false };
  const sliceSize = RECORDS_PER_YEAR / SLICES;
  const first = await get('/occurrence/search', { ...query, limit: sliceSize });
  let results = first.results;
  if (first.count > RECORDS_PER_YEAR) {
    const offsets = [];
    for (let i = 1; i < SLICES; i++) offsets.push(Math.floor((first.count * i) / SLICES));
    const pages = await Promise.all(offsets.map((offset) => get('/occurrence/search', { ...query, limit: sliceSize, offset })));
    results = results.concat(...pages.map((p) => p.results));
  } else if (first.count > sliceSize) {
    results = (await get('/occurrence/search', { ...query, limit: RECORDS_PER_YEAR })).results;
  }
  // Compact rows: [lat, lon, date, municipality, locality, count, uncertaintyMetres]
  return results.map((r) => [
    Math.round(r.decimalLatitude * 1e4) / 1e4,
    Math.round(r.decimalLongitude * 1e4) / 1e4,
    (r.eventDate ?? `${year}`).slice(0, 10),
    r.gadm?.level2?.name ?? r.municipality ?? '', // GADM municipality matches the per-municipality counts
    r.locality ?? '', // full place name; the table wraps long names
    r.individualCount ?? null,
    r.coordinateUncertaintyInMeters ?? null,
  ]);
}

// Exact counts per month and per municipality (GADM level 2) for one year,
// plus the date of the latest report that year.
async function detailsForYear(taxonKey, year, count) {
  const months = Array(12).fill(0);
  if (!count) return { months, municipalities: {}, latest: null };
  const query = { ...base, taxonKey, year };
  const data = await get('/occurrence/search', { ...query, limit: 0, facet: ['month', 'gadmLevel2Gid'], facetLimit: 20 });
  const municipalities = {};
  for (const f of data.facets) {
    for (const c of f.counts) {
      if (f.field === 'MONTH') months[Number(c.name) - 1] = c.count;
      else municipalities[c.name] = c.count;
    }
  }
  // Latest report: look in the last month that has reports. Results come
  // roughly in date order, so the last page of that month holds the latest.
  let latest = null;
  const lastMonth = months.findLastIndex((m) => m > 0) + 1;
  if (lastMonth) {
    const monthCount = months[lastMonth - 1];
    const page = await get('/occurrence/search', { ...query, month: lastMonth, limit: 300, offset: Math.max(0, monthCount - 300) });
    latest = page.results.map((r) => (r.eventDate ?? '').slice(0, 10)).filter(Boolean).sort().at(-1) ?? null;
  }
  return { months, municipalities, latest };
}

async function inBatches(items, size, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  }
  return out;
}

await mkdir('public/data/records', { recursive: true });

const species = [];
for (const s of SPECIES) {
  const match = await get('/species/match', { name: s.scientific, strict: true });
  if (!match.usageKey || match.rank !== 'SPECIES') throw new Error(`No species match for ${s.scientific}`);
  const taxonKey = match.acceptedUsageKey ?? match.usageKey;

  const counts = await yearlyCounts({ taxonKey });
  const years = counts.years.map((y) => y.year);
  const rows = (await inBatches(years, 2, (y) => recordsForYear(taxonKey, y))).flat();
  await writeFile(`public/data/records/${s.slug}.json`, JSON.stringify(rows));
  const details = await inBatches(counts.years, 3, (y) => detailsForYear(taxonKey, y.year, y.count));
  const enriched = counts.years.map((y, i) => ({ ...y, ...details[i] }));

  species.push({ ...s, taxonKey, total: counts.total, years: enriched, sampled: rows.length });
  console.log(`${s.sv.padEnd(20)} ${String(counts.total).padStart(7)} reported, ${rows.length} sampled`);
}

const county = await yearlyCounts();

// All municipalities in the county, with names from a sample record of each.
const countyFacets = await get('/occurrence/search', { ...base, limit: 0, facet: 'gadmLevel2Gid', facetLimit: 20 });
const municipalities = [];
for (const c of countyFacets.facets[0].counts) {
  const one = await get('/occurrence/search', { ...base, gadmLevel2Gid: c.name, limit: 1 });
  municipalities.push({ gid: c.name, name: one.results[0]?.gadm?.level2?.name ?? c.name });
}
municipalities.sort((a, b) => a.name.localeCompare(b.name, 'sv'));

await writeFile(
  'public/data/species.json',
  JSON.stringify(
    {
      source: {
        dataset: 'Artportalen (Swedish Species Observation System)',
        publisher: 'SLU Artdatabanken',
        via: 'GBIF.org',
        datasetUrl: `https://www.gbif.org/dataset/${ARTPORTALEN}`,
        license: 'CC0 1.0',
        area: 'Uppsala län',
        fetched: new Date().toISOString().slice(0, 10),
        firstYear: FIRST_YEAR,
        lastYear: LAST_YEAR,
        recordsPerYear: RECORDS_PER_YEAR,
      },
      county: county.years,
      municipalities,
      species,
    },
    null,
    1,
  ),
);
console.log(`County total ${FIRST_YEAR}–${LAST_YEAR}: ${county.total}`);
