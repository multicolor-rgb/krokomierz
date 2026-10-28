import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shot = await readFile(path.join(root, 'public/screens/home-pl.png'));
const logo = await readFile(path.join(root, 'public/logo.svg'), 'utf8');
const data = `data:image/png;base64,${shot.toString('base64')}`;
const logoData = `data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:1200px;height:630px;overflow:hidden;background:#08090B;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#fff;position:relative}
  .glow{position:absolute;border-radius:999px;filter:blur(110px)}
  .a{width:520px;height:520px;left:-140px;top:-180px;background:rgba(198,255,61,.20)}
  .b{width:420px;height:420px;right:-100px;top:80px;background:rgba(77,225,255,.13)}
  .wrap{position:relative;height:100%;padding:64px 70px;display:flex;align-items:center;justify-content:space-between;gap:30px}
  .left{width:610px}
  .brand{display:flex;align-items:center;gap:14px;font-size:22px;font-weight:800;letter-spacing:-.02em}
  .brand img{width:46px;height:46px;border-radius:14px}
  h1{font-size:78px;line-height:.95;letter-spacing:-.055em;font-weight:800;margin-top:34px}
  .grad{background:linear-gradient(135deg,#C6FF3D 0%,#7DF7A0 45%,#4DE1FF 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
  p{font-size:20px;line-height:1.5;color:#9AA1AE;margin-top:24px;max-width:540px;font-weight:500}
  .pills{display:flex;gap:10px;margin-top:30px}
  .pill{border:1px solid rgba(198,255,61,.25);background:rgba(198,255,61,.10);color:#C6FF3D;border-radius:999px;padding:9px 16px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
  .pill.dark{border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#9AA1AE}
  .phone{position:relative;width:300px;flex-shrink:0;transform:rotate(-4deg)}
  .phone img{width:100%;border-radius:42px;border:10px solid #14171c;box-shadow:0 50px 120px rgba(0,0,0,.7)}
  .badge{position:absolute;left:-120px;top:120px;background:rgba(17,19,24,.92);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:14px 18px;backdrop-filter:blur(12px);box-shadow:0 20px 60px rgba(0,0,0,.5)}
  .badge b{display:block;font-size:20px;color:#C6FF3D}
  .badge span{font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#9AA1AE}
</style></head><body>
  <div class="glow a"></div><div class="glow b"></div>
  <div class="wrap">
    <div class="left">
      <div class="brand"><img src="${logoData}">Krokomierz</div>
      <h1>Każdy krok<br><span class="grad">się liczy.</span></h1>
      <p>Nowoczesny krokomierz na Androida i w przeglądarce. Cele, statystyki, osiągnięcia i przypomnienia — bez konta i bez chmury.</p>
      <div class="pills">
        <div class="pill">Pobierz APK</div>
        <div class="pill dark">28 osiągnięć</div>
        <div class="pill dark">100% offline</div>
      </div>
    </div>
    <div class="phone">
      <img src="${data}">
      <div class="badge"><b>7 dni</b><span>Seria</span></div>
    </div>
  </div>
</body></html>`;

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(root, 'public/og.png') });
await browser.close();
console.log('OG image: landing/public/og.png');
