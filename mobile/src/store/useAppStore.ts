import { create } from 'zustand';
import type { AchievementState, DayLog, Profile, Settings, Source, Tab } from '../lib/types';
import { DEFAULT_SETTINGS } from '../lib/types';
import {
  buildLog,
  effectiveGoal,
  generateDemoDays,
  todayKey,
  computeStats,
} from '../lib/calc';
import {
  clearAll,
  db,
  getKV,
  loadAchievements,
  loadDays,
  saveAchievements,
  saveDay,
  setKV,
} from '../lib/db';
import { ACHIEVEMENTS } from '../lib/achievements';
import { isNative } from '../lib/nativeSteps';

export interface Toast {
  type: 'goal' | 'achievement';
  id?: string;
}

interface AppState {
  ready: boolean;
  profile: Profile | null;
  settings: Settings;
  days: Record<string, DayLog>;
  achievements: Record<string, AchievementState>;
  goal: number;
  tab: Tab;
  toasts: Toast[];
  demo: boolean;
  nativeRunning: boolean;
  init: () => Promise<void>;
  saveOnboarding: (profile: Profile, settings: Partial<Settings>) => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  setTab: (tab: Tab) => void;
  addSteps: (delta: number, source: Source) => Promise<void>;
  setTodaySteps: (steps: number, source: Source) => Promise<void>;
  syncNative: (steps: number, running?: boolean) => void;
  checkAchievements: () => Promise<void>;
  dismissToast: () => void;
  resetAll: () => Promise<void>;
  importData: (payload: unknown) => Promise<boolean>;
}

const demoProfile: Profile = {
  age: 31,
  sex: 'male',
  heightCm: 178,
  weightKg: 76,
  activity: 'moderate',
  goal: 'health',
  targetWeightKg: 72,
  startWeightKg: 80,
};

function mergeSettings(raw: Partial<Settings> | undefined): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...(raw ?? {}),
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...(raw?.notifications ?? {}),
    },
  };
}

