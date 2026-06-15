'use client';

import { useEffect, useRef } from 'react';
import { useBookMatch } from '@/context/BookMatchContext';
import { useCollection } from '@/context/CollectionContext';
import { useReadingQuest } from '@/context/ReadingQuestContext';
import { useJourney } from '@/context/JourneyContext';

/** Syncs local journey badges/XP from server account progress (quiz, collection, reviews). */
export default function JourneySync() {
  const { readerTypeId, hydrated } = useBookMatch();
  const { savedBooks, loading: collectionLoading } = useCollection();
  const { reviewedCount, loading: questLoading } = useReadingQuest();
  const { syncProgress } = useJourney();
  const lastSyncRef = useRef('');

  const collectionReviewCount = savedBooks.filter((b) => b.review).length;
  const totalReviewCount = Math.max(reviewedCount, collectionReviewCount);

  useEffect(() => {
    if (!hydrated || collectionLoading || questLoading) return;

    const key = `${readerTypeId ?? ''}|${savedBooks.length}|${totalReviewCount}`;
    if (lastSyncRef.current === key) return;
    lastSyncRef.current = key;

    syncProgress({
      hasReaderType: !!readerTypeId,
      collectionCount: savedBooks.length,
      reviewCount: totalReviewCount,
    });
  }, [
    hydrated,
    readerTypeId,
    savedBooks.length,
    totalReviewCount,
    collectionLoading,
    questLoading,
    syncProgress,
  ]);

  return null;
}
