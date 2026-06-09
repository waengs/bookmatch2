'use client';

import { getTopPowers, levelToPlus } from '@/lib/reading-powers';
import type { ReaderTypeId } from '@/lib/types';

interface ReadingPowersListProps {
  typeId: ReaderTypeId;
  title?: string;
}

export default function ReadingPowersList({
  typeId,
  title = 'Your reading powers:',
}: ReadingPowersListProps) {
  const top = getTopPowers(typeId, 3);

  return (
    <div className="reading-powers-list">
      <div className="reading-powers-list-title">{title}</div>
      {top.map(({ power, level }) => (
        <div key={power.id} className="reading-power-row">
          <span className="reading-power-emoji">{power.emoji}</span>
          <span className="reading-power-name">{power.title}</span>
          <span className="reading-power-level">{levelToPlus(level)}</span>
        </div>
      ))}
    </div>
  );
}
