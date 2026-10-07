// Automated keyboard and focus checks, run in Chromium through Playwright.
// Covers: tab order, the "Skip to results" link, focus after sorting and
// paging, focus staying on the pagination buttons at both ends, and opening
// and closing the mobile filter panel by keyboard. Runs in Swedish and English.
//
// Usage: node tests/keyboard.mjs [baseUrl]   (default http://localhost:4173)
// Needs a running server, e.g. `npm run preview`.

import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4173';
let passed = 0;
let failed = 0;

function check(name, ok, detail = '') {
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? '✓' : '✗'} ${name}${!ok && detail ? `\n    ${detail}` : ''}`);
}

// A short, stable description of the focused element.
const focused = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return 'body';
    if (el.matches('.skip-link')) return `skip:${el.getAttribute('href')}`;
    if (el.matches('.wordmark')) return 'logo';
    if (el.closest('.site-nav')) return `nav:${el.getAttribute('href')}`;
    if (el.closest('.site-header .segmented')) return `lang:${el.getAttribute('lang')}`;
    if (el.matches('.filter-panel__toggle')) return 'filter-toggle';
    if (el.matches('select')) return `select:${el.id.split('-').pop()}`;
    if (el.matches('.filter-panel__reset')) return 'reset';
    if (el.matches('.segmented__option')) return `toggle:${el.closest('.panel')?.className.match(/dash-grid__(\w+)/)?.[1]}`;
    if (el.matches('.sort-button')) return `sort:${el.cellIndex ?? el.closest('th').cellIndex}`;
    if (el.closest('.pagination')) return `page:${el.closest('.pagination').querySelectorAll('button')[0] === el ? 'prev' : 'next'}`;
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`;
  });

async function tabs(page, n) {
  const seen = [];
  for (let i = 0; i < n; i++) {
    await page.keyboard.press('Tab');
    seen.push(await focused(page));
  }
  return seen;
}

async function open(browser, lang, width, path = '/') {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  await context.addInitScript((l) => localStorage.setItem('artkollen-lang', l), lang);
  const page = await context.newPage();
  await page.goto(base + path);
  await page.waitForSelector('.chart__plot');
  await page.waitForSelector('.data-table--records');
  return { context, page };
}

const browser = await chromium.launch();

