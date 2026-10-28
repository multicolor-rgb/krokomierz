import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../lib/i18n';
import { todayKey } from '../lib/calc';
import { formatNumber } from '../lib/format';
import { isNative, StepCounter, type ActiveSensor } from '../lib/nativeSteps';
import { usePedometer, useWakeLock } from '../lib/pedometer';
import { Icon } from '../components/icons';
import { NumberField, Sheet, Toggle } from '../components/ui';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { requestNotificationPermission } from '../lib/notifications';

export function Tracker() {
  const t = useT();
  const settings = useAppStore((s) => s.settings);
  const days = useAppStore((s) => s.days);
  const profile = useAppStore((s) => s.profile);
  const demo = useAppStore((s) => s.demo);
  const nativeRunning = useAppStore((s) => s.nativeRunning);
  const addSteps = useAppStore((s) => s.addSteps);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const checkAchievements = useAppStore((s) => s.checkAchievements);
  const syncNative = useAppStore((s) => s.syncNative);

  const lang = settings.lang;
  const today = days[todayKey()];
  const steps = today?.steps ?? 0;

  const [active, setActive] = useState(false);
  const [session, setSession] = useState(0);
  const [demoOn, setDemoOn] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [custom, setCustom] = useState(500);
  const [sensor, setSensor] = useState<ActiveSensor>('none');
  const [nativeError, setNativeError] = useState(false);
  const pending = useRef(0);

  const flush = () => {
    if (pending.current > 0) {
      const value = pending.current;
      pending.current = 0;
      void addSteps(value, demoOn ? 'demo' : 'sensor');
    }
  };

  const onStep = () => {
    setSession((s) => s + 1);
    pending.current += 1;
    if (pending.current >= 12) flush();
  };

  const status = usePedometer(active && !isNative && !demoOn, settings.sensitivity, onStep);
  useWakeLock(active && settings.wakeLock && !isNative);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(flush, 3000);
    return () => {
      window.clearInterval(timer);
      flush();
    };
  }, [active]);

  useEffect(() => {
    if (!active || !demoOn) return;
    const timer = window.setInterval(() => {
      setSession((s) => s + 2);
      pending.current += 2;
      if (pending.current >= 10) flush();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, demoOn]);

  useEffect(() => () => flush(), []);

  useEffect(() => {
    if (!isNative) return;
    void StepCounter.getDiagnostics()
      .then((data) => setSensor(data.activeSensor))
      .catch(() => undefined);
  }, []);

  const changeSensitivity = async (value: number) => {
    await updateSettings({ sensitivity: value });
    if (isNative) {
      try {
        await StepCounter.setSensitivity({ value });
      } catch {
        /* sensor */
      }
    }
  };

  const toggleSession = async () => {
    if (active) {
      flush();
      setActive(false);
      await checkAchievements();
    } else {
      setSession(0);
      setActive(true);
    }
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      /* brak haptyki */
    }
  };

  const toggleNative = async () => {
    const next = !settings.silentMode;
    setNativeError(false);
    try {
      if (next) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          setNativeError(true);
          return;
        }
        await StepCounter.requestPermission();
        const started = await StepCounter.start();
        if (!started.running) throw new Error('service');
        await updateSettings({ silentMode: true });
        const result = await StepCounter.getToday();
        syncNative(result.steps, result.running);
        const diagnostics = await StepCounter.getDiagnostics();
        setSensor(diagnostics.activeSensor);
      } else {
        await StepCounter.stop();
        await updateSettings({ silentMode: false });
        syncNative(steps, false);
        setSensor('none');
      }
    } catch {
      setNativeError(true);
    }
  };

  const addManual = async (value: number) => {
    if (value <= 0) return;
    if (isNative && settings.silentMode) {
      try {
        const result = await StepCounter.addSteps({ steps: value });
        syncNative(result.steps, true);
      } catch {
        await addSteps(value, 'manual');
      }
    } else {
      await addSteps(value, 'manual');
    }
    await checkAchievements();
    setSheet(false);
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      /* brak haptyki */
    }
  };

  const running = isNative ? settings.silentMode : active;
  const shownSteps = steps;
  const sensorLabel =
    sensor === 'counter'
      ? t('sensorCounter')
      : sensor === 'detector'
        ? t('sensorDetector')
        : sensor === 'accelerometer'
          ? t('sensorAccelerometer')
          : t('sensorUnknown');
  const statusLabel = isNative
    ? settings.silentMode
      ? `${t('nativeActive')} · ${sensorLabel}`
      : t('nativeInactive')
    : active
      ? t('liveSession')
      : t('ready');

  return (
    <div className="safe-top safe-bottom space-y-4 px-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">{t('trackerSub')}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{t('trackerTitle')}</h1>
        </div>
        {isNative && (
          <button type="button" onClick={() => useAppStore.getState().setTab('settings')} className="chip">
            {t('openDiagnostics')}
          </button>
        )}
      </header>

      <section className="relative overflow-hidden rounded-4xl border border-white/[0.06] bg-surface/80 p-6 text-center shadow-card backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime/10 blur-3xl" />
        <span
          className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest ${
            running ? 'bg-lime/15 text-lime' : 'bg-white/5 text-muted'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${running ? 'animate-pulse bg-lime' : 'bg-muted'}`} />
          {statusLabel}
        </span>

        <p className="relative mt-5 text-[4.2rem] font-extrabold leading-none tracking-[-0.04em] tabular">
          {formatNumber(shownSteps, lang)}
        </p>
        <p className="mt-2 text-xs font-bold text-muted">{t('todayTotal')}</p>

        {session > 0 && (
          <p className="mt-2 inline-flex rounded-full bg-cyan/10 px-3 py-1 text-[11px] font-extrabold text-cyan">
            +{formatNumber(session, lang)} {t('sessionSteps')}
          </p>
        )}

        <div className="relative mt-6 flex gap-2.5">
          {isNative ? (
            <button
              type="button"
              onClick={toggleNative}
              className={`flex-1 ${settings.silentMode ? 'btn-ghost' : 'btn-primary'}`}
            >
              <Icon name={settings.silentMode ? 'pause' : 'play'} size={18} />
              {settings.silentMode ? t('nativeStop') : t('nativeStart')}
            </button>
          ) : (
            <button type="button" onClick={toggleSession} className={`flex-1 ${active ? 'btn-ghost' : 'btn-primary'}`}>
              <Icon name={active ? 'pause' : 'play'} size={18} />
              {active ? t('stopWalk') : t('startWalk')}
            </button>
          )}
          <button
            type="button"
            onClick={() => setSheet(true)}
            aria-label={t('manualAdd')}
            className="btn-dark h-[52px] w-[52px] shrink-0 p-0"
          >
            <Icon name="plus" size={22} />
          </button>
        </div>

        {!isNative && active && (
          <p className="relative mt-4 text-[11px] font-medium text-muted">{t('liveHint')}</p>
        )}
        {!isNative && status === 'denied' && (
          <p className="relative mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-300">
            {t('sensorDenied')}
          </p>
        )}
        {!isNative && status === 'unsupported' && (
          <p className="relative mt-4 rounded-xl bg-amber-500/10 px-3 py-2 text-[11px] font-bold text-amber-300">
            {t('sensorUnsupported')}
          </p>
        )}
      </section>

      {!isNative && (
        <section className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold">{t('demoMode')}</p>
              <p className="text-[11px] font-medium text-muted">{t('demoDesc')}</p>
            </div>
            <Toggle checked={demoOn} onChange={setDemoOn} label={t('demoMode')} />
          </div>
        </section>
      )}

      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <Icon name="target" size={16} className="text-lime" />
          <p className="text-sm font-extrabold">{t('manualAdd')}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => void addManual(500)} className="btn-dark">
            {t('add500')}
          </button>
          <button type="button" onClick={() => setSheet(true)} className="btn-dark">
            <Icon name="plus" size={16} />
            {t('addCustom')}
          </button>
        </div>
      </section>

      {!isNative && (
        <section className="card space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold">{t('sensitivity')}</p>
            <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-extrabold text-lime">
              {settings.sensitivity.toFixed(1)}×
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={settings.sensitivity}
            onChange={(event) => void updateSettings({ sensitivity: Number(event.target.value) })}
            className="w-full accent-lime"
          />
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted">
            <span>{t('sensitivityLow')}</span>
            <span>{t('sensitivityHigh')}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <div>
              <p className="text-sm font-extrabold">{t('wakeLock')}</p>
              <p className="text-[11px] font-medium text-muted">{t('wakeLockDesc')}</p>
            </div>
            <Toggle
              checked={settings.wakeLock}
              onChange={(value) => void updateSettings({ wakeLock: value })}
              label={t('wakeLock')}
            />
          </div>
        </section>
      )}

      {isNative && sensor === 'accelerometer' && (
        <section className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold">{t('nativeSensitivity')}</p>
              <p className="mt-0.5 text-[10px] font-medium text-muted">{t('sensitivityNativeNote')}</p>
            </div>
            <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-extrabold text-lime">
              {settings.sensitivity.toFixed(1)}×
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={settings.sensitivity}
            onChange={(event) => void changeSensitivity(Number(event.target.value))}
            className="w-full accent-lime"
          />
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted">
            <span>{t('sensitivityLow')}</span>
            <span>{t('sensitivityHigh')}</span>
          </div>
          <p className="text-[10px] font-medium text-muted">{t('sensitivityTestHint')}</p>
        </section>
      )}

      {isNative && nativeError && (
        <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-[11px] font-bold text-red-300">
          {t('silentError')}
        </p>
      )}

      <section className="card border-cyan/15 bg-cyan/[0.04]">
        <div className="flex gap-2.5">
          <Icon name="info" size={17} className="mt-0.5 shrink-0 text-cyan" />
          <p className="text-[11px] font-medium leading-relaxed text-white/75">
            {isNative ? t('nativeNotice') : t('webNotice')}
            <br />
            <span className="text-muted">{t('sensorHint')}</span>
          </p>
        </div>
      </section>

      <Sheet open={sheet} onClose={() => setSheet(false)} title={t('addSteps')}>
        <div className="space-y-4">
          <NumberField
            label={t('steps')}
            value={custom}
            onChange={setCustom}
            min={100}
            max={50000}
            step={100}
          />
          <div className="grid grid-cols-3 gap-2">
            {[500, 1000, 2000].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCustom(value)}
                className={`chip ${custom === value ? 'chip-active' : ''}`}
              >
                +{formatNumber(value, lang)}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => void addManual(custom)} className="btn-primary w-full">
            <Icon name="plus" size={18} />
            {t('add')}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
