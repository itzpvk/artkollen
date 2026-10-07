// Marks a proper name so browser translation (e.g. Chrome) leaves it alone and
// screen readers pronounce it in the right language.
// translate="no" is the standard; class "notranslate" is Google's fallback.
//
//   <Name>Knivsta</Name>                 Swedish place or brand (default lang="sv")
//   <Name lang="la" as="i">Grus grus</Name>   Latin species name
//   <Name lang="en">OpenStreetMap</Name>
export default function Name({ children, lang = 'sv', as: Tag = 'span' }) {
  return (
    <Tag translate="no" lang={lang} className="notranslate">
      {children}
    </Tag>
  );
}

// Same marking for HTML strings that are not rendered by React (Leaflet attribution).
export function nameHtml(text, lang = 'en') {
  return `<span translate="no" lang="${lang}" class="notranslate">${text}</span>`;
}
