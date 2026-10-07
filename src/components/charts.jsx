// Small SVG chart kit: vertical bars, horizontal bars and a line, all sharing
// one interaction model. Each plot is a single tab stop; arrow keys move
// between marks, the active value shows in a tooltip and is announced in a
// live region. Hovering does the same with the pointer. Every chart is paired
// with a table view in its panel, so nothing depends on seeing the marks.

import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../i18n/strings.jsx';

function useWidth(ref) {
  const [width, setWidth] = useState(600);
  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

export function niceMax(value, ticks = 4) {
  if (value <= 0) return 1;
  const raw = value / ticks;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow >= raw) * pow;
  return Math.ceil(value / step) * step;
}

// Label every `every`-th tick, plus the last one when it isn't crowded by
// the previous labelled tick.
function showTick(i, length, every) {
  const last = length - 1;
  return i % every === 0 || (i === last && last % every > every / 2);
}

// Bar with a 4px rounded data end and a square baseline.
function vBar(x, y, w, h) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}
function hBar(x, y, w, h) {
  const r = Math.min(4, h / 2, w);
  return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
}

// Shared focus/keyboard/pointer/tooltip wrapper.
function Plot({ count, ariaLabel, hint, height, indexAt, tooltip, tooltipX, children }) {
  const ref = useRef(null);
  const width = useWidth(ref);
  const [active, setActive] = useState(null);
  const last = count - 1;
  const safeActive = active !== null && active <= last ? active : null;

  const onKeyDown = (e) => {
    const step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1, Home: -Infinity, End: Infinity }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    setActive((a) => Math.max(0, Math.min(last, (a ?? 0) + step)));
  };
  const onPointerMove = (e) => {
    const box = ref.current.getBoundingClientRect();
    setActive(indexAt(e.clientX - box.left, e.clientY - box.top, width));
  };

  const tip = safeActive !== null ? tooltip(safeActive) : null;
  const left = tip ? Math.max(0, Math.min(width - 168, tooltipX(safeActive, width) - 84)) : 0;

  return (
    <div
      ref={ref}
      className="chart__plot"
      tabIndex={0}
      role="img"
      aria-label={`${ariaLabel} ${hint}`}
      onKeyDown={onKeyDown}
      onFocus={() => setActive((a) => a ?? 0)}
      onBlur={() => setActive(null)}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setActive(null)}
      style={{ height }}
    >
      {children(width, safeActive)}
      {tip && (
        <div className="chart__tooltip" style={{ left }}>
          <strong>{tip.value}</strong>
          <span>{tip.label}</span>
        </div>
      )}
      <p className="visually-hidden" aria-live="polite">
        {tip && (
          <>
            {tip.label}: {tip.value}
          </>
        )}
      </p>
    </div>
  );
}

