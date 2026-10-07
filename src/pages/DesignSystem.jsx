import { useMemo } from 'react';
import { useDocumentTitle, useLanguage } from '../i18n/LanguageContext.jsx';
import { ds } from '../i18n/designSystem.jsx';
import Name from '../components/Name.jsx';
import { contrastRatio, parseFont, pxValue, ratioFloor, readToken, toHex } from '../lib/tokens.js';

// Design system page. Every value shown (hex, px, type sizes, contrast) is read
// live from tokens.css when the page renders; nothing here repeats a value.

// The six core colours: key into the copy, the CSS token, and the contrast rule
// that applies to how the colour is used (4.5:1 text, 3:1 non-text).
const CORE_COLOURS = [
  { key: 'paper', token: '--color-bg-page', need: null },
  { key: 'ink', token: '--color-text-primary', need: 4.5 },
  { key: 'spruce', token: '--color-action-primary', need: 4.5 },
  { key: 'lake', token: '--color-focus', need: 3 },
  { key: 'contour', token: '--color-data-compare', need: 3 },
  { key: 'lichen', token: '--color-text-secondary', need: 4.5 },
];

const DATA_STEPS = [1, 2, 3, 4, 5].map((i) => `--color-data-${i}`);

const TYPE_STYLES = [
  { name: 'Display', token: '--text-display', sample: <Name>Artkollen</Name> },
  { name: 'Heading/H1', token: '--text-h1', sample: 'Var har blåsippan setts?' },
  { name: 'Heading/H2', token: '--text-h2', sample: 'Observationer per år' },
  { name: 'Heading/H3', token: '--text-h3', sample: 'Om datan' },
  { name: 'Body/Regular', token: '--text-body', sample: 'Välj en art och ett tidsintervall för att se var den har rapporterats.' },
  { name: 'Body/Strong', token: '--text-body', weight: 600, noToken: true, sample: '1 842 observationer' },
  { name: 'Small/Regular', token: '--text-small', sample: 'Källa: Artportalen via GBIF' },
  { name: 'Label', token: '--text-label', sample: 'Art' },
  { name: 'Data/Number', token: '--text-small', tabular: true, noToken: true, dataNote: true, sample: '2024-04-12  1 842' },
];

const SPACING = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].map((s) => `--space-${s}`);

// "1–3" for consecutive steps, otherwise "1, 3 and 5".
function listSteps(steps, lang) {
  if (steps.length > 1 && steps.every((s, i) => i === 0 || s === steps[i - 1] + 1)) return `${steps[0]}–${steps.at(-1)}`;
  return new Intl.ListFormat(lang === 'sv' ? 'sv' : 'en', { type: 'conjunction' }).format(steps.map(String));
}

function Result({ ratio, need, c, lang }) {
  const pass = ratio >= need;
  return (
    <>
      <span className={pass ? 'ds-result ds-result--pass' : 'ds-result ds-result--fail'}>
        <span aria-hidden="true">{pass ? '✓' : '✕'}</span> {pass ? c.pass : c.fail}
      </span>{' '}
      <span className="ds-muted">({c.requirement(lang, need)})</span>
    </>
  );
}

