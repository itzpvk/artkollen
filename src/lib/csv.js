// Builds a semicolon-separated CSV (what Swedish Excel expects) with a UTF-8
// byte order mark so å, ä and ö survive, then triggers a download.

function cell(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadCsv(filename, header, rows) {
  const lines = [header, ...rows].map((r) => r.map(cell).join(';'));
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
