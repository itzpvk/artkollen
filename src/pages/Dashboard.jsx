import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentTitle, useLanguage } from '../i18n/LanguageContext.jsx';
import { formatDate, formatMonth, formatNumber, formatPercent } from '../i18n/strings.jsx';
import { loadMeta, loadRecords, useAsync, yearOf } from '../lib/data.js';
import { toGrid } from '../lib/grid.js';
import FilterPanel from '../components/FilterPanel.jsx';
import InfoBox from '../components/InfoBox.jsx';
import StatTiles from '../components/StatTiles.jsx';
import ChartPanel from '../components/ChartPanel.jsx';
import ObservationMap from '../components/ObservationMap.jsx';
import RecordsTable from '../components/RecordsTable.jsx';
import { BarChart, ColumnChart, DataTable, LineChart } from '../components/charts.jsx';
import Name from '../components/Name.jsx';

const DEFAULT_SPECIES = 'blasippa';

export default function Dashboard() {
  const { lang, t } = useLanguage();
  useDocumentTitle(t.explorePageTitle);
  const meta = useAsync(loadMeta, []);

  if (meta.error) return <p className="page status status--error">{t.loadError}</p>;
  if (!meta.data) return <p className="page status">{t.loading}</p>;
  return <DashboardView meta={meta.data} lang={lang} t={t} />;
}

function clampYear(value, fallback, min, max) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
}

