import { useEffect, useRef, useState } from 'react';

type PedometerStatus = 'idle' | 'running' | 'denied' | 'unsupported';

/**
 * Prosty, ale skuteczny detektor kroków oparty o akcelerometr.
 * Filtr górnoprzepustowy usuwa grawitację, a detekcja szczytów
 * z refrakcją 260 ms zapobiega wielokrotnemu liczeniu jednego kroku.
 */
export class StepDetector {
  private gx = 0;
  private gy = 0;
  private gz = 0;
  private lp = 0;
  private prev = 0;
  private lastStep = 0;
  private sensitivity = 1;

  constructor(sensitivity = 1) {
    this.sensitivity = sensitivity;
  }

  setSensitivity(value: number) {
    this.sensitivity = Math.min(2.5, Math.max(0.4, value));
  }

  push(x: number, y: number, z: number): boolean {
    // dolnoprzepustowy filtr grawitacji
    this.gx = this.gx * 0.9 + x * 0.1;
    this.gy = this.gy * 0.9 + y * 0.1;
    this.gz = this.gz * 0.9 + z * 0.1;

    const lx = x - this.gx;
    const ly = y - this.gy;
    const lz = z - this.gz;
    const magnitude = Math.sqrt(lx * lx + ly * ly + lz * lz);

    // wygładzenie sygnału
    this.lp = this.lp * 0.55 + magnitude * 0.45;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const threshold = 1.15 / this.sensitivity;
    const isStep = this.lp > threshold && this.prev <= threshold && now - this.lastStep > 260;

    if (isStep) this.lastStep = now;
    this.prev = this.lp;
    return isStep;
  }
}

function motionValue(event: DeviceMotionEvent): [number, number, number] | null {
  const acc = event.accelerationIncludingGravity ?? event.acceleration;
  if (!acc || acc.x == null || acc.y == null || acc.z == null) return null;
  return [acc.x, acc.y, acc.z];
}

export function usePedometer(active: boolean, sensitivity: number, onStep: () => void) {
  const [status, setStatus] = useState<PedometerStatus>('idle');
  const callback = useRef(onStep);
  callback.current = onStep;
  const detector = useRef(new StepDetector(sensitivity));

  useEffect(() => {
    detector.current.setSensitivity(sensitivity);
  }, [sensitivity]);

  useEffect(() => {
    if (!active) {
      setStatus('idle');
      return;
    }
    if (typeof window === 'undefined' || typeof DeviceMotionEvent === 'undefined') {
      setStatus('unsupported');
      return;
    }

    let mounted = true;
    const handler = (event: DeviceMotionEvent) => {
      const values = motionValue(event);
      if (!values) return;
      if (detector.current.push(values[0], values[1], values[2])) callback.current();
    };

    const start = async () => {
      const MotionEvent = DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (typeof MotionEvent.requestPermission === 'function') {
        try {
          const result = await MotionEvent.requestPermission();
          if (result !== 'granted') {
            if (mounted) setStatus('denied');
            return;
          }
        } catch {
          if (mounted) setStatus('denied');
          return;
        }
      }
      window.addEventListener('devicemotion', handler, { passive: true });
      if (mounted) setStatus('running');
    };

    void start();

    return () => {
      mounted = false;
      window.removeEventListener('devicemotion', handler);
    };
  }, [active]);

  return status;
}

export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    let lock: { release: () => Promise<void> } | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const manager = (navigator as Navigator & {
          wakeLock: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
        }).wakeLock;
        lock = await manager.request('screen');
        if (cancelled) await lock.release();
      } catch {
        /* brak wsparcia lub odmowa */
      }
    };

    void request();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release().catch(() => undefined);
    };
  }, [active]);
}
