'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useBookMatch } from '@/context/BookMatchContext';
import { useJourney } from '@/context/JourneyContext';
import { quizQuestions, TOTAL_QUIZ_STEPS } from '@/lib/quiz-data';
import { calculateReaderType } from '@/lib/quiz-scoring';
import { getAdventureLevel } from '@/lib/adventure-level';
import ReadingPowersList from '@/components/ReadingPowersList';
import type { ReaderType } from '@/lib/types';

type QuizMode = 'welcome' | 'question' | 'result' | null;

export default function QuizModal() {
  const { data: session, status } = useSession();
  const { quizOpen, closeQuiz, setReaderTypeId, books } = useBookMatch();
  const { onReaderTypeDiscovered } = useJourney();
  const [mode, setMode] = useState<QuizMode>('welcome');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<ReaderType | null>(null);

  const reset = useCallback(() => {
    setMode('welcome');
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setResult(null);
  }, []);

  useEffect(() => {
    if (quizOpen) reset();
  }, [quizOpen, reset]);

  useEffect(() => {
    if (!quizOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeQuiz();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [quizOpen, closeQuiz]);

  const progressPct =
    mode === 'welcome' ? 0 : mode === 'result' ? 100 : Math.round((step / TOTAL_QUIZ_STEPS) * 100);

  const handleSelect = async (optionIndex: number) => {
    setSelected(optionIndex);
    const newAnswers = [...answers];
    newAnswers[step] = optionIndex;

    setTimeout(async () => {
      if (step + 1 < TOTAL_QUIZ_STEPS) {
        setAnswers(newAnswers);
        setStep(step + 1);
        setSelected(null);
        setMode('question');
      } else {
        const type = calculateReaderType(newAnswers);
        setResult(type);
        setMode('result');
        onReaderTypeDiscovered();
        await setReaderTypeId(type.id);
      }
    }, 450);
  };

  if (!quizOpen || status === 'loading' || !session?.user) return null;

  const q = quizQuestions[step];
  const firstName = session.user.name?.split(' ')[0];
  const isCoverStep = mode === 'question' && q?.isCover;
  const modalClass = `quiz-modal${mode === 'welcome' ? ' quiz-modal--welcome' : ''}${mode === 'result' ? ' quiz-modal--result' : ''}${isCoverStep ? ' quiz-modal--covers' : ''}`;

  return (
    <div
      className={`quiz-overlay active`}
      role="dialog"
      aria-modal="true"
      aria-label="Discover Your Reader Type"
      onClick={(e) => { if (e.target === e.currentTarget) closeQuiz(); }}
    >
      <div className={modalClass}>
        {mode === 'welcome' && (
          <div className="quiz-decor" aria-hidden="true">
            <span className="quiz-float quiz-float--page">📄</span>
            <span className="quiz-float quiz-float--page2">📖</span>
            <span className="quiz-float quiz-float--star">✨</span>
            <span className="quiz-float quiz-float--star2">⭐</span>
          </div>
        )}

        <button type="button" className="quiz-close" aria-label="Close quiz" onClick={closeQuiz}>
          ✕
        </button>

        <div className="quiz-content" aria-live="polite">
          {mode === 'welcome' && (
            <div className="quiz-welcome">
              <div className="quiz-welcome-sparkle">✨</div>
              <h2 className="quiz-welcome-heading">
                {firstName ? (
                  <>
                    Hi {firstName}!
                    <br />
                    Let&apos;s discover you
                  </>
                ) : (
                  <>
                    Let&apos;s discover
                    <br />
                    you!
                  </>
                )}
              </h2>
              <p className="quiz-welcome-sub">
                Every reader is different.
                <br />
                <br />
                What kind of stories
                <br />
                spark your imagination?
              </p>
              <button
                type="button"
                className="cta-btn cta-btn--magic"
                onClick={() => { setMode('question'); setStep(0); }}
              >
                Start my quest ✨
              </button>
              <p className="quiz-time-note">About 1 minute · +50 XP when you finish!</p>
            </div>
          )}

          {mode === 'question' && q && (
            <div className="quiz-question">
              <div className="quiz-step-label">Question {step + 1} of {TOTAL_QUIZ_STEPS}</div>
              <div className="quiz-step-bar">
                {Array.from({ length: TOTAL_QUIZ_STEPS }, (_, i) => (
                  <div
                    key={i}
                    className={`quiz-step-segment${i < step ? ' done' : ''}${i === step ? ' active' : ''}`}
                  />
                ))}
              </div>
              <h2 className="quiz-question-text">{q.question}</h2>
              <div className={`quiz-options${q.isCover ? ' quiz-options--covers' : ''}`}>
                {q.options.map((opt, i) => (
                  q.isCover ? (
                    <button
                      key={opt.label}
                      type="button"
                      className={`quiz-option quiz-cover${selected === i ? ' selected' : ''}`}
                      aria-label={opt.coverBook ? `${opt.label} — ${opt.coverBook}` : opt.label}
                      onClick={() => handleSelect(i)}
                    >
                      <div
                        className="quiz-cover-art"
                        style={opt.coverUrl ? undefined : { background: opt.gradient }}
                      >
                        {opt.coverUrl ? (
                          <Image
                            src={opt.coverUrl}
                            alt={opt.coverBook ? `Cover of ${opt.coverBook}` : opt.label}
                            fill
                            sizes="150px"
                            className="quiz-cover-image"
                            unoptimized
                          />
                        ) : (
                          <span className="quiz-option-emoji">{opt.emoji}</span>
                        )}
                        <span className="quiz-cover-label">{opt.label}</span>
                      </div>
                    </button>
                  ) : (
                    <button
                      key={opt.label}
                      type="button"
                      className={`quiz-option${selected === i ? ' selected' : ''}`}
                      aria-label={opt.label}
                      onClick={() => handleSelect(i)}
                    >
                      <span className="quiz-option-bookmark">🔖</span>
                      <span className="quiz-option-emoji">{opt.emoji}</span>
                      <span className="quiz-option-label">{opt.label}</span>
                      {opt.desc && <span className="quiz-option-desc">{opt.desc}</span>}
                    </button>
                  )
                ))}
              </div>
            </div>
          )}

          {mode === 'result' && result && (
            <>
              <div className="quiz-result-confetti" aria-hidden="true">
                {['✨', '📚', '⭐', '🔖', '🌙', '💫'].map((c, i) => (
                  <span
                    key={c}
                    className="quiz-confetti-piece"
                    style={{ left: `${10 + i * 14}%`, animationDelay: `${i * 0.3}s` }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="quiz-result quiz-result--adventure">
                <div className="quiz-result-badge">🌟 You are {result.name}!</div>
                <div className="quiz-result-type">
                  <span>{result.adventureTitle}</span>
                  <span className="quiz-result-emoji">{result.emoji}</span>
                </div>
                <p className="quiz-result-tagline">{result.kidTagline}</p>
                <ReadingPowersList typeId={result.id} />
                <div className="quiz-result-likes">
                  <div className="quiz-result-likes-title">Your recommended books:</div>
                  {result.recommendedCategories.map((cat) => (
                    <div key={cat} className="quiz-result-like">
                      <span>{cat}</span>
                    </div>
                  ))}
                </div>
                {books.length > 0 && (
                  <>
                    <div className="quiz-result-matches-title">Adventures waiting for you:</div>
                    <div className="quiz-result-books">
                      {books.slice(0, 1).map((book) => {
                        const adv = getAdventureLevel(book.match);
                        return (
                          <div key={book.id} className="quiz-result-book">
                            <div
                              className="quiz-result-book-cover"
                              style={{ background: book.coverUrl ? undefined : book.gradient, position: 'relative', overflow: 'hidden' }}
                            >
                              {book.coverUrl ? (
                                <Image src={book.coverUrl} alt="" fill style={{ objectFit: 'cover' }} unoptimized />
                              ) : (
                                book.emoji
                              )}
                            </div>
                            <div className="quiz-result-book-info">
                              <div className="quiz-result-book-title">{book.title}</div>
                              <div className="quiz-result-book-author">{book.author}</div>
                            </div>
                            <div className={`quiz-result-adventure ${adv.className}`}>
                              {adv.emoji} {adv.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                <div className="quiz-result-xp">+50 XP earned! 🌟</div>
                <button
                  type="button"
                  className="cta-btn cta-btn--magic"
                  onClick={() => {
                    closeQuiz();
                    document.getElementById('section-matches')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Start my adventure →
                </button>
              </div>
            </>
          )}
        </div>

        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </div>
  );
}
