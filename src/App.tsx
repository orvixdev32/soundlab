import { useState } from 'react';
import TopBar from './components/layout/TopBar';
import type { NavTab } from './components/layout/TopBar';
import SceneLibrary from './features/scenes/SceneLibrary';
import type { Scene } from './types/scene';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeCustomizingScene, setActiveCustomizingScene] = useState<Scene | null>(null);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    // If switching tabs away from scenes, we can reset active customizing scene
    if (tab === 'home') {
      setActiveCustomizingScene(null);
    }
  };

  // Determine dynamic background
  const backgroundStyle = activeCustomizingScene
    ? ({ '--current-bg': `url("${activeCustomizingScene.coverImage}")` } as React.CSSProperties)
    : undefined;

  return (
    <div className="page" id="home" style={backgroundStyle}>
      <TopBar activeTab={activeTab} onTabChange={handleTabChange} />

      <main>
        {activeTab === 'home' && (
          <section className="hero-content" aria-labelledby="hero-title">
            <h1 id="hero-title">
              Sound for the state of mind.
            </h1>

            <p className="hero-description">
              Find your atmosphere. Create your space.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() => setActiveTab('scenes')}
              >
                <span>Go to Scenes</span>
              </button>

              <button
                className="button button-secondary"
                type="button"
                onClick={() => setActiveTab('scenes')}
              >
                <span>Browse Soundscapes</span>
              </button>
            </div>
          </section>
        )}

        {activeTab === 'scenes' && (
          <SceneLibrary onSceneChange={setActiveCustomizingScene} />
        )}

        {activeTab === 'about' && (
          <section className="hero-content" style={{ minHeight: '60vh' }}>
            <h1 style={{ fontSize: '2.5rem' }}>About soundlab.</h1>
            <p className="hero-description" style={{ maxWidth: '700px', fontSize: '1.1rem' }}>
              soundlab helps you craft personalized audio environments to boost your productivity,
              focus on study, or relax after a long day.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