function YGrid({ ticks, y, x1, x2, format }) {
  return ticks.map((tick) => (
    <g key={tick}>
      <line x1={x1} x2={x2} y1={y(tick)} y2={y(tick)} className="chart__grid" />
      <text x={x1 - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="chart__tick">
        {format(tick)}
      </text>
    </g>
  ));
}

const VM = { top: 22, right: 12, bottom: 28, left: 52 };

// Vertical columns, e.g. per year or per month.
// data: [{ key, label, value }]; labelIndexes: which columns get a value label.
export function ColumnChart({ data, lang, ariaLabel, hint, height = 240, labelIndexes = [], tickEvery = 1, tooltip }) {
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const geometry = (width) => {
    const innerW = Math.max(10, width - VM.left - VM.right);
    const band = innerW / data.length;
    return { band, barW: Math.max(2, Math.min(24, band - 2)) };
  };
  const innerH = height - VM.top - VM.bottom;
  const y = (v) => VM.top + innerH - (v / max) * innerH;

  return (
    <Plot
      count={data.length}
      ariaLabel={ariaLabel}
      hint={hint}
      height={height}
      indexAt={(px, _py, width) =>
        Math.max(0, Math.min(data.length - 1, Math.floor((px - VM.left) / geometry(width).band)))
      }
      tooltipX={(i, width) => VM.left + (i + 0.5) * geometry(width).band}
      tooltip={(i) => tooltip(data[i])}
    >
      {(width, active) => {
        const { band, barW } = geometry(width);
        return (
          <svg width={width} height={height} aria-hidden="true" focusable="false">
            <YGrid ticks={ticks} y={y} x1={VM.left} x2={width - VM.right} format={(v) => formatNumber(lang, v)} />
            {data.map((d, i) => {
              const x = VM.left + i * band + (band - barW) / 2;
              const h = (d.value / max) * innerH;
              const anchor = i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle';
              const lx = anchor === 'start' ? x : anchor === 'end' ? x + barW : x + barW / 2;
              return (
                <g key={d.key}>
                  {h > 0 && (
                    <path d={vBar(x, y(d.value), barW, h)} className={i === active ? 'mark mark--active' : 'mark'} />
                  )}
                  {labelIndexes.includes(i) && d.value > 0 && (
                    <text x={lx} y={y(d.value) - 6} textAnchor={anchor} className="chart__value">
                      {formatNumber(lang, d.value)}
                    </text>
                  )}
                  {showTick(i, data.length, tickEvery) && (
                    <text x={x + barW / 2} y={height - 8} textAnchor="middle" className="chart__tick">
                      {d.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        );
      }}
    </Plot>
  );
}

// Horizontal bars, sorted by the caller, value at the bar end.
// labelLang marks the bar labels as names in that language, untranslated
// (e.g. Swedish municipality names).
export function BarChart({ data, lang, ariaLabel, hint, tooltip, labelLang }) {
  const row = 32;
  const barH = 20;
  const labelW = 96;
  const valueW = 56;
  const height = data.length * row + 8;
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <Plot
      count={data.length}
      ariaLabel={ariaLabel}
      hint={hint}
      height={height}
      indexAt={(_px, py) => Math.max(0, Math.min(data.length - 1, Math.floor((py - 4) / row)))}
      tooltipX={(_i, width) => width - 84}
      tooltip={(i) => tooltip(data[i])}
    >
      {(width, active) => {
        const innerW = Math.max(10, width - labelW - valueW);
        return (
          <svg width={width} height={height} aria-hidden="true" focusable="false">
            {data.map((d, i) => {
              const y = 4 + i * row + (row - barH) / 2;
              const w = (d.value / max) * innerW;
              return (
                <g key={d.key}>
                  <text
                    x={0}
                    y={y + barH / 2}
                    dy="0.32em"
                    {...(labelLang && { translate: 'no', lang: labelLang })}
                    className={labelLang ? 'chart__label notranslate' : 'chart__label'}
                  >
                    {d.label}
                  </text>
                  {w > 0 && (
                    <path d={hBar(labelW, y, w, barH)} className={i === active ? 'mark mark--active' : 'mark'} />
                  )}
                  <text x={labelW + w + 6} y={y + barH / 2} dy="0.32em" className="chart__value">
                    {formatNumber(lang, d.value)}
                  </text>
                </g>
              );
            })}
          </svg>
        );
      }}
    </Plot>
  );
}

// Single-series line with an end dot and an end label.
export function LineChart({ data, lang, ariaLabel, hint, height = 220, tickEvery = 5, format, tooltip }) {
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const M = { ...VM, left: 60, right: 20 };
  const innerH = height - M.top - M.bottom;
  const y = (v) => M.top + innerH - (v / max) * innerH;
  const xAt = (i, width) => {
    const innerW = Math.max(10, width - M.left - M.right);
    return M.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  };

  return (
    <Plot
      count={data.length}
      ariaLabel={ariaLabel}
      hint={hint}
      height={height}
      indexAt={(px, _py, width) => {
        const innerW = Math.max(10, width - M.left - M.right);
        return Math.max(0, Math.min(data.length - 1, Math.round(((px - M.left) / innerW) * (data.length - 1))));
      }}
      tooltipX={(i, width) => xAt(i, width)}
      tooltip={(i) => tooltip(data[i])}
    >
      {(width, active) => {
        const points = data.map((d, i) => `${xAt(i, width)},${y(d.value)}`).join(' ');
        const lastI = data.length - 1;
        const focus = active ?? lastI;
        return (
          <svg width={width} height={height} aria-hidden="true" focusable="false">
            <YGrid ticks={ticks} y={y} x1={M.left} x2={width - M.right} format={format} />
            {active !== null && (
              <line
                x1={xAt(active, width)}
                x2={xAt(active, width)}
                y1={M.top}
                y2={M.top + innerH}
                className="chart__crosshair"
              />
            )}
            <polyline points={points} className="line" />
            <circle cx={xAt(focus, width)} cy={y(data[focus].value)} r={5} className="line__dot" />
            <text x={xAt(lastI, width)} y={y(data[lastI].value) - 12} textAnchor="end" className="chart__value">
              {format(data[lastI].value)}
            </text>
            {data.map(
              (d, i) =>
                showTick(i, data.length, tickEvery) && (
                  <text key={d.key} x={xAt(i, width)} y={height - 8} textAnchor="middle" className="chart__tick">
                    {d.label}
                  </text>
                ),
            )}
          </svg>
        );
      }}
    </Plot>
  );
}

// Plain table used as the text alternative for every chart. Columns can be
// given a fixed `width` (e.g. '60%'); the table then uses table-layout: fixed,
// so changing filters never shifts the column layout.
export function DataTable({ caption, columns, rows }) {
  const fixed = columns.some((c) => c.width);
  return (
    <div tabIndex={0} role="region" aria-label={caption} className="table-wrap">
      <table className={fixed ? 'data-table data-table--fixed' : 'data-table'}>
        <caption>{caption}</caption>
        {fixed && (
          <colgroup>
            {columns.map((c) => (
              <col key={c.label} style={{ width: c.width }} />
            ))}
          </colgroup>
        )}
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={c.label} scope="col" className={i > 0 ? 'num' : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, rowIndex) => (
            <tr key={rowIndex}>
              {r.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={i} className="num">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