export const useAppStore = create<AppState>()((set, get) => ({
  ready: false,
  profile: null,
  settings: DEFAULT_SETTINGS,
  days: {},
  achievements: {},
  goal: 10000,
  tab: 'home',
  toasts: [],
  demo: false,
  nativeRunning: false,

  async init() {
    if (get().ready) return;
    const params = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');

    const [rawProfile, rawSettings, achievements, logs] = await Promise.all([
      getKV<Profile | null>('profile', null),
      getKV<Partial<Settings> | undefined>('settings', undefined),
      loadAchievements(),
      loadDays(),
    ]);

    let settings = mergeSettings(rawSettings);
    let profile = rawProfile;
    let dayLogs = logs;
    const demo = params.get('demo') === '1';

    const langParam = params.get('lang');
    if (langParam === 'pl' || langParam === 'en') settings = { ...settings, lang: langParam };

    if (!profile) {
      settings = { ...settings, tracking: isNative };
    }

    if (demo && !profile) {
      profile = demoProfile;
      settings = { ...settings, onboarded: true, lang: settings.lang, tracking: false };
      dayLogs = generateDemoDays(profile, effectiveGoal(profile, settings, []), 45);
      await db.days.bulkPut(dayLogs);
    }

    const dayMap = Object.fromEntries(dayLogs.map((d) => [d.date, d]));
    const goal = effectiveGoal(profile, settings, dayLogs);

    let achievementMap = achievements;
    if (demo && Object.keys(achievements).length === 0) {
      const stats = computeStats(dayLogs, goal);
      achievementMap = {};
      let offset = 0;
      for (const def of ACHIEVEMENTS) {
        if (def.metric(stats) >= def.target) {
          achievementMap[def.id] = { id: def.id, unlockedAt: Date.now() - offset * 86400000 };
          offset++;
        }
      }
      await saveAchievements(achievementMap);
    }

    if (typeof document !== 'undefined') document.documentElement.lang = settings.lang;

    const screen = params.get('screen') as Tab | null;
    const validTabs: Tab[] = ['home', 'stats', 'track', 'badges', 'settings'];
    const tab = screen && validTabs.includes(screen) ? screen : 'home';

    set({
      ready: true,
      profile,
      settings,
      days: dayMap,
      achievements: achievementMap,
      goal,
      demo,
      tab,
    });
  },

  async saveOnboarding(profile, settingsPatch) {
    const settings: Settings = {
      ...mergeSettings(get().settings),
      ...settingsPatch,
      notifications: {
        ...get().settings.notifications,
        ...(settingsPatch.notifications ?? {}),
      },
      onboarded: true,
    };
    const goal = effectiveGoal(profile, settings, Object.values(get().days));
    await setKV('profile', profile);
    await setKV('settings', settings);
    if (typeof document !== 'undefined') document.documentElement.lang = settings.lang;
    set({ profile, settings, goal });
    await get().checkAchievements();
  },

  async updateProfile(patch) {
    const profile = get().profile;
    if (!profile) return;
    const next = { ...profile, ...patch };
    await setKV('profile', next);
    const goal = effectiveGoal(next, get().settings, Object.values(get().days));
    set({ profile: next, goal });
  },

  async updateSettings(patch) {
    const current = get().settings;
    const next: Settings = {
      ...current,
      ...patch,
      notifications: { ...current.notifications, ...(patch.notifications ?? {}) },
    };
    await setKV('settings', next);
    if (typeof document !== 'undefined') document.documentElement.lang = next.lang;
    const goal = effectiveGoal(get().profile, next, Object.values(get().days));
    set({ settings: next, goal });
  },

  setTab(tab) {
    set({ tab });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  async addSteps(delta, source) {
    const { profile, days, goal } = get();
    const date = todayKey();
    const prev = days[date];
    const total = Math.max(0, (prev?.steps ?? 0) + delta);
    const log = buildLog(date, total, profile, source);
    await saveDay(log);
    const nextDays = { ...days, [date]: log };
    const nextGoal = effectiveGoal(profile, get().settings, Object.values(nextDays));
    const crossed = (prev?.steps ?? 0) < goal && total >= goal;
    const toasts = crossed ? [...get().toasts, { type: 'goal' as const }] : get().toasts;
    set({ days: nextDays, goal: nextGoal, toasts });
    if (Math.abs(total - (prev?.steps ?? 0)) >= 25) await get().checkAchievements();
  },

  async setTodaySteps(steps, source) {
    const { profile, days, goal } = get();
    const date = todayKey();
    const prev = days[date];
    if (prev && prev.steps === steps) return;
    const log = buildLog(date, steps, profile, source);
    await saveDay(log);
    const nextDays = { ...days, [date]: log };
    const nextGoal = effectiveGoal(profile, get().settings, Object.values(nextDays));
    const crossed = (prev?.steps ?? 0) < goal && steps >= goal;
    const toasts = crossed ? [...get().toasts, { type: 'goal' as const }] : get().toasts;
    set({ days: nextDays, goal: nextGoal, toasts });
  },

  syncNative(steps, running) {
    if (running !== undefined) set({ nativeRunning: running });
    void get().setTodaySteps(steps, 'native');
  },

  async checkAchievements() {
    const { days, goal, achievements } = get();
    const stats = computeStats(Object.values(days), goal);
    const newly = ACHIEVEMENTS.filter(
      (a) => !achievements[a.id] && a.metric(stats) >= a.target,
    );
    if (!newly.length) return;
    const next = { ...achievements };
    for (const def of newly) next[def.id] = { id: def.id, unlockedAt: Date.now() };
    await saveAchievements(next);
    set({
      achievements: next,
      toasts: [
        ...get().toasts,
        ...newly.map((def) => ({ type: 'achievement' as const, id: def.id })),
      ],
    });
  },

  dismissToast() {
    set({ toasts: get().toasts.slice(1) });
  },

  async resetAll() {
    await clearAll();
    await db.open();
    set({
      profile: null,
      settings: { ...DEFAULT_SETTINGS, tracking: isNative },
      days: {},
      achievements: {},
      goal: 10000,
      tab: 'home',
      toasts: [],
      demo: false,
    });
  },

  async importData(payload) {
    try {
      const data = payload as {
        profile?: Profile;
        settings?: Partial<Settings>;
        days?: DayLog[];
        achievements?: AchievementState[];
      };
      if (!data || typeof data !== 'object') return false;
      if (data.profile) await setKV('profile', data.profile);
      if (data.settings) await setKV('settings', mergeSettings(data.settings));
      if (Array.isArray(data.days)) {
        await db.days.clear();
        await db.days.bulkPut(data.days);
      }
      if (Array.isArray(data.achievements)) {
        await setKV('achievements', data.achievements);
      }
      const profile = data.profile ?? get().profile;
      const settings = mergeSettings(data.settings ?? get().settings);
      const logs = Array.isArray(data.days) ? data.days : Object.values(get().days);
      const achievements = Array.isArray(data.achievements)
        ? Object.fromEntries(data.achievements.map((a) => [a.id, a]))
        : get().achievements;
      set({
        profile,
        settings,
        days: Object.fromEntries(logs.map((d) => [d.date, d])),
        achievements,
        goal: effectiveGoal(profile, settings, logs),
      });
      return true;
    } catch {
      return false;
    }
  },
}));
