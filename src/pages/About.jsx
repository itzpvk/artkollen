import { useDocumentTitle, useLanguage } from '../i18n/LanguageContext.jsx';
import { loadMeta, useAsync } from '../lib/data.js';
import { formatNumber } from '../i18n/strings.jsx';
import Name from '../components/Name.jsx';
import StatTiles from '../components/StatTiles.jsx';

const GBIF_DATASET = 'https://www.gbif.org/dataset/38b4c89f-584c-41bb-bd8f-cd1def33e92f';
const TESTED = '2026-10-07';

function Sv({ meta }) {
  const s = meta?.source;
  const total = meta?.species.reduce((sum, sp) => sum + sp.total, 0);
  return (
    <>
      <header className="about__intro">
        <h1>Om datan och tillgänglighet</h1>
        <p className="about__lead">
          <Name>Artkollen</Name> visar var tio arter har rapporterats i <Name>Uppsala</Name> län och hur antalet
          rapporter har förändrats sedan 2000. Här står varifrån datan kommer, vad den inte kan svara på och hur
          tillgänglig webbplatsen är.
        </p>
      </header>

      <FactTiles meta={meta} />

      <div className="about-grid">
        <section className="panel about-card" aria-labelledby="sv-source">
          <h2 id="sv-source">Varifrån kommer datan?</h2>
          <p>
            Observationerna kommer från{' '}
            <a href={GBIF_DATASET}>
              <Name>Artportalen</Name>
            </a>
            , Sveriges system för rapportering av artfynd, som drivs av <Name>SLU Artdatabanken</Name>. Datan hämtades
            via <Name lang="en">GBIF</Name>:s öppna gränssnitt
            {s ? ` den ${s.fetched}` : ''} och får användas fritt (licens CC0).
          </p>
          <ul>
            <li>
              Område: <Name>Uppsala</Name> län. <Name>Heby</Name> kommun ingår inte i prototypens data.
            </li>
            <li>
              Länsgränsen på kartan kommer från{' '}
              <a href="https://www.naturalearthdata.com/">
                <Name lang="en">Natural Earth</Name>
              </a>{' '}
              (public domain). Bakgrundskartan kommer från <Name lang="en">OpenStreetMap</Name>.
            </li>
            <li>År: {s ? `${s.firstYear}–${s.lastYear}` : '2000–2025'}, alltså hela kalenderår.</li>
            <li>
              Sammanfattningen, nyckeltalen och diagrammen över år, månad, kommun och andel bygger på alla
              {total ? ` ${formatNumber('sv', total)}` : ''} rapporterade observationer av de tio arterna.
            </li>
            <li>
              Rapporter som saknar månad (till exempel när bara året är känt) ingår i totalen men visas inte i
              diagrammet per månad. Under diagrammet står hur många de är.
            </li>
            <li>
              Kartan och observationstabellen bygger på ett urval: högst {s?.recordsPerYear ?? 200} observationer per
              art och år, hämtade i fem block från olika delar av <Name lang="en">GBIF</Name>:s resultatlista. Urvalet
              är inte slumpmässigt. Det håller sidan snabb även på mobil.
            </li>
            <li>
              I observationstabellen och CSV-filen visas poster daterade 1 januari som årtal med &quot;datum
              okänt&quot;. Sådana datum betyder oftast att bara året är känt. Det gör att även ett fåtal verkliga
              observationer från 1 januari visas utan datum.
            </li>
            <li>
              Sju av platsnamnen i urvalet är avkortade efter 80 tecken, eftersom hämtningsskriptet tidigare kortade
              långa namn.
            </li>
          </ul>
        </section>

        <section className="panel about-card" aria-labelledby="sv-limits">
          <h2 id="sv-limits">Det här kan datan inte visa</h2>
          <ul>
            <li>
              <strong>Hur många individer som finns.</strong> En rapport betyder att någon såg arten och rapporterade
              den. Fler rapporter kan betyda att fler letar, inte att arten blivit vanligare.
            </li>
            <li>
              <strong>Var arten inte finns.</strong> Tomma rutor på kartan kan bero på att ingen har letat där.
            </li>
            <li>
              <strong>Exakta platser för känsliga arter.</strong> <Name>Artportalen</Name> döljer eller förgröver
              koordinater för arter som kan störas.
            </li>
          </ul>
        </section>

        <section className="panel about-card about-card--wide" aria-labelledby="sv-a11y">
          <h2 id="sv-a11y">Tillgänglighetsredogörelse</h2>
          <p>
            <Name>Artkollen</Name> är en oberoende prototyp och omfattas inte av lagen om tillgänglighet till digital
            offentlig service (DOS-lagen). Den är ändå byggd för att följa samma krav: WCAG 2.1 på nivå AA, som lagen
            hänvisar till via standarden EN 301 549.
          </p>
          <div className="about-subs">
            <div>
              <h3>Hur tillgänglig är webbplatsen?</h3>
              <p>Webbplatsen är delvis förenlig med WCAG 2.1 AA. Kända brister står nedan.</p>
            </div>
            <div>
              <h3>Kända brister</h3>
              <ul>
                <li>
                  Rutorna på kartan går inte att nå en och en med tangentbordet. Kartan går att flytta och zooma med
                  tangentbordet, och samma uppgifter finns som tabell via knappen Tabell.
                </li>
                <li>
                  Bakgrundskartan kommer från <Name lang="en">OpenStreetMap</Name> och dess texter och färger styrs inte
                  av <Name>Artkollen</Name>.
                </li>
                <li>Platsnamnen i tabellen kommer direkt från rapportörerna och kan innehålla förkortningar.</li>
              </ul>
            </div>
            <div>
              <h3>Så har webbplatsen testats</h3>
              <p>
                Senast testad {TESTED}, med enbart automatiska tester: kontroll med axe, automatiserade kontroller av
                tabbordningen med tangentbord, kontroll vid 320 px bredd (motsvarar 400 % zoom) och kontrastberäkning av
                alla färger. Manuell testning med tangentbord och skärmläsare är planerad men har inte gjorts.
              </p>
            </div>
            <div>
              <h3>Rapportera brister</h3>
              <p>Hittar du något som inte fungerar? Kontakta Vinoth K via kontaktuppgifterna i ansökan.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function En({ meta }) {
  const s = meta?.source;
  const total = meta?.species.reduce((sum, sp) => sum + sp.total, 0);
  return (
    <>
      <header className="about__intro">
        <h1>About the data and accessibility</h1>
        <p className="about__lead">
          <Name>Artkollen</Name> shows where ten species have been reported in <Name>Uppsala</Name> County and how the
          number of reports has changed since 2000. This page explains where the data comes from, what it cannot tell
          you and how accessible the site is.
        </p>
      </header>

      <FactTiles meta={meta} />

      <div className="about-grid">
        <section className="panel about-card" aria-labelledby="en-source">
          <h2 id="en-source">Where does the data come from?</h2>
          <p>
            The observations come from{' '}
            <a href={GBIF_DATASET}>
              <Name>Artportalen</Name>
            </a>
            , Sweden&apos;s system for reporting species sightings, run by <Name>SLU Artdatabanken</Name>. The data was
            fetched through <Name lang="en">GBIF</Name>&apos;s open API
            {s ? ` on ${s.fetched}` : ''} and is free to use (CC0 licence).
          </p>
          <ul>
            <li>
              Area: <Name>Uppsala</Name> County. <Name>Heby</Name> municipality is not included in this prototype&apos;s
              data.
            </li>
            <li>
              The county boundary on the map comes from{' '}
              <a href="https://www.naturalearthdata.com/">
                <Name lang="en">Natural Earth</Name>
              </a>{' '}
              (public domain). The background map comes from <Name lang="en">OpenStreetMap</Name>.
            </li>
            <li>Years: {s ? `${s.firstYear}–${s.lastYear}` : '2000–2025'}, complete calendar years only.</li>
            <li>
              The summary, the key figures and the charts per year, month, municipality and share use all
              {total ? ` ${formatNumber('en', total)}` : ''} reported observations of the ten species.
            </li>
            <li>
              Reports without a month (for example when only the year is known) are included in the total but not shown
              in the chart per month. The number of such reports is stated under that chart.
            </li>
            <li>
              The map and the observations table use a sample: at most {s?.recordsPerYear ?? 200} observations per
              species and year, taken in five blocks from different parts of <Name lang="en">GBIF</Name>&apos;s result
              list. The sample is not random. It keeps the page fast, also on mobile.
            </li>
            <li>
              In the observations table and the CSV file, records dated 1 January are shown as the year with &quot;date
              unknown&quot;. Such dates usually mean only the year is known. As a result, a few real 1 January sightings
              are also shown without a date.
            </li>
            <li>
              Seven of the place names in the sample are cut off after 80 characters, because the fetch script used to
              shorten long names.
            </li>
          </ul>
        </section>

        <section className="panel about-card" aria-labelledby="en-limits">
          <h2 id="en-limits">What the data cannot show</h2>
          <ul>
            <li>
              <strong>How many individuals exist.</strong> A report means someone saw the species and reported it. More
              reports can mean more people are looking, not that the species has become more common.
            </li>
            <li>
              <strong>Where the species is absent.</strong> Empty squares on the map may simply be places nobody has
              looked.
            </li>
            <li>
              <strong>Exact locations of sensitive species.</strong> <Name>Artportalen</Name> hides or blurs coordinates
              for species that could be disturbed.
            </li>
          </ul>
        </section>

        <section className="panel about-card about-card--wide" aria-labelledby="en-a11y">
          <h2 id="en-a11y">Accessibility statement</h2>
          <p>
            <Name>Artkollen</Name> is an independent prototype and is not covered by the Swedish Act on accessibility to
            digital public services (DOS-lagen). It is still built to meet the same requirements: WCAG 2.1 level AA,
            which the law refers to through the EN 301 549 standard.
          </p>
          <div className="about-subs">
            <div>
              <h3>How accessible is the site?</h3>
              <p>The site partially conforms to WCAG 2.1 AA. Known issues are listed below.</p>
            </div>
            <div>
              <h3>Known issues</h3>
              <ul>
                <li>
                  The squares on the map cannot be reached one by one with the keyboard. The map can be moved and zoomed
                  with the keyboard, and the same information is available as a table through the Table button.
                </li>
                <li>
                  The background map comes from <Name lang="en">OpenStreetMap</Name>; its labels and colours are not
                  controlled by <Name>Artkollen</Name>.
                </li>
                <li>Place names in the table come directly from the people reporting and may contain abbreviations.</li>
              </ul>
            </div>
            <div>
              <h3>How the site was tested</h3>
              <p>
                Last tested {TESTED}, with automated tests only: checks with axe, automated keyboard checks of the tab
                order, a check at 320 px width (equivalent to 400% zoom) and contrast calculations for every colour.
                Manual testing with a keyboard and a screen reader is planned but has not been done.
              </p>
            </div>
            <div>
              <h3>Report a problem</h3>
              <p>Found something that does not work? Contact Vinoth K using the details in the application.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// Key facts about the data, shown with the same tile component as Explore.
function FactTiles({ meta }) {
  const { t } = useLanguage();
  const s = meta?.source;
  if (!s) return null;
  return (
    <StatTiles
      heading={t.aboutTilesHeading}
      headingId="about-tiles-heading"
      tiles={[
        {
          label: t.tileSource,
          value: <Name>Artportalen</Name>,
          detail: (
            <>
              <Name>SLU Artdatabanken</Name> via <Name lang="en">GBIF</Name>
            </>
          ),
        },
        { label: t.tileLicence, value: 'CC0' },
        { label: t.tileFetched, value: s.fetched },
        { label: t.tileAreaYears, value: t.areaName, detail: `${s.firstYear}–${s.lastYear}` },
      ]}
    />
  );
}

export default function About() {
  const { lang, t } = useLanguage();
  useDocumentTitle(t.aboutPageTitle);
  const meta = useAsync(loadMeta, []);
  return (
    <article className="page-wide about">{lang === 'sv' ? <Sv meta={meta.data} /> : <En meta={meta.data} />}</article>
  );
}
