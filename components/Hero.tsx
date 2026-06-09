'use client';

import Image from 'next/image';
import { useBookMatch } from '@/context/BookMatchContext';

interface HeroProps {
  onBrowseBooks: () => void;
}

export default function Hero({ onBrowseBooks }: HeroProps) {
  const { openQuiz, isSignedIn, readerType } = useBookMatch();

  return (
    <section className="hero-banner" id="section-home">
      <div className="hero-banner-scene" aria-hidden="true">
        <Image
          src="/bookmatch2_header.png"
          alt=""
          fill
          priority
          sizes="(max-width: 820px) 100vw, 900px"
          className="hero-banner-image"
        />
      </div>
      <div className="hero-banner-content">
        <h1 className="hero-banner-heading">
          Discover your
          <br />
          <em>reading adventure</em>
        </h1>
        <p className="hero-banner-sub">
          {readerType
            ? `You're ${readerType.name}! Explore stories picked for your reading style.`
            : isSignedIn
              ? 'Answer a few fun questions, find your reader type, and unlock stories made just for you.'
              : 'Sign in to take the reader quiz and unlock personalized book adventures.'}
        </p>
        <div className="hero-banner-actions">
          {readerType ? (
            <button type="button" className="cta-btn cta-btn--primary" onClick={onBrowseBooks}>
              Explore your matches ✨
            </button>
          ) : (
            <button type="button" className="cta-btn cta-btn--primary" onClick={openQuiz}>
              {isSignedIn ? 'Discover My Reader Type ✨' : 'Sign in to take the quiz ✨'}
            </button>
          )}
          <button type="button" className="cta-btn cta-btn--ghost" onClick={onBrowseBooks}>
            Browse Books
          </button>
        </div>
      </div>
    </section>
  );
}