function Section({ id, title, children, plain }) {
  return (
    <section id={id} className={plain ? 'ds-section' : 'panel ds-section'} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}>{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystem() {
  const { lang } = useLanguage();
  const c = ds[lang];
  useDocumentTitle(c.pageTitle);

  // Read once per render language; tokens.css is loaded with the app bundle.
  const live = useMemo(() => {
    const paper = toHex(readToken('--color-bg-page'));
    const card = toHex(readToken('--color-bg-surface'));
    const colours = CORE_COLOURS.map((col) => {
      const hex = toHex(readToken(col.token));
      return { ...col, hex, ratio: ratioFloor(contrastRatio(hex, paper)) };
    });
    const data = DATA_STEPS.map((token, i) => {
      const hex = toHex(readToken(token));
      return { token, step: i + 1, hex, ratio: ratioFloor(contrastRatio(hex, card)) };
    });
    const type = TYPE_STYLES.map((s) => {
      const f = parseFont(readToken(s.token));
      return { ...s, size: f.size, lineHeight: f.lineHeight, weightValue: s.weight ?? f.weight };
    });
    const spacing = SPACING.map((token) => ({ token, px: pxValue(readToken(token)) }));
    return { colours, data, type, spacing, radiusSm: readToken('--radius-sm'), radiusMd: readToken('--radius-md') };
  }, []);

  const failing = live.data.filter((d) => d.ratio < 3).map((d) => d.step);
  const toc = [
    ['ds-intro', c.sections.intro],
    ['ds-colour', c.sections.colour],
    ['ds-type', c.sections.type],
    ['ds-spacing', c.sections.spacing],
  ];

  return (
    <div className="ds-layout">
      <nav className="ds-toc" aria-labelledby="ds-toc-heading">
        <div className="ds-toc__inner">
          <h2 id="ds-toc-heading" className="ds-toc__heading">
            {c.tocHeading}
          </h2>
          <ul>
            {toc.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="page-wide ds">
        {/* 1. Intro */}
        <section id="ds-intro" className="ds-intro" aria-labelledby="ds-h1">
          <h1 id="ds-h1">{c.title}</h1>
          <p>{c.intro}</p>
        </section>

        {/* 2. Colour */}
        <Section id="ds-colour" title={c.sections.colour}>
          <ul className="ds-swatches">
            {live.colours.map((col) => {
              const copy = c.colours[col.key];
              return (
                <li key={col.key} className="ds-swatch">
                  <div className="ds-swatch__chip" style={{ background: `var(${col.token})` }} aria-hidden="true" />
                  <div className="ds-swatch__meta">
                    <p className="ds-swatch__name">{copy.name}</p>
                    <p className="ds-muted">
                      {col.hex} <code>{col.token}</code>
                    </p>
                    <p>{copy.usage}</p>
                    <p>
                      {col.need === null ? (
                        c.notApplicable
                      ) : (
                        <>
                          {c.contrastOnPaper(lang, col.ratio)} <Result ratio={col.ratio} need={col.need} c={c} lang={lang} />
                        </>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <h3 className="ds-subheading">{c.dataScaleLabel}</h3>
          <div className="ds-strip" aria-hidden="true">
            {live.data.map((d) => (
              <span key={d.token} style={{ background: `var(${d.token})` }} />
            ))}
          </div>
          <ul className="ds-steps">
            {live.data.map((d) => (
              <li key={d.token}>
                <span className="ds-steps__chip" style={{ background: `var(${d.token})` }} aria-hidden="true" />
                <span className="ds-steps__text">
                  <strong>{c.dataStep(d.step)}</strong> {d.hex} <code>{d.token}</code> {c.contrastOnCard(lang, d.ratio)}{' '}
                  <Result ratio={d.ratio} need={3} c={c} lang={lang} />
                </span>
              </li>
            ))}
          </ul>
          {failing.length > 0 && <p className="ds-note">{c.dataExplain(listSteps(failing, lang), failing.length > 1)}</p>}
        </Section>

        {/* 3. Type */}
        <Section id="ds-type" title={c.sections.type}>
          <p className="ds-note">{c.typeIntro}</p>
          <p className="ds-note">{c.typeDigits}</p>
          <ul className="ds-specimens">
            {live.type.map((s) => (
              <li key={s.name} className="ds-spec">
                <p className="ds-spec__meta">
                  <span className="ds-spec__name">{s.name}</span>
                  <span className="ds-muted">
                    {s.size} / {s.lineHeight} {c.weights[s.weightValue]}
                    {s.noToken && (
                      <>
                        <br />({c.noToken}
                        {s.dataNote ? `; ${c.dataNumberNote}` : ''})
                      </>
                    )}
                  </span>
                </p>
                <p
                  className="ds-spec__sample"
                  lang="sv"
                  // Only set keys that have a value: an empty longhand (e.g. fontWeight)
                  // would cancel that part of the font shorthand.
                  style={{
                    font: `var(${s.token})`,
                    ...(s.weight && { fontWeight: s.weight }),
                    ...(s.tabular && { fontVariantNumeric: 'tabular-nums' }),
                  }}
                >
                  {s.sample}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        {/* 4. Spacing and radius */}
        <Section id="ds-spacing" title={c.sections.spacing}>
          <ul className="ds-spacing">
            {live.spacing.map((s) => (
              <li key={s.token}>
                <span className="ds-spacing__label">
                  <code>{s.token}</code> <span className="ds-muted">{s.px} px</span>
                </span>
                <span className="ds-spacing__bar" style={{ width: `var(${s.token})` }} aria-hidden="true" />
              </li>
            ))}
          </ul>
          <p className="ds-note">{c.radiusNote(live.radiusSm, live.radiusMd)}</p>
        </Section>
      </div>
    </div>
  );
}
