import React from 'react';
import styles from './TopBar.module.css';

export type NavTab = 'home' | 'scenes' | 'generator' | 'about';

interface TopBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isPlaying?: boolean;
  playingSceneTitle?: string;
  onOpenCurrentScene?: () => void;
}

const navigationItems: { label: string; tab: NavTab }[] = [
  { label: 'Home', tab: 'home' },
  { label: 'Scenes', tab: 'scenes' },
  { label: 'Constructor', tab: 'generator' },
  { label: 'About', tab: 'about' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  isPlaying = false,
  playingSceneTitle,
  onOpenCurrentScene,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftGroup}>
          <button
            type="button"
            className={styles.logo}
            onClick={() => onTabChange('home')}
            aria-label="Soundlab homepage"
          >
            <span className={styles.logoIcon}>♫</span>
            <span className={styles.logoText}>
              sound<strong>lab</strong>
            </span>
          </button>

          <nav className={styles.nav} aria-label="Main Navigation">
            {navigationItems.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  type="button"
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  onClick={() => onTabChange(item.tab)}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className={styles.rightGroup}>
          {isPlaying && (
            <div className={styles.nowPlayingWidget}>
              <span className={styles.playingDot} />
              <span className={styles.playingLabel}>
                Playing: {playingSceneTitle || 'Atmosphere'}
              </span>
              {onOpenCurrentScene && (
                <button
                  type="button"
                  className={styles.jumpToPlayerBtn}
                  onClick={onOpenCurrentScene}
                >
                  Open Player
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            className={styles.createBtn}
            onClick={() => onTabChange('generator')}
          >
            + Create Scene
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
