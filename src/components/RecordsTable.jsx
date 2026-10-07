import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { formatNumber } from '../i18n/strings.jsx';
import { COUNT, DATE, LAT, LOCALITY, LON, MUNICIPALITY, ACCURACY, isDateUnknown } from '../lib/data.js';
import { downloadCsv } from '../lib/csv.js';

const PAGE_SIZE = 10;

// Sortable records table (Figma: "Table row") with pagination and CSV export.
// Sorting uses buttons inside the column headers and aria-sort on the <th>.
// Renders its own title row so the CSV button sits top right, like the
// toggles on the other cards.
export default function RecordsTable({ rows, species, from, to, headingId }) {
  const { lang, t } = useLanguage();
  const [sort, setSort] = useState({ col: DATE, dir: 'desc' });
  const [page, setPage] = useState(1);

  // Fixed column widths (table-layout: fixed), so sorting or paging never
  // changes the column layout.
  const columns = [
    { col: DATE, label: t.colDate, width: '16%' }, // fits a full date on one line from the 640px minimum
    { col: MUNICIPALITY, label: t.colMunicipality, width: '16%' },
    { col: LOCALITY, label: t.colLocality, width: '38%' },
    { col: COUNT, label: t.colCount, num: true, width: '10%' },
    { col: ACCURACY, label: t.colAccuracy, num: true, width: '20%' },
  ];

  const sorted = useMemo(() => {
    const collator = new Intl.Collator(lang === 'sv' ? 'sv' : 'en', { numeric: true });
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sort.col];
      const bv = b[sort.col];
      if (av === bv) return 0;
      if (av === null || av === '') return 1; // empty values last
      if (bv === null || bv === '') return -1;
      return (typeof av === 'number' ? av - bv : collator.compare(av, bv)) * factor;
    });
  }, [rows, sort, lang]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  useEffect(() => setPage(1), [rows, sort]);
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Prev/Next use aria-disabled instead of disabled at the ends, so a focused
  // button never becomes unfocusable (focus would otherwise drop to the page).
  const goTo = (next) => {
    if (next >= 1 && next <= pages) setPage(next);
  };

  const toggleSort = (col) =>
    setSort((s) =>
      s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: col === DATE ? 'desc' : 'asc' },
    );

  const download = () => {
    const header = [
      'datum',
      'datum_okant',
      'art',
      'vetenskapligt_namn',
      'kommun',
      'plats',
      'antal',
      'latitud',
      'longitud',
      'positionsnoggrannhet_m',
    ];
    const data = sorted.map((r) => [
      isDateUnknown(r) ? r[DATE].slice(0, 4) : r[DATE],
      isDateUnknown(r) ? 'ja' : '',
      species.sv,
      species.scientific,
      r[MUNICIPALITY],
      r[LOCALITY],
      r[COUNT],
      r[LAT],
      r[LON],
      r[ACCURACY],
    ]);
    downloadCsv(`artkollen-${species.slug}-${from}-${to}.csv`, header, data);
  };

  return (
    <>
      <div className="panel__head">
        <h2 id={headingId}>{t.recordsHeading}</h2>
        <button type="button" className="btn btn--secondary btn--small" onClick={download} aria-describedby="csv-hint">
          {t.download}
        </button>
      </div>
      <p className="caption">
        {t.recordsCaption(lang, rows.length)} <span id="csv-hint">{t.downloadHint}</span>
      </p>
      <div tabIndex={0} role="region" aria-label={t.recordsHeading} className="table-wrap table-wrap--records">
        <table className="data-table data-table--records">
          <colgroup>
            {columns.map((c) => (
              <col key={c.col} style={{ width: c.width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {columns.map((c) => {
                const ariaSort = sort.col === c.col ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined;
                return (
                  <th key={c.col} scope="col" aria-sort={ariaSort} className={c.num ? 'num' : undefined}>
                    <button type="button" className="sort-button" onClick={() => toggleSort(c.col)}>
                      {c.label}
                      <span className="sort-button__icon" aria-hidden="true">
                        {ariaSort === 'ascending' ? '▲' : ariaSort === 'descending' ? '▼' : '↕'}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={`${r[DATE]}-${r[LAT]}-${r[LON]}-${i}`}>
                <td className="date">
                  {isDateUnknown(r) ? (
                    <>
                      {r[DATE].slice(0, 4)} <span className="muted">({t.dateUnknown})</span>
                    </>
                  ) : (
                    <span className="nowrap">{r[DATE]}</span>
                  )}
                </td>
                {/* Place names as reported in Swedish; not for machine translation. */}
                <td translate="no" lang="sv" className="notranslate">
                  {r[MUNICIPALITY]}
                </td>
                <td translate="no" lang="sv" className="notranslate">
                  {r[LOCALITY]}
                </td>
                <td className="num">{r[COUNT] === null ? '' : formatNumber(lang, r[COUNT])}</td>
                <td className="num">{r[ACCURACY] === null ? '' : formatNumber(lang, r[ACCURACY])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav className="pagination" aria-label={t.paginationLabel}>
        <button type="button" className="btn btn--secondary" onClick={() => goTo(page - 1)} aria-disabled={page === 1}>
          {t.previous}
        </button>
        <p aria-live="polite">{t.pageOf(page, pages)}</p>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => goTo(page + 1)}
          aria-disabled={page === pages}
        >
          {t.next}
        </button>
      </nav>
    </>
  );
}
