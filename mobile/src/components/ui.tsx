import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon, type IconName } from './icons';

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-lime' : 'bg-white/10'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`absolute top-1 h-5 w-5 rounded-full bg-ink shadow ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={`flex rounded-2xl border border-white/10 bg-white/[0.04] p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-xl px-3 py-2 text-xs font-extrabold transition ${
            value === option.value ? 'bg-lime text-ink shadow-glow' : 'text-muted hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-t-4xl border border-white/10 bg-surface p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] shadow-card"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />
            {title && <h3 className="mb-4 text-xl font-extrabold tracking-tight">{title}</h3>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  unit,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  const clampValue = (next: number) => Math.min(max, Math.max(min, Math.round(next)));
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
        <button
          type="button"
          aria-label="-"
          onClick={() => onChange(clampValue(value - step))}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-muted active:scale-95"
        >
          <Icon name="minus" size={16} />
        </button>
        <div className="flex min-w-0 flex-1 items-baseline justify-center gap-1">
          <input
            type="number"
            inputMode="numeric"
            value={Number.isFinite(value) ? value : ''}
            onChange={(event) => onChange(clampValue(Number(event.target.value)))}
            className="min-w-0 w-full bg-transparent px-1 text-center text-xl font-extrabold tabular outline-none"
          />
          {unit && <span className="shrink-0 text-[10px] font-bold text-muted">{unit}</span>}
        </div>
        <button
          type="button"
          aria-label="+"
          onClick={() => onChange(clampValue(value + step))}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-muted active:scale-95"
        >
          <Icon name="plus" size={16} />
        </button>
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  className = '',
  barClassName = 'bg-lime-gradient',
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-white/[0.08] ${className}`}>
      <motion.div
        className={`h-full rounded-full ${barClassName}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
      />
    </div>
  );
}

export function IconBadge({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <span className={`grid h-10 w-10 place-items-center rounded-2xl bg-lime/10 text-lime ${className}`}>
      <Icon name={name} size={20} />
    </span>
  );
}

export function StatTile({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  icon?: IconName;
}) {
  return (
    <div className="card-tight">
      {icon && (
        <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-lime">
          <Icon name={icon} size={16} />
        </span>
      )}
      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-lg font-extrabold tabular">
        {value}
        {unit && <span className="ml-1 text-xs font-bold text-muted">{unit}</span>}
      </p>
    </div>
  );
}
