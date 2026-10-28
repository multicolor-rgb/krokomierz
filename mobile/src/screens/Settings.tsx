import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { CapacitorHttp } from '@capacitor/core';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../lib/i18n';
import type { Activity, GoalType, Lang, Sex, Units } from '../lib/types';
import { autoStrideCm, recommendedSteps, todayKey, weekdayLong, weekdayShort } from '../lib/calc';
import { formatNumber } from '../lib/format';
import { isNative, StepCounter, type NativeSensorMode, type StepDiagnostics } from '../lib/nativeSteps';
import {
  notificationPermission,
  requestNotificationPermission,
  scheduleNativeReminders,
  sendTestNotification,
} from '../lib/notifications';
import { APP_VERSION, APK_URL, LANDING_URL, VERSION_URL } from '../lib/version';
import { Icon } from '../components/icons';
import { NumberField, Segmented, Sheet, Toggle } from '../components/ui';

type SheetKind = 'privacy' | 'reset' | null;
type UpdateState = 'idle' | 'checking' | 'latest' | 'available' | 'error';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function Settings() {
  const t = useT();
  const profile = useAppStore((s) => s.profile)!;
  const settings = useAppStore((s) => s.settings);
  const days = useAppStore((s) => s.days);
  const achievements = useAppStore((s) => s.achievements);
  const goal = useAppStore((s) => s.goal);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const resetAll = useAppStore((s) => s.resetAll);
  const importData = useAppStore((s) => s.importData);
  const setTab = useAppStore((s) => s.setTab);
  const lang = settings.lang;

  const [age, setAge] = useState(profile.age);
  const [height, setHeight] = useState(profile.heightCm);
  const [weight, setWeight] = useState(profile.weightKg);
  const [sex, setSex] = useState<Sex>(profile.sex);
  const [activity, setActivity] = useState<Activity>(profile.activity);
  const [goalType, setGoalType] = useState<GoalType>(profile.goal);
  const [target, setTarget] = useState(profile.targetWeightKg ?? Math.round(profile.weightKg * 0.95));
  const [profileSaved, setProfileSaved] = useState(false);
  const [strideManual, setStrideManual] = useState(profile.strideCm != null);
  const [stride, setStride] = useState(profile.strideCm ?? Math.round(autoStrideCm(profile.heightCm, profile.sex)));
  const [silentBusy, setSilentBusy] = useState(false);
  const [silentError, setSilentError] = useState(false);
  const [diagnostics, setDiagnostics] = useState<StepDiagnostics | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [sensorMode, setSensorMode] = useState<NativeSensorMode>(settings.sensorMode);
  const [batteryIgnoring, setBatteryIgnoring] = useState<boolean | null>(null);

  const [permission, setPermission] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [testState, setTestState] = useState<'idle' | 'sent' | 'error'>('idle');
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [resetDone, setResetDone] = useState(false);
  const [importError, setImportError] = useState(false);
  const [update, setUpdate] = useState<UpdateState>('idle');
  const [updateInfo, setUpdateInfo] = useState<{ version?: string; url?: string } | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAge(profile.age);
    setHeight(profile.heightCm);
    setWeight(profile.weightKg);
    setSex(profile.sex);
    setActivity(profile.activity);
    setGoalType(profile.goal);
    setTarget(profile.targetWeightKg ?? Math.round(profile.weightKg * 0.95));
    setStrideManual(profile.strideCm != null);
    setStride(profile.strideCm ?? Math.round(autoStrideCm(profile.heightCm, profile.sex)));
  }, [profile]);

  useEffect(() => {
    setSensorMode(settings.sensorMode);
  }, [settings.sensorMode]);

  const refreshDiagnostics = async () => {
    if (!isNative) return;
    setDiagLoading(true);
    try {
      const data = await StepCounter.getDiagnostics();
      setDiagnostics(data);
      setBatteryIgnoring(!data.batteryOptimized);
      setSensorMode(data.sensorMode);
    } catch {
      /* plugin niedostępny */
    } finally {
      setDiagLoading(false);
    }
  };

  useEffect(() => {
    if (isNative) void refreshDiagnostics();
  }, []);

  useEffect(() => {
    void notificationPermission().then(setPermission);
    setStandalone(
      typeof window !== 'undefined' &&
        (window.matchMedia('(display-mode: standalone)').matches ||
          (navigator as Navigator & { standalone?: boolean }).standalone === true),
    );
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const saveProfile = async () => {
    await updateProfile({
      age,
      heightCm: height,
      weightKg: weight,
      sex,
      activity,
      goal: goalType,
      targetWeightKg: goalType === 'lose' ? target : null,
      startWeightKg: profile.startWeightKg ?? (goalType === 'lose' ? weight : undefined),
      strideCm: strideManual ? stride : null,
    });
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 2000);
  };

  const changeLang = (value: Lang) => void updateSettings({ lang: value });
  const changeUnits = (value: Units) => void updateSettings({ units: value });

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      setPermission((await notificationPermission()) as typeof permission);
      if (!granted) return;
    }
    const next = { ...settings.notifications, enabled };
    await updateSettings({ notifications: next });
    if (isNative) await scheduleNativeReminders(next, lang, goal);
  };

  const changeTime = async (time: string) => {
    const next = { ...settings.notifications, time };
    await updateSettings({ notifications: next });
    if (isNative && next.enabled) await scheduleNativeReminders(next, lang, goal);
  };

  const toggleDay = async (day: number) => {
    const daysList = settings.notifications.days.includes(day)
      ? settings.notifications.days.filter((d) => d !== day)
      : [...settings.notifications.days, day];
    const next = { ...settings.notifications, days: daysList };
    await updateSettings({ notifications: next });
    if (isNative && next.enabled) await scheduleNativeReminders(next, lang, goal);
  };

  const test = async () => {
    const ok = await sendTestNotification(lang);
    setTestState(ok ? 'sent' : 'error');
    setPermission((await notificationPermission()) as typeof permission);
    window.setTimeout(() => setTestState('idle'), 3000);
  };

  const toggleSilent = async (enabled: boolean) => {
    if (!isNative) {
      await updateSettings({ silentMode: enabled });
      return;
    }
    setSilentBusy(true);
    setSilentError(false);
    try {
      if (enabled) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          setSilentError(true);
          return;
        }
        await StepCounter.requestPermission();
        const result = await StepCounter.start();
        if (!result.running) throw new Error('service');
        await updateSettings({ silentMode: true });
        const today = await StepCounter.getToday();
        useAppStore.getState().syncNative(today.steps, today.running);
      } else {
        await StepCounter.stop();
        await updateSettings({ silentMode: false });
        useAppStore.getState().syncNative(
          useAppStore.getState().days[todayKey()]?.steps ?? 0,
          false,
        );
      }
      await refreshDiagnostics();
    } catch {
      setSilentError(true);
    } finally {
      setSilentBusy(false);
    }
  };

  const changeSensorMode = async (mode: NativeSensorMode) => {
    setSensorMode(mode);
    await updateSettings({ sensorMode: mode });
    if (isNative) {
      try {
        await StepCounter.setSensorMode({ mode });
        await refreshDiagnostics();
      } catch {
        /* sensor */
      }
    }
  };

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

  const requestBattery = async () => {
    if (!isNative) return;
    try {
      await StepCounter.requestIgnoreBatteryOptimizations();
      window.setTimeout(() => void refreshDiagnostics(), 1200);
    } catch {
      /* ustawienia */
    }
  };

  const openAutostart = async () => {
    if (!isNative) return;
    try {
      await StepCounter.openAutostartSettings();
    } catch {
      /* ustawienia */
    }
  };

  const exportData = async () => {
    const payload = {
      app: 'krokomierz',
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      profile,
      settings,
      goal,
      days: Object.values(days),
      achievements: Object.values(achievements),
    };
    const json = JSON.stringify(payload, null, 2);
    const filename = `krokomierz-export-${new Date().toISOString().slice(0, 10)}.json`;
    if (isNative) {
      try {
        const result = await Filesystem.writeFile({
          path: filename,
          data: json,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({ title: filename, url: result.uri, dialogTitle: t('exportData') });
      } catch {
        /* anulowano */
      }
      return;
    }
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const ok = await importData(JSON.parse(text));
      setImportError(!ok);
    } catch {
      setImportError(true);
    }
    event.target.value = '';
    window.setTimeout(() => setImportError(false), 3000);
  };

  const doReset = async () => {
    await resetAll();
    setSheet(null);
    setResetDone(true);
  };

  const checkUpdates = async () => {
    setUpdate('checking');
    try {
      let data: { version?: string; url?: string };
      if (isNative) {
        // Natywny HTTP omija ograniczenia CORS WebView.
        const response = await CapacitorHttp.get({
          url: `${VERSION_URL}?t=${Date.now()}`,
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (response.status < 200 || response.status >= 300) throw new Error('no version');
        data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      } else {
        const response = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('no version');
        data = (await response.json()) as { version?: string; url?: string };
      }
      setUpdateInfo(data);
      if (data.version && data.version !== APP_VERSION) setUpdate('available');
      else setUpdate('latest');
    } catch {
      setUpdate('error');
    }
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstallPrompt(null);
  };

  const recommended = recommendedSteps(profile);
  const daysOrder = [1, 2, 3, 4, 5, 6, 0];

  return (
    <div className="safe-top safe-bottom space-y-4 px-5">
      <header>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">{t('settingsSub')}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{t('settingsTitle')}</h1>
      </header>

      <section className="card space-y-4">
        <p className="section-title">{t('languageSection')}</p>
        <div>
          <span className="label">{t('language')}</span>
          <Segmented
            value={lang}
            onChange={changeLang}
            options={[
              { value: 'pl', label: 'Polski' },
              { value: 'en', label: 'English' },
            ]}
          />
        </div>
        <div>
          <span className="label">{t('units')}</span>
          <Segmented
            value={settings.units}
            onChange={changeUnits}
            options={[
              { value: 'metric', label: t('metric') },
              { value: 'imperial', label: t('imperial') },
            ]}
          />
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <p className="section-title">{t('profileSection')}</p>
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-muted">
            BMI {(weight / Math.pow(height / 100, 2)).toFixed(1)}
          </span>
        </div>
        <div>
          <span className="label">{t('sex')}</span>
          <div className="grid grid-cols-3 gap-2">
            {(['male', 'female', 'other'] as Sex[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSex(value)}
                className={`rounded-2xl border px-2 py-2.5 text-[11px] font-extrabold ${
                  sex === value ? 'border-lime/50 bg-lime/10 text-lime' : 'border-white/10 bg-white/[0.03] text-muted'
                }`}
              >
                {t(value)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <NumberField label={t('age')} value={age} onChange={setAge} min={12} max={100} unit={t('years')} />
          <NumberField label={t('heightCm')} value={height} onChange={setHeight} min={120} max={220} unit="cm" />
          <NumberField label={t('weightKg')} value={weight} onChange={setWeight} min={35} max={200} unit="kg" />
        </div>
        <div className="rounded-2xl bg-white/[0.03] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">{t('strideSection')}</p>
              <p className="mt-1 text-sm font-extrabold tabular">
                {strideManual ? `${stride} cm` : `${autoStrideCm(height, sex)} cm`}
                <span className="ml-1 text-[10px] font-bold text-lime">
                  {strideManual ? t('strideManual') : t('strideAuto')}
                </span>
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-muted">
                {strideManual
                  ? t('strideHint')
                  : t('strideAutoDesc', { cm: autoStrideCm(height, sex) })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (strideManual) {
                  setStrideManual(false);
                  setStride(Math.round(autoStrideCm(height, sex)));
                } else {
                  setStrideManual(true);
                  setStride(profile.strideCm ?? Math.round(autoStrideCm(height, sex)));
                }
              }}
              className="chip chip-active shrink-0"
            >
              {strideManual ? t('strideAuto') : t('strideManual')}
            </button>
          </div>
          {strideManual && (
            <div className="mt-3">
              <NumberField label={t('strideLength')} value={stride} onChange={setStride} min={40} max={120} unit="cm" />
            </div>
          )}
        </div>
        <div>
          <span className="label">{t('activity')}</span>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'moderate', 'high'] as Activity[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setActivity(value)}
                className={`rounded-2xl border px-2 py-2.5 text-[11px] font-extrabold ${
                  activity === value ? 'border-lime/50 bg-lime/10 text-lime' : 'border-white/10 bg-white/[0.03] text-muted'
                }`}
              >
                {value === 'low' ? t('activityLow') : value === 'high' ? t('activityHigh') : t('activityModerate')}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="label">{t('goal')}</span>
          <div className="grid grid-cols-3 gap-2">
            {(['lose', 'maintain', 'health'] as GoalType[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setGoalType(value)}
                className={`rounded-2xl border px-2 py-2.5 text-[11px] font-extrabold ${
                  goalType === value ? 'border-lime/50 bg-lime/10 text-lime' : 'border-white/10 bg-white/[0.03] text-muted'
                }`}
              >
                {t(value)}
              </button>
            ))}
          </div>
        </div>
        {goalType === 'lose' && (
          <NumberField label={t('targetWeight')} value={target} onChange={setTarget} min={40} max={200} unit="kg" />
        )}
        <button type="button" onClick={() => void saveProfile()} className="btn-primary w-full">
          <Icon name={profileSaved ? 'check' : 'target'} size={18} />
          {profileSaved ? t('profileSaved') : t('saveProfile')}
        </button>
        <button
          type="button"
          onClick={() => setTab('goals')}
          className="flex w-full items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">
              {t('dailyTarget')}
            </span>
            <span className="text-sm font-extrabold tabular">
              {formatNumber(goal, lang)} {t('steps')} · {t('recommendedForYou')}: {formatNumber(recommended, lang)}
            </span>
          </span>
          <Icon name="right" size={16} className="text-muted" />
        </button>
      </section>

      <section className="card space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-title">{t('notificationsSection')}</p>
            <p className="mt-0.5 text-[11px] font-medium text-muted">{t('reminderEnabled')}</p>
          </div>
          <Toggle checked={settings.notifications.enabled} onChange={(v) => void toggleNotifications(v)} label={t('reminderEnabled')} />
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="text-muted">{t('permission')}:</span>
          <span
            className={`rounded-full px-2 py-0.5 ${
              permission === 'granted'
                ? 'bg-lime/10 text-lime'
                : permission === 'denied'
                  ? 'bg-red-500/10 text-red-300'
                  : 'bg-white/5 text-muted'
            }`}
          >
            {permission === 'granted' ? t('granted') : permission === 'denied' ? t('denied') : '—'}
          </span>
        </div>

        {settings.notifications.enabled && (
          <>
            <label className="block">
              <span className="label">{t('reminderTime')}</span>
              <input
                type="time"
                value={settings.notifications.time}
                onChange={(event) => void changeTime(event.target.value)}
                className="field"
              />
            </label>
            <div>
              <span className="label">{t('reminderDays')}</span>
              <div className="flex gap-1.5">
                {daysOrder.map((day) => {
                  const active = settings.notifications.days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      aria-label={weekdayLong(lang, day)}
                      onClick={() => void toggleDay(day)}
                      className={`grid h-9 flex-1 place-items-center rounded-xl text-[10px] font-extrabold ${
                        active ? 'bg-lime text-ink' : 'bg-white/5 text-muted'
                      }`}
                    >
                      {weekdayShort(lang, day)}
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="button" onClick={() => void test()} className="btn-dark w-full">
              <Icon name="bell" size={16} />
              {testState === 'sent' ? t('testSent') : t('sendTest')}
            </button>
            {testState === 'error' && <p className="text-[11px] font-bold text-red-300">{t('notifDenied')}</p>}
          </>
        )}

        <p className="rounded-2xl bg-white/[0.03] p-3 text-[10px] font-medium leading-relaxed text-muted">
          {isNative ? t('notifNativeNote') : t('notifWebNote')}
        </p>
      </section>

      <section className="card space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-title">{t('silentMode')}</p>
            <p className="mt-0.5 text-[11px] font-medium text-muted">{t('silentModeDesc')}</p>
          </div>
          {isNative && (
            <Toggle
              checked={settings.silentMode}
              onChange={(value) => void toggleSilent(value)}
              label={t('silentMode')}
            />
          )}
        </div>

        {isNative ? (
          <>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
              <span className={`rounded-full px-2.5 py-1 ${settings.silentMode ? 'bg-lime/10 text-lime' : 'bg-white/5 text-muted'}`}>
                {settings.silentMode ? t('silentModeOn') : t('silentModeOff')}
              </span>
              {silentBusy && <span className="text-muted">{t('loading')}</span>}
              {silentError && <span className="text-red-300">{t('silentError')}</span>}
            </div>
            <p className="rounded-2xl bg-white/[0.03] p-3 text-[10px] font-medium leading-relaxed text-muted">
              {t('silentModeAndroidNote')}
            </p>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] p-3">
              <div>
                <p className="text-[11px] font-extrabold">{t('batteryOptimization')}</p>
                <p className="mt-0.5 text-[10px] font-medium text-muted">
                  {batteryIgnoring === true ? t('batteryUnrestricted') : t('batteryOptimized')}
                </p>
              </div>
              <button type="button" onClick={() => void requestBattery()} className="chip chip-active shrink-0">
                {t('disableBatteryOptimization')}
              </button>
            </div>
            <button type="button" onClick={() => void openAutostart()} className="btn-dark w-full justify-start">
              <Icon name="refresh" size={16} />
              {t('openAutostart')}
            </button>
            <p className="text-[10px] font-medium leading-relaxed text-muted">
              {t('miuiHelp')}: {t('miuiHelpSteps')}
            </p>
          </>
        ) : (
          <p className="rounded-2xl bg-white/[0.03] p-3 text-[10px] font-medium leading-relaxed text-muted">
            {t('silentModeWebNote')}
          </p>
        )}
      </section>

      <section className="card space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-title">{t('sensitivity')}</p>
            <p className="mt-0.5 text-[10px] font-medium text-muted">
              {isNative
                ? diagnostics?.activeSensor === 'accelerometer' || sensorMode === 'accelerometer'
                  ? t('sensitivityNativeNote')
                  : t('nativeSensitivityOff')
                : t('sensitivityDesc')}
            </p>
          </div>
          <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-extrabold text-lime">
            {settings.sensitivity.toFixed(1)}×
          </span>
        </div>

        {!isNative || diagnostics?.activeSensor === 'accelerometer' || sensorMode === 'accelerometer' ? (
          <>
            <div>
              <span className="label">{t('sensitivityPresets')}</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { value: 0.7, label: t('sensLow') },
                  { value: 1.0, label: t('sensMedium') },
                  { value: 1.3, label: t('sensHigh') },
                  { value: 1.6, label: t('sensVeryHigh') },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => void changeSensitivity(preset.value)}
                    className={`rounded-xl border px-1 py-2 text-[9px] font-extrabold ${
                      Math.abs(settings.sensitivity - preset.value) < 0.05
                        ? 'border-lime/50 bg-lime/10 text-lime'
                        : 'border-white/10 bg-white/[0.03] text-muted'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
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
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <p className="text-[10px] font-medium text-muted">{t('sensitivityTestHint')}</p>
              <button type="button" onClick={() => void changeSensitivity(1)} className="chip shrink-0">
                {t('resetSensitivity')}
              </button>
            </div>
          </>
        ) : (
          <p className="rounded-2xl bg-white/[0.03] p-3 text-[10px] font-medium text-muted">
            {t('nativeSensitivityOff')}
          </p>
        )}

        {!isNative && (
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <p className="text-sm font-extrabold">{t('wakeLock')}</p>
              <p className="text-[10px] font-medium text-muted">{t('wakeLockDesc')}</p>
            </div>
            <Toggle checked={settings.wakeLock} onChange={(v) => void updateSettings({ wakeLock: v })} label={t('wakeLock')} />
          </div>
        )}
      </section>

      {isNative && (
        <section className="card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-title">{t('diagnostics')}</p>
              <p className="text-[10px] font-medium text-muted">{t('diagnosticsSub')}</p>
            </div>
            <button type="button" onClick={() => void refreshDiagnostics()} className="chip">
              <Icon name="refresh" size={14} />
            </button>
          </div>

          {diagnostics ? (
            <>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: t('diagCounter'), ok: diagnostics.hasCounter },
                  { label: t('diagDetector'), ok: diagnostics.hasDetector },
                  { label: t('diagAccelerometer'), ok: diagnostics.hasAccelerometer },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-white/[0.03] p-2 text-center">
                    <p className="text-[8px] font-extrabold uppercase tracking-wider text-muted">{item.label}</p>
                    <p className={`mt-1 text-[10px] font-extrabold ${item.ok ? 'text-lime' : 'text-red-300'}`}>
                      {item.ok ? t('diagActive') : t('diagUnavailable')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 rounded-2xl bg-white/[0.03] p-3 text-[10px] font-medium">
                <div className="flex justify-between gap-3">
                  <span className="text-muted">{t('sensorMode')}</span>
                  <span className="font-extrabold">{diagnostics.sensorMode}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted">{t('sensorLabel')}</span>
                  <span className="font-extrabold">
                    {diagnostics.activeSensor === 'counter'
                      ? t('sensorCounter')
                      : diagnostics.activeSensor === 'detector'
                        ? t('sensorDetector')
                        : diagnostics.activeSensor === 'accelerometer'
                          ? t('sensorAccelerometer')
                          : t('sensorUnknown')}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted">{t('diagService')}</span>
                  <span className={`font-extrabold ${diagnostics.serviceRunning ? 'text-lime' : 'text-red-300'}`}>
                    {diagnostics.serviceRunning ? t('diagRunning') : t('diagStopped')}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted">{t('diagPermission')}</span>
                  <span className={`font-extrabold ${diagnostics.activityPermission ? 'text-lime' : 'text-red-300'}`}>
                    {diagnostics.activityPermission ? t('granted') : t('denied')}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted">{t('diagNotification')}</span>
                  <span className={`font-extrabold ${diagnostics.notificationPermission ? 'text-lime' : 'text-red-300'}`}>
                    {diagnostics.notificationPermission ? t('granted') : t('denied')}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted">{t('diagBattery')}</span>
                  <span className={`font-extrabold ${diagnostics.batteryOptimized ? 'text-amber-300' : 'text-lime'}`}>
                    {diagnostics.batteryOptimized ? t('batteryOptimized') : t('batteryUnrestricted')}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted">{t('diagLastEvent')}</span>
                  <span className="font-extrabold">
                    {diagnostics.lastEventAt > 0
                      ? new Date(diagnostics.lastEventAt).toLocaleTimeString(lang === 'pl' ? 'pl-PL' : 'en-US')
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted">{t('diagToday')}</span>
                  <span className="font-extrabold tabular">{formatNumber(diagnostics.todaySteps, lang)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted">{t('diagModel')}</span>
                  <span className="max-w-[60%] truncate text-right font-extrabold">
                    {diagnostics.manufacturer} {diagnostics.model} · API {diagnostics.sdk}
                  </span>
                </div>
              </div>

              {!diagnostics.hasCounter && !diagnostics.hasDetector && diagnostics.hasAccelerometer && (
                <p className="rounded-2xl bg-amber-500/10 p-3 text-[10px] font-bold leading-relaxed text-amber-300">
                  {t('diagAccelFallback')}
                </p>
              )}
              {!diagnostics.hasCounter && !diagnostics.hasDetector && !diagnostics.hasAccelerometer && (
                <p className="rounded-2xl bg-red-500/10 p-3 text-[10px] font-bold leading-relaxed text-red-300">
                  {t('diagNoSensor')}
                </p>
              )}

              <div>
                <span className="label">{t('sensorMode')}</span>
                <Segmented
                  value={sensorMode === 'accelerometer' ? 'accelerometer' : 'auto'}
                  onChange={(value) => void changeSensorMode(value as NativeSensorMode)}
                  options={[
                    { value: 'auto', label: t('sensorAuto') },
                    { value: 'accelerometer', label: t('sensorAccelerometer') },
                  ]}
                />
              </div>

              <button type="button" onClick={() => setTab('track')} className="btn-dark w-full">
                {t('diagTest')}
              </button>
              <p className="text-[10px] font-medium text-muted">{t('diagTestHint')}</p>
            </>
          ) : (
            <p className="text-[11px] font-medium text-muted">{diagLoading ? t('loading') : t('diagUnavailable')}</p>
          )}
        </section>
      )}

      <section className="card space-y-3">
        <p className="section-title">{t('dataSection')}</p>
        <button type="button" onClick={() => void exportData()} className="btn-dark w-full justify-start">
          <Icon name="download" size={17} />
          {t('exportData')}
        </button>
        <button type="button" onClick={() => fileInput.current?.click()} className="btn-dark w-full justify-start">
          <Icon name="upload" size={17} />
          {t('importData')}
        </button>
        <input ref={fileInput} type="file" accept="application/json" onChange={(e) => void onImport(e)} className="hidden" />
        {importError && <p className="text-[11px] font-bold text-red-300">{t('importError')}</p>}
        <button
          type="button"
          onClick={() => setSheet('reset')}
          className="btn w-full justify-start border border-red-500/20 bg-red-500/10 text-red-300"
        >
          <Icon name="trash" size={17} />
          {t('resetData')}
        </button>
        {resetDone && <p className="text-[11px] font-bold text-lime">{t('resetDone')}</p>}
      </section>

      <section className="card space-y-3">
        <p className="section-title">{t('aboutSection')}</p>
        <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
          <span className="text-[11px] font-bold text-muted">{t('version')}</span>
          <span className="text-sm font-extrabold tabular">{APP_VERSION}</span>
        </div>
        <button type="button" onClick={() => void checkUpdates()} className="btn-dark w-full justify-start">
          <Icon name="refresh" size={17} />
          {update === 'checking' ? t('loading') : t('checkUpdates')}
        </button>
        {update === 'latest' && <p className="text-[11px] font-bold text-lime">{t('upToDate')}</p>}
        {update === 'error' && <p className="text-[11px] font-bold text-muted">{t('errorGeneric')}</p>}
        {update === 'available' && (
          <a href={updateInfo?.url ?? APK_URL} className="btn-primary w-full" target="_blank" rel="noreferrer">
            <Icon name="download" size={17} />
            {t('updateAvailable')} · {updateInfo?.version}
          </a>
        )}
        {!isNative && !standalone && installPrompt && (
          <button type="button" onClick={() => void install()} className="btn-dark w-full justify-start">
            <Icon name="download" size={17} />
            {t('installPwa')}
          </button>
        )}
        {standalone && (
          <p className="rounded-2xl bg-lime/10 px-4 py-3 text-[11px] font-bold text-lime">{t('pwaInstalled')}</p>
        )}
        <button type="button" onClick={() => setSheet('privacy')} className="btn-dark w-full justify-start">
          <Icon name="shield" size={17} />
          {t('privacy')}
        </button>
        <a
          href={LANDING_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-dark w-full justify-start"
        >
          <Icon name="globe" size={17} />
          krokomierz.multidev.top
        </a>
        <p className="pt-1 text-center text-[10px] font-medium leading-relaxed text-muted">
          {t('aboutText')}
          <br />© 2026 Krokomierz · MIT
        </p>
      </section>

      <Sheet open={sheet === 'reset'} onClose={() => setSheet(null)} title={t('resetConfirm')}>
        <p className="text-sm font-medium leading-relaxed text-muted">{t('resetConfirmDesc')}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setSheet(null)} className="btn-ghost">
            {t('cancel')}
          </button>
          <button type="button" onClick={() => void doReset()} className="btn bg-red-500 text-white">
            {t('delete')}
          </button>
        </div>
      </Sheet>

      <Sheet open={sheet === 'privacy'} onClose={() => setSheet(null)} title={t('privacy')}>
        <div className="flex items-start gap-3 rounded-2xl bg-lime/10 p-4 text-lime">
          <Icon name="shield" size={20} className="mt-0.5 shrink-0" />
          <p className="text-[12px] font-semibold leading-relaxed">{t('privacyText')}</p>
        </div>
        <div className="mt-3 space-y-2">
          <a
            href={`${LANDING_URL}/privacy/`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 text-[12px] font-extrabold"
          >
            {t('privacyFull')}
            <Icon name="arrow" size={15} className="text-lime" />
          </a>
          <a
            href={`${LANDING_URL}/cookies/`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 text-[12px] font-extrabold"
          >
            {t('cookiesPolicy')}
            <Icon name="arrow" size={15} className="text-lime" />
          </a>
          <a
            href="mailto:gramodrana1@gmail.com"
            className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 text-[12px] font-extrabold"
          >
            gramodrana1@gmail.com
            <Icon name="arrow" size={15} className="text-lime" />
          </a>
        </div>
        <button type="button" onClick={() => setSheet(null)} className="btn-primary mt-4 w-full">
          {t('close')}
        </button>
      </Sheet>
    </div>
  );
}
