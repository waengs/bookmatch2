import { quizQuestions } from './quiz-data';
import { readerTypes } from './reader-types';
import type { ReaderType, ReaderTypeId } from './types';

export function calculateReaderType(answers: number[]): ReaderType {
  const scores: Record<ReaderTypeId, number> = {
    dreamer: 0,
    adventurer: 0,
    detective: 0,
    romantic: 0,
    comfort: 0,
    thinker: 0,
    shadow: 0,
    challenger: 0,
  };

  answers.forEach((optionIndex, qIndex) => {
    const option = quizQuestions[qIndex]?.options[optionIndex];
    if (!option?.scores) return;
    for (const [typeId, points] of Object.entries(option.scores)) {
      scores[typeId as ReaderTypeId] += points;
    }
  });

  let topId: ReaderTypeId = 'dreamer';
  let topScore = -1;
  for (const [id, score] of Object.entries(scores) as [ReaderTypeId, number][]) {
    if (score > topScore) {
      topScore = score;
      topId = id;
    }
  }

  return readerTypes[topId];
}
