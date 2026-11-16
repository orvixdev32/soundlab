import React from 'react';
import type { Scene } from '../../types/scene';
import styles from './SceneCard.module.css';

interface SceneCardProps {
  scene: Scene;
  isActive: boolean;
  onOpen: (scene: Scene) => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, onOpen }) => {
  return (
    <article
      className={styles.card}
      onClick={() => onOpen(scene)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(scene);
        }
      }}
      aria-label={`Enter soundscape: ${scene.title}`}
    >
      <div className={styles.mediaFrame}>
        <img
          src={scene.coverImage}
          alt={scene.title}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.metaOverlay}>
          <span className={styles.categoryTag}>{scene.category}</span>
          <span className={styles.layerCount}>{scene.layers.length} Layers</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{scene.title}</h3>
        </div>
        <div className={styles.subtitle}>{scene.subtitle}</div>
        <p className={styles.description}>{scene.description}</p>

        <div className={styles.footer}>
          <div className={styles.layersPreview}>
            <span className={styles.layerItem}>
              {scene.layers.slice(0, 3).map((l) => l.name).join(' · ')}
              {scene.layers.length > 3 ? ' +' : ''}
            </span>
          </div>
          <span className={styles.actionPrompt}>Enter Environment →</span>
        </div>
      </div>
    </article>
  );
};

export default SceneCard;
