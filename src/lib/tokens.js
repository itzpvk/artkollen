// Reads design tokens live from the stylesheet (tokens.css), so the Design
// system page always shows what the site actually uses.

export function readToken(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Resolves any CSS colour (hex, rgb(), named) to "#RRGGBB" via the browser.
export function toHex(color) {
  const probe = document.createElement('span');
  probe.style.color = color;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
  probe.remove();
  return '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
}

// WCAG 2.1 relative luminance and contrast ratio.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Truncates (not rounds) to two decimals, so 4.499 never shows as a passing 4.50.
export function ratioFloor(ratio) {
  return Math.floor(ratio * 100) / 100;
}

// Parses a font shorthand token such as "700 2.4375rem/3rem ..." into px.
export function parseFont(value) {
  const m = value.match(/(\d{3})\s+([\d.]+)(rem|px)\/([\d.]+)(rem|px)/);
  if (!m) return null;
  const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const px = (n, unit) => Math.round(unit === 'rem' ? parseFloat(n) * rootPx : parseFloat(n));
  return { weight: Number(m[1]), size: px(m[2], m[3]), lineHeight: px(m[4], m[5]) };
}

export function pxValue(value) {
  const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return value.endsWith('rem') ? parseFloat(value) * rootPx : parseFloat(value);
}