for (const lang of ['sv', 'en']) {
  console.log(`\n— ${lang === 'sv' ? 'Swedish' : 'English'} —`);

  // 1. Tab order on desktop
  {
    const { context, page } = await open(browser, lang, 1440);
    const expected = [
      'skip:#results',
      'skip:#main',
      'logo',
      'nav:/',
      `nav:${lang === 'sv' ? '/om' : '/about'}`,
      `nav:${lang === 'sv' ? '/designsystem' : '/design-system'}`,
      'lang:sv',
      'lang:en',
      'select:species',
      'select:from',
      'select:to',
      'reset',
      'toggle:map',
    ];
    const seen = await tabs(page, expected.length);
    check('desktop: Tab order follows the visual order', seen.join() === expected.join(), `got ${seen.join(' → ')}`);

    // 2. Skip link
    await page.goto(base + '/');
    await page.waitForSelector('.chart__plot');
    const hiddenBefore = await page.locator('.skip-link').first().evaluate((e) => e.getBoundingClientRect().bottom <= 0);
    await page.keyboard.press('Tab');
    const visibleOnFocus = await page.locator('.skip-link').first().evaluate((e) => e.getBoundingClientRect().top >= 0);
    check('skip link: hidden until focused, then visible', hiddenBefore && visibleOnFocus);
    await page.keyboard.press('Enter');
    const target = await page.evaluate(() => document.activeElement.id);
    check('skip link: Enter moves focus to the results', target === 'results', `focus on #${target}`);
    await page.keyboard.press('Tab');
    check('skip link: next Tab lands on the first control in the results', (await focused(page)) === 'toggle:map');
    await context.close();
  }

  // 3. Sorting keeps focus on the activated column heading
  {
    const { context, page } = await open(browser, lang, 1440);
    const heading = page.locator('.sort-button').nth(2);
    await heading.focus();
    await page.keyboard.press('Enter');
    const afterEnter = await focused(page);
    const sortAfterEnter = await page.locator('.data-table--records th').nth(2).getAttribute('aria-sort');
    await page.keyboard.press(' ');
    const afterSpace = await focused(page);
    const sortAfterSpace = await page.locator('.data-table--records th').nth(2).getAttribute('aria-sort');
    check('sorting: Enter sorts and focus stays on the heading', afterEnter === 'sort:2' && sortAfterEnter === 'ascending', `focus ${afterEnter}, aria-sort ${sortAfterEnter}`);
    check('sorting: Space reverses and focus stays on the heading', afterSpace === 'sort:2' && sortAfterSpace === 'descending', `focus ${afterSpace}, aria-sort ${sortAfterSpace}`);
    await context.close();
  }

  // 4–5. Paging keeps focus; both ends keep focus on the button
  {
    // A species with few pages, so the last page is quick to reach.
    const { context, page } = await open(browser, lang, 1440, '/?art=spansk-skogssnigel');
    const status = () => page.locator('.pagination p').textContent();
    const prev = page.locator('.pagination button').nth(0);
    const next = page.locator('.pagination button').nth(1);

    await prev.focus();
    const startStatus = await status();
    await page.keyboard.press('Enter');
    check(
      'pagination: Previous on page 1 is aria-disabled, does nothing, keeps focus',
      (await prev.getAttribute('aria-disabled')) === 'true' && (await status()) === startStatus && (await focused(page)) === 'page:prev',
    );

    await next.focus();
    await page.keyboard.press('Enter');
    check('pagination: Next moves to page 2 and keeps focus', (await status()) !== startStatus && (await focused(page)) === 'page:next');

    let guard = 0;
    while ((await next.getAttribute('aria-disabled')) !== 'true' && guard++ < 200) await page.keyboard.press('Enter');
    const lastStatus = await status();
    await page.keyboard.press('Enter');
    check(
      'pagination: Next on the last page is aria-disabled, does nothing, keeps focus',
      (await next.getAttribute('aria-disabled')) === 'true' && (await status()) === lastStatus && (await focused(page)) === 'page:next',
    );
    await context.close();
  }

  // 6. Mobile filter panel by keyboard
  {
    const { context, page } = await open(browser, lang, 375);
    const toggle = page.locator('.filter-panel__toggle');
    const body = page.locator('#filter-body');
    // two skip links, logo, three menu links, two language buttons, then Filter
    const seen = await tabs(page, 9);
    check('mobile: the Filter button is in the Tab order after the language switch', seen.at(-1) === 'filter-toggle', `got ${seen.join(' → ')}`);
    check('mobile: panel starts closed', (await toggle.getAttribute('aria-expanded')) === 'false' && !(await body.isVisible()));

    await page.keyboard.press('Enter');
    check('mobile: Enter opens the panel (aria-expanded="true")', (await toggle.getAttribute('aria-expanded')) === 'true' && (await body.isVisible()));
    await page.keyboard.press('Tab');
    check('mobile: next Tab moves into the panel (species field)', (await focused(page)) === 'select:species');

    await page.keyboard.press('Escape');
    check(
      'mobile: Escape closes the panel and returns focus to the Filter button',
      (await toggle.getAttribute('aria-expanded')) === 'false' && !(await body.isVisible()) && (await focused(page)) === 'filter-toggle',
    );

    await page.keyboard.press(' ');
    const openedBySpace = (await toggle.getAttribute('aria-expanded')) === 'true';
    await page.keyboard.press(' ');
    check('mobile: Space opens and closes the panel from the button', openedBySpace && (await toggle.getAttribute('aria-expanded')) === 'false');
    await context.close();
  }
}

await browser.close();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
