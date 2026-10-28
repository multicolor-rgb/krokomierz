import { formatCompact, formatNumber } from '../lib/format';
import type { Lang } from '../lib/types';

export interface BarDatum {
  label: string;
  value: number;
  isToday?: boolean;
}

export function StepsBarChart({
  data,
  goal,
  lang,
  height = 150,
  showValues = false,
}: {
  data: BarDatum[];
  goal: number;
  lang: Lang;
  height?: number;
  showValues?: boolean;
}) {
  const max = Math.max(goal * 1.18, ...data.map((d) => d.value), 1);
  const goalBottom = (goal / max) * 100;
  const every = data.length > 14 ? 5 : 1;

  return (
    <div className="relative" style={{ height }}>
      <div
        className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-lime/40"
        style={{ bottom: `${goalBottom}%` }}
      >
        <span className="absolute -top-2 right-0 rounded-full bg-ink px-1.5 text-[9px] font-bold text-lime">
          {formatNumber(goal, lang)}
        </span>
      </div>
      <div className="flex h-full items-end gap-[3px]">
        {data.map((item, index) => {
          const pct = Math.max(2, (item.value / max) * 100);
          const reached = item.value >= goal;
          return (
            <div key={`${item.label}-${index}`} className="group relative flex h-full flex-1 flex-col justify-end">
              {showValues && (
                <span className="mb-1 text-center text-[9px] font-bold tabular text-muted">
                  {item.value > 0 ? formatCompact(item.value, lang) : ''}
                </span>
              )}
              <div
                className={`w-full rounded-t-md transition-all ${
                  reached
                    ? 'bg-lime-gradient shadow-[0_0_12px_rgba(198,255,61,0.25)]'
                    : item.isToday
                      ? 'bg-lime/45'
                      : 'bg-white/15 group-hover:bg-white/25'
                }`}
                style={{ height: `${pct}%` }}
                title={`${item.label}: ${formatNumber(item.value, lang)}`}
              />
              <span
                className={`mt-1.5 h-3 text-center text-[9px] font-bold ${
                  item.isToday ? 'text-lime' : 'text-muted/70'
                }`}
              >
                {index % every === 0 || item.isToday ? item.label : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ActivityBars({
  data,
  height = 44,
}: {
  data: number[];
  height?: number;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((value, index) => (
        <div
          key={index}
          className={`flex-1 rounded-sm ${
            value > 0 ? 'bg-lime/60' : 'bg-white/10'
          }`}
          style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
