import { Capacitor, registerPlugin } from '@capacitor/core';

export interface StepCounterPlugin {
  start(): Promise<{ running: boolean }>;
  stop(): Promise<void>;
  getToday(): Promise<{ steps: number; running: boolean }>;
  addSteps(options: { steps: number }): Promise<{ steps: number }>;
  checkPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<{ granted: boolean }>;
  addListener(
    eventName: 'step',
    listener: (data: { steps: number }) => void,
  ): Promise<{ remove: () => Promise<void> }>;
}

export const StepCounter = registerPlugin<StepCounterPlugin>('StepCounter');

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();
