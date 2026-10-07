// Automated accessibility check: runs axe (WCAG 2.0/2.1 A + AA rules) on each
// page in both languages at eight widths, and saves screenshots. Also checks
// the mobile filter panel in its open state.
//
// Usage: node tests/a11y.mjs [baseUrl] [screenshotDir]

import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const base = process.argv[2] ?? 'http://localhost:5173';
const outDir = process.argv[3] ?? 'test-results';
await mkdir(outDir, { recursive: true });

const pages = [
  { name: 'dashboard', path: '/' },
  { name: 'dashboard-tables', path: '/?art=trana', toggleTables: true },
  { name: 'dashboard-filters-open', path: '/', openFilters: true },
  { name: 'about', path: '/om' },
  { name: 'design-system', path: '/designsystem' },
];
// Includes both sides of the 1100px and 700px breakpoints.
const viewports = [1920, 1440, 1100, 1099, 768, 700, 699, 320].map((width) => ({
  name: String(width),
  width,
  height: 900,
}));

const browser = await chromium.launch();
let failures = 0;

for (const lang of ['sv', 'en']) {
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: vp });
    await context.addInitScript((l) => localStorage.setItem('artkollen-lang', l), lang);
    const page = await context.newPage();
    for (const p of pages) {
      await page.goto(base + p.path);
      await page.waitForSelector('h1');
      await page.waitForLoadState('networkidle');
      if (p.openFilters) {
        const toggle = page.locator('.filter-panel__toggle');
        if (!(await toggle.isVisible())) continue; // desktop: panel is always open
        await toggle.click();
      }
      if (p.toggleTables) {
        for (const label of lang === 'sv' ? ['Tabell'] : ['Table']) {
          const buttons = page.getByRole('button', { name: label, exact: true });
          for (const b of await buttons.all()) await b.click();
        }
      }
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.leaflet-tile-pane') // third-party map tiles
        .analyze();
      const id = `${p.name}-${lang}-${vp.name}`;
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > vp.width) {
        failures++;
        console.log(`✗ ${id}: horizontal scroll (${scrollWidth}px > ${vp.width}px)`);
      }
      if (result.violations.length) {
        failures += result.violations.length;
        console.log(`✗ ${id}`);
        for (const v of result.violations) {
          console.log(`   ${v.impact} ${v.id}: ${v.help}`);
          for (const n of v.nodes.slice(0, 3)) console.log(`      ${n.target.join(' ')}`);
        }
      } else {
        console.log(`✓ ${id}: no axe violations`);
      }
      await page.screenshot({ path: `${outDir}/${id}.png`, fullPage: true });
    }
    await context.close();
  }
}

await browser.close();
process.exit(failures ? 1 : 0);
