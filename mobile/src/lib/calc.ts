import { addDays, format, parseISO, startOfDay, subDays } from 'date-fns';
import type { DayLog, Profile, Settings, Source, StatsCtx } from './types';

export const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');
export const todayKey = () => dayKey(new Date());

export function baseSteps(age: number): number {
  if (age < 30) return 10000;
  if (age < 50) return 9000;
  if (age < 65) return 8000;
  return 7000;
}

export function bmi(p: Profile): number {
  const h = p.heightCm / 100;
  return p.weightKg / (h * h);
}

/** Rekomendowana liczba kroków na podstawie wieku, aktywności, BMI i celu. */
export function recommendedSteps(p: Profile): number {
  let steps = baseSteps(p.age);
  if (p.activity === 'low') steps -= 1000;
  if (p.activity === 'high') steps += 1500;

  const b = bmi(p);
  if (b >= 30) steps -= 1000;
  else if (b >= 25) steps -= 500;
  else if (b < 18.5) steps += 500;

  if (p.goal === 'lose') steps += 1500;
  if (p.goal === 'health') steps += 500;

  steps = Math.round(steps / 500) * 500;
  return Math.min(15000, Math.max(5000, steps));
}

/** Cel dzienny z uwzględnieniem ręcznego nadpisania i automatycznej progresji. */
export function effectiveGoal(profile: Profile | null, settings: Settings, days: DayLog[]): number {
  if (!profile) return 10000;
  if (settings.dailyGoalOverride) return settings.dailyGoalOverride;
  const base = recommendedSteps(profile);
  if (!settings.autoAdjust) return base;

  // Progresja: +5% za każde 7 kolejnych dni z celem >= 90%, maksymalnie +20%.
  const map = new Map(days.map((d) => [d.date, d]));
  let cursor = startOfDay(new Date());
  if ((map.get(todayKey())?.steps ?? 0) < base * 0.9) cursor = subDays(cursor, 1);
  let streak = 0;
  for (let i = 0; i < 28; i++) {
    const log = map.get(dayKey(cursor));
    if (!log || log.steps < base * 0.9) break;
    streak++;
    cursor = subDays(cursor, 1);
  }
  const bumps = Math.min(4, Math.floor(streak / 7));
  return Math.round((base * (1 + 0.05 * bumps)) / 100) * 100;
}

export function autoStrideCm(heightCm: number, sex: Profile['sex'] = 'other'): number {
  const factor = sex === 'female' ? 0.413 : 0.415;
  return +(heightCm * factor).toFixed(1);
}

export function effectiveStrideCm(profile: Profile | null): number {
  if (!profile) return autoStrideCm(175);
  return profile.strideCm && profile.strideCm > 0 ? profile.strideCm : autoStrideCm(profile.heightCm, profile.sex);
}

export function strideMeters(heightCm: number, strideCm?: number | null): number {
  return (strideCm && strideCm > 0 ? strideCm : heightCm * 0.415) / 100;
}

export function buildLog(date: string, steps: number, profile: Profile | null, source: Source): DayLog {
  const s = Math.max(0, Math.round(steps));
  const h = profile?.heightCm ?? 175;
  const w = profile?.weightKg ?? 75;
  return {
    date,
    steps: s,
    distanceKm: +(s * strideMeters(h, profile?.strideCm ?? autoStrideCm(h, profile?.sex)) / 1000).toFixed(2),
    calories: Math.round(s * w * 0.0005),
    activeMinutes: Math.round(s / 100),
    source,
    updatedAt: Date.now(),
  };
}

export function emptyDay(date: string): DayLog {
  return { date, steps: 0, distanceKm: 0, calories: 0, activeMinutes: 0, source: 'manual', updatedAt: 0 };
}

export function lastNDays(days: DayLog[], n: number): DayLog[] {
  const map = new Map(days.map((d) => [d.date, d]));
  const out: DayLog[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = dayKey(subDays(new Date(), i));
    out.push(map.get(key) ?? emptyDay(key));
  }
  return out;
}

