import { useState } from 'react';
import TopBar from './components/layout/TopBar';
import type { NavTab } from './components/layout/TopBar';
import SceneLibrary from './features/scenes/SceneLibrary';
import SceneGenerator from './features/scenes/SceneGenerator';
import SceneDetailView from './features/scenes/SceneDetailView';
import SceneCard from './features/scenes/SceneCard';
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

  const handleOpenScene = (scene: Scene) => {
    setActiveCustomizingScene(scene);
    setActiveTab('scenes');
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
        playingSceneTitle={activeCustomizingScene?.title}
        onOpenCurrentScene={() => {
          setActiveTab('scenes');
        }}
      />

      <main className="mainContent">
        {activeTab === 'home' && (
          <div className="homeContainer">
            {/* Practical Hero Banner */}
            <section className="heroBanner">
              <div className="heroTextColumn">
                <span className="heroKicker">Ambient Sound Mixer</span>
                <h1 className="heroTitle">
                  Atmospheric sounds for focus, study, and relaxation.
                </h1>
                <p className="heroDescription">
                  Soundlab lets you blend natural audio layers — gentle rain, distant wind, campfire, and café ambience — into a personalized listening environment.
                </p>

                <div className="heroButtonRow">
                  <button
                    type="button"
                    className="btnPrimary"
                    onClick={() => setActiveTab('scenes')}
                  >
                    Browse Soundscapes
                  </button>

                  <button
                    type="button"
                    className="btnSecondary"
                    onClick={() => setActiveTab('generator')}
                  >
                    Create Custom Scene
                  </button>
                </div>
              </div>

              <div className="heroCardColumn">
                <div className="featuredCard">
                  <div className="featuredCardImage">
                    <img
                      src="/images/forest.jpg"
                      alt="Rainy Forest"
                      className="featuredImg"
                    />
                    <span className="featuredBadge">Popular Scene</span>
                  </div>
                  <div className="featuredCardBody">
                    <div className="featuredCardHeader">
                      <div>
                        <h3 className="featuredCardTitle">Rainy Forest</h3>
                        <span className="featuredCardMeta">Nature · 4 sound layers</span>
                      </div>
                      <button
                        type="button"
                        className="btnPlayQuick"
                        onClick={() => handleOpenScene(presetScenes[0])}
                      >
                        Listen ▶
                      </button>
                    </div>
                    <p className="featuredCardDesc">
                      Gentle precipitation on pine needles with distant wind and woodland stream.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Soundscapes Grid */}
            <section className="featuredSection">
              <div className="sectionHeader">
                <div>
                  <h2 className="sectionTitle">Featured Soundscapes</h2>
                  <p className="sectionSubtitle">Handcrafted ambient environments ready to play.</p>
                </div>
                <button
                  type="button"
                  className="linkBtn"
                  onClick={() => setActiveTab('scenes')}
                >
                  View all ({allScenes.length}) →
                </button>
              </div>

              <div className="featuredGrid">
                {allScenes.slice(0, 3).map((scene) => (
                  <SceneCard
                    key={scene.id}
                    scene={scene}
                    isActive={false}
                    onOpen={handleOpenScene}
                  />
                ))}
              </div>
            </section>

            {/* 3-Step How It Works Box */}
            <section className="guideSection">
              <h2 className="guideTitle">How Soundlab Works</h2>
              <div className="guideGrid">
                <div className="guideItem">
                  <div className="guideNumber">1</div>
                  <h3 className="guideHeading">Select an atmosphere</h3>
                  <p className="guideText">
                    Choose from curated scenes like forest rain, cozy hearth, or city coffee shops.
                  </p>
                </div>

                <div className="guideItem">
                  <div className="guideNumber">2</div>
                  <h3 className="guideHeading">Tune the layers</h3>
                  <p className="guideText">
                    Every environment has individual channels. Adjust each fader or mute sounds to suit your ears.
                  </p>
                </div>

                <div className="guideItem">
                  <div className="guideNumber">3</div>
                  <h3 className="guideHeading">Set a sleep timer</h3>
                  <p className="guideText">
                    Set a 15 to 60 minute timer for focused study sprints or to fall asleep peacefully.
                  </p>
                </div>
              </div>
            </section>
          </div>
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
          <div className="aboutContainer">
            <div className="aboutPanel">
              <h1 className="aboutTitle">About Soundlab</h1>
              <p className="aboutLead">
                Soundlab is an independent, distraction-free ambient audio mixer built for concentration, meditation, and rest.
              </p>

              <hr className="aboutDivider" />

              <h2 className="aboutSectionHeading">Why we built this</h2>
              <p className="aboutText">
                Many modern sound apps are crowded with subscription popups, complicated menus, or algorithmic feeds. We wanted something simpler: a clean web application where you can open a soundscape, balance the rain and wind exactly the way you like, and get to work or go to sleep.
              </p>

              <h2 className="aboutSectionHeading">Key Features</h2>
              <ul className="aboutFeatureList">
                <li>
                  <strong>Independent Sound Layers:</strong> Each scene is composed of multiple real sound recordings rather than a single repeating loop. You control the volume of every element.
                </li>
                <li>
                  <strong>Sleep & Focus Timer:</strong> Choose 15, 30, 45, or 60 minutes. Audio fades out smoothly at the end so it never jolts you awake.
                </li>
                <li>
                  <strong>Scene Constructor:</strong> Mix any combination of available audio channels, name your scene, and select a cover image.
                </li>
                <li>
                  <strong>Direct Web Audio:</strong> Everything runs locally in your browser using the Web Audio API with minimal resource usage.
                </li>
              </ul>

              <hr className="aboutDivider" />

              <p className="aboutFooterNote">
                Built with React, TypeScript, and the Web Audio API. Designed with practicality and simplicity in mind.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Practical Footer */}
      <footer className="footer">
        <div className="footerContainer">
          <div className="footerLeft">
            <span className="footerBrand">soundlab</span>
            <span className="footerTagline">— Ambient audio tool for focus & rest</span>
          </div>
          <div className="footerNav">
            <button type="button" onClick={() => setActiveTab('home')}>Home</button>
            <button type="button" onClick={() => setActiveTab('scenes')}>Scenes</button>
            <button type="button" onClick={() => setActiveTab('generator')}>Constructor</button>
            <button type="button" onClick={() => setActiveTab('about')}>About</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