function DashboardView({ meta, lang, t }) {
  const { firstYear, lastYear } = meta.source;
  const [params, setParams] = useSearchParams();

  // Filter state lives in the URL so any view can be shared as a link.
  const slug = meta.species.some((s) => s.slug === params.get('art')) ? params.get('art') : DEFAULT_SPECIES;
  const from = clampYear(params.get('fran'), firstYear, firstYear, lastYear);
  const to = Math.max(from, clampYear(params.get('till'), lastYear, firstYear, lastYear));
  const species = meta.species.find((s) => s.slug === slug);
  const name = species[lang];

  const updateFilters = (next) => {
    const merged = { art: slug, fran: from, till: to, ...next };
    if (merged.fran > merged.till) merged.till = merged.fran;
    setParams({ art: merged.art, fran: String(merged.fran), till: String(merged.till) }, { replace: true });
  };
  const resetFilters = () => updateFilters({ art: DEFAULT_SPECIES, fran: firstYear, till: lastYear });

  // Exact yearly totals (all reports).
  const years = species.years.filter((y) => y.year >= from && y.year <= to);
  const county = meta.county.filter((y) => y.year >= from && y.year <= to);
  const total = years.reduce((sum, y) => sum + y.count, 0);
  const peak = years.reduce((best, y) => (y.count > best.count ? y : best), { count: -1 });
  const share = years.map((y, i) => ({
    key: y.year,
    label: String(y.year),
    year: y.year,
    count: y.count,
    all: county[i].count,
    value: county[i].count ? (y.count / county[i].count) * 100 : 0,
  }));

  // Exact counts per month and per municipality, and the latest report date,
  // summed over the selected years (GBIF facets saved by the fetch script).
  const byMonth = Array(12).fill(0);
  const municipalityCounts = new Map();
  let latest = '';
  for (const y of years) {
    y.months.forEach((v, i) => (byMonth[i] += v));
    for (const [gid, v] of Object.entries(y.municipalities)) {
      municipalityCounts.set(gid, (municipalityCounts.get(gid) ?? 0) + v);
    }
    if (y.latest && y.latest > latest) latest = y.latest;
  }
  const noMonth = total - byMonth.reduce((a, b) => a + b, 0);
  const municipalityName = (gid) => meta.municipalities.find((m) => m.gid === gid)?.name ?? t.unknownMunicipality;
  const byMunicipality = [...municipalityCounts]
    .filter(([, v]) => v > 0)
    .map(([gid, v]) => [municipalityName(gid), v])
    .sort((a, b) => b[1] - a[1]);
  const top = byMunicipality[0]?.[0];

  // The map and the records table use the sample of individual records.
  const records = useAsync(() => loadRecords(slug), [slug]);
  const rows = useMemo(
    () => (records.data ?? []).filter((r) => yearOf(r) >= from && yearOf(r) <= to),
    [records.data, from, to],
  );
  const cells = useMemo(() => toGrid(rows).sort((a, b) => b.count - a.count), [rows]);
  const loaded = !!records.data;
  const hint = t.arrowHint;

  let answer;
  if (total === 0) answer = t.summaryNone(name, from, to);
  else if (top) answer = t.summary(lang, byMunicipality.length, name, from, to, top);
  else answer = t.summaryNoPlace(name, from, to);

  const tiles = [
    { label: t.tileTotal, value: formatNumber(lang, total), detail: t.tileAllYears(from, to) },
    {
      label: t.tilePeak,
      value: peak.count > 0 ? String(peak.year) : '–',
      detail: peak.count > 0 ? t.tilePeakDetail(lang, peak.count) : null,
    },
    { label: t.tileMunicipalities, value: formatNumber(lang, byMunicipality.length), detail: t.tileAllYears(from, to) },
    { label: t.tileLatest, value: latest ? formatDate(lang, latest) : '–' },
  ];

  const sampleState = (content) => {
    if (records.error) return <p className="status status--error">{t.loadError}</p>;
    if (!loaded) return <p className="status">{t.loading}</p>;
    if (!rows.length) return <p className="status">{t.noRecords}</p>;
    return <div className={records.loading ? 'state-wrap is-refreshing' : 'state-wrap'}>{content}</div>;
  };

  return (
    <div className="dashboard-layout">
      <FilterPanel
        meta={meta}
        slug={slug}
        from={from}
        to={to}
        name={name}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      <div id="results" className="results" tabIndex={-1}>
        <div className="answer">
          <h1 id="page-heading">{t.heading(name)}</h1>
          <p className="answer__sentence" aria-live="polite">
            {answer}
          </p>
          <div className="only-narrow">
            <InfoBox>{t.note}</InfoBox>
          </div>
        </div>

        <StatTiles tiles={tiles} />

        <div className="dash-grid">
          <ChartPanel
            className="dash-grid__map"
            kind="map"
            size="fill"
            title={t.mapHeading}
            note={loaded ? t.mapCaption(lang, rows.length) : null}
            chart={() => sampleState(<ObservationMap rows={rows} />)}
            table={() =>
              sampleState(
                <DataTable
                  caption={t.gridTableCaption}
                  columns={[
                    { label: t.colSquare, width: '40%' },
                    { label: t.municipality, width: '36%' },
                    { label: t.observationsInSample, width: '24%' },
                  ]}
                  rows={cells.map((c) => {
                    const [[s, w], [n, e]] = c.bounds;
                    const topMuni = Object.entries(c.municipalities).sort((a, b) => b[1] - a[1])[0]?.[0];
                    return [
                      `${((s + n) / 2).toFixed(2)}, ${((w + e) / 2).toFixed(2)}`,
                      topMuni ? <Name>{topMuni}</Name> : t.unknownMunicipality,
                      formatNumber(lang, c.count),
                    ];
                  })}
                />,
              )
            }
          />

          <div className="dash-grid__stack">
            <ChartPanel
              className="dash-grid__year"
              size="sm"
              title={t.yearHeading}
              chart={() => (
                <ColumnChart
                  data={years.map((y) => ({ key: y.year, label: String(y.year), value: y.count }))}
                  lang={lang}
                  ariaLabel={t.yearLabel(name, from, to)}
                  hint={hint}
                  height={200}
                  tickEvery={years.length > 14 ? 5 : years.length > 7 ? 2 : 1}
                  labelIndexes={[years.indexOf(peak), years.length - 1]}
                  tooltip={(d) => ({ value: formatNumber(lang, d.value), label: d.label })}
                />
              )}
              table={() => (
                <DataTable
                  caption={t.yearTableCaption(name)}
                  columns={[
                    { label: t.year, width: '60%' },
                    { label: t.reports, width: '40%' },
                  ]}
                  rows={years.map((y) => [y.year, formatNumber(lang, y.count)])}
                />
              )}
            />

            <ChartPanel
              className="dash-grid__share"
              size="sm"
              title={t.shareHeading}
              description={t.shareText}
              chart={() => (
                <LineChart
                  data={share}
                  height={200}
                  lang={lang}
                  ariaLabel={t.shareLabel(name, from, to)}
                  hint={hint}
                  tickEvery={share.length > 14 ? 5 : share.length > 7 ? 2 : 1}
                  format={(v) => formatPercent(lang, v)}
                  tooltip={(d) => ({ value: formatPercent(lang, d.value), label: d.label })}
                />
              )}
              table={() => (
                <DataTable
                  caption={t.shareTableCaption(name)}
                  columns={[
                    { label: t.year, width: '16%' },
                    { label: t.reports, width: '24%' },
                    { label: t.allReports, width: '36%' },
                    { label: t.share, width: '24%' },
                  ]}
                  rows={share.map((d) => [
                    d.year,
                    formatNumber(lang, d.count),
                    formatNumber(lang, d.all),
                    formatPercent(lang, d.value),
                  ])}
                />
              )}
            />
          </div>

          <ChartPanel
            className="dash-grid__month"
            title={t.monthHeading}
            note={noMonth > 0 ? t.noMonth(lang, noMonth) : null}
            chart={() =>
              total === 0 ? (
                <p className="status">{t.noRecords}</p>
              ) : (
                <ColumnChart
                  data={byMonth.map((v, i) => ({ key: i, label: formatMonth(lang, i).replace('.', ''), value: v }))}
                  lang={lang}
                  ariaLabel={t.monthLabel(name)}
                  hint={hint}
                  height={260}
                  tickEvery={2}
                  labelIndexes={[byMonth.indexOf(Math.max(...byMonth))]}
                  tooltip={(d) => ({ value: formatNumber(lang, d.value), label: formatMonth(lang, d.key) })}
                />
              )
            }
            table={() => (
              <DataTable
                caption={t.monthTableCaption(name)}
                columns={[
                  { label: t.month, width: '60%' },
                  { label: t.reports, width: '40%' },
                ]}
                rows={byMonth.map((v, i) => [formatMonth(lang, i), formatNumber(lang, v)])}
              />
            )}
          />

          <ChartPanel
            className="dash-grid__municipality"
            title={t.municipalityHeading}
            chart={() =>
              byMunicipality.length === 0 ? (
                <p className="status">{t.noRecords}</p>
              ) : (
                <BarChart
                  data={byMunicipality.map(([m, v]) => ({ key: m, label: m, value: v }))}
                  labelLang="sv"
                  lang={lang}
                  ariaLabel={t.municipalityLabel(name)}
                  hint={hint}
                  tooltip={(d) => ({ value: formatNumber(lang, d.value), label: <Name>{d.label}</Name> })}
                />
              )
            }
            table={() => (
              <DataTable
                caption={t.municipalityTableCaption(name)}
                columns={[
                  { label: t.municipality, width: '60%' },
                  { label: t.reports, width: '40%' },
                ]}
                rows={byMunicipality.map(([m, v]) => [<Name key={m}>{m}</Name>, formatNumber(lang, v)])}
              />
            )}
          />

          <section className="panel dash-grid__records" aria-labelledby="records-heading">
            {loaded && rows.length > 0 ? (
              <RecordsTable rows={rows} species={species} from={from} to={to} headingId="records-heading" />
            ) : (
              <>
                <div className="panel__head">
                  <h2 id="records-heading">{t.recordsHeading}</h2>
                </div>
                {sampleState(null)}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
