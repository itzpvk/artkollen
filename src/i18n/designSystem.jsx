// Copy for the Design system page, Swedish and English. Values (hex, px,
// contrast) are not written here; the page reads them live from tokens.css.

import Name from '../components/Name.jsx';

const n1 = (lang, value) =>
  new Intl.NumberFormat(lang === 'sv' ? 'sv-SE' : 'en-GB', { maximumFractionDigits: 1 }).format(value);
const n2 = (lang, value) =>
  new Intl.NumberFormat(lang === 'sv' ? 'sv-SE' : 'en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    value,
  );

export const ds = {
  sv: {
    pageTitle: 'Designsystem – Artkollen',
    tocHeading: 'På sidan',
    sections: { intro: 'Introduktion', colour: 'Färg', type: 'Typografi', spacing: 'Avstånd och hörnradie' },

    title: (
      <>
        <Name>Artkollens</Name> designsystem
      </>
    ),
    intro:
      'Färger, typografi och avstånd för ett lugnt och lättläst sätt att utforska artobservationer. Paletten är lånad från svenska terrängkartor: kartpapper, granskog, sjövatten och höjdkurvor. Varje textfärg klarar WCAG 2.1 AA mot den bakgrund den används på.',

    colours: {
      paper: { name: 'Kartpapper', usage: 'Sidbakgrund.' },
      ink: { name: 'Granbläck', usage: 'Brödtext.' },
      spruce: { name: 'Gran', usage: 'Knappar, länkar.' },
      lake: { name: 'Sjö', usage: 'Fokusring, infoikon.' },
      contour: { name: 'Höjdkurva', usage: 'Reserverad för en jämförelseserie i diagram. Används inte just nu.' },
      lichen: { name: 'Lavgrå', usage: 'Sekundär text, inmatningsramar.' },
    },
    contrastOnPaper: (lang, ratio) => `Kontrast mot papper: ${n2(lang, ratio)} : 1`,
    contrastOnCard: (lang, ratio) => `Kontrast mot kort: ${n2(lang, ratio)} : 1`,
    requirement: (lang, need) => `krav ${n1(lang, need)} : 1`,
    pass: 'Klarar AA',
    fail: 'Underkänd',
    notApplicable: 'Ej tillämpligt: det här är bakgrunden.',

    dataScaleLabel: 'Dataskala (kartrutor och staplar), en enda färgton så att den går att läsa utan färgseende',
    dataStep: (i) => `Steg ${i}`,
    dataExplain: (failing) =>
      `Steg ${failing} klarar inte 3 : 1 mot ett vitt kort. Det är godtagbart eftersom färgen aldrig bär informationen ensam: varje kartruta har en vit kontur, förklaringen under kartan anger intervallen i text och tabellvyn visar alla värden. På själva kartan ligger rutorna på kartbilder som varierar, så där finns inget enskilt kontrastvärde.`,

    typeIntro: (
      <>
        <Name lang="en">Atkinson Hyperlegible Next</Name>, ritad av <Name lang="en">Braille Institute</Name> för
        läsare med nedsatt syn. Tydliga bokstavsformer (Il1, O0) hjälper när man läser ortnamn och siffror.
      </>
    ),
    typeDigits: (
      <>
        Siffrorna 0–9 kommer från <Name lang="en">Source Sans 3</Name>, som har en rak nolla utan snedstreck. I tabeller
        används tabellsiffror så att talen står i kolumn.
      </>
    ),
    noToken: 'ingen token i koden',
    dataNumberNote: 'tabeller använder Small med tabellsiffror',
    weights: { 400: 'Regular', 600: 'SemiBold', 700: 'Bold' },
    specimenOf: (style) => `Exempel på ${style}`,

    spacingRow: (name, px) => `${name}: ${px} px`,
    radiusNote: (sm, md) =>
      `Hörnradie: ${sm} på kontroller (knappar, fält, växlare), ${md} på behållare. Rutorna på kartan har skarpa hörn: de är riktiga rutnätsceller.`,
  },

  en: {
    pageTitle: 'Design system – Artkollen',
    tocHeading: 'On this page',
    sections: { intro: 'Introduction', colour: 'Colour', type: 'Type', spacing: 'Spacing and radius' },

    title: (
      <>
        <Name>Artkollen</Name> design system
      </>
    ),
    intro:
      'Colours, type and spacing for a calm, readable way into species observation data. The palette borrows from Swedish terrain maps: map paper, spruce forest, lake water and contour lines. Every text colour passes WCAG 2.1 AA on the background it is used on.',

    colours: {
      paper: { name: 'Map paper', usage: 'Page background.' },
      ink: { name: 'Spruce ink', usage: 'Body text.' },
      spruce: { name: 'Spruce', usage: 'Buttons, links.' },
      lake: { name: 'Lake', usage: 'Focus ring, info icon.' },
      contour: { name: 'Contour', usage: 'Reserved for a comparison series in charts. Not in use at present.' },
      lichen: { name: 'Lichen grey', usage: 'Secondary text, input borders.' },
    },
    contrastOnPaper: (lang, ratio) => `Contrast on paper: ${n2(lang, ratio)} : 1`,
    contrastOnCard: (lang, ratio) => `Contrast on card: ${n2(lang, ratio)} : 1`,
    requirement: (lang, need) => `needs ${n1(lang, need)} : 1`,
    pass: 'Passes AA',
    fail: 'Fails',
    notApplicable: 'Not applicable: this is the background.',

    dataScaleLabel: 'Data scale (map squares and bars), single hue so it reads without colour vision',
    dataStep: (i) => `Step ${i}`,
    dataExplain: (failing, many) =>
      `${many ? 'Steps' : 'Step'} ${failing} ${many ? 'do' : 'does'} not reach 3 : 1 against a white card. That is acceptable because colour never carries the information alone: every map square has a white outline, the legend under the map states the ranges in text, and the table view shows every value. On the map itself the squares sit on map tiles that vary, so no single contrast figure applies there.`,

    typeIntro: (
      <>
        <Name lang="en">Atkinson Hyperlegible Next</Name>, designed by the <Name lang="en">Braille Institute</Name> for
        readers with low vision. Distinct letter shapes (Il1, O0) help when reading place names and numbers.
      </>
    ),
    typeDigits: (
      <>
        Digits 0–9 come from <Name lang="en">Source Sans 3</Name>, which has a plain zero without a slash. Tables use
        tabular figures so numbers line up in columns.
      </>
    ),
    noToken: 'no token in code',
    dataNumberNote: 'tables use Small with tabular figures',
    weights: { 400: 'Regular', 600: 'SemiBold', 700: 'Bold' },
    specimenOf: (style) => `Sample of ${style}`,

    spacingRow: (name, px) => `${name}: ${px} px`,
    radiusNote: (sm, md) =>
      `Radius: ${sm} on controls (buttons, fields, toggles), ${md} on containers. Squares on the map stay sharp: they are real grid cells.`,
  },
};
