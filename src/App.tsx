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
          <section className="heroCanvas" aria-label="Acoustic Prologue">
            <div className="heroContent">
              <span className="heroStamp">Sound Architecture / 2026</span>
              <h1 className="heroTitle">
                Acoustic spaces for the <span className="heroTitleEm">quiet mind</span>.
              </h1>

              <p className="heroStatement">
                Soundlab is an ambient environment engine. Calibrate multi-layered organic soundscapes,
                attenuate noise, and immerse your space in rain, hearth, and wilderness frequencies.
              </p>

              <div className="heroActions">
                <button
                  type="button"
                  className="btnPrimary"
                  onClick={() => setActiveTab('scenes')}
                >
                  Enter Environments →
                </button>

                <button
                  type="button"
                  className="btnSecondary"
                  onClick={() => setActiveTab('generator')}
                >
                  Synthesize Chamber
                </button>
              </div>
            </div>

            <div className="heroShowcase">
              <img
                src="/images/forest.jpg"
                alt="Rainy Pine Wilderness"
                className="heroImage"
              />
              <div className="showcaseCaption">
                <span className="captionTitle">Rainy Forest</span>
                <span className="captionMeta">Archetype 01 / Nature</span>
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
          <section className="philosophyView" aria-label="Acoustic Manifesto">
            <header className="philosophyHeader">
              <span className="philosophyKicker">Design Manifesto / Core Intent</span>
              <h1 className="philosophyTitle">The Architecture of Silence</h1>
            </header>

            <div className="manifestoSection">
              <p className="leadParagraph">
                Silence is rarely an absence of sound; it is the presence of an atmosphere that
                demands nothing from your attention.
              </p>

              <p className="bodyParagraph">
                Modern software overwhelms with sensory friction. Soundlab was conceived as an acoustic
                antidote: a deliberate, art-directed space that lets you mix natural acoustic layers—from
                the low hum of an alpine rainstorm to the dry crackle of evening pine wood.
              </p>

              <div className="principleGrid">
                <div className="principleCard">
                  <div className="principleNumber">01 / Organic Stratification</div>
                  <h3 className="principleHeading">Real Layered Channels</h3>
                  <p className="principleText">
                    Soundscapes are never single flat tracks. They are living multi-track balances of
                    wind, precipitation, timber, and spatial acoustics.
                  </p>
                </div>

                <div className="principleCard">
                  <div className="principleNumber">02 / Restrained Digital Craft</div>
                  <h3 className="principleHeading">Functional Minimalism</h3>
                  <p className="principleText">
                    No neon glows, no synthetic dashboard fatigue. Every surface, fader, and typographic
                    measure is calibrated for prolonged listening comfort.
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
