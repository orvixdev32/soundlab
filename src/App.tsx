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
    if (tab !== 'scenes') {
      setActiveCustomizingScene(null);
    }
  };

  const handleSceneCreated = (newScene: Scene) => {
    setAllScenes((prev) => [newScene, ...prev]);
    setActiveTab('scenes');
    setActiveCustomizingScene(newScene);
  };

  return (
    <div className="page" id="top">
      <TopBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isPlaying={Boolean(activeCustomizingScene)}
      />

      <main>
        {activeTab === 'home' && (
          <section className="heroCanvas">
            <div className="heroContent">
              <h1 className="heroTitle">
                Sounds for the <span className="heroTitleEm">quiet mind</span>.
              </h1>

              <p className="heroStatement">
                Soundlab helps you build personalized sound environments for focus, rest, and creativity.
                Layer rain, wind, fire, and more — then shape the mix to suit the moment.
              </p>

              <div className="heroActions">
                <button
                  type="button"
                  className="btnPrimary"
                  onClick={() => setActiveTab('scenes')}
                >
                  Browse Scenes →
                </button>

                <button
                  type="button"
                  className="btnSecondary"
                  onClick={() => setActiveTab('generator')}
                >
                  Create a Scene
                </button>
              </div>
            </div>

            <div className="heroShowcase">
              <img
                src="/images/forest.jpg"
                alt="Rainy forest"
                className="heroImage"
              />
              <div className="showcaseCaption">
                <span className="captionTitle">Rainy Forest</span>
                <span className="captionMeta">Nature · 4 layers</span>
              </div>
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
          <section className="philosophyView">
            <header className="philosophyHeader">
              <h1 className="philosophyTitle">About Soundlab</h1>
            </header>

            <div className="manifestoSection">
              <p className="leadParagraph">
                Silence is rarely an absence of sound — it is the presence of an atmosphere
                that asks nothing of your attention.
              </p>

              <p className="bodyParagraph">
                Soundlab was built as an antidote to sensory overload: a simple, focused tool
                for mixing natural audio layers — rain, wind, fire, birdsong, and city ambience —
                into an environment that works for you.
              </p>

              <div className="principleGrid">
                <div className="principleCard">
                  <h3 className="principleHeading">Layered by design</h3>
                  <p className="principleText">
                    Good soundscapes are never a single flat track. They are a live balance of
                    multiple sounds, each adjusted to feel natural together.
                  </p>
                </div>

                <div className="principleCard">
                  <h3 className="principleHeading">Simple on purpose</h3>
                  <p className="principleText">
                    No synthetic dashboard fatigue. Every surface, fader, and label is shaped
                    for extended, comfortable listening sessions.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
