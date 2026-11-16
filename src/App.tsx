import { useState } from 'react';
import TopBar from './components/layout/TopBar';
import type { NavTab } from './components/layout/TopBar';
import SceneLibrary from './features/scenes/SceneLibrary';
import SceneGenerator from './features/scenes/SceneGenerator';
import SceneDetailView from './features/scenes/SceneDetailView';
import { presetScenes } from './data/presets';
import type { Scene } from './types/scene';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [allScenes, setAllScenes] = useState<Scene[]>(presetScenes);
  const [activeCustomizingScene, setActiveCustomizingScene] = useState<Scene | null>(null);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    // If navigating to home, generator or about, reset active scene background
    if (tab !== 'scenes') {
      setActiveCustomizingScene(null);
    }
  };

  const handleSceneCreated = (newScene: Scene) => {
    // Add new scene to beginning of list
    setAllScenes((prev) => [newScene, ...prev]);
    // Switch to Scenes tab and immediately open the created scene in mixer
    setActiveTab('scenes');
    setActiveCustomizingScene(newScene);
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
                onClick={() => setActiveTab('generator')}
              >
                <span>Create Custom Scene</span>
              </button>
            </div>
          </section>
        )}

        {activeTab === 'scenes' && (
          activeCustomizingScene ? (
            <SceneDetailView
              scene={activeCustomizingScene}
              onBack={() => setActiveCustomizingScene(null)}
            />
          ) : (
            <SceneLibrary
              scenes={allScenes}
              onSceneChange={setActiveCustomizingScene}
              onOpenConstructor={() => setActiveTab('generator')}
            />
          )
        )}

        {activeTab === 'generator' && (
          <SceneGenerator onSceneCreated={handleSceneCreated} />
        )}

        {activeTab === 'about' && (
          <section className="hero-content" style={{ minHeight: '60vh' }}>
            <h1 style={{ fontSize: '2.5rem' }}>About soundlab.</h1>
            <p className="hero-description" style={{ maxWidth: '700px', fontSize: '1.1rem' }}>
              soundlab helps you craft personalized audio environments to boost your productivity,
              focus on study, or relax after a long day. Mix existing curated scenes or construct your own unique soundscapes.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
