import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.resolve(root, '../landing/public/screens');
await mkdir(outDir, { recursive: true });

const screens = [
  { name: 'home', tab: 'home' },
  { name: 'tracker', tab: 'track' },
  { name: 'stats', tab: 'stats' },
  { name: 'badges', tab: 'badges' },
];

const langs = ['pl', 'en'];

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb'],
});

for (const lang of langs) {
  for (const screen of screens) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      locale: lang === 'pl' ? 'pl-PL' : 'en-US',
      colorScheme: 'dark',
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:4174/app/?demo=1&screen=${screen.tab}&lang=${lang}`, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.waitForTimeout(1400);
    const file = path.join(outDir, `${screen.name}-${lang}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log('saved', file);
    await context.close();
  }
}

await browser.close();
