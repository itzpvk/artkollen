import { useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import Filters from './Filters.jsx';
import InfoBox from './InfoBox.jsx';

// Left-hand filter panel. From 1100px it is always open: the panel itself is
// a full-height column next to the results, and its contents stick in view
// while the results scroll. Below 1100px it collapses behind a "Filters" disclosure
// button that opens it in place (no overlay, so no focus trap is needed).
// It comes before the results in the DOM, so tab order matches what you see.
export default function FilterPanel({ meta, slug, from, to, name, onChange, onReset }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);

  // Escape closes the mobile panel and returns focus to its button.
  const onKeyDown = (e) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      toggleRef.current?.focus();
    }
  };

  return (
    <aside className="filter-panel" aria-labelledby="filter-heading" onKeyDown={onKeyDown}>
      <div className="filter-panel__inner">
        <div className="filter-panel__bar">
          <button
            ref={toggleRef}
            type="button"
            className="btn btn--secondary filter-panel__toggle"
            aria-expanded={open}
            aria-controls="filter-body"
            onClick={() => setOpen((o) => !o)}
          >
            {t.filterToggle}
            <span className="filter-panel__chevron" aria-hidden="true" />
          </button>
          <p className="filter-panel__current">{t.currentSelection(name, from, to)}</p>
        </div>

        <div id="filter-body" className={open ? 'filter-panel__body is-open' : 'filter-panel__body'}>
          <h2 id="filter-heading" className="filter-panel__heading">
            {t.filterHeading}
          </h2>
          <p className="filter-panel__help">{t.filterHelp}</p>
          <Filters meta={meta} slug={slug} from={from} to={to} onChange={onChange} />
          <button type="button" className="btn btn--secondary filter-panel__reset" onClick={onReset}>
            {t.resetFilters}
          </button>
          <div className="only-wide">
            <InfoBox>{t.note}</InfoBox>
          </div>
        </div>
      </div>
    </aside>
  );
}
