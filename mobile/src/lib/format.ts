import type { Lang, Units } from './types';

const locale = (lang: Lang) => (lang === 'pl' ? 'pl-PL' : 'en-US');

export function formatNumber(n: number, lang: Lang): string {
  return new Intl.NumberFormat(locale(lang)).format(Math.round(n));
}

export function formatDecimal(n: number, lang: Lang, digits = 1): string {
  return new Intl.NumberFormat(locale(lang), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}

export function formatDistance(km: number, lang: Lang, units: Units): string {
  if (units === 'imperial') return `${formatDecimal(km * 0.621371, lang)} mi`;
  return `${formatDecimal(km, lang)} km`;
}

export function formatWeight(kg: number, lang: Lang, units: Units): string {
  if (units === 'imperial') return `${formatDecimal(kg * 2.20462, lang)} lb`;
  return `${formatDecimal(kg, lang)} kg`;
}

export function formatHeight(cm: number, lang: Lang, units: Units): string {
  if (units === 'imperial') {
    const totalIn = cm / 2.54;
    const ft = Math.floor(totalIn / 12);
    const inch = Math.round(totalIn % 12);
    return `${ft}′${inch}″`;
  }
  return `${Math.round(cm)} cm`;
}

export function formatCompact(n: number, lang: Lang): string {
  if (n >= 1000) return `${formatDecimal(n / 1000, lang, 1)}k`;
  return formatNumber(n, lang);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function to12h(time: string, lang: Lang): string {
  if (lang !== 'en') return time;
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
