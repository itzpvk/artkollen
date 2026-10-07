// All interface copy in Swedish and English. Functions take values to interpolate.
// Proper names inside sentences are wrapped in <Name> so browser translation
// leaves them alone (see components/Name.jsx).

import Name, { nameHtml } from '../components/Name.jsx';

const locale = (lang) => (lang === 'sv' ? 'sv-SE' : 'en-GB');
const n = (lang, value) => new Intl.NumberFormat(locale(lang)).format(value);
const pct = (lang, value) =>
  new Intl.NumberFormat(locale(lang), { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    value / 100,
  );
const date = (lang, iso) =>
  new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
const monthName = (lang, index) =>
  new Intl.DateTimeFormat(locale(lang), { month: 'short' }).format(new Date(2025, index, 1));

export const strings = {
  sv: {
    skipLink: 'Hoppa till innehållet',
    siteName: 'Artkollen',
    navLabel: 'Huvudmeny',
    navExplore: 'Utforska',
    navAbout: 'Om datan',
    navDesign: 'Designsystem',
    languageLabel: 'Språk',
    explorePageTitle: 'Artkollen – rapporterade arter i Uppsala län',
    aboutPageTitle: 'Om datan och tillgänglighet – Artkollen',
    notFoundTitle: 'Sidan finns inte',
    notFoundText: 'Adressen kan vara fel eller sidan flyttad.',
    notFoundLink: 'Gå till startsidan',

    heading: (species) => (
      <>
        Var har man rapporterat {species.toLowerCase()} i <Name>Uppsala</Name> län?
      </>
    ),
    filterHelp: (
      <>
        Välj art och år. Kartan, diagrammen och tabellen uppdateras direkt. Data från <Name>Artportalen</Name>.
      </>
    ),
    filterHeading: 'Filter',
    filterToggle: 'Filter',
    currentSelection: (species, from, to) => `${species}, ${from}–${to}`,
    resetFilters: 'Återställ filter',
    skipToResults: 'Hoppa till resultat',
    speciesLabel: 'Art',
    fromLabel: 'Från år',
    toLabel: 'Till år',
    invasiveTag: 'invasiv art',
    groups: { plant: 'Växter', insect: 'Insekter', bird: 'Fåglar', mammal: 'Däggdjur', mollusc: 'Snäckor' },

    summary: (lang, places, species, from, to, top) => (
      <>
        {species} har rapporterats i {n(lang, places)} {places === 1 ? 'kommun' : 'kommuner'} i <Name>Uppsala</Name> län{' '}
        {from}–{to}, oftast i <Name>{top}</Name>.
      </>
    ),
    summaryNoPlace: (species, from, to) => (
      <>
        {species} har rapporterats i <Name>Uppsala</Name> län {from}–{to}.
      </>
    ),
    summaryNone: (species, from, to) =>
      `Inga observationer av ${species.toLowerCase()} rapporterades ${from}–${to}. Prova ett längre tidsintervall.`,
    note: 'Siffrorna visar rapporterade observationer, inte hur många individer som finns. Fler människor rapporterar i dag än för 20 år sedan, så en ökning kan bero på att fler letar.',

    tilesLabel: 'Nyckeltal',
    aboutTilesHeading: 'Datan i korthet',
    tileSource: 'Källa',
    tileLicence: 'Licens',
    tileFetched: 'Hämtad',
    tileAreaYears: 'Område och år',
    areaName: (
      <>
        <Name>Uppsala</Name> län
      </>
    ),
    tileTotal: 'Rapporter totalt',
    tilePeak: 'Flest rapporter',
    tilePeakDetail: (lang, count) => `${n(lang, count)} rapporter det året`,
    tileMunicipalities: 'Kommuner med rapporter',
    tileLatest: 'Senaste rapport',
    tileAllYears: (from, to) => `${from}–${to}`,

    viewChart: 'Diagram',
    viewMap: 'Karta',
    viewTable: 'Tabell',
    viewToggleLabel: (what) => `Visa ${what} som`,
    arrowHint: 'Använd vänster- och högerpil för att gå mellan staplarna.',

    mapHeading: 'Var observationerna finns',
    mapCaption: (lang, count) => (
      <>
        Rutor på cirka 5 × 5 km. Bygger på ett urval av {n(lang, count)} observationer (högst 200 per år).{' '}
        <Name>Heby</Name> kommun ingår inte.
      </>
    ),
    boundaryAttribution: `Länsgräns: <a href="https://www.naturalearthdata.com/">${nameHtml('Natural Earth')}</a>`,
    mapLabel:
      'Karta över observationer i Uppsala län. Använd piltangenterna för att flytta kartan och plus eller minus för att zooma. Samma uppgifter finns i tabellvyn.',
    mapLegend: 'Observationer per ruta',
    zoomIn: 'Zooma in',
    zoomOut: 'Zooma ut',
    mapCell: (lang, count) => `${n(lang, count)} observationer i rutan`,
    gridTableCaption: 'Rutor med observationer i urvalet, flest först',
    colSquare: 'Rutans mittpunkt (lat, lon)',
    unknownMunicipality: 'Okänd kommun',

    yearHeading: 'Rapporter per år',
    yearLabel: (species, from, to) =>
      `Stapeldiagram över rapporterade observationer av ${species.toLowerCase()} per år ${from}–${to}.`,
    yearTableCaption: (species) => `Rapporterade observationer av ${species.toLowerCase()} per år`,

    monthHeading: 'Rapporter per månad',
    monthLabel: (species) => `Stapeldiagram över rapporter av ${species.toLowerCase()} per månad.`,
    monthTableCaption: (species) => `Rapporter av ${species.toLowerCase()} per månad`,
    noMonth: (lang, count) => `${n(lang, count)} rapporter saknar månad och visas inte.`,

    municipalityHeading: 'Rapporter per kommun',
    municipalityLabel: (species) => `Stapeldiagram över rapporter av ${species.toLowerCase()} per kommun.`,
    municipalityTableCaption: (species) => `Rapporter av ${species.toLowerCase()} per kommun`,

    shareHeading: 'Andel av alla rapporter i länet',
    shareText: (
      <>
        Artens andel av alla rapporter i <Name>Uppsala</Name> län samma år. Om linjen är platt beror en ökning troligen
        på att fler rapporterar.
      </>
    ),
    shareLabel: (species, from, to) =>
      `Linjediagram över ${species.toLowerCase()}s andel av alla rapporter i länet per år ${from}–${to}.`,
    shareTableCaption: (species) => `${species}: andel av alla rapporter i länet per år`,
    shareTooltip: (lang, value) => `${pct(lang, value)} av alla rapporter`,

    year: 'År',
    month: 'Månad',
    municipality: 'Kommun',
    reports: 'Rapporter',
    observationsInSample: 'Observationer i urvalet',
    allReports: 'Alla rapporter i länet',
    share: 'Andel',

    recordsHeading: 'Observationer',
    recordsCaption: (lang, count) =>
      `${n(lang, count)} observationer i urvalet. Klicka på en kolumnrubrik för att sortera.`,
    colDate: 'Datum',
    dateUnknown: 'datum okänt',
    colMunicipality: 'Kommun',
    colLocality: 'Plats',
    colCount: 'Antal',
    colAccuracy: 'Positionsnoggrannhet (m)',
    download: 'Ladda ner CSV',
    downloadHint: 'Semikolonseparerad fil som öppnas i Excel.',
    previous: 'Föregående',
    next: 'Nästa',
    pageOf: (page, pages) => `Sida ${page} av ${pages}`,
    paginationLabel: 'Sidor i tabellen',
    loading: 'Hämtar observationer …',
    loadError: 'Observationerna kunde inte hämtas. Kontrollera anslutningen och ladda om sidan.',
    noRecords: 'Det finns inga observationer att visa för det här tidsintervallet.',

    footerProject: (
      <>
        <Name>Artkollen</Name> är en oberoende prototyp gjord av <Name lang="en">Vinoth K</Name>. Den är inte en tjänst
        från <Name>SLU</Name>.
      </>
    ),
    footerData: (
      <>
        Data: <Name>Artportalen</Name> (<Name>SLU Artdatabanken</Name>) via <Name lang="en">GBIF.org</Name>, licens CC0.
      </>
    ),
  },

  en: {
    skipLink: 'Skip to content',
    siteName: 'Artkollen',
    navLabel: 'Main menu',
    navExplore: 'Explore',
    navAbout: 'About the data',
    navDesign: 'Design system',
    languageLabel: 'Language',
    explorePageTitle: 'Artkollen – reported species in Uppsala County',
    aboutPageTitle: 'About the data and accessibility – Artkollen',
    notFoundTitle: 'Page not found',
    notFoundText: 'The address may be wrong or the page may have moved.',
    notFoundLink: 'Go to the start page',

    heading: (species) => (
      <>
        Where has the {species.toLowerCase()} been reported in <Name>Uppsala</Name> County?
      </>
    ),
    filterHelp: (
      <>
        Choose a species and years. The map, charts and table update straight away. Data from <Name>Artportalen</Name>.
      </>
    ),
    filterHeading: 'Filters',
    filterToggle: 'Filters',
    currentSelection: (species, from, to) => `${species}, ${from}–${to}`,
    resetFilters: 'Reset filters',
    skipToResults: 'Skip to results',
    speciesLabel: 'Species',
    fromLabel: 'From year',
    toLabel: 'To year',
    invasiveTag: 'invasive species',
    groups: { plant: 'Plants', insect: 'Insects', bird: 'Birds', mammal: 'Mammals', mollusc: 'Molluscs' },

    summary: (lang, places, species, from, to, top) => (
      <>
        {species} was reported in {n(lang, places)} {places === 1 ? 'municipality' : 'municipalities'} in{' '}
        <Name>Uppsala</Name> County {from}–{to}, most often in <Name>{top}</Name>.
      </>
    ),
    summaryNoPlace: (species, from, to) => (
      <>
        {species} was reported in <Name>Uppsala</Name> County {from}–{to}.
      </>
    ),
    summaryNone: (species, from, to) =>
      `No observations of ${species.toLowerCase()} were reported ${from}–${to}. Try a longer time span.`,
    note: 'The numbers show reported observations, not how many individuals exist. More people report today than 20 years ago, so an increase can simply mean more people are looking.',

    tilesLabel: 'Key figures',
    aboutTilesHeading: 'The data at a glance',
    tileSource: 'Source',
    tileLicence: 'Licence',
    tileFetched: 'Fetched',
    tileAreaYears: 'Area and years',
    areaName: (
      <>
        <Name>Uppsala</Name> County
      </>
    ),
    tileTotal: 'Total reports',
    tilePeak: 'Peak year',
    tilePeakDetail: (lang, count) => `${n(lang, count)} reports that year`,
    tileMunicipalities: 'Municipalities with reports',
    tileLatest: 'Latest report',
    tileAllYears: (from, to) => `${from}–${to}`,

    viewChart: 'Chart',
    viewMap: 'Map',
    viewTable: 'Table',
    viewToggleLabel: (what) => `Show ${what} as`,
    arrowHint: 'Use the left and right arrow keys to move between the bars.',

    mapHeading: 'Where the observations are',
    mapCaption: (lang, count) => (
      <>
        Squares of about 5 × 5 km. Based on a sample of {n(lang, count)} observations (at most 200 per year).{' '}
        <Name>Heby</Name> municipality is not included.
      </>
    ),
    boundaryAttribution: `County boundary: <a href="https://www.naturalearthdata.com/">${nameHtml('Natural Earth')}</a>`,
    mapLabel:
      'Map of observations in Uppsala County. Use the arrow keys to move the map and plus or minus to zoom. The same information is in the table view.',
    mapLegend: 'Observations per square',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    mapCell: (lang, count) => `${n(lang, count)} observations in this square`,
    gridTableCaption: 'Squares with observations in the sample, most first',
    colSquare: 'Centre of square (lat, lon)',
    unknownMunicipality: 'Unknown municipality',

    yearHeading: 'Reports per year',
    yearLabel: (species, from, to) =>
      `Bar chart of reported observations of ${species.toLowerCase()} per year ${from}–${to}.`,
    yearTableCaption: (species) => `Reported observations of ${species.toLowerCase()} per year`,

    monthHeading: 'Reports per month',
    monthLabel: (species) => `Bar chart of reports of ${species.toLowerCase()} per month.`,
    monthTableCaption: (species) => `Reports of ${species.toLowerCase()} per month`,
    noMonth: (lang, count) => `${n(lang, count)} reports have no month and are not shown.`,

    municipalityHeading: 'Reports per municipality',
    municipalityLabel: (species) => `Bar chart of reports of ${species.toLowerCase()} per municipality.`,
    municipalityTableCaption: (species) => `Reports of ${species.toLowerCase()} per municipality`,

    shareHeading: 'Share of all reports in the county',
    shareText: (
      <>
        The species&apos; share of all reports in <Name>Uppsala</Name> County that year. If the line is flat, an
        increase is probably because more people report.
      </>
    ),
    shareLabel: (species, from, to) =>
      `Line chart of the ${species.toLowerCase()}'s share of all reports in the county per year ${from}–${to}.`,
    shareTableCaption: (species) => `${species}: share of all reports in the county per year`,
    shareTooltip: (lang, value) => `${pct(lang, value)} of all reports`,

    year: 'Year',
    month: 'Month',
    municipality: 'Municipality',
    reports: 'Reports',
    observationsInSample: 'Observations in sample',
    allReports: 'All reports in the county',
    share: 'Share',

    recordsHeading: 'Observations',
    recordsCaption: (lang, count) => `${n(lang, count)} observations in the sample. Select a column heading to sort.`,
    colDate: 'Date',
    dateUnknown: 'date unknown',
    colMunicipality: 'Municipality',
    colLocality: 'Place',
    colCount: 'Count',
    colAccuracy: 'Position accuracy (m)',
    download: 'Download CSV',
    downloadHint: 'Semicolon-separated file that opens in Excel.',
    previous: 'Previous',
    next: 'Next',
    pageOf: (page, pages) => `Page ${page} of ${pages}`,
    paginationLabel: 'Table pages',
    loading: 'Loading observations …',
    loadError: 'The observations could not be loaded. Check your connection and reload the page.',
    noRecords: 'There are no observations to show for this time span.',

    footerProject: (
      <>
        <Name>Artkollen</Name> is an independent prototype made by <Name lang="en">Vinoth K</Name>. It is not an{' '}
        <Name>SLU</Name> service.
      </>
    ),
    footerData: (
      <>
        Data: <Name>Artportalen</Name> (<Name>SLU Artdatabanken</Name>) via <Name lang="en">GBIF.org</Name>, licence
        CC0.
      </>
    ),
  },
};

export const formatNumber = n;
export const formatPercent = pct;
export const formatDate = date;
export const formatMonth = monthName;
