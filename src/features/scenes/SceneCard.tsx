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
      aria-label={`Open scene: ${scene.title}`}
    >
      <div className={styles.imageContainer}>
        <img
          src={scene.coverImage}
          alt={scene.title}
          className={styles.image}
          loading="lazy"
        />
        <span className={styles.categoryBadge}>{scene.category}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{scene.title}</h3>
          <span className={styles.soundCount}>{scene.layers.length} sounds</span>
        </div>

        {scene.subtitle && <p className={styles.subtitle}>{scene.subtitle}</p>}
        {scene.description && <p className={styles.description}>{scene.description}</p>}

        <div className={styles.footer}>
          <span className={styles.layerNames}>
            {scene.layers.map((l) => l.name).join(', ')}
          </span>
          <button
            type="button"
            className={styles.openBtn}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(scene);
            }}
          >
            Listen
          </button>
        </div>
      </div>
    </article>
  );
};

export default SceneCard;
