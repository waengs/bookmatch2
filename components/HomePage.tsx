'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useBookMatch } from '@/context/BookMatchContext';
import Sidebar from '@/components/Sidebar';
import Hero from '@/components/Hero';
import BookMatchIntro from '@/components/BookMatchIntro';
import BookGrid from '@/components/BookGrid';
import QuizModal from '@/components/QuizModal';
import AuthButton from '@/components/AuthButton';
import ReaderQuest from '@/components/ReaderQuest';
import SuperpowersSection from '@/components/SuperpowersSection';
import FeaturedAdventure from '@/components/FeaturedAdventure';
import BookSearch from '@/components/BookSearch';
import QuestsPanel from '@/components/QuestsPanel';
import RewardsPanel from '@/components/RewardsPanel';
import MePanel from '@/components/MePanel';
import ReaderIdentityCard from '@/components/ReaderIdentityCard';

export default function HomePage() {
  const { data: session } = useSession();
  const { readerType, readerTypeId, books, booksLoading, openQuiz, hydrated } = useBookMatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [exploreSearch, setExploreSearch] = useState<{ q?: string; genres?: string[] }>({});

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const menuBtn = document.getElementById('menu-btn');
      if (
        window.innerWidth <= 820 &&
        sidebar?.classList.contains('open') &&
        !sidebar.contains(e.target as Node) &&
        e.target !== menuBtn
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Open quiz after sign-in redirect (?quiz=1) or first visit for signed-in users
  useEffect(() => {
    if (!hydrated || !session?.user) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('quiz') === '1') {
      openQuiz();
      window.history.replaceState({}, '', '/');
      return;
    }

    if (readerTypeId) return;
    if (sessionStorage.getItem('bookmatch-quiz-opened')) return;
    sessionStorage.setItem('bookmatch-quiz-opened', '1');
    const t = setTimeout(() => openQuiz(), 600);
    return () => clearTimeout(t);
  }, [hydrated, readerTypeId, openQuiz, session?.user]);

  const firstName = session?.user?.name?.split(' ')[0];
  const greeting = firstName ? `Welcome, ${firstName}! ✨` : 'Welcome, adventurer! ✨';

  const matchesTitle = readerType
    ? `More Adventures for ${readerType.name.replace('The ', '')}s`
    : 'Your story adventures';

  const handleNav = (id: string, sectionId?: string) => {
    setActiveNav(id);
    if (window.innerWidth <= 820) setSidebarOpen(false);
    if (sectionId) {
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  const browseBooks = () => {
    setExploreSearch({});
    handleNav('explore');
  };

  const startQuestSearch = (genres: string[]) => {
    if (!readerTypeId) {
      openQuiz();
      return;
    }
    setExploreSearch({ genres });
    setActiveNav('explore');
    if (window.innerWidth <= 820) setSidebarOpen(false);
    window.setTimeout(() => {
      document.getElementById('section-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const showBooksLoading = booksLoading && books.length === 0;

  return (
    <>
      <Sidebar open={sidebarOpen} activeNav={activeNav} onNavClick={handleNav} />

      <main className="main-content main-content--mock">
        <header className="topbar topbar--mock">
          <button
            type="button"
            className="menu-btn"
            id="menu-btn"
            aria-label="Toggle menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="topbar-greeting topbar-greeting--mock">{greeting}</h1>
          <div className="topbar-actions">
            <AuthButton showName onProfileClick={() => handleNav('me')} />
          </div>
        </header>

        {activeNav === 'home' && (
          <>
            <Hero onBrowseBooks={browseBooks} />
            {readerType && (
              <ReaderIdentityCard variant="header" onViewProfile={() => handleNav('me')} />
            )}
            <BookMatchIntro />
            <div className="home-dashboard-row">
              <ReaderQuest />
              <FeaturedAdventure
                books={books}
                totalCount={books.length}
                loading={showBooksLoading && !!readerType}
                onViewAll={browseBooks}
              />
            </div>
            <SuperpowersSection />
            {!readerType && (
              <section className="quiz-promo-card quiz-promo-card--mock">
                <div className="quiz-promo-emoji">✨</div>
                <div>
                  <h2 className="quiz-promo-title">Start your reader quest!</h2>
                  <p className="quiz-promo-desc">Discover who you are as a reader and unlock your personalized library.</p>
                </div>
                <button type="button" className="cta-btn cta-btn--primary" onClick={openQuiz}>
                  Begin ✨
                </button>
              </section>
            )}
            {readerType && books.length > 1 && (
              <BookGrid
                books={books.slice(1)}
                loading={showBooksLoading}
                title={matchesTitle}
                hasReaderType={!!readerType}
                onTakeQuiz={openQuiz}
                showQuestActions={!!session?.user}
              />
            )}
          </>
        )}

        {activeNav === 'explore' && (
          <>
            <BookSearch
              key={`${exploreSearch.q ?? ''}-${exploreSearch.genres?.join(',') ?? ''}`}
              initialQuery={exploreSearch.q ?? ''}
              initialGenres={exploreSearch.genres ?? []}
            />
            {readerType && (
              <BookGrid
                books={books}
                loading={showBooksLoading}
                title={matchesTitle}
                hasReaderType={!!readerType}
                onTakeQuiz={openQuiz}
                showQuestActions={!!session?.user}
              />
            )}
          </>
        )}

        {activeNav === 'quests' && <QuestsPanel onStartQuest={startQuestSearch} />}
        {activeNav === 'rewards' && <RewardsPanel />}
        {activeNav === 'me' && <MePanel />}
      </main>

      <QuizModal />
    </>
  );
}
