import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../lib/i18n';
import type { Activity, GoalType, Lang, Sex, Units } from '../lib/types';
import { recommendedSteps, todayKey, weekdayLong, weekdayShort } from '../lib/calc';
import { formatNumber } from '../lib/format';
import { isNative, StepCounter } from '../lib/nativeSteps';
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
  }, [profile]);

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

  const toggleTracking = async (enabled: boolean) => {
    await updateSettings({ tracking: enabled });
    if (!isNative) return;
    try {
      if (enabled) {
        await StepCounter.start();
        const result = await StepCounter.getToday();
        useAppStore.getState().syncNative(result.steps, result.running);
      } else {
        await StepCounter.stop();
        useAppStore.getState().syncNative(useAppStore.getState().days[todayKey()]?.steps ?? 0, false);
      }
    } catch {
      /* sensor niedostępny */
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
      const response = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('no version');
      const data = (await response.json()) as { version?: string; url?: string };
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
        <div className="grid grid-cols-2 gap-3">
          <NumberField label={t('age')} value={age} onChange={setAge} min={12} max={100} unit={t('years')} />
          <NumberField label={t('heightCm')} value={height} onChange={setHeight} min={120} max={220} unit="cm" />
        </div>
        <NumberField label={t('weightKg')} value={weight} onChange={setWeight} min={35} max={200} unit="kg" />
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
        <p className="section-title">{t('trackingSection')}</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold">{isNative ? t('nativeSensor') : t('webSensor')}</p>
            <p className="mt-0.5 text-[11px] font-medium text-muted">{t('autoTrackingDesc')}</p>
          </div>
          <Toggle checked={settings.tracking} onChange={(v) => void toggleTracking(v)} label={t('autoTracking')} />
        </div>
        {!isNative && (
          <>
            <div>
              <div className="flex items-center justify-between">
                <span className="label mb-0">{t('sensitivity')}</span>
                <span className="text-[10px] font-extrabold text-lime">{settings.sensitivity.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={settings.sensitivity}
                onChange={(event) => void updateSettings({ sensitivity: Number(event.target.value) })}
                className="mt-2 w-full accent-lime"
              />
              <p className="text-[10px] font-medium text-muted">{t('sensitivityDesc')}</p>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <div>
                <p className="text-sm font-extrabold">{t('wakeLock')}</p>
                <p className="text-[10px] font-medium text-muted">{t('wakeLockDesc')}</p>
              </div>
              <Toggle checked={settings.wakeLock} onChange={(v) => void updateSettings({ wakeLock: v })} label={t('wakeLock')} />
            </div>
          </>
        )}
        {isNative && <p className="text-[10px] font-medium text-muted">{t('nativeNotice')}</p>}
      </section>

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
        <button type="button" onClick={() => setSheet(null)} className="btn-primary mt-4 w-full">
          {t('close')}
        </button>
      </Sheet>
    </div>
  );
}
