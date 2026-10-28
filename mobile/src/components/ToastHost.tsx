import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../lib/i18n';
import { ACHIEVEMENTS, achText } from '../lib/achievements';
import { Icon } from './icons';

export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-2xl bg-lime-gradient text-ink shadow-glow"
      style={{ width: size, height: size }}
    >
      <Icon name="footsteps" size={Math.round(size * 0.56)} strokeWidth={2} />
    </div>
  );
}

export function ToastHost() {
  const t = useT();
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);
  const lang = useAppStore((s) => s.settings.lang);
  const toast = toasts[0];

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismiss, 4600);
    return () => window.clearTimeout(timer);
  }, [toast, dismiss]);

  const def = toast?.type === 'achievement' ? ACHIEVEMENTS.find((a) => a.id === toast.id) : undefined;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.button
            key={`${toast.type}-${toast.id ?? 'goal'}`}
            type="button"
            onClick={dismiss}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-3xl border border-lime/25 bg-surface/95 p-3.5 text-left shadow-card backdrop-blur-xl"
            initial={{ y: -80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lime/15 text-2xl">
              {def ? def.icon : '🔥'}
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-lime">
                {toast.type === 'goal' ? t('goalToast') : t('badgeUnlocked')}
              </span>
              <span className="mt-0.5 block truncate text-sm font-extrabold">
                {def ? achText(def, lang).name : t('keepGoing')}
              </span>
              <span className="mt-0.5 block truncate text-[11px] font-medium text-muted">
                {def ? achText(def, lang).desc : t('goalDone')}
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
