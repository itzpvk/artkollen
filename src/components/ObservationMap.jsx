import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { classBreaks, classOf, toGrid } from '../lib/grid.js';
import { formatNumber } from '../i18n/strings.jsx';
import { loadOutline } from '../lib/data.js';
import { nameHtml } from './Name.jsx';

// Used until the county outline has loaded.
const COUNTY_BOUNDS = [
  [59.38, 16.78],
  [60.66, 18.62],
];
const WORLD = [
  [-89, -179],
  [89, -179],
  [89, 179],
  [-89, 179],
];

function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Leaflet map with observations grouped into ~5 km squares. Leaflet gives the
// container keyboard panning (arrow keys) and zoom (+/-). The squares
// themselves are not focusable, so the same information is offered as a table
// through the Map/Table toggle.
export default function ObservationMap({ rows }) {
  const { lang, t } = useLanguage();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  const cells = useMemo(() => toGrid(rows), [rows]);
  const breaks = useMemo(() => classBreaks(cells), [cells]);

  useEffect(() => {
    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      zoomControl: false,
      minZoom: 7,
      zoomSnap: 0.25,
      maxBounds: [
        [58.8, 15.8],
        [61.2, 19.8],
      ],
    });
    map.fitBounds(COUNTY_BOUNDS);
    // Panes: the fade sits under the squares, the outline above them.
    map.createPane('fade').style.zIndex = 350;
    map.createPane('outline').style.zIndex = 450;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 13,
      attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">${nameHtml('OpenStreetMap')}</a>`,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Keep tiles filling the box when its width changes (window resize,
    // the mobile filter panel opening).
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(containerRef.current);

    // County outline (Natural Earth, public domain) and a light fade outside it.
    let active = true;
    loadOutline()
      .then((geojson) => {
        if (!active) return;
        const rings = geojson.features[0].geometry.coordinates.map((poly) => poly[0].map(([lon, lat]) => [lat, lon]));
        L.polygon([WORLD, ...rings], {
          pane: 'fade',
          stroke: false,
          fillColor: token('--color-bg-page'),
          fillOpacity: 0.55,
          interactive: false,
        }).addTo(map);
        const outline = L.geoJSON(geojson, {
          pane: 'outline',
          interactive: false,
          style: { color: token('--color-text-primary'), weight: 2, fill: false },
        }).addTo(map);
        map.fitBounds(outline.getBounds(), { padding: [8, 8] });
        map.setMaxBounds(outline.getBounds().pad(0.6));
      })
      .catch(() => {
        // Without the outline the map still works; it just isn't faded.
      });

    return () => {
      active = false;
      resize.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    containerRef.current.setAttribute('aria-label', t.mapLabel);
    const zoom = L.control.zoom({ zoomInTitle: t.zoomIn, zoomOutTitle: t.zoomOut }).addTo(map);
    map.attributionControl.addAttribution(t.boundaryAttribution);
    return () => {
      zoom.remove();
      map.attributionControl?.removeAttribution(t.boundaryAttribution);
    };
  }, [t]);

  useEffect(() => {
    const layer = layerRef.current;
    layer.clearLayers();
    const colors = [1, 2, 3, 4, 5].map((i) => token(`--color-data-${i}`));
    const offset = 5 - breaks.length; // fewer classes use the darker end
    for (const cell of cells) {
      const square = L.rectangle(cell.bounds, {
        stroke: true,
        color: token('--color-bg-surface'),
        weight: 1,
        fillColor: colors[offset + classOf(cell.count, breaks)],
        fillOpacity: 0.85,
      })
        .bindTooltip(t.mapCell(lang, cell.count), { sticky: true })
        .addTo(layer);
      // Keep hundreds of squares out of the Tab order; the table view has the same data.
      const el = square.getElement();
      el.setAttribute('tabindex', '-1');
      el.setAttribute('aria-hidden', 'true');
    }
  }, [cells, breaks, lang, t]);

  const legend = breaks.map((upper, i) => {
    const lower = i === 0 ? 1 : breaks[i - 1] + 1;
    return {
      color: `var(--color-data-${5 - breaks.length + i + 1})`,
      label: lower >= upper ? formatNumber(lang, upper) : `${formatNumber(lang, lower)}–${formatNumber(lang, upper)}`,
    };
  });

  return (
    <div className="map">
      <div ref={containerRef} className="map__canvas" role="region" />
      {legend.length > 0 && (
        <div className="legend">
          <p className="legend__title" id="map-legend">
            {t.mapLegend}
          </p>
          <ul aria-labelledby="map-legend">
            {legend.map((l) => (
              <li key={l.label}>
                <span className="legend__swatch" style={{ background: l.color }} aria-hidden="true" />
                {l.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
