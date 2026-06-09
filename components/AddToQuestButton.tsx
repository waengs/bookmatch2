'use client';

import type { Book } from '@/lib/types';
import { useReadingQuest } from '@/context/ReadingQuestContext';

interface AddToQuestButtonProps {
  book: Book;
  className?: string;
  compact?: boolean;
}

export default function AddToQuestButton({ book, className = '', compact = false }: AddToQuestButtonProps) {
  const { isSignedIn, isInQuest, addBook, isComplete, slotsLeft, loading } = useReadingQuest();
  const inQuest = isInQuest(book);

  if (!isSignedIn) return null;
  if (isComplete) return null;

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (inQuest || slotsLeft === 0) return;
    await addBook(book);
  }

  const label = inQuest ? 'In quest' : slotsLeft === 0 ? 'Quest full' : 'Add to quest';

  return (
    <button
      type="button"
      className={`quest-add-btn${inQuest ? ' quest-add-btn--added' : ''}${className ? ` ${className}` : ''}`}
      onClick={handleClick}
      disabled={loading || inQuest || slotsLeft === 0}
      aria-pressed={inQuest}
      title={label}
    >
      {compact ? (inQuest ? '✓' : '+') : label}
    </button>
  );
}
