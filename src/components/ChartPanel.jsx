import { useId, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import SegmentedToggle from './SegmentedToggle.jsx';

// A dashboard card: title row with the Chart/Table (or Map/Table) toggle at the
// top right, an optional description, a body and an optional note.
//
// The body has a fixed size (`size`: "sm" | "md") or fills the card ("fill",
// used by the map), and both views render inside the same box. Switching
// between chart and table therefore never changes the card's height; a long
// table scrolls inside its own focusable region instead.
//
// `chart` and `table` are render functions so only the visible view is built.
export default function ChartPanel({ title, description, note, chart, table, kind = 'chart', size = 'md', className = '' }) {
  const { t } = useLanguage();
  const id = useId();
  const [view, setView] = useState(kind);
  const visualLabel = kind === 'map' ? t.viewMap : t.viewChart;

  return (
    <section className={`panel ${className}`} aria-labelledby={`${id}-h`}>
      <div className="panel__head">
        <h2 id={`${id}-h`}>{title}</h2>
        <SegmentedToggle
          label={t.viewToggleLabel(title.toLowerCase())}
          value={view}
          onChange={setView}
          options={[
            { value: kind, label: visualLabel },
            { value: 'table', label: t.viewTable },
          ]}
        />
      </div>
      {description && <p className="panel__description">{description}</p>}
      <div className={`panel__body panel__body--${size}`}>{view === 'table' ? table() : chart()}</div>
      {note && <p className="caption">{note}</p>}
    </section>
  );
}
