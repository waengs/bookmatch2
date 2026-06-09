const iconProps = { width: 20, height: 20, strokeWidth: 2, stroke: 'currentColor', fill: 'none' };

export function IconHome() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconExplore() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" strokeLinecap="round" />
      <path d="M6 6c3 2 9 2 12 0M6 18c3-2 9-2 12 0" strokeLinecap="round" />
    </svg>
  );
}

export function IconQuests() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconRewards() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <path d="M8 4h8l1 4H7l1-4z" strokeLinejoin="round" />
      <path d="M7 8h10v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8z" strokeLinejoin="round" />
      <path d="M12 8v11M9 12h6" strokeLinecap="round" />
    </svg>
  );
}

export function IconMe() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" strokeLinecap="round" />
    </svg>
  );
}

export const NAV_ICONS = {
  home: IconHome,
  explore: IconExplore,
  quests: IconQuests,
  rewards: IconRewards,
  me: IconMe,
} as const;
