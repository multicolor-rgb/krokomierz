import { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../lib/i18n';
import {
  dayLabel,
  goalPercent,
  lastNDays,
  sum,
  todayKey,
  weekdayShort,
} from '../lib/calc';
import { formatDistance, formatNumber } from '../lib/format';
import { StepsBarChart } from '../components/Charts';
import { Icon } from '../components/icons';
import { ProgressBar, Segmented, StatTile } from '../components/ui';

type Mode = 'today' | 'week' | 'month';

export function Stats() {
  const t = useT();
  const settings = useAppStore((s) => s.settings);
  const days = useAppStore((s) => s.days);
  const goal = useAppStore((s) => s.goal);
  const lang = settings.lang;
  const [mode, setMode] = useState<Mode>('week');

  const all = useMemo(() => Object.values(days), [days]);
  const today = days[todayKey()];
  const range = mode === 'month' ? 30 : 7;
  const series = useMemo(() => lastNDays(all, range), [all, range]);
  const withData = series.filter((d) => d.steps > 0);
  const total = sum(series.map((d) => d.steps));
  const average = withData.length ? Math.round(total / withData.length) : 0;
  const best = series.reduce((m, d) => Math.max(m, d.steps), 0);
  const hits = withData.filter((d) => d.steps >= goal).length;
  const rate = withData.length ? Math.round((hits / withData.length) * 100) : 0;

  const chartData = series.map((d) => ({
    label: mode === 'month' ? String(new Date(d.date).getDate()) : weekdayShort(lang, new Date(d.date).getDay()),
    value: d.steps,
    isToday: d.date === todayKey(),
  }));

  const history = useMemo(() => lastNDays(all, 14).reverse(), [all]);

  return (
    <div className="safe-top safe-bottom space-y-4 px-5">
      <header>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">{t('statsSub')}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{t('statsTitle')}</h1>
      </header>

      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'today', label: t('todayTab') },
          { value: 'week', label: t('weekTab') },
          { value: 'month', label: t('monthTab') },
        ]}
      />

      {mode === 'today' ? (
        <section className="card relative overflow-hidden">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-lime/10 blur-3xl" />
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{t('todaySteps')}</p>
          <p className="mt-1 text-4xl font-extrabold tabular">{formatNumber(today?.steps ?? 0, lang)}</p>
          <div className="mt-3">
            <ProgressBar value={goalPercent(today?.steps ?? 0, goal)} />
            <div className="mt-1.5 flex justify-between text-[10px] font-bold text-muted">
              <span>{goalPercent(today?.steps ?? 0, goal)}%</span>
              <span>
                {formatNumber(goal, lang)} {t('steps')}
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <StatTile
              label={t('distance')}
              value={formatDistance(today?.distanceKm ?? 0, lang, settings.units)}
            />
            <StatTile label={t('calories')} value={formatNumber(today?.calories ?? 0, lang)} unit={t('kcal')} />
            <StatTile label={t('activeTime')} value={String(today?.activeMinutes ?? 0)} unit={t('min')} />
          </div>
        </section>
      ) : (
        <section className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
                {mode === 'week' ? t('last7') : t('last30')}
              </p>
              <p className="mt-1 text-3xl font-extrabold tabular">{formatNumber(total, lang)}</p>
              <p className="text-[11px] font-bold text-muted">{t('totalSteps')}</p>
            </div>
            <span className="rounded-full bg-lime/10 px-3 py-1.5 text-[10px] font-extrabold text-lime">
              {t('chartGoal')}: {formatNumber(goal, lang)}
            </span>
          </div>
          <div className="mt-5">
            <StepsBarChart data={chartData} goal={goal} lang={lang} height={mode === 'month' ? 130 : 150} showValues={mode === 'week'} />
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-2">
        <StatTile label={t('average')} value={formatNumber(average, lang)} unit={t('steps')} icon="chart" />
        <StatTile label={t('bestDay')} value={formatNumber(best, lang)} unit={t('steps')} icon="trophy" />
        <StatTile
          label={t('totalDistance')}
          value={formatDistance(sum(withData.map((d) => d.distanceKm)), lang, settings.units)}
          icon="walk"
        />
        <StatTile label={t('goalRate')} value={`${rate}%`} icon="target" />
      </section>

      {mode !== 'today' && (
        <section className="card">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
              {t('activeDays')}
            </p>
            <span className="text-xs font-extrabold text-lime">
              {withData.length}/{range}
            </span>
          </div>
          <div className="mt-3 flex gap-1">
            {series.map((d) => (
              <div
                key={d.date}
                className={`h-2 flex-1 rounded-full ${
                  d.steps >= goal ? 'bg-lime' : d.steps > 0 ? 'bg-lime/30' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <div className="flex items-center justify-between">
          <p className="section-title">{t('history')}</p>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">14 {t('days')}</span>
        </div>
        <div className="mt-3 divide-y divide-white/5">
          {history.map((log) => {
            const date = new Date(log.date);
            const label =
              log.date === todayKey()
                ? t('today')
                : log.date === lastNDays(all, 2)[0].date
                  ? t('yesterday')
                  : dayLabel(lang, log.date);
            const pct = goalPercent(log.steps, goal);
            return (
              <div key={log.date} className="flex items-center gap-3 py-2.5">
                <div className="w-14 shrink-0">
                  <p className="text-[11px] font-extrabold">{label}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted">
                    {weekdayShort(lang, date.getDay())}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-extrabold tabular">{formatNumber(log.steps, lang)}</p>
                    <p className="text-[10px] font-bold text-muted">
                      {formatDistance(log.distanceKm, lang, settings.units)}
                    </p>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${pct >= 100 ? 'bg-lime' : 'bg-lime/35'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                {pct >= 100 && <Icon name="check" size={14} className="shrink-0 text-lime" />}
              </div>
            );
          })}
          {history.every((d) => d.steps === 0) && (
            <p className="py-6 text-center text-xs font-medium text-muted">{t('noHistory')}</p>
          )}
        </div>
      </section>
    </div>
  );
}
