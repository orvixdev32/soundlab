import React, { useState } from 'react';
import type { Scene } from '../../types/scene';
import SceneCard from './SceneCard';
import SceneDetailView from './SceneDetailView';
import styles from './SceneLibrary.module.css';

interface SceneLibraryProps {
  scenes: Scene[];
  onSceneChange?: (scene: Scene | null) => void;
  onOpenConstructor?: () => void;
  isPlaying?: boolean;
}

export const SceneLibrary: React.FC<SceneLibraryProps> = ({
  scenes,
  onSceneChange,
  onOpenConstructor,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCustomizingScene, setActiveCustomizingScene] = useState<Scene | null>(null);

  const categories = ['all', 'nature', 'urban', 'focus', 'relax'];

  const filteredScenes =
    selectedCategory === 'all'
      ? scenes
      : scenes.filter((scene) => scene.category === selectedCategory);

  const handleOpenScene = (scene: Scene) => {
    setActiveCustomizingScene(scene);
    if (onSceneChange) {
      onSceneChange(scene);
    }
  };

  const handleBackToLibrary = () => {
    setActiveCustomizingScene(null);
    if (onSceneChange) {
      onSceneChange(null);
    }
  };

  if (activeCustomizingScene) {
    return (
      <SceneDetailView
        scene={activeCustomizingScene}
        onBack={handleBackToLibrary}
      />
    );
  }

  return (
    <section className={styles.container} aria-label="Curated Atmospheres Archive">
      <header className={styles.editorialHeader}>
        <div className={styles.leadColumn}>
          <span className={styles.kicker}>Index of Atmospheres / v2.4</span>
          <h1 className={styles.heading}>
            Curated environments for <span className={styles.headingEm}>deep focus</span> & reverie.
          </h1>
        </div>
        <p className={styles.description}>
          Every soundscape is an acoustic ecosystem composed of multi-channel audio layers.
          Step inside to calibrate individual frequencies, winds, precipitation, and room acoustics.
        </p>
      </header>

      <div className={styles.controlBar}>
        <div className={styles.filterGroup} role="tablist" aria-label="Filter by mood">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`${styles.filterButton} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {onOpenConstructor && (
          <button
            type="button"
            className={styles.newSceneBtn}
            onClick={onOpenConstructor}
          >
            <span>+ Construct Soundscape</span>
          </button>
        )}
      </div>

      <div className={styles.galleryGrid}>
        {filteredScenes.map((scene) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            isActive={false}
            onOpen={handleOpenScene}
          />
        ))}
      </div>
    </section>
  );
};

export default SceneLibrary;
