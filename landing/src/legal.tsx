import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/manrope';
import './index.css';
import { CONTACT_EMAIL, legalDocs, type Block, type Lang } from './legalContent';

const BASE = import.meta.env.BASE_URL;
const HOME = BASE;
const PRIVACY = `${BASE}privacy/`;
const COOKIES = `${BASE}cookies/`;
const GITHUB = 'https://github.com/multicolor-rgb/krokomierz';

function readLang(): Lang {
  if (typeof localStorage === 'undefined') return 'pl';
  const stored = localStorage.getItem('krokomierz-lang');
  if (stored === 'pl' || stored === 'en') return stored;
  return typeof navigator !== 'undefined' && navigator.language.startsWith('pl') ? 'pl' : 'en';
}

function isCookiesPage() {
  return typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '').endsWith('/cookies');
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

function BlockView({ block }: { block: Block }) {
  if (block.type === 'p') {
    return <p className="mt-3 text-[13px] font-medium leading-relaxed text-muted sm:text-sm">{block.text}</p>;
  }
  if (block.type === 'ul') {
    return (
      <ul className="mt-3 space-y-2">
        {block.items.map((item) => (
          <li key={item} className="flex gap-2.5 text-[13px] font-medium leading-relaxed text-muted sm:text-sm">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === 'table') {
    return (
      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.06]">
        <table className="w-full min-w-[520px] border-collapse text-left text-[11px] sm:text-[12px]">
          <thead>
            <tr className="bg-white/[0.04]">
              {block.head.map((cell) => (
                <th key={cell} className="px-4 py-3 font-extrabold text-white/80">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.join('|')} className="border-t border-white/[0.06]">
                {row.map((cell, index) => (
                  <td key={`${cell}-${index}`} className={`px-4 py-3 align-top ${index === 0 ? 'font-extrabold text-white/80' : 'text-muted'}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {block.items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-lime/25 bg-lime/10 px-3 py-1.5 text-[10px] font-extrabold text-lime transition hover:bg-lime/15"
        >
          {item.label} ↗
        </a>
      ))}
    </div>
  );
}

export default function LegalPage() {
  const [lang, setLang] = useState<Lang>(readLang);
  const page = isCookiesPage() ? 'cookies' : 'privacy';
  const doc = legalDocs[lang][page];

  useEffect(() => {
    localStorage.setItem('krokomierz-lang', lang);
    document.documentElement.lang = lang;
    document.title = `${doc.title} — Krokomierz`;
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      lang === 'pl'
        ? 'Polityka prywatności i cookies Krokomierza. Dane aplikacji pozostają na urządzeniu, bez konta i serwera.'
        : 'Krokomierz privacy and cookie policy. App data stays on your device, with no account or server.',
    );
  }, [lang, doc.title]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-ink/80 backdrop-blur-2xl">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <a href={HOME} className="flex items-center gap-2.5">
            <img src={`${BASE}logo.svg`} alt="Krokomierz" className="h-9 w-9 rounded-xl" />
            <span className="text-[15px] font-extrabold tracking-tight">Krokomierz</span>
          </a>
          <div className="flex items-center gap-2">
            <a href={HOME} className="hidden rounded-xl px-3 py-2 text-[11px] font-extrabold text-muted transition hover:text-white sm:block">
              {lang === 'pl' ? 'Strona główna' : 'Home'}
            </a>
            <LangToggle lang={lang} onChange={setLang} />
          </div>
        </div>
      </header>

      <main className="container-page max-w-4xl py-12 sm:py-16">
        <div className="rounded-3xl border border-lime/20 bg-gradient-to-br from-lime/[0.10] via-surface/70 to-cyan/[0.04] p-6 sm:p-9">
          <p className="eyebrow">{doc.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-5xl">{doc.title}</h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{doc.updated}</p>
          <p className="mt-5 max-w-2xl text-[13px] font-medium leading-relaxed text-white/75 sm:text-sm">{doc.lead}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={PRIVACY} className={`chip ${page === 'privacy' ? 'chip-active' : ''}`}>
              {lang === 'pl' ? 'Prywatność' : 'Privacy'}
            </a>
            <a href={COOKIES} className={`chip ${page === 'cookies' ? 'chip-active' : ''}`}>
              {lang === 'pl' ? 'Cookies' : 'Cookies'}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="chip">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {doc.sections.map((section) => (
            <section key={section.title} className="glass p-5 sm:p-6">
              <h2 className="text-base font-extrabold tracking-tight sm:text-lg">{section.title}</h2>
              {section.blocks.map((block, index) => (
                <BlockView key={`${section.title}-${index}`} block={block} />
              ))}
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-white/[0.07] bg-surface/60 p-5 sm:p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">
            {lang === 'pl' ? 'Kontakt' : 'Contact'}
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-2 inline-block text-lg font-extrabold text-lime hover:underline">
            {CONTACT_EMAIL}
          </a>
          <p className="mt-2 text-[11px] font-medium text-muted">
            {lang === 'pl'
              ? 'W sprawach prywatności, cookies i danych osobowych odpowiadamy do 30 dni.'
              : 'We respond to privacy, cookie and personal data requests within 30 days.'}
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] font-medium leading-relaxed text-muted/60">
          {lang === 'pl'
            ? 'Dokument informacyjny. Nie stanowi indywidualnej porady prawnej.'
            : 'Informational document. Not individual legal advice.'}
        </p>
      </main>

      <footer className="border-t border-white/5 bg-black/20">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-7 text-[11px] font-bold text-muted sm:flex-row">
          <span>© 2026 Krokomierz · MIT</span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href={HOME} className="hover:text-lime">{lang === 'pl' ? 'Strona główna' : 'Home'}</a>
            <a href={PRIVACY} className="hover:text-lime">{lang === 'pl' ? 'Prywatność' : 'Privacy'}</a>
            <a href={COOKIES} className="hover:text-lime">Cookies</a>
            <a href={GITHUB} target="_blank" rel="noreferrer" className="hover:text-lime">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


ReactDOM.createRoot(document.getElementById('root')!).render(<LegalPage />);
