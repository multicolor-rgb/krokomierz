import { useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useAppStore } from './store/useAppStore';
import { isNative, StepCounter } from './lib/nativeSteps';
import { maybeShowWebReminder } from './lib/notifications';
import { todayKey } from './lib/calc';
import { Onboarding } from './components/Onboarding';
import { BottomNav } from './components/BottomNav';
import { LogoMark, ToastHost } from './components/ToastHost';
import { Dashboard } from './screens/Dashboard';
import { Tracker } from './screens/Tracker';
import { Stats } from './screens/Stats';
import { Goals } from './screens/Goals';
import { Achievements } from './screens/Achievements';
import { Settings } from './screens/Settings';

export default function App() {
  const ready = useAppStore((s) => s.ready);
  const profile = useAppStore((s) => s.profile);
  const tab = useAppStore((s) => s.tab);
  const tracking = useAppStore((s) => s.settings.tracking);
  const init = useAppStore((s) => s.init);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void init();
  }, [init]);

  useEffect(() => {
    if (!ready || !profile) return;
    void useAppStore.getState().checkAchievements();
  }, [ready, profile]);

  useEffect(() => {
    if (!isNative || !ready || !profile) return;
    let disposed = false;
    const subs: { remove: () => Promise<void> | void }[] = [];

    void (async () => {
      try {
        if (tracking) {
          await StepCounter.start();
          const result = await StepCounter.getToday();
          useAppStore.getState().syncNative(result.steps, result.running);
        }
        subs.push(
          await StepCounter.addListener('step', (data) => {
            useAppStore.getState().syncNative(data.steps, true);
          }),
        );
        subs.push(
          await CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
            if (!isActive) return;
            try {
              const result = await StepCounter.getToday();
              useAppStore.getState().syncNative(result.steps, result.running);
            } catch {
              /* sensor */
            }
          }),
        );
        subs.push(
          await CapacitorApp.addListener('backButton', () => {
            const state = useAppStore.getState();
            if (state.tab !== 'home') state.setTab('home');
            else void CapacitorApp.exitApp();
          }),
        );
      } catch {
        /* środowisko bez natywnych pluginów */
      }
      if (disposed) {
        for (const sub of subs) void sub.remove();
      }
    })();

    return () => {
      disposed = true;
      for (const sub of subs) void sub.remove();
    };
  }, [ready, profile, tracking]);

  useEffect(() => {
    if (!ready || !profile || isNative) return;
    const check = () => {
      const state = useAppStore.getState();
      const steps = state.days[todayKey()]?.steps ?? 0;
      void maybeShowWebReminder(state.settings.lang, state.settings.notifications, steps, state.goal);
    };
    check();
    const interval = window.setInterval(check, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [ready, profile]);

  useEffect(() => {
    if (!isNative) return;
    void (async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#08090B' });
      } catch {
        /* brak wsparcia */
      }
      try {
        await SplashScreen.hide();
      } catch {
        /* brak wsparcia */
      }
    })();
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-[100dvh] place-items-center px-6">
        <div className="flex flex-col items-center gap-5">
          <LogoMark size={76} />
          <div className="text-center">
            <p className="text-2xl font-extrabold tracking-tight">Krokomierz</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
              Every step counts
            </p>
          </div>
          <div className="h-1 w-28 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-lime-gradient" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return <Onboarding />;

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-md">
      {tab === 'home' && <Dashboard />}
      {tab === 'stats' && <Stats />}
      {tab === 'track' && <Tracker />}
      {tab === 'goals' && <Goals />}
      {tab === 'badges' && <Achievements />}
      {tab === 'settings' && <Settings />}
      <BottomNav />
      <ToastHost />
    </div>
  );
}
