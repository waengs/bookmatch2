export interface AdventureLevel {
  label: string;
  emoji: string;
  className: string;
}

export function getAdventureLevel(match: number): AdventureLevel {
  if (match >= 93) {
    return { label: 'Perfect Adventure', emoji: '⭐', className: 'adventure-chip--perfect' };
  }
  if (match >= 85) {
    return { label: 'Great Match!', emoji: '🌟', className: 'adventure-chip--great' };
  }
  return { label: 'Good Adventure', emoji: '✨', className: 'adventure-chip--good' };
}
