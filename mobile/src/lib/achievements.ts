import type { Lang, StatsCtx } from './types';

export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AchievementDef {
  id: string;
  icon: string;
  tier: Tier;
  target: number;
  metric: (c: StatsCtx) => number;
  pl: { name: string; desc: string };
  en: { name: string; desc: string };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first1k', icon: '👟', tier: 'bronze', target: 1000, metric: (c) => c.totalSteps,
    pl: { name: 'Pierwszy tysiąc', desc: 'Przejdź łącznie 1 000 kroków.' },
    en: { name: 'First Thousand', desc: 'Walk 1,000 steps in total.' },
  },
  {
    id: 'first5k', icon: '🚶', tier: 'bronze', target: 5000, metric: (c) => c.totalSteps,
    pl: { name: 'Rozgrzewka', desc: 'Przejdź łącznie 5 000 kroków.' },
    en: { name: 'Warm Up', desc: 'Walk 5,000 steps in total.' },
  },
  {
    id: 'first10k', icon: '🏃', tier: 'silver', target: 10000, metric: (c) => c.totalSteps,
    pl: { name: 'Dziesiątka', desc: 'Przejdź łącznie 10 000 kroków.' },
    en: { name: 'Ten K', desc: 'Walk 10,000 steps in total.' },
  },
  {
    id: 'day5k', icon: '⚡', tier: 'bronze', target: 5000, metric: (c) => c.bestDay,
    pl: { name: 'Dzień dobry', desc: 'Zrób 5 000 kroków w jeden dzień.' },
    en: { name: 'Good Day', desc: 'Walk 5,000 steps in a single day.' },
  },
  {
    id: 'day10k', icon: '🎯', tier: 'silver', target: 10000, metric: (c) => c.bestDay,
    pl: { name: 'Dziesięć tysięcy', desc: 'Zrób 10 000 kroków w jeden dzień.' },
    en: { name: 'Ten Thousand', desc: 'Walk 10,000 steps in a single day.' },
  },
  {
    id: 'day15k', icon: '🚀', tier: 'gold', target: 15000, metric: (c) => c.bestDay,
    pl: { name: 'Ponad normę', desc: 'Zrób 15 000 kroków w jeden dzień.' },
    en: { name: 'Above the Norm', desc: 'Walk 15,000 steps in a single day.' },
  },
  {
    id: 'day20k', icon: '🌋', tier: 'platinum', target: 20000, metric: (c) => c.bestDay,
    pl: { name: 'Wulkan energii', desc: 'Zrób 20 000 kroków w jeden dzień.' },
    en: { name: 'Energy Volcano', desc: 'Walk 20,000 steps in a single day.' },
  },
  {
    id: 'streak3', icon: '🔥', tier: 'bronze', target: 3, metric: (c) => c.streak,
    pl: { name: 'Rozpęd', desc: 'Osiągnij cel 3 dni z rzędu.' },
    en: { name: 'Momentum', desc: 'Hit your goal 3 days in a row.' },
  },
  {
    id: 'streak7', icon: '🔥', tier: 'silver', target: 7, metric: (c) => c.streak,
    pl: { name: 'Tydzień mocy', desc: 'Osiągnij cel 7 dni z rzędu.' },
    en: { name: 'Power Week', desc: 'Hit your goal 7 days in a row.' },
  },
  {
    id: 'streak14', icon: '💪', tier: 'gold', target: 14, metric: (c) => c.streak,
    pl: { name: 'Dwa tygodnie', desc: 'Osiągnij cel 14 dni z rzędu.' },
    en: { name: 'Two Weeks', desc: 'Hit your goal 14 days in a row.' },
  },
  {
    id: 'streak30', icon: '👑', tier: 'platinum', target: 30, metric: (c) => c.streak,
    pl: { name: 'Miesiąc króla', desc: 'Osiągnij cel 30 dni z rzędu.' },
    en: { name: 'King Month', desc: 'Hit your goal 30 days in a row.' },
  },
  {
    id: 'total50k', icon: '🛣️', tier: 'bronze', target: 50000, metric: (c) => c.totalSteps,
    pl: { name: 'Pół setki', desc: 'Przejdź łącznie 50 000 kroków.' },
    en: { name: 'Half a Hundred', desc: 'Walk 50,000 steps in total.' },
  },
  {
    id: 'total100k', icon: '💯', tier: 'silver', target: 100000, metric: (c) => c.totalSteps,
    pl: { name: 'Sto tysięcy', desc: 'Przejdź łącznie 100 000 kroków.' },
    en: { name: 'One Hundred K', desc: 'Walk 100,000 steps in total.' },
  },
  {
    id: 'total500k', icon: '🏅', tier: 'gold', target: 500000, metric: (c) => c.totalSteps,
    pl: { name: 'Pół miliona', desc: 'Przejdź łącznie 500 000 kroków.' },
    en: { name: 'Half a Million', desc: 'Walk 500,000 steps in total.' },
  },
  {
    id: 'total1m', icon: '💎', tier: 'platinum', target: 1000000, metric: (c) => c.totalSteps,
    pl: { name: 'Milion kroków', desc: 'Przejdź łącznie 1 000 000 kroków.' },
    en: { name: 'One Million', desc: 'Walk 1,000,000 steps in total.' },
  },
  {
    id: 'km10', icon: '📍', tier: 'bronze', target: 10, metric: (c) => c.totalKm,
    pl: { name: 'Pierwsza dycha', desc: 'Przejdź łącznie 10 km.' },
    en: { name: 'First Ten', desc: 'Cover 10 km in total.' },
  },
  {
    id: 'km50', icon: '🗺️', tier: 'silver', target: 50, metric: (c) => c.totalKm,
    pl: { name: 'Pół setki km', desc: 'Przejdź łącznie 50 km.' },
    en: { name: 'Fifty Klicks', desc: 'Cover 50 km in total.' },
  },
  {
    id: 'km100', icon: '🏙️', tier: 'gold', target: 100, metric: (c) => c.totalKm,
    pl: { name: 'Sto kilometrów', desc: 'Przejdź łącznie 100 km.' },
    en: { name: 'Hundred Klicks', desc: 'Cover 100 km in total.' },
  },
  {
    id: 'km500', icon: '🌍', tier: 'platinum', target: 500, metric: (c) => c.totalKm,
    pl: { name: 'Pięćset km', desc: 'Przejdź łącznie 500 km.' },
    en: { name: 'Five Hundred', desc: 'Cover 500 km in total.' },
  },
  {
    id: 'goal1', icon: '✅', tier: 'bronze', target: 1, metric: (c) => c.goalHits,
    pl: { name: 'Cel osiągnięty', desc: 'Osiągnij dzienny cel pierwszy raz.' },
    en: { name: 'Goal Reached', desc: 'Hit your daily goal for the first time.' },
  },
  {
    id: 'goal7', icon: '📅', tier: 'silver', target: 7, metric: (c) => c.goalHits,
    pl: { name: 'Siedem celów', desc: 'Osiągnij dzienny cel 7 razy.' },
    en: { name: 'Seven Goals', desc: 'Hit your daily goal 7 times.' },
  },
  {
    id: 'goal30', icon: '🏆', tier: 'gold', target: 30, metric: (c) => c.goalHits,
    pl: { name: 'Trzydzieści celów', desc: 'Osiągnij dzienny cel 30 razy.' },
    en: { name: 'Thirty Goals', desc: 'Hit your daily goal 30 times.' },
  },
  {
    id: 'perfectWeek', icon: '🌟', tier: 'gold', target: 1, metric: (c) => (c.perfectWeek ? 1 : 0),
    pl: { name: 'Perfekcyjny tydzień', desc: 'Osiągnij cel przez 7 dni z rzędu.' },
    en: { name: 'Perfect Week', desc: 'Hit your goal for 7 days straight.' },
  },
  {
    id: 'earlyBird', icon: '🌅', tier: 'silver', target: 1, metric: (c) => (c.earlyBird ? 1 : 0),
    pl: { name: 'Ranny ptaszek', desc: 'Zapisz 1 000 kroków przed 8:00.' },
    en: { name: 'Early Bird', desc: 'Log 1,000 steps before 8 AM.' },
  },
  {
    id: 'nightOwl', icon: '🌙', tier: 'silver', target: 1, metric: (c) => (c.nightOwl ? 1 : 0),
    pl: { name: 'Nocny marek', desc: 'Zapisz 3 000 kroków po 22:00.' },
    en: { name: 'Night Owl', desc: 'Log 3,000 steps after 10 PM.' },
  },
  {
    id: 'week50k', icon: '📈', tier: 'silver', target: 50000, metric: (c) => c.weekSteps,
    pl: { name: 'Tydzień 50k', desc: 'Przejdź 50 000 kroków w 7 dni.' },
    en: { name: '50k Week', desc: 'Walk 50,000 steps in 7 days.' },
  },
  {
    id: 'week70k', icon: '📊', tier: 'gold', target: 70000, metric: (c) => c.weekSteps,
    pl: { name: 'Tydzień 70k', desc: 'Przejdź 70 000 kroków w 7 dni.' },
    en: { name: '70k Week', desc: 'Walk 70,000 steps in 7 days.' },
  },
  {
    id: 'bestWeek100k', icon: '🥇', tier: 'platinum', target: 100000, metric: (c) => c.bestWeek,
    pl: { name: 'Sto tysięcy w tydzień', desc: 'Przejdź 100 000 kroków w dowolnych 7 dniach.' },
    en: { name: 'Hundred K Week', desc: 'Walk 100,000 steps in any 7 days.' },
  },
];

export const TIER_STYLES: Record<Tier, { ring: string; bg: string; text: string }> = {
  bronze: { ring: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-300' },
  silver: { ring: 'border-slate-300/25', bg: 'bg-slate-300/10', text: 'text-slate-200' },
  gold: { ring: 'border-yellow-400/35', bg: 'bg-yellow-400/10', text: 'text-yellow-300' },
  platinum: { ring: 'border-cyan/40', bg: 'bg-cyan/10', text: 'text-cyan' },
};

export function achText(def: AchievementDef, lang: Lang) {
  return lang === 'pl' ? def.pl : def.en;
}
