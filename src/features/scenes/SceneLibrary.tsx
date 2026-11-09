import React, { useState } from 'react';
import { presetScenes } from '../../data/presets';
import type { Scene } from '../../types/scene';
import SceneCard from './SceneCard';
import SceneDetailView from './SceneDetailView';
import styles from './SceneLibrary.module.css';

interface SceneLibraryProps {
  onSceneChange?: (scene: Scene | null) => void;
}

export const SceneLibrary: React.FC<SceneLibraryProps> = ({ onSceneChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCustomizingScene, setActiveCustomizingScene] = useState<Scene | null>(null);

  const categories = ['all', 'nature', 'urban', 'focus', 'relax'];

  const filteredScenes = selectedCategory === 'all'
    ? presetScenes
    : presetScenes.filter((scene) => scene.category === selectedCategory);

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
    <section id="scenes" className={styles.librarySection} aria-label="Scene Library">
      <div className={styles.header}>
        <span className={styles.tagline}>Atmospheres</span>
        <h2 className={styles.title}>Curated Soundscapes</h2>
        <p className={styles.subtitle}>
          Select a preset atmosphere to enter its dedicated scene space and fine-tune each sound layer.
        </p>
      </div>

      <div className={styles.filterBar} role="tablist" aria-label="Filter scenes by mood">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`${styles.filterBtn} ${selectedCategory === category ? styles.activeFilter : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
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
