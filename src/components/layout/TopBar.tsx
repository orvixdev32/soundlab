import React from 'react';
import styles from './TopBar.module.css';

export type NavTab = 'home' | 'scenes' | 'about';

interface TopBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const navigationItems: { label: string; tab: NavTab }[] = [
  { label: 'Home', tab: 'home' },
  { label: 'Scenes', tab: 'scenes' },
  { label: 'About', tab: 'about' },
];

export const TopBar: React.FC<TopBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className={styles.topBar}>
      <button
        type="button"
        className={styles.logo}
        onClick={() => onTabChange('home')}
      >
        soundlab.
      </button>

      <nav className={styles.navigation} aria-label="Main navigation">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              className={`${styles.link} ${isActive ? styles.activeLink : ''}`}
              onClick={() => onTabChange(item.tab)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        className={styles.contact}
        onClick={() => onTabChange('about')}
      >
        About
      </button>
    </header>
  );
};

export default TopBar;
