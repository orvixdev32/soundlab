import React, { useState, useEffect } from 'react';
import type { Scene } from '../../types/scene';
import { globalAudioEngine } from '../../audio/AudioEngine';
import { getSoundSrc } from '../../data/sounds';
import styles from './SceneDetailView.module.css';

interface SceneDetailViewProps {
  scene: Scene;
  onBack: () => void;
}

interface LayerState {
  volume: number;
  muted: boolean;
  hasAudio: boolean;
}

export const SceneDetailView: React.FC<SceneDetailViewProps> = ({ scene, onBack }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.8);

  const [layersState, setLayersState] = useState<Record<string, LayerState>>(() => {
    const initial: Record<string, LayerState> = {};
    scene.layers.forEach((layer) => {
      const src = getSoundSrc(layer.soundId);
      initial[layer.soundId] = {
        volume: layer.defaultVolume,
        muted: false,
        hasAudio: Boolean(src),
      };
    });
    return initial;
  });

  // Підключення аудіодоріжок сцени
  useEffect(() => {
    const activeLayers = scene.layers
      .map((l) => ({
        soundId: l.soundId,
        src: getSoundSrc(l.soundId) || '',
        defaultVolume: l.defaultVolume,
      }))
      .filter((l) => Boolean(l.src));

    if (activeLayers.length > 0) {
      // Підготовка аудіодоріжок
      globalAudioEngine.setSceneLayers(activeLayers, false);
      globalAudioEngine.setMasterVolume(masterVolume);
    }

    return () => {
      globalAudioEngine.stopAll();
    };
  }, [scene]);

  const handleTogglePlayback = async () => {
    if (isPlaying) {
      globalAudioEngine.pause();
      setIsPlaying(false);
    } else {
      await globalAudioEngine.play();
      setIsPlaying(true);
    }
  };

  const handleMasterVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    globalAudioEngine.setMasterVolume(vol);
  };

  const handleVolumeChange = (soundId: string, newVolume: number) => {
    setLayersState((prev) => ({
      ...prev,
      [soundId]: {
        ...prev[soundId],
        volume: newVolume,
      },
    }));
    globalAudioEngine.setLayerVolume(soundId, newVolume);
  };

  const handleToggleMute = (soundId: string) => {
    const isNowMuted = globalAudioEngine.toggleLayerMute(soundId);
    setLayersState((prev) => ({
      ...prev,
      [soundId]: {
        ...prev[soundId],
        muted: isNowMuted,
      },
    }));
  };

  const handleReset = () => {
    const reset: Record<string, LayerState> = {};
    scene.layers.forEach((layer) => {
      const src = getSoundSrc(layer.soundId);
      reset[layer.soundId] = {
        volume: layer.defaultVolume,
        muted: false,
        hasAudio: Boolean(src),
      };
      globalAudioEngine.setLayerVolume(layer.soundId, layer.defaultVolume);
      if (layersState[layer.soundId]?.muted) {
        globalAudioEngine.toggleLayerMute(layer.soundId);
      }
    });
    setLayersState(reset);
    handleMasterVolumeChange(0.8);
  };

  const handleBack = () => {
    globalAudioEngine.stopAll();
    onBack();
  };

  const hasAnyAudioFile = Object.values(layersState).some((l) => l.hasAudio);

  return (
    <div className={styles.viewContainer}>
      <div className={styles.topNavigation}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          ← Back to All Scenes
        </button>
        <div className={styles.navRightGroup}>
          <button
            type="button"
            className={`${styles.playToggleButton} ${isPlaying ? styles.isPlaying : ''}`}
            onClick={handleTogglePlayback}
            disabled={!hasAnyAudioFile}
          >
            <span>{isPlaying ? '⏸ Pause Atmosphere' : '▶ Play Atmosphere'}</span>
          </button>
          <span className={styles.modeBadge}>Scene Customizer</span>
        </div>
      </div>

      <div className={styles.mainPanel}>
        {/* Left column: Scene Overview & Master Volume */}
        <div className={styles.overviewCard}>
          <div className={styles.previewImageWrapper}>
            <img
              src={scene.coverImage}
              alt={scene.title}
              className={styles.previewImage}
            />
            <div className={styles.previewOverlay} />
          </div>

          <div className={styles.overviewBody}>
            <h2 className={styles.title}>{scene.title}</h2>
            <div className={styles.subtitle}>{scene.subtitle}</div>
            <p className={styles.description}>{scene.description}</p>

            <div className={styles.masterRow}>
              <div className={styles.masterHeader}>
                <span>Master Volume</span>
                <span className={styles.percent}>{Math.round(masterVolume * 100)}%</span>
              </div>
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVolume}
                  onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
                  className={styles.slider}
                  aria-label="Master Volume"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Sound Layers Mixer & Tweaks */}
        <div className={styles.controlsPanel}>
          <div className={styles.controlsHeader}>
            <h3>Sound Layer Mixer ({scene.layers.length})</h3>
            <button type="button" className={styles.resetBtn} onClick={handleReset}>
              Reset to Defaults
            </button>
          </div>

          <div className={styles.layersList}>
            {scene.layers.map((layer) => {
              const current = layersState[layer.soundId] || {
                volume: layer.defaultVolume,
                muted: false,
                hasAudio: false,
              };

              return (
                <div
                  key={layer.soundId}
                  className={`${styles.layerCard} ${current.muted ? styles.muted : ''}`}
                >
                  <div className={styles.layerTop}>
                    <div className={styles.layerNameGroup}>
                      <span className={styles.layerName}>{layer.name}</span>
                      {layer.category && (
                        <span className={styles.layerCategory}>{layer.category}</span>
                      )}
                      {!current.hasAudio && (
                        <span className={styles.missingBadge}>audio needed</span>
                      )}
                    </div>

                    {current.hasAudio && (
                      <button
                        type="button"
                        className={`${styles.muteButton} ${current.muted ? styles.isMuted : ''}`}
                        onClick={() => handleToggleMute(layer.soundId)}
                      >
                        {current.muted ? 'Muted' : 'Mute'}
                      </button>
                    )}
                  </div>

                  <div className={styles.sliderRow}>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      disabled={current.muted || !current.hasAudio}
                      value={current.muted || !current.hasAudio ? 0 : current.volume}
                      onChange={(e) =>
                        handleVolumeChange(layer.soundId, parseFloat(e.target.value))
                      }
                      className={styles.slider}
                      aria-label={`${layer.name} volume`}
                    />
                    <span className={styles.layerVolumeValue}>
                      {!current.hasAudio ? '—' : current.muted ? '0%' : `${Math.round(current.volume * 100)}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneDetailView;
