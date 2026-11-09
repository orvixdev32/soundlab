import React from 'react';
import type { Scene } from '../../types/scene';
import styles from './SceneCard.module.css';

interface SceneCardProps {
  scene: Scene;
  isActive: boolean;
  onOpen: (scene: Scene) => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, isActive, onOpen }) => {
  return (
    <article
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={() => onOpen(scene)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(scene);
        }
      }}
      aria-label={`Open scene ${scene.title}`}
    >
      <div className={styles.imageWrapper}>
        <img
          src={scene.coverImage}
          alt={scene.title}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.overlay} />
        <span className={styles.badge}>{scene.category}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{scene.title}</h3>
          <p className={styles.subtitle}>{scene.subtitle}</p>
        </div>

        <p className={styles.description}>{scene.description}</p>

        <div className={styles.layersSection}>
          <div className={styles.layersLabel}>Included Layers</div>
          <div className={styles.layerChips}>
            {scene.layers.map((layer) => (
              <span key={layer.soundId} className={styles.chip}>
                {layer.name}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.layerCount}>
            {scene.layers.length} {scene.layers.length === 1 ? 'layer' : 'layers'}
          </span>
          <button
            type="button"
            className={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(scene);
            }}
          >
            Customize Scene →
          </button>
        </div>
      </div>
    </article>
  );
};

export default SceneCard;
