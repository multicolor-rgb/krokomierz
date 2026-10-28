import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../lib/i18n';
import { bmi, effectiveGoal, lastNDays, recommendedSteps, sum } from '../lib/calc';
import { formatNumber } from '../lib/format';
import { Icon } from '../components/icons';
import { NumberField, ProgressBar, Toggle } from '../components/ui';

export function Goals() {
  const t = useT();
  const profile = useAppStore((s) => s.profile)!;
  const settings = useAppStore((s) => s.settings);
  const days = useAppStore((s) => s.days);
  const goal = useAppStore((s) => s.goal);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const setTab = useAppStore((s) => s.setTab);
  const lang = settings.lang;

  const recommended = recommendedSteps(profile);
  const [value, setValue] = useState(goal);
  const [auto, setAuto] = useState(settings.autoAdjust);
  const [target, setTarget] = useState(profile.targetWeightKg ?? Math.round(profile.weightKg * 0.95));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(goal);
    setAuto(settings.autoAdjust);
  }, [goal, settings.autoAdjust]);

  const week = lastNDays(Object.values(days), 7);
  const weekSteps = sum(week.map((d) => d.steps));
  const weekGoal = value * 7;
  const bmiValue = bmi(profile);
  const activityLabel =
    profile.activity === 'low'
      ? t('activityLow')
      : profile.activity === 'high'
        ? t('activityHigh')
        : t('activityModerate');

  const startWeight = profile.startWeightKg ?? profile.weightKg;
  const targetWeight = profile.targetWeightKg;
  const weightProgress = targetWeight
    ? Math.max(0, Math.min(100, ((startWeight - profile.weightKg) / Math.max(0.1, startWeight - targetWeight)) * 100))
    : 0;
  const toGo = targetWeight ? Math.abs(profile.weightKg - targetWeight) : 0;

  const save = async () => {
    const override = value === recommended ? null : value;
    await updateSettings({ dailyGoalOverride: override, autoAdjust: auto });
    if (profile.goal === 'lose' && targetWeight !== target) {
      await updateProfile({
        targetWeightKg: target,
        startWeightKg: profile.startWeightKg ?? profile.weightKg,
      });
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const previewGoal = effectiveGoal(profile, { ...settings, dailyGoalOverride: value === recommended ? null : value, autoAdjust: auto }, Object.values(days));

  return (
    <div className="safe-top safe-bottom space-y-4 px-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTab('home')}
          className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-muted"
          aria-label={t('back')}
        >
          <Icon name="left" size={18} />
        </button>
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">{t('goalsSub')}</p>
          <h1 className="text-2xl font-extrabold tracking-tight">{t('goalsTitle')}</h1>
        </div>
      </header>

      <section className="card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-lime/10 blur-3xl" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{t('currentGoal')}</p>
            <p className="mt-1 text-4xl font-extrabold tabular tracking-tight">{formatNumber(value, lang)}</p>
            <p className="text-[11px] font-bold text-muted">{t('steps')} / {t('day')}</p>
          </div>
          <span className="rounded-full bg-lime/10 px-3 py-1.5 text-[10px] font-extrabold text-lime">
            {t('weeklyTarget')}: {formatNumber(value * 7, lang)}
          </span>
        </div>

        <div className="mt-5">
          <input
            type="range"
            min={3000}
            max={20000}
            step={500}
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
            className="w-full accent-lime"
          />
          <div className="mt-1 flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted">
            <span>3 000</span>
            <span>10 000</span>
            <span>20 000</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[0.03] p-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-lime/10 text-lime">
              <Icon name="sparkles" size={15} />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">{t('recommendedForYou')}</p>
              <p className="text-sm font-extrabold tabular">{formatNumber(recommended, lang)} {t('steps')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setValue(recommended)}
            className="rounded-xl bg-lime px-3 py-2 text-[10px] font-extrabold text-ink"
          >
            {t('useRecommended')}
          </button>
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold">{t('weekProgress')}</p>
            <p className="mt-0.5 text-[11px] font-bold text-muted">
              {formatNumber(weekSteps, lang)} / {formatNumber(weekGoal, lang)}
            </p>
          </div>
          <span className="text-lg font-extrabold text-lime">
            {Math.min(100, Math.round((weekSteps / Math.max(1, weekGoal)) * 100))}%
          </span>
        </div>
        <ProgressBar className="mt-3" value={(weekSteps / Math.max(1, weekGoal)) * 100} />
      </section>

      <section className="card flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold">{t('autoAdjust')}</p>
          <p className="mt-0.5 text-[11px] font-medium text-muted">{t('autoAdjustDesc')}</p>
          <p className="mt-1 text-[10px] font-medium text-muted/70">{t('adjustHint')}</p>
        </div>
        <Toggle checked={auto} onChange={setAuto} label={t('autoAdjust')} />
      </section>

      <section className="card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-extrabold">{t('weightGoal')}</p>
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-extrabold text-muted">
            {profile.goal === 'lose' ? t('lose') : t('maintain')}
          </span>
        </div>
        {profile.goal === 'lose' ? (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/[0.03] p-3">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-muted">{t('currentWeight')}</p>
                <p className="mt-1 text-xl font-extrabold tabular">{profile.weightKg} kg</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-3">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-muted">{t('targetWeight')}</p>
                <p className="mt-1 text-xl font-extrabold tabular text-lime">{targetWeight ?? target} kg</p>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={weightProgress} />
              <p className="mt-1.5 text-[10px] font-bold text-muted">
                {targetWeight ? t('toGoKg', { n: toGo.toFixed(1) }) : t('noWeightGoal')}
              </p>
            </div>
            <div className="mt-4">
              <NumberField label={t('targetWeight')} value={target} onChange={setTarget} min={40} max={200} unit="kg" />
            </div>
          </>
        ) : (
          <p className="mt-2 text-[11px] font-medium text-muted">{t('noWeightGoal')}</p>
        )}
      </section>

      <section className="card border-cyan/15 bg-cyan/[0.04]">
        <div className="flex items-center gap-2 text-cyan">
          <Icon name="info" size={16} />
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]">{t('recommendedForYou')}</p>
        </div>
        <p className="mt-2 text-[11px] font-medium leading-relaxed text-white/75">
          {t('recommendationWhy', { age: profile.age, activity: activityLabel, bmi: bmiValue.toFixed(1) })}
        </p>
        <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted">{t('goalHint')}</p>
        {previewGoal !== value && (
          <p className="mt-2 rounded-xl bg-lime/10 px-3 py-2 text-[11px] font-bold text-lime">
            {t('autoAdjust')}: {formatNumber(previewGoal, lang)} {t('steps')}
          </p>
        )}
      </section>

      <button type="button" onClick={() => void save()} className="btn-primary w-full">
        <Icon name={saved ? 'check' : 'target'} size={18} />
        {saved ? t('saved') : t('saveGoal')}
      </button>
    </div>
  );
}
