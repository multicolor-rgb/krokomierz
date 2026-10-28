import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { CookieNotice } from './CookieNotice';
import { CONTACT_EMAIL } from './legalContent';
import {
  APK_DATE,
  APK_FILE,
  APK_SIZE,
  APK_VERSION,
  APP_URL,
  PWA_URL,
  SHA256,
  copy,
  type Lang,
} from './i18n';

const GITHUB = 'https://github.com/multicolor-rgb/krokomierz';
const RELEASES = 'https://github.com/multicolor-rgb/krokomierz/releases';

function DownloadIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 19h16" />
    </svg>
  );
}

function ArrowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

function ShieldIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.2c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.19 1.78 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function PhoneFrame({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative rounded-[2.6rem] border border-white/15 bg-[#0d0f12] p-2 shadow-phone ${className}`}>
      <div className="absolute left-1/2 top-3.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
      <img src={src} alt={alt} loading="lazy" className="w-full rounded-[2.15rem]" />
    </div>
  );
}

function MiniRing({ value }: { value: number }) {
  return (
    <div
      className="grid h-12 w-12 place-items-center rounded-full"
      style={{ background: `conic-gradient(#C6FF3D ${value * 3.6}deg, rgba(255,255,255,0.1) 0)` }}
    >
      <div className="grid h-9 w-9 place-items-center rounded-full bg-surface text-[10px] font-extrabold text-lime">
        {value}%
      </div>
    </div>
  );
}

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  return (
    <div className="flex rounded-xl border border-white/10 bg-white/[0.04] p-0.5">
      {(['pl', 'en'] as Lang[]).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold uppercase transition ${
            lang === value ? 'bg-lime text-ink' : 'text-muted hover:text-white'
          }`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('krokomierz-lang') : null;
  const [lang, setLang] = useState<Lang>(
    stored === 'en' || stored === 'pl' ? stored : typeof navigator !== 'undefined' && navigator.language.startsWith('pl') ? 'pl' : 'en',
  );
  const t = copy[lang];
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    localStorage.setItem('krokomierz-lang', lang);
    document.documentElement.lang = lang;
    document.title = t.metaTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.metaDesc);
  }, [lang, t]);

  useEffect(() => {
    if (!qrRef.current) return;
    void QRCode.toCanvas(qrRef.current, APK_FILE, {
      width: 168,
      margin: 1,
      color: { dark: '#08090B', light: '#C6FF3D' },
      errorCorrectionLevel: 'M',
    });
  }, [lang]);

  const screens: { key: 'home' | 'tracker' | 'stats' | 'badges'; label: string }[] = [
    { key: 'home', label: t.screens.tabs.home },
    { key: 'tracker', label: t.screens.tabs.tracker },
    { key: 'stats', label: t.screens.tabs.stats },
    { key: 'badges', label: t.screens.tabs.badges },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-ink/75 backdrop-blur-2xl">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <a href="#" className="flex items-center gap-2.5">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Krokomierz" className="h-9 w-9 rounded-xl" />
            <span className="text-[15px] font-extrabold tracking-tight">Krokomierz</span>
          </a>
          <nav className="hidden items-center gap-7 text-[13px] font-bold text-muted md:flex">
            <a href="#features" className="transition hover:text-white">{t.nav.features}</a>
            <a href="#how" className="transition hover:text-white">{t.nav.how}</a>
            <a href="#screens" className="transition hover:text-white">{t.nav.screens}</a>
            <a href="#faq" className="transition hover:text-white">{t.nav.faq}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LangToggle lang={lang} onChange={setLang} />
            <a href="#download" className="btn-primary hidden !rounded-xl !px-4 !py-2.5 !text-[12px] sm:inline-flex">
              <DownloadIcon size={15} />
              {t.hero.cta}
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden pb-16 pt-14 sm:pt-20 lg:pb-24">
          <div className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-lime/10 blur-[120px]" />
          <div className="pointer-events-none absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-cyan/10 blur-[120px]" />
          <div className="container-page relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-lime/25 bg-lime/10 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-lime">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
                  {t.hero.badge}
                </span>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 className="mt-5 text-[3.3rem] font-extrabold leading-[0.92] tracking-[-0.05em] sm:text-6xl lg:text-[4.6rem]">
                  {t.hero.titleA}
                  <br />
                  <span className="text-gradient">{t.hero.titleB}</span>
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-xl text-[15px] font-medium leading-relaxed text-muted sm:text-base">
                  {t.hero.sub}
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a href={APK_FILE} download className="btn-primary">
                    <DownloadIcon />
                    {t.hero.cta}
                  </a>
                  <a href={PWA_URL} className="btn-ghost">
                    {t.hero.ctaSub}
                    <ArrowIcon size={16} />
                  </a>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-muted">
                  <span>{t.hero.meta}</span>
                  <span className="flex items-center gap-1.5 text-lime">
                    <CheckIcon size={13} />
                    {t.hero.free}
                  </span>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.15} className="relative">
              <div className="relative mx-auto w-[292px] sm:w-[330px]">
                <div className="absolute -inset-10 rounded-full bg-lime/10 blur-3xl" />
                <div className="relative animate-float">
                  <PhoneFrame src={`${import.meta.env.BASE_URL}screens/home-${lang}.png`} alt="Krokomierz — pulpit" />
                </div>

                <div className="glass absolute -left-24 top-24 hidden w-[178px] items-center gap-3 p-3.5 shadow-phone sm:flex">
                  <MiniRing value={72} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{t.float.steps}</p>
                    <p className="text-lg font-extrabold leading-tight tabular">6 840</p>
                    <p className="text-[10px] font-bold text-lime">72% {t.float.goal}</p>
                  </div>
                </div>

                <div className="glass absolute -right-16 bottom-40 hidden w-[190px] gap-3 p-3.5 shadow-phone sm:flex">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-lime/15 text-xl">🔥</span>
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-lime">{t.float.badge}</p>
                    <p className="text-[13px] font-extrabold leading-tight">{t.float.badgeName}</p>
                    <p className="text-[10px] font-bold text-muted">7 {t.float.streak}</p>
                  </div>
                </div>

                <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-surface/90 px-4 py-2 backdrop-blur-xl">
                  <span className="flex -space-x-1">
                    {[1, 2, 3].map((i) => (
                      <span key={i} className="h-5 w-5 rounded-full border-2 border-surface bg-lime-gradient" />
                    ))}
                  </span>
                  <span className="text-[10px] font-extrabold text-muted">28 · 7 · 100k+</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-white/5 bg-white/[0.015]">
          <div className="container-page grid grid-cols-2 divide-x divide-white/5 py-7 sm:grid-cols-4">
            {t.trust.map((item, index) => (
              <Reveal key={item.label} delay={index * 0.05} className="px-3 py-2 text-center sm:px-6">
                <p className="text-2xl font-extrabold tracking-tight text-gradient sm:text-3xl">{item.value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{item.label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="features" className="container-page py-20 sm:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">{t.nav.features}</p>
            <h2 className="h2 mt-3">{t.features.title}</h2>
            <p className="muted mx-auto mt-4 max-w-lg">{t.features.sub}</p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.items.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.05}>
                <article className="glass card-hover h-full p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-lime/20 bg-lime/10 text-2xl">
                    {item.icon}
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-[13px] font-medium leading-relaxed text-muted">{item.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="screens" className="relative overflow-hidden border-y border-white/5 bg-white/[0.015] py-20 sm:py-28">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[700px] -translate-x-1/2 rounded-full bg-lime/10 blur-[120px]" />
          <div className="container-page relative">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">{t.nav.screens}</p>
              <h2 className="h2 mt-3">{t.screens.title}</h2>
              <p className="muted mx-auto mt-4 max-w-lg">{t.screens.sub}</p>
            </Reveal>

            <div className="mt-12 grid grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
              {screens.map((screen, index) => (
                <Reveal key={screen.key} delay={index * 0.06} className="text-center">
                  <div className="group relative mx-auto w-full max-w-[230px] transition duration-500 hover:-translate-y-2">
                    <PhoneFrame
                      src={`${import.meta.env.BASE_URL}screens/${screen.key}-${lang}.png`}
                      alt={`Krokomierz — ${screen.label}`}
                      className="!rounded-[2.2rem] !p-1.5"
                    />
                  </div>
                  <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">{screen.label}</p>
                </Reveal>
              ))}
            </div>
            <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-muted/60">
              {t.screens.note}
            </p>
          </div>
        </section>

        <section id="how" className="container-page py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <p className="eyebrow">{t.nav.how}</p>
              <h2 className="h2 mt-3">{t.how.title}</h2>
              <p className="muted mt-4 max-w-md">{t.how.sub}</p>
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-lime/20 bg-lime/[0.06] p-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-ink">
                  <DownloadIcon size={18} />
                </span>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-lime">{t.download.requirements}</p>
                  <p className="text-[12px] font-bold text-white/80">{APK_SIZE} · v{APK_VERSION}</p>
                </div>
              </div>
            </Reveal>

            <div className="space-y-3">
              {t.how.steps.map((step, index) => (
                <Reveal key={step.n} delay={index * 0.07}>
                  <div className="glass card-hover flex gap-5 p-5 sm:p-6">
                    <span className="text-2xl font-extrabold text-gradient">{step.n}</span>
                    <div>
                      <h3 className="text-base font-extrabold">{step.title}</h3>
                      <p className="mt-1 text-[13px] font-medium leading-relaxed text-muted">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-white/5 bg-white/[0.015] py-20 sm:py-24">
          <div className="container-page">
            <Reveal className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">{t.badges.title}</p>
                <h2 className="h2 mt-3">{t.badges.sub}</h2>
              </div>
              <a href={PWA_URL} className="btn-ghost !py-3">
                {t.badges.cta}
                <ArrowIcon size={16} />
              </a>
            </Reveal>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {t.badges.names.map((name, index) => (
                <Reveal key={name} delay={index * 0.04}>
                  <div className="glass flex h-full items-center gap-3 p-4">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl ${index % 4 === 0 ? 'bg-yellow-400/10' : index % 3 === 0 ? 'bg-cyan/10' : 'bg-lime/10'}`}>
                      {['👟', '🏃', '🔥', '🔥', '🌟', '💎', '🌍', '🌙'][index]}
                    </span>
                    <span className="text-[12px] font-extrabold leading-tight">{name}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page py-20 sm:py-28">
          <Reveal>
            <div className="glass relative overflow-hidden p-7 sm:p-10">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime/10 blur-3xl" />
              <div className="relative grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                <div>
                  <span className="grid h-14 w-14 place-items-center rounded-3xl border border-lime/25 bg-lime/10 text-lime">
                    <ShieldIcon size={26} />
                  </span>
                  <h2 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">{t.privacy.title}</h2>
                  <p className="muted mt-3 max-w-lg">{t.privacy.text}</p>
                </div>
                <ul className="space-y-3">
                  {t.privacy.points.map((point) => (
                    <li key={point} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lime/15 text-lime">
                        <CheckIcon size={14} />
                      </span>
                      <span className="text-[13px] font-bold text-white/85">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="download" className="container-page pb-20 sm:pb-28">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-lime/20 bg-gradient-to-br from-lime/[0.12] via-surface/80 to-cyan/[0.06] p-7 sm:p-10">
              <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-lime/15 blur-[100px]" />
              <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <p className="eyebrow">{t.hero.badge}</p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{t.download.title}</h2>
                  <p className="muted mt-3 max-w-md">{t.download.sub}</p>

                  <div className="mt-7 grid grid-cols-3 gap-2">
                    {[
                      { label: t.download.version, value: `v${APK_VERSION}` },
                      { label: t.download.size, value: APK_SIZE },
                      { label: t.download.updated, value: APK_DATE },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/[0.06] bg-black/20 px-3 py-3">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted">{item.label}</p>
                        <p className="mt-1 text-[13px] font-extrabold">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <a href={APK_FILE} download className="btn-primary">
                      <DownloadIcon />
                      {t.download.apk}
                    </a>
                    <a href={PWA_URL} className="btn-ghost">
                      {t.download.pwa}
                      <ArrowIcon size={16} />
                    </a>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-muted">
                    <span className="rounded-full bg-white/5 px-2.5 py-1">{t.download.requirements}</span>
                    <a href={SHA256} className="underline decoration-white/20 underline-offset-4 hover:text-white">
                      {t.download.sha}
                    </a>
                    <a href={RELEASES} target="_blank" rel="noreferrer" className="hover:text-white">
                      {t.download.release}
                    </a>
                  </div>

                  <div className="mt-7">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{t.download.installTitle}</p>
                    <ol className="mt-3 space-y-2">
                      {t.download.install.map((step, index) => (
                        <li key={step} className="flex items-start gap-2.5 text-[12px] font-medium text-white/75">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime/15 text-[10px] font-extrabold text-lime">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="rounded-[2rem] border border-lime/25 bg-lime p-4 shadow-glow">
                    <canvas ref={qrRef} className="h-[168px] w-[168px] rounded-xl" />
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-lime">{t.download.qr}</p>
                  <p className="max-w-[220px] text-center text-[11px] font-medium leading-relaxed text-muted">
                    {t.download.pwaNote}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="faq" className="container-page pb-20 sm:pb-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <p className="eyebrow">FAQ</p>
              <h2 className="h2 mt-3">{t.faq.title}</h2>
              <p className="muted mt-4 max-w-sm">
                {lang === 'pl'
                  ? 'Nie znalazłeś odpowiedzi? Napisz do nas na GitHubie.'
                  : 'Didn’t find an answer? Reach out on GitHub.'}
              </p>
              <a href={GITHUB} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-[12px] font-extrabold text-lime">
                <GithubIcon size={16} />
                github.com/multicolor-rgb/krokomierz
              </a>
            </Reveal>
            <div className="space-y-2.5">
              {t.faq.items.map((item, index) => (
                <Reveal key={item.q} delay={index * 0.04}>
                  <details className="group rounded-2xl border border-white/[0.07] bg-surface/60 px-5 py-4 backdrop-blur-xl">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[13px] font-extrabold">
                      {item.q}
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 text-muted transition group-open:rotate-45 group-open:bg-lime group-open:text-ink">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-3 text-[12px] font-medium leading-relaxed text-muted">{item.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black/20">
        <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="h-9 w-9 rounded-xl" />
              <span className="text-sm font-extrabold">Krokomierz</span>
            </div>
            <p className="muted mt-4 max-w-xs text-[12px]">{t.footer.tagline}</p>
            <p className="mt-4 text-[10px] font-bold text-muted/60">{t.footer.note}</p>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">{t.footer.product}</p>
            <ul className="mt-3 space-y-2 text-[12px] font-bold text-white/75">
              <li><a href={APK_FILE} download className="hover:text-lime">{t.footer.download}</a></li>
              <li><a href={PWA_URL} className="hover:text-lime">{t.footer.pwa}</a></li>
              <li><a href="#features" className="hover:text-lime">{t.nav.features}</a></li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">{t.footer.resources}</p>
            <ul className="mt-3 space-y-2 text-[12px] font-bold text-white/75">
              <li><a href={RELEASES} target="_blank" rel="noreferrer" className="hover:text-lime">{t.footer.github}</a></li>
              <li><a href={SHA256} className="hover:text-lime">SHA-256</a></li>
              <li><a href="#faq" className="hover:text-lime">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">{t.footer.legal}</p>
            <ul className="mt-3 space-y-2 text-[12px] font-bold text-white/75">
              <li><a href={`${import.meta.env.BASE_URL}privacy/`} className="hover:text-lime">{t.footer.privacy}</a></li>
              <li><a href={`${import.meta.env.BASE_URL}cookies/`} className="hover:text-lime">{t.footer.cookies}</a></li>
              <li><a href={GITHUB} target="_blank" rel="noreferrer" className="hover:text-lime">{t.footer.license}</a></li>
              <li><a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-lime">{CONTACT_EMAIL}</a></li>
            </ul>
          </div>
        </div>
        <div className="container-page flex flex-col items-center justify-between gap-3 border-t border-white/5 py-5 text-[10px] font-bold text-muted/60 sm:flex-row">
          <span>© 2026 Krokomierz · MIT</span>
          <span className="flex items-center gap-1.5">
            <GithubIcon size={13} />
            multicolor-rgb
          </span>
        </div>
      </footer>
      <CookieNotice lang={lang} />
    </div>
  );
}
