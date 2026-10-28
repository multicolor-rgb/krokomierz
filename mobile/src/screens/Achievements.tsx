import { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../lib/i18n';
import type { I18nKey } from '../lib/i18n';
import { computeStats } from '../lib/calc';
import { formatNumber } from '../lib/format';
import { ACHIEVEMENTS, TIER_STYLES, achText, type AchievementDef, type Tier } from '../lib/achievements';
import { Icon } from '../components/icons';
import { ProgressBar, Sheet } from '../components/ui';

function tierKey(tier: Tier): I18nKey {
  return `tier${tier.charAt(0).toUpperCase()}${tier.slice(1)}` as I18nKey;
}

export function Achievements() {
  const t = useT();
  const lang = useAppStore((s) => s.settings.lang);
  const days = useAppStore((s) => s.days);
  const goal = useAppStore((s) => s.goal);
  const unlocked = useAppStore((s) => s.achievements);
  const [selected, setSelected] = useState<AchievementDef | null>(null);

  const stats = useMemo(() => computeStats(Object.values(days), goal), [days, goal]);
  const unlockedCount = Object.keys(unlocked).length;
  const percent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  const next = useMemo(() => {
    return ACHIEVEMENTS.filter((a) => !unlocked[a.id])
      .map((a) => ({ def: a, ratio: Math.min(1, a.metric(stats) / a.target) }))
      .sort((a, b) => b.ratio - a.ratio)[0];
  }, [unlocked, stats]);

  const sorted = useMemo(() => {
    return [...ACHIEVEMENTS].sort((a, b) => {
      const ua = unlocked[a.id] ? 1 : 0;
      const ub = unlocked[b.id] ? 1 : 0;
      if (ua !== ub) return ub - ua;
      return a.target - b.target;
    });
  }, [unlocked]);

  return (
    <div className="safe-top safe-bottom space-y-4 px-5">
      <header>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">{t('badgesSub')}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{t('badgesTitle')}</h1>
      </header>

      <section className="card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-lime/10 blur-3xl" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
              {t('unlockedOf', { a: unlockedCount, b: ACHIEVEMENTS.length })}
            </p>
            <p className="mt-1 text-4xl font-extrabold tabular text-gradient">{percent}%</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-lime/10 text-3xl">🏆</div>
        </div>
        <ProgressBar className="mt-4" value={percent} />
      </section>

      {next && (
        <button
          type="button"
          onClick={() => setSelected(next.def)}
          className="card flex w-full items-center gap-3 text-left"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/5 text-2xl grayscale">
            {next.def.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-lime">
              {t('nextBadge')}
            </span>
            <span className="mt-0.5 block truncate text-sm font-extrabold">{achText(next.def, lang).name}</span>
            <span className="mt-1.5 block">
              <ProgressBar value={next.ratio * 100} />
            </span>
            <span className="mt-1 block text-[10px] font-bold text-muted">
              {formatNumber(Math.min(next.def.metric(stats), next.def.target), lang)} / {formatNumber(next.def.target, lang)}
            </span>
          </span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {sorted.map((def) => {
          const state = unlocked[def.id];
          const style = TIER_STYLES[def.tier];
          const value = def.metric(stats);
          const ratio = Math.min(1, value / def.target);
          const text = achText(def, lang);
          return (
            <button
              key={def.id}
              type="button"
              onClick={() => setSelected(def)}
              className={`relative overflow-hidden rounded-3xl border p-3.5 text-left transition active:scale-[0.98] ${
                state ? `${style.ring} ${style.bg}` : 'border-white/[0.06] bg-surface/70'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-3xl ${state ? '' : 'opacity-40 grayscale'}`}>{def.icon}</span>
                {state ? (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-lime text-ink">
                    <Icon name="check" size={12} strokeWidth={3} />
                  </span>
                ) : (
                  <Icon name="lock" size={14} className="text-muted/50" />
                )}
              </div>
              <p className={`mt-2.5 text-[12px] font-extrabold leading-tight ${state ? '' : 'text-muted'}`}>
                {text.name}
              </p>
              <p className="mt-1 line-clamp-2 text-[9px] font-medium leading-snug text-muted/80">{text.desc}</p>
              <div className="mt-2.5">
                <ProgressBar
                  value={state ? 100 : ratio * 100}
                  className="h-1"
                  barClassName={state ? 'bg-lime' : 'bg-white/30'}
                />
                <div className="mt-1 flex items-center justify-between">
                  <span className={`text-[8px] font-extrabold uppercase tracking-wider ${style.text}`}>
                    {t(tierKey(def.tier))}
                  </span>
                  <span className="text-[8px] font-bold tabular text-muted">
                    {state ? t('unlocked') : `${formatNumber(Math.min(value, def.target), lang)}/${formatNumber(def.target, lang)}`}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Sheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-4xl bg-white/5 text-5xl">
              {selected.icon}
            </div>
            <p className={`mt-4 text-[10px] font-extrabold uppercase tracking-[0.2em] ${TIER_STYLES[selected.tier].text}`}>
              {t(tierKey(selected.tier))}
            </p>
            <h3 className="mt-1 text-2xl font-extrabold tracking-tight">{achText(selected, lang).name}</h3>
            <p className="mt-2 text-sm font-medium text-muted">{achText(selected, lang).desc}</p>
            <div className="mt-5">
              <ProgressBar
                value={unlocked[selected.id] ? 100 : Math.min(100, (selected.metric(stats) / selected.target) * 100)}
              />
              <p className="mt-2 text-xs font-extrabold tabular">
                {formatNumber(Math.min(selected.metric(stats), selected.target), lang)} /{' '}
                {formatNumber(selected.target, lang)}
              </p>
            </div>
            <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-white/[0.03] px-4 py-3">
              <Icon name={unlocked[selected.id] ? 'check' : 'target'} size={16} className="text-lime" />
              <span className="text-[11px] font-bold text-muted">
                {unlocked[selected.id] ? t('unlocked') : t('locked')}
              </span>
            </div>
            <button type="button" onClick={() => setSelected(null)} className="btn-primary mt-4 w-full">
              {t('close')}
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
