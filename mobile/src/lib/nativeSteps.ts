import { Capacitor, registerPlugin } from '@capacitor/core';

export type NativeSensorMode = 'auto' | 'counter' | 'detector' | 'accelerometer';
export type ActiveSensor = 'counter' | 'detector' | 'accelerometer' | 'none';

export interface StepDiagnostics {
  hasCounter: boolean;
  hasDetector: boolean;
  hasAccelerometer: boolean;
  sensorMode: NativeSensorMode;
  activeSensor: ActiveSensor;
  serviceRunning: boolean;
  activityPermission: boolean;
  notificationPermission: boolean;
  batteryOptimized: boolean;
  todaySteps: number;
  lastEventAt: number;
  sensitivity: number;
  manufacturer: string;
  model: string;
  sdk: number;
}

export interface StepCounterPlugin {
  start(): Promise<{ running: boolean; sensor?: ActiveSensor; activityPermission?: boolean }>;
  stop(): Promise<void>;
  getToday(): Promise<{ steps: number; running: boolean; sensor?: ActiveSensor }>;
  addSteps(options: { steps: number }): Promise<{ steps: number }>;
  checkPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<{ granted: boolean }>;
  getDiagnostics(): Promise<StepDiagnostics>;
  setSensorMode(options: { mode: NativeSensorMode }): Promise<{ mode: NativeSensorMode }>;
  setSensitivity(options: { value: number }): Promise<void>;
  isIgnoringBatteryOptimizations(): Promise<{ ignoring: boolean }>;
  requestIgnoreBatteryOptimizations(): Promise<void>;
  openAutostartSettings(): Promise<void>;
  addListener(
    eventName: 'step',
    listener: (data: { steps: number }) => void,
  ): Promise<{ remove: () => Promise<void> }>;
}

export const StepCounter = registerPlugin<StepCounterPlugin>('StepCounter');

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();
