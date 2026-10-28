import { useAppStore } from '../store/useAppStore';
import { useT } from '../lib/i18n';
import { Icon, type IconName } from './icons';
import type { Tab } from '../lib/types';

const items: { tab: Tab; icon: IconName; key: 'navHome' | 'navStats' | 'navTrack' | 'navBadges' | 'navSettings' }[] = [
  { tab: 'home', icon: 'home', key: 'navHome' },
  { tab: 'stats', icon: 'chart', key: 'navStats' },
  { tab: 'track', icon: 'footsteps', key: 'navTrack' },
  { tab: 'badges', icon: 'trophy', key: 'navBadges' },
  { tab: 'settings', icon: 'settings', key: 'navSettings' },
];

export function BottomNav() {
  const t = useT();
  const tab = useAppStore((s) => s.tab);
  const setTab = useAppStore((s) => s.setTab);

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="pointer-events-auto mx-auto max-w-md px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
        <div className="flex items-end justify-between rounded-[1.75rem] border border-white/10 bg-surface/95 px-2.5 py-2 shadow-card backdrop-blur-2xl">
          {items.map((item) => {
            const active = tab === item.tab;
            if (item.tab === 'track') {
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => setTab('track')}
                  aria-label={t(item.key)}
                  className={`-mt-7 grid h-16 w-16 place-items-center rounded-full border-[5px] border-ink transition active:scale-95 ${
                    active ? 'bg-lime-gradient text-ink shadow-glow' : 'bg-surface2 text-lime'
                  }`}
                >
                  <Icon name="footsteps" size={26} />
                </button>
              );
            }
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => setTab(item.tab)}
                aria-label={t(item.key)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition ${
                  active ? 'text-lime' : 'text-muted'
                }`}
              >
                <Icon name={item.icon} size={21} />
                <span className="text-[9px] font-extrabold uppercase tracking-wide">{t(item.key)}</span>
                <span
                  className={`h-1 w-1 rounded-full transition ${active ? 'bg-lime' : 'bg-transparent'}`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
