import type { SVGProps } from 'react';

export type IconName =
  | 'home'
  | 'chart'
  | 'footsteps'
  | 'trophy'
  | 'settings'
  | 'plus'
  | 'minus'
  | 'close'
  | 'right'
  | 'left'
  | 'bell'
  | 'check'
  | 'flame'
  | 'clock'
  | 'target'
  | 'download'
  | 'upload'
  | 'trash'
  | 'shield'
  | 'info'
  | 'refresh'
  | 'play'
  | 'pause'
  | 'sparkles'
  | 'arrow'
  | 'globe'
  | 'ruler'
  | 'weight'
  | 'calendar'
  | 'share'
  | 'walk'
  | 'lock'
  | 'bolt';

const paths: Record<IconName, JSX.Element> = {
  home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" />,
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  footsteps: (
    <>
      <path d="M6.5 4c1.5 0 2.5 1.4 2.5 3.2 0 1.5-.6 2.3-.6 3.6 0 1 .6 1.7.6 2.7 0 1.2-1 2-2.3 2S4 14.6 4 13.3c0-1.2.7-2 .7-3.2C4.7 8.6 4 7.8 4 6.3 4 4.9 5 4 6.5 4Z" />
      <path d="M17.5 9c1.5 0 2.5 1.4 2.5 3.2 0 1.5-.6 2.3-.6 3.6 0 1 .6 1.7.6 2.7 0 1.2-1 2-2.3 2s-2.2-.9-2.2-2.2c0-1.2.7-2 .7-3.2 0-1.5-.7-2.3-.7-3.8 0-1.4 1-2.3 2.5-2.3Z" />
      <circle cx="6.5" cy="17.5" r="1" />
      <circle cx="17.5" cy="4" r="1" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M9 21h6M10 21v-2h4v2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  right: <path d="m9 6 6 6-6 6" />,
  left: <path d="m15 6-6 6 6 6" />,
  bell: <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  check: <path d="m4 12.5 5 5L20 6.5" />,
  flame: <path d="M12 22c4 0 7-2.7 7-6.6 0-3.4-2.4-5.3-4-7.4-1.4-1.9-2-3.5-2-5-2 1.5-3 4-3 5.6 0 1 .4 2 .4 2s-1.4-.8-2-2.2C7 10 5 12 5 15.4 5 19.3 8 22 12 22Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  download: <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 19h16" />,
  upload: <path d="M12 21V9m0 0 4.5 4.5M12 9l-4.5 4.5M4 5h16" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" />,
  shield: <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  refresh: <path d="M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5" />,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  sparkles: <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z" />,
  arrow: <path d="M5 12h14m0 0-6-6m6 6-6 6" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
    </>
  ),
  ruler: <path d="M4 16 16 4l4 4L8 20l-4-4ZM8 12l2 2M11 9l2 2M14 6l2 2" />,
  weight: (
    <>
      <path d="M5 8h14l2 12H3L5 8Z" />
      <path d="M9 8a3 3 0 1 1 6 0" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </>
  ),
  share: <path d="M12 16V4m0 0L8 8m4-4 4 4M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />,
  walk: (
    <>
      <circle cx="13" cy="4" r="2" />
      <path d="m10 22 2-6 2-2-1-5-3 2-2 4M9 22l1-5M15 10l2 4 3 1" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 22, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
