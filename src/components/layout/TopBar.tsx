import React from 'react';
import styles from './TopBar.module.css';

export type NavTab = 'home' | 'scenes' | 'generator' | 'about';

interface TopBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isPlaying?: boolean;
}

const navigationItems: { label: string; tab: NavTab }[] = [
  { label: 'Overview', tab: 'home' },
  { label: 'Soundscapes', tab: 'scenes' },
  { label: 'Constructor', tab: 'generator' },
  { label: 'Philosophy', tab: 'about' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  isPlaying = false,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.brandGroup}>
        <button
          type="button"
          className={styles.logo}
          onClick={() => onTabChange('home')}
          aria-label="Soundlab home"
        >
          soundlab<span className={styles.logoDot} />
        </button>
        <span className={styles.tagline}>Acoustic Sanctuaries</span>
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => onTabChange(item.tab)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className={styles.actions}>
        <div className={styles.statusIndicator}>
          <span
            className={styles.statusDot}
            style={isPlaying ? { backgroundColor: 'var(--accent-amber)' } : undefined}
          />
          <span>{isPlaying ? 'Engine Live' : 'Engine Ready'}</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
