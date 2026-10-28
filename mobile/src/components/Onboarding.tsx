import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../lib/i18n';
import { bmi, recommendedSteps } from '../lib/calc';
import { formatNumber } from '../lib/format';
import { isNative, StepCounter } from '../lib/nativeSteps';
import { requestNotificationPermission, scheduleNativeReminders } from '../lib/notifications';
import type { Activity, GoalType, Lang, Profile, Sex } from '../lib/types';
import { Icon } from '../components/icons';
import { LogoMark } from '../components/ToastHost';
import { NumberField, Segmented, Toggle } from '../components/ui';

export function Onboarding() {
  const t = useT();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const saveOnboarding = useAppStore((s) => s.saveOnboarding);

  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Lang>(settings.lang);
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [activity, setActivity] = useState<Activity>('moderate');
  const [goal, setGoal] = useState<GoalType>('health');
  const [targetWeight, setTargetWeight] = useState(70);
  const [reminders, setReminders] = useState(true);
  const [time, setTime] = useState('19:00');
  const [saving, setSaving] = useState(false);

  const profile: Profile = {
    age,
    sex,
    heightCm: height,
    weightKg: weight,
    activity,
    goal,
    targetWeightKg: goal === 'lose' ? targetWeight : null,
    startWeightKg: goal === 'lose' ? weight : undefined,
  };
  const recommended = recommendedSteps(profile);
  const bmiValue = bmi(profile);
  const bmiLabel =
    bmiValue < 18.5
      ? t('bmiUnder')
      : bmiValue < 25
        ? t('bmiNormal')
        : bmiValue < 30
          ? t('bmiOver')
          : t('bmiObese');

  const changeLang = (value: Lang) => {
    setLang(value);
    void updateSettings({ lang: value });
  };

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    let granted = false;
    if (reminders) granted = await requestNotificationPermission();
    await saveOnboarding(profile, {
      lang,
      tracking: isNative,
      notifications: {
        enabled: reminders && granted,
        time,
        days: [1, 2, 3, 4, 5, 6, 0],
      },
    });
    if (isNative) {
      try {
        await StepCounter.start();
        const today = await StepCounter.getToday();
        useAppStore.getState().syncNative(today.steps, today.running);
      } catch {
        /* sensor niedostępny */
      }
      if (granted) await scheduleNativeReminders({ enabled: true, time, days: [1, 2, 3, 4, 5, 6, 0] }, lang, recommended);
    }
    setSaving(false);
  };

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col overflow-hidden px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime/15 blur-[100px]" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-cyan/10 blur-[100px]" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark size={38} />
          <span className="text-sm font-extrabold tracking-tight">Krokomierz</span>
        </div>
        <Segmented
          className="w-[104px]"
          options={[
            { value: 'pl', label: 'PL' },
            { value: 'en', label: 'EN' },
          ]}
          value={lang}
          onChange={changeLang}
        />
      </div>

      {step > 0 && (
        <div className="relative mt-6 flex gap-1.5">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= step ? 'bg-lime' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      )}

      <div className="relative flex flex-1 flex-col">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="flex flex-1 flex-col justify-center py-10"
            >
              <span className="chip chip-active mb-5 w-fit">v1.0 · PWA + APK</span>
              <h1 className="text-[2.7rem] font-extrabold leading-[0.98] tracking-[-0.04em]">
                {t('obWelcomeTitle').split(' ').slice(0, -1).join(' ')}{' '}
                <span className="text-gradient">{t('obWelcomeTitle').split(' ').slice(-1)}</span>
              </h1>
              <p className="mt-4 max-w-[19rem] text-sm font-medium leading-relaxed text-muted">
                {t('obWelcomeSub')}
              </p>

              <div className="mt-8 grid grid-cols-3 gap-2">
                {[
                  { icon: 'footsteps' as const, value: '10k', label: t('steps') },
                  { icon: 'target' as const, value: '100%', label: t('goal') },
                  { icon: 'trophy' as const, value: '28', label: t('badgesTitle') },
                ].map((item) => (
                  <div key={item.label} className="card-tight text-center">
                    <Icon name={item.icon} size={18} className="mx-auto text-lime" />
                    <p className="mt-2 text-lg font-extrabold">{item.value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted">{item.label}</p>
                  </div>
                ))}
              </div>

              <button type="button" onClick={next} className="btn-primary mt-8 w-full">
                {t('obStart')}
                <Icon name="arrow" size={18} />
              </button>
              <p className="mt-3 text-center text-[11px] font-medium text-muted">
                {t('privacyText')}
              </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex flex-1 flex-col py-8"
            >
              <h2 className="text-3xl font-extrabold tracking-tight">{t('obProfile')}</h2>
              <p className="mt-2 text-sm font-medium text-muted">{t('obProfileSub')}</p>

              <div className="mt-7 space-y-4">
                <div>
                  <span className="label">{t('sex')}</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['male', 'female', 'other'] as Sex[]).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSex(value)}
                        className={`rounded-2xl border px-2 py-3 text-xs font-extrabold transition ${
                          sex === value
                            ? 'border-lime/50 bg-lime/10 text-lime'
                            : 'border-white/10 bg-white/[0.04] text-muted'
                        }`}
                      >
                        {t(value)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <NumberField label={t('age')} value={age} onChange={setAge} min={12} max={100} unit={t('years')} />
                  <NumberField label={t('height')} value={height} onChange={setHeight} min={120} max={220} unit="cm" />
                </div>
                <NumberField label={t('weight')} value={weight} onChange={setWeight} min={35} max={200} unit="kg" />
                <div className="card-tight flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">{t('bmiLabel')}</p>
                    <p className="mt-1 text-lg font-extrabold">
                      {bmiValue.toFixed(1)}{' '}
                      <span className="text-xs font-bold text-lime">{bmiLabel}</span>
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-lime/10 p-2.5 text-lime">
                    <Icon name="weight" size={20} />
                  </div>
                </div>
              </div>

              <div className="mt-auto flex gap-3 pt-6">
                <button type="button" onClick={back} className="btn-ghost px-5">
                  <Icon name="left" size={18} />
                </button>
                <button type="button" onClick={next} className="btn-primary flex-1">
                  {t('next')}
                  <Icon name="arrow" size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex flex-1 flex-col py-8"
            >
              <h2 className="text-3xl font-extrabold tracking-tight">{t('obGoalTitle')}</h2>
              <p className="mt-2 text-sm font-medium text-muted">{t('obGoalSub')}</p>

              <div className="mt-6 space-y-2.5">
                {(
                  [
                    { value: 'low', title: t('activityLow'), desc: t('activityLowDesc') },
                    { value: 'moderate', title: t('activityModerate'), desc: t('activityModerateDesc') },
                    { value: 'high', title: t('activityHigh'), desc: t('activityHighDesc') },
                  ] as { value: Activity; title: string; desc: string }[]
                ).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setActivity(item.value)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                      activity === item.value
                        ? 'border-lime/50 bg-lime/10'
                        : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-xl ${
                        activity === item.value ? 'bg-lime text-ink' : 'bg-white/5 text-muted'
                      }`}
                    >
                      <Icon name={item.value === 'low' ? 'walk' : item.value === 'high' ? 'bolt' : 'footsteps'} size={18} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-extrabold">{item.title}</span>
                      <span className="block text-[11px] font-medium text-muted">{item.desc}</span>
                    </span>
                    {activity === item.value && <Icon name="check" size={18} className="text-lime" />}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <span className="label">{t('goal')}</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['lose', 'maintain', 'health'] as GoalType[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setGoal(value)}
                      className={`rounded-2xl border px-2 py-3 text-xs font-extrabold transition ${
                        goal === value
                          ? 'border-lime/50 bg-lime/10 text-lime'
                          : 'border-white/10 bg-white/[0.04] text-muted'
                      }`}
                    >
                      {t(value)}
                    </button>
                  ))}
                </div>
              </div>

              {goal === 'lose' && (
                <div className="mt-4">
                  <NumberField
                    label={t('targetWeight')}
                    value={targetWeight}
                    onChange={setTargetWeight}
                    min={35}
                    max={200}
                    unit="kg"
                  />
                </div>
              )}

              <div className="card mt-5 border-lime/20 bg-lime/[0.06]">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-lime">
                  {t('recommendedGoal')}
                </p>
                <p className="mt-1 text-3xl font-extrabold tabular">
                  {formatNumber(recommended, lang)} <span className="text-sm text-muted">{t('steps')}</span>
                </p>
              </div>

              <div className="mt-auto flex gap-3 pt-6">
                <button type="button" onClick={back} className="btn-ghost px-5">
                  <Icon name="left" size={18} />
                </button>
                <button type="button" onClick={next} className="btn-primary flex-1">
                  {t('next')}
                  <Icon name="arrow" size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="finish"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex flex-1 flex-col py-8"
            >
              <h2 className="text-3xl font-extrabold tracking-tight">{t('obRecTitle')}</h2>
              <p className="mt-2 text-sm font-medium text-muted">{t('obRecSub')}</p>

              <div className="card mt-6 overflow-hidden border-lime/25 bg-gradient-to-br from-lime/[0.14] to-cyan/[0.05]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-lime">
                      {t('recommendedGoal')}
                    </p>
                    <p className="mt-1 text-4xl font-extrabold tabular tracking-tight">
                      {formatNumber(recommended, lang)}
                    </p>
                    <p className="text-xs font-bold text-muted">{t('steps')} / {t('day')}</p>
                  </div>
                  <LogoMark size={44} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-bold text-muted">
                  <span className="rounded-xl bg-black/20 px-3 py-2">{t('weeklyTarget')}: {formatNumber(recommended * 7, lang)}</span>
                  <span className="rounded-xl bg-black/20 px-3 py-2">{t('bmiLabel')}: {bmiValue.toFixed(1)}</span>
                </div>
              </div>

              <div className="card mt-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-lime">
                      <Icon name="bell" size={19} />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold">{t('obNotifTitle')}</p>
                      <p className="text-[11px] font-medium text-muted">{t('obNotifSub')}</p>
                    </div>
                  </div>
                  <Toggle checked={reminders} onChange={setReminders} label={t('obNotifTitle')} />
                </div>
                {reminders && (
                  <label className="mt-4 block">
                    <span className="label">{t('reminderTime')}</span>
                    <input
                      type="time"
                      value={time}
                      onChange={(event) => setTime(event.target.value)}
                      className="field"
                    />
                  </label>
                )}
              </div>

              <div className="mt-auto space-y-3 pt-6">
                <button type="button" onClick={finish} disabled={saving} className="btn-primary w-full">
                  {saving ? t('loading') : t('obFinish')}
                  <Icon name="arrow" size={18} />
                </button>
                <p className="text-center text-[11px] font-medium text-muted">{t('obFinishSub')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
