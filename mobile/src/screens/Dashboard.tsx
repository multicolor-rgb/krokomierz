import { useAppStore } from '../store/useAppStore';
import { useT } from '../lib/i18n';
import type { I18nKey } from '../lib/i18n';
import {
  calcStreak,
  goalPercent,
  greetingKey,
  lastNDays,
  sum,
  todayKey,
  todayLabel,
  weekdayShort,
} from '../lib/calc';
import { formatDistance, formatNumber } from '../lib/format';
import { ACHIEVEMENTS, achText } from '../lib/achievements';
import { RingProgress } from '../components/RingProgress';
import { ActivityBars } from '../components/Charts';
import { Icon } from '../components/icons';
import { LogoMark } from '../components/ToastHost';
import { StatTile } from '../components/ui';

export function Dashboard() {
  const t = useT();
  const profile = useAppStore((s) => s.profile)!;
  const settings = useAppStore((s) => s.settings);
  const days = useAppStore((s) => s.days);
  const goal = useAppStore((s) => s.goal);
  const achievements = useAppStore((s) => s.achievements);
  const demo = useAppStore((s) => s.demo);
  const setTab = useAppStore((s) => s.setTab);

  const lang = settings.lang;
  const today = days[todayKey()];
  const steps = today?.steps ?? 0;
  const percent = goalPercent(steps, goal);
  const remaining = Math.max(0, goal - steps);
  const streak = calcStreak(Object.values(days), goal);
  const week = lastNDays(Object.values(days), 7);
  const weekSteps = sum(week.map((d) => d.steps));
  const weekGoal = goal * 7;

  const latest = Object.values(achievements).sort((a, b) => b.unlockedAt - a.unlockedAt)[0];
  const latestDef = latest ? ACHIEVEMENTS.find((a) => a.id === latest.id) : undefined;
  const greeting =
    greetingKey() === 'morning'
      ? t('greetingMorning')
      : greetingKey() === 'afternoon'
        ? t('greetingAfternoon')
        : t('greetingEvening');
  const tip = t(`tip${(new Date().getDate() % 6) + 1}` as I18nKey);

  return (
    <div className="safe-top safe-bottom space-y-4 px-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">{greeting}</p>
          <h1 className="mt-0.5 text-[1.45rem] font-extrabold leading-tight tracking-tight">
            {todayLabel(lang)}
          </h1>
          {demo && (
            <span className="mt-2 inline-flex rounded-full bg-cyan/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-cyan">
              {t('demoNotice')}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setTab('settings')}
          aria-label={t('settingsTitle')}
          className="active:scale-95"
        >
          <LogoMark size={44} />
        </button>
      </header>

      <section className="flex flex-col items-center pt-1">
        <RingProgress value={steps} goal={goal} size={258} stroke={15}>
          <div className="text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted">{t('today')}</p>
            <p className="mt-1 text-[3.15rem] font-extrabold leading-none tracking-tight tabular">
              {formatNumber(steps, lang)}
            </p>
            <p className="mt-1.5 text-[11px] font-bold text-muted">
              {t('stepsOfGoal', { steps: '', goal: formatNumber(goal, lang) }).replace(' z ', ' / ').replace(' of ', ' / ')}
            </p>
            <span
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                percent >= 100 ? 'bg-lime/15 text-lime' : 'bg-white/5 text-muted'
              }`}
            >
              {percent}% {t('goalShort')}
            </span>
          </div>
        </RingProgress>

        <p className="mt-2 text-center text-xs font-bold text-muted">
          {remaining > 0 ? t('toGo', { n: formatNumber(remaining, lang) }) : `🎉 ${t('goalDone')}`}
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <StatTile
          label={t('distance')}
          value={formatDistance(today?.distanceKm ?? 0, lang, settings.units)}
          icon="walk"
        />
        <StatTile label={t('calories')} value={formatNumber(today?.calories ?? 0, lang)} unit={t('kcal')} icon="bolt" />
        <StatTile label={t('activeTime')} value={String(today?.activeMinutes ?? 0)} unit={t('min')} icon="clock" />
      </section>

      <section className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
              {t('weekProgress')}
            </p>
            <p className="mt-1 text-lg font-extrabold tabular">
              {formatNumber(weekSteps, lang)}{' '}
              <span className="text-xs font-bold text-muted">/ {formatNumber(weekGoal, lang)}</span>
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-orange-400/10 px-2.5 py-1.5 text-xs font-extrabold text-orange-300">
            <Icon name="flame" size={15} />
            {streak} {t('days')}
          </span>
        </div>
        <div className="mt-4">
          <ActivityBars data={week.map((d) => d.steps)} height={52} />
          <div className="mt-2 flex gap-1">
            {week.map((d) => {
              const idx = new Date(d.date).getDay();
              return (
                <span
                  key={d.date}
                  className={`flex-1 text-center text-[9px] font-bold ${
                    d.date === todayKey() ? 'text-lime' : 'text-muted/70'
                  }`}
                >
                  {weekdayShort(lang, idx)}
                </span>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTab('stats')}
          className="mt-3 flex w-full items-center justify-between text-[11px] font-extrabold text-lime"
        >
          {t('navStats')}
          <Icon name="right" size={15} />
        </button>
      </section>

      <button
        type="button"
        onClick={() => setTab('track')}
        className="relative w-full overflow-hidden rounded-3xl bg-lime-gradient p-5 text-left text-ink shadow-glow active:scale-[0.99]"
      >
        <span className="absolute -right-4 -top-6 h-28 w-28 rounded-full bg-ink/10" />
        <span className="absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-ink/[0.06]" />
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink/60">
          {t('liveSession')}
        </p>
        <p className="mt-1 text-xl font-extrabold tracking-tight">
          {settings.tracking && settings.onboarded ? t('keepTracking') : t('startTracking')}
        </p>
        <p className="mt-0.5 text-xs font-bold text-ink/60">
          {formatNumber(steps, lang)} {t('steps')} · {t('today')}
        </p>
        <span className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-ink text-lime">
          <Icon name="footsteps" size={23} />
        </span>
      </button>

      <section className="card">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
            {t('goalsCard')}
          </p>
          <button type="button" onClick={() => setTab('goals')} className="text-muted">
            <Icon name="right" size={16} />
          </button>
        </div>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-extrabold tabular">{formatNumber(goal, lang)}</p>
            <p className="text-[11px] font-bold text-muted">{t('dailyTarget')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-extrabold text-lime">
              {formatNumber(goal * 7, lang)}
            </p>
            <p className="text-[11px] font-bold text-muted">{t('weeklyTarget')}</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-lime-gradient"
            style={{ width: `${Math.min(100, (weekSteps / Math.max(1, weekGoal)) * 100)}%` }}
          />
        </div>
        <button
          type="button"
          onClick={() => setTab('goals')}
          className="mt-3 flex w-full items-center justify-between text-[11px] font-extrabold text-lime"
        >
          {t('viewGoals')}
          <Icon name="arrow" size={15} />
        </button>
      </section>

      <section className="card">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
          {t('latestBadge')}
        </p>
        {latestDef ? (
          <button
            type="button"
            onClick={() => setTab('badges')}
            className="mt-3 flex w-full items-center gap-3 text-left"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lime/10 text-2xl">
              {latestDef.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-extrabold">{achText(latestDef, lang).name}</span>
              <span className="mt-0.5 block truncate text-[11px] font-medium text-muted">
                {achText(latestDef, lang).desc}
              </span>
            </span>
            <Icon name="right" size={16} className="text-muted" />
          </button>
        ) : (
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-2xl">🏁</span>
            <p className="text-[11px] font-medium text-muted">{t('noBadges')}</p>
          </div>
        )}
      </section>

      <section className="card border-cyan/15 bg-cyan/[0.04]">
        <div className="flex items-center gap-2 text-cyan">
          <Icon name="sparkles" size={16} />
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]">{t('tipTitle')}</p>
        </div>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-white/85">{tip}</p>
      </section>
    </div>
  );
}
