import { useId } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import Name from './Name.jsx';

const GROUP_ORDER = ['plant', 'insect', 'mollusc', 'bird', 'mammal'];

// Native <select> elements with visible labels (Figma: "Select").
// Changes apply immediately; the answer sentence is a live region that
// announces the new result. The surrounding panel provides the label.
export default function Filters({ meta, slug, from, to, onChange }) {
  const { lang, t } = useLanguage();
  const id = useId();
  const { firstYear, lastYear } = meta.source;
  const allYears = [];
  for (let y = firstYear; y <= lastYear; y++) allYears.push(y);

  const collator = new Intl.Collator(lang === 'sv' ? 'sv' : 'en');
  const selected = meta.species.find((s) => s.slug === slug);
  const groups = GROUP_ORDER.map((g) => ({
    group: g,
    items: meta.species.filter((s) => s.group === g).sort((a, b) => collator.compare(a[lang], b[lang])),
  })).filter((g) => g.items.length);

  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()}>
      <div className="field field--species">
        <label htmlFor={`${id}-species`}>{t.speciesLabel}</label>
        <select
          id={`${id}-species`}
          value={slug}
          aria-describedby={`${id}-species-hint`}
          onChange={(e) => onChange({ art: e.target.value })}
        >
          {groups.map((g) => (
            <optgroup key={g.group} label={t.groups[g.group]}>
              {g.items.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s[lang]}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p id={`${id}-species-hint`} className="field__hint">
          <Name lang="la" as="i">
            {selected.scientific}
          </Name>
          {selected.invasive ? `, ${t.invasiveTag}` : ''}
        </p>
      </div>
      <div className="field">
        <label htmlFor={`${id}-from`}>{t.fromLabel}</label>
        <select id={`${id}-from`} value={from} onChange={(e) => onChange({ fran: Number(e.target.value) })}>
          {allYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${id}-to`}>{t.toLabel}</label>
        <select id={`${id}-to`} value={to} onChange={(e) => onChange({ till: Number(e.target.value) })}>
          {allYears
            .filter((y) => y >= from)
            .map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
        </select>
      </div>
    </form>
  );
}
