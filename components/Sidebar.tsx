'use client';

import { useJourney } from '@/context/JourneyContext';
import { useCollection } from '@/context/CollectionContext';
import AppLogo from '@/components/AppLogo';
import ReaderIdentityCard from '@/components/ReaderIdentityCard';
import { NAV_ICONS } from '@/components/NavIcons';

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'explore', label: 'Explore' },
  { id: 'quests', label: 'Quests' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'me', label: 'Me' },
] as const;

interface SidebarProps {
  open: boolean;
  activeNav: string;
  onNavClick: (id: string, sectionId?: string) => void;
  onStreakClick?: () => void;
}

export default function Sidebar({ open, activeNav, onNavClick, onStreakClick }: SidebarProps) {
  const { journey } = useJourney();
  const { savedBooks, isSignedIn: hasCollection } = useCollection();

  return (
    <aside className={`sidebar sidebar--light${open ? ' open' : ''}`} id="sidebar">
      <div className="sidebar-logo">
        <AppLogo priority className="app-logo--sidebar" />
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.id];
          return (
            <a
              key={item.id}
              href="#"
              className={`nav-item nav-item--light${activeNav === item.id ? ' active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                onNavClick(item.id);
              }}
            >
              <span className="nav-icon"><Icon /></span>
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <ReaderIdentityCard variant="sidebar" onViewProfile={() => onNavClick('me')} />

        {hasCollection && (
          <button
            type="button"
            className="streak-card streak-card--collection"
            onClick={() => onNavClick('me', 'section-collection')}
          >
            <span className="streak-card-icon">📚</span>
            <div>
              <div className="streak-card-label">My Collection</div>
              <div className="streak-card-val">
                {savedBooks.length > 0 ? `${savedBooks.length} saved` : 'View collection'}
              </div>
            </div>
          </button>
        )}

        <button
          type="button"
          className="streak-card streak-card--clickable"
          onClick={() => onStreakClick?.()}
        >
          <span className="streak-card-icon">🔥</span>
          <div>
            <div className="streak-card-label">Reading Streak</div>
            <div className="streak-card-val">{journey.streak} days</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