export function calcStreak(days: DayLog[], goal: number): number {
  const map = new Map(days.map((d) => [d.date, d]));
  let streak = 0;
  let cursor = startOfDay(new Date());
  // Dziś jeszcze się nie skończył — jeśli cel nie jest osiągnięty, liczymy od wczoraj.
  if ((map.get(dayKey(cursor))?.steps ?? 0) < goal) cursor = subDays(cursor, 1);
  for (let i = 0; i < 400; i++) {
    const log = map.get(dayKey(cursor));
    if (!log || log.steps < goal) break;
    streak++;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

export function computeStats(days: DayLog[], goal: number): StatsCtx {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const withSteps = sorted.filter((d) => d.steps > 0);
  const last7 = lastNDays(days, 7);
  const last7Steps = sum(last7.map((d) => d.steps));

  let bestWeek = 0;
  for (let i = 6; i < sorted.length; i++) {
    const chunk = sorted.slice(i - 6, i + 1);
    if (chunk.length === 7) bestWeek = Math.max(bestWeek, sum(chunk.map((d) => d.steps)));
  }

  const perfectWeek =
    last7.filter((d) => d.steps >= goal).length === 7 ||
    (sorted.length >= 7 &&
      sorted.some((_, idx) => {
        if (idx < 6) return false;
        return sorted.slice(idx - 6, idx + 1).every((d) => d.steps >= goal);
      }));

  const earlyBird = withSteps.some((d) => {
    const h = new Date(d.updatedAt).getHours();
    return h < 8 && d.steps >= 1000;
  });
  const nightOwl = withSteps.some((d) => {
    const h = new Date(d.updatedAt).getHours();
    return h >= 22 && d.steps >= 3000;
  });

  return {
    totalSteps: sum(withSteps.map((d) => d.steps)),
    bestDay: withSteps.reduce((m, d) => Math.max(m, d.steps), 0),
    days: withSteps.length,
    streak: calcStreak(days, goal),
    goalHits: withSteps.filter((d) => d.steps >= goal).length,
    perfectWeek,
    totalKm: +sum(withSteps.map((d) => d.distanceKm)).toFixed(1),
    weekSteps: last7Steps,
    earlyBird,
    nightOwl,
    bestWeek,
  };
}

export function goalPercent(steps: number, goal: number): number {
  return Math.min(100, Math.round((steps / Math.max(1, goal)) * 100));
}

export function weekdayShort(lang: 'pl' | 'en', index: number): string {
  const pl = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];
  const en = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  return (lang === 'pl' ? pl : en)[index] ?? '';
}

export function weekdayLong(lang: 'pl' | 'en', index: number): string {
  const pl = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const en = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return (lang === 'pl' ? pl : en)[index] ?? '';
}

export function monthShort(lang: 'pl' | 'en', date: Date): string {
  const pl = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
  const en = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return (lang === 'pl' ? pl : en)[date.getMonth()];
}

export function dayLabel(lang: 'pl' | 'en', key: string): string {
  const date = parseISO(key);
  return `${date.getDate()} ${monthShort(lang, date)}`;
}

export function todayLabel(lang: 'pl' | 'en'): string {
  const d = new Date();
  const pl = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const en = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthsPl = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  if (lang === 'pl') return `${pl[d.getDay()]}, ${d.getDate()} ${monthsPl[d.getMonth()]}`;
  return `${en[d.getDay()]}, ${monthsEn[d.getMonth()]} ${d.getDate()}`;
}

export function greetingKey(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

export function generateDemoDays(profile: Profile, goal: number, count = 45): DayLog[] {
  const out: DayLog[] = [];
  const sources: Source[] = ['sensor', 'native', 'manual'];
  for (let i = count - 1; i >= 0; i--) {
    const date = dayKey(subDays(new Date(), i));
    const wobble = Math.sin(i * 0.9) * 0.22 + Math.cos(i * 0.37) * 0.12;
    const weekendBoost = [0, 6].includes(parseISO(date).getDay()) ? 0.16 : 0;
    const ratio = 0.55 + ((count - i) / count) * 0.5 + wobble + weekendBoost;
    const steps = i === 0 ? Math.round(goal * 0.72) : Math.max(1200, Math.round(goal * ratio));
    const log = buildLog(date, steps, profile, sources[i % sources.length]);
    if (i === 3) log.updatedAt = new Date(new Date().setHours(6, 40, 0, 0)).getTime();
    if (i === 5) log.updatedAt = new Date(new Date().setHours(22, 20, 0, 0)).getTime();
    out.push(log);
  }
  return out;
}
