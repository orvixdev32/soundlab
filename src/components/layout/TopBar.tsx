import styles from './TopBar.module.css';

const navigationItems = [
  { label: 'Home', href: '#home' },
  { label: 'Scenes', href: '#scenes' },
  { label: 'About', href: '#about' },
];

function TopBar() {
  return (
    <header className={styles.topBar}>
      <a className={styles.logo} href="#home">
        soundlab.
      </a>

      <nav
        className={styles.navigation}
        aria-label="Main navigation"
      >
        {navigationItems.map((item) => (
          <a
            key={item.label}
            className={styles.link}
            href={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <a className={styles.contact} href="#contact">
        Contact
      </a>
    </header>
  );
}

export default TopBar;