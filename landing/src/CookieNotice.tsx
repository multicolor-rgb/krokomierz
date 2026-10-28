import { useEffect, useState } from 'react';
import { cookieNoticeCopy, type Lang } from './legalContent';

const KEY = 'krokomierz-cookie-notice';
const COOKIES_URL = `${import.meta.env.BASE_URL}cookies/`;

export function CookieNotice({ lang }: { lang: Lang }) {
  const [visible, setVisible] = useState(false);
  const copy = cookieNoticeCopy[lang];

  useEffect(() => {
    try {
      setVisible(!localStorage.getItem(KEY));
    } catch {
      setVisible(false);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      /* prywatny tryb przeglądania */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
      <div
        role="status"
        className="pointer-events-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-surface/95 p-4 shadow-phone backdrop-blur-2xl sm:flex sm:items-center sm:gap-4 sm:p-5"
      >
        <div className="flex items-start gap-3 sm:flex-1">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-lime/10 text-lg">🍪</span>
          <div>
            <p className="text-[12px] font-extrabold text-white">Cookies</p>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted">{copy.text}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 sm:mt-0 sm:shrink-0">
          <a
            href={COOKIES_URL}
            className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-center text-[10px] font-extrabold text-white/80 transition hover:bg-white/5 sm:flex-none"
          >
            {copy.more}
          </a>
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-xl bg-lime px-3 py-2 text-[10px] font-extrabold text-ink transition hover:brightness-105 sm:flex-none"
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
