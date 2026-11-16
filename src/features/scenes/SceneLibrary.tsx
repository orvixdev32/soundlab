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

  const categories = [
    { id: 'all', label: 'All Scenes' },
    { id: 'nature', label: 'Nature' },
    { id: 'urban', label: 'Urban' },
    { id: 'focus', label: 'Focus' },
    { id: 'relax', label: 'Relax' },
  ];

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
    <section className={styles.container} aria-label="Soundscape Library">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Soundscapes</h1>
          <p className={styles.subtitle}>
            Explore and listen to multi-layered sound environments. Click any scene to adjust the mix.
          </p>
        </div>

        {onOpenConstructor && (
          <button
            type="button"
            className={styles.newSceneBtn}
            onClick={onOpenConstructor}
          >
            + Create Scene
          </button>
        )}
      </div>

      <div className={styles.filterBar}>
        <div className={styles.categoryTabs} role="tablist">
          {categories.map((cat) => {
            const count =
              cat.id === 'all'
                ? scenes.length
                : scenes.filter((s) => s.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                className={`${styles.tabBtn} ${selectedCategory === cat.id ? styles.tabBtnActive : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label} <span className={styles.countBadge}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredScenes.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No soundscapes found in this category.</p>
          <button
            type="button"
            className={styles.resetFilterBtn}
            onClick={() => setSelectedCategory('all')}
          >
            Show all scenes
          </button>
        </div>
      ) : (
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
      )}
    </section>
  );
};

export default SceneLibrary;
