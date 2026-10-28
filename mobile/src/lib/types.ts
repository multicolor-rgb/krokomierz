export type Lang = 'pl' | 'en';
export type Sex = 'male' | 'female' | 'other';
export type Activity = 'low' | 'moderate' | 'high';
export type GoalType = 'lose' | 'maintain' | 'health';
export type Units = 'metric' | 'imperial';
export type SensorMode = 'auto' | 'counter' | 'detector' | 'accelerometer';
export type Source = 'sensor' | 'manual' | 'native' | 'demo';
export type Tab = 'home' | 'stats' | 'track' | 'badges' | 'settings' | 'goals';

export interface Profile {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: GoalType;
  targetWeightKg: number | null;
  startWeightKg?: number;
  strideCm: number | null;
}

export interface NotificationSettings {
  enabled: boolean;
  time: string;
  days: number[];
}

export interface Settings {
  lang: Lang;
  units: Units;
  notifications: NotificationSettings;
  sensitivity: number;
  wakeLock: boolean;
  dailyGoalOverride: number | null;
  autoAdjust: boolean;
  silentMode: boolean;
  sensorMode: SensorMode;
  onboarded: boolean;
}

export interface DayLog {
  date: string;
  steps: number;
  distanceKm: number;
  calories: number;
  activeMinutes: number;
  source: Source;
  updatedAt: number;
}

export interface AchievementState {
  id: string;
  unlockedAt: number;
}

export interface StatsCtx {
  totalSteps: number;
  bestDay: number;
  days: number;
  streak: number;
  goalHits: number;
  perfectWeek: boolean;
  totalKm: number;
  weekSteps: number;
  earlyBird: boolean;
  nightOwl: boolean;
  bestWeek: number;
}

export const DEFAULT_SETTINGS: Settings = {
  lang: 'pl',
  units: 'metric',
  notifications: { enabled: false, time: '19:00', days: [1, 2, 3, 4, 5, 6, 0] },
  sensitivity: 1,
  wakeLock: true,
  dailyGoalOverride: null,
  autoAdjust: true,
  silentMode: false,
  sensorMode: 'auto',
  onboarded: false,
};
