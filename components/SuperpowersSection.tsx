'use client';

import { useState } from 'react';
import { READING_POWERS } from '@/lib/reading-powers';

interface SuperpowersSectionProps {
  compact?: boolean;
}

export default function SuperpowersSection({ compact = false }: SuperpowersSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const mobilePower = READING_POWERS[mobileIndex];

  return (
    <section className={`superpowers-section superpowers-section--mock${compact ? ' superpowers-section--compact' : ''}`} id="section-superpowers">
      <div className="superpowers-layout">
        <div className="superpowers-main">
          <h2 className="superpowers-title">Reading Gives You Superpowers</h2>
          <p className="superpowers-sub">Every book you read helps you grow</p>

          <div className="power-grid-mock">
            {READING_POWERS.map((power) => (
              <button
                key={power.id}
                type="button"
                className={`power-card-mock${activeId === power.id ? ' power-card-mock--active' : ''}`}
                style={{ background: power.cardBg }}
                onClick={() => setActiveId((prev) => (prev === power.id ? null : power.id))}
                aria-pressed={activeId === power.id}
              >
                <span className="power-card-mock-emoji">{power.emoji}</span>
                <span className="power-card-mock-title">{power.displayTitle}</span>
                {activeId === power.id && (
                  <span className="power-card-mock-desc">{power.boostDesc}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="superpowers-illustration" aria-hidden="true">
          <div className="superpowers-illustration-scene">
            <span className="superpowers-illustration-girl">📖</span>
            <span className="superpowers-illustration-grass">🌿</span>
          </div>
        </div>
      </div>

      <div className="power-carousel">
        <button
          type="button"
          className="power-carousel-btn"
          aria-label="Previous power"
          onClick={() => setMobileIndex((i) => (i - 1 + READING_POWERS.length) % READING_POWERS.length)}
        >
          ‹
        </button>
        <div className="power-carousel-slide" style={{ background: mobilePower.cardBg }}>
          <div className="power-carousel-counter">
            {mobileIndex + 1} / {READING_POWERS.length}
          </div>
          <span className="power-carousel-emoji">{mobilePower.emoji}</span>
          <h3 className="power-carousel-title">{mobilePower.displayTitle}</h3>
          <p className="power-carousel-desc">{mobilePower.boostDesc}</p>
        </div>
        <button
          type="button"
          className="power-carousel-btn"
          aria-label="Next power"
          onClick={() => setMobileIndex((i) => (i + 1) % READING_POWERS.length)}
        >
          ›
        </button>
      </div>
    </section>
  );
}
