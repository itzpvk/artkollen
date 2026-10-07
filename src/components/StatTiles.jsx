import { useLanguage } from '../i18n/LanguageContext.jsx';

// Row of four key figures, as a description list so each value is read
// together with its label.
export default function StatTiles({ tiles, heading, headingId = 'tiles-heading' }) {
  const { t } = useLanguage();
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="visually-hidden">
        {heading ?? t.tilesLabel}
      </h2>
      <dl className="tiles">
        {tiles.map((tile) => (
          <div key={tile.label} className="tile">
            <dt className="tile__label">{tile.label}</dt>
            <dd className="tile__value">{tile.value}</dd>
            {tile.detail && <dd className="tile__detail">{tile.detail}</dd>}
          </div>
        ))}
      </dl>
    </section>
  );
}
