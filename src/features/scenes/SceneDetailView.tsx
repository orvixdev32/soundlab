import React, { useState, useEffect, useRef } from 'react';
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

const TIMER_OPTIONS = [
  { label: 'Off', minutes: 0 },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
];

export const SceneDetailView: React.FC<SceneDetailViewProps> = ({ scene, onBack }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.8);

  // Timer states
  const [timerDuration, setTimerDuration] = useState<number>(0); // minutes (0 = off)
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isTimerDropdownOpen, setIsTimerDropdownOpen] = useState<boolean>(false);
  const timerDropdownRef = useRef<HTMLDivElement>(null);

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
      globalAudioEngine.setSceneLayers(activeLayers, false);
      globalAudioEngine.setMasterVolume(masterVolume);
    }

    return () => {
      globalAudioEngine.stopAll();
    };
  }, [scene]);

  // Закриття випадайки таймера при кліку поза нею
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        timerDropdownRef.current &&
        !timerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTimerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Логіка відліку таймера
  useEffect(() => {
    if (!isPlaying || secondsRemaining === null || secondsRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Таймер завершився: плавно ставимо на паузу за 2 секунди
          globalAudioEngine.pause(2.0);
          setIsPlaying(false);
          setTimerDuration(0);
          return null;
        }

        // Коли залишилось рівно 10 секунд — починаємо повільний fade-out
        if (prev === 10) {
          globalAudioEngine.pause(10.0);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, secondsRemaining]);

  const handleTogglePlayback = async () => {
    if (isPlaying) {
      // Плавна зупинка (1.0 секунда)
      await globalAudioEngine.pause(1.0);
      setIsPlaying(false);
    } else {
      // Плавний старт (1.5 секунди)
      await globalAudioEngine.play(1.5);
      setIsPlaying(true);
    }
  };

  const handleSelectTimer = (minutes: number) => {
    setTimerDuration(minutes);
    setIsTimerDropdownOpen(false);

    if (minutes === 0) {
      setSecondsRemaining(null);
    } else {
      setSecondsRemaining(minutes * 60);
      // Якщо сцена ще не грала — автоматично запускаємо її з плавним наростанням
      if (!isPlaying) {
        globalAudioEngine.play(1.5);
        setIsPlaying(true);
      }
    }
  };

  const formatRemainingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
          {/* Sleep / Focus Timer Control */}
          <div className={styles.timerWrapper} ref={timerDropdownRef}>
            <button
              type="button"
              className={`${styles.timerButton} ${timerDuration > 0 ? styles.timerActive : ''}`}
              onClick={() => setIsTimerDropdownOpen(!isTimerDropdownOpen)}
              title="Set Sleep / Focus Timer"
            >
              <span>⏱</span>
              <span>
                {secondsRemaining !== null && isPlaying
                  ? formatRemainingTime(secondsRemaining)
                  : timerDuration > 0
                  ? `${timerDuration}m`
                  : 'Timer'}
              </span>
            </button>

            {isTimerDropdownOpen && (
              <div className={styles.timerDropdown} role="menu">
                <div className={styles.timerDropdownHeader}>Timer & Fade Out</div>
                {TIMER_OPTIONS.map((opt) => (
                  <button
                    key={opt.minutes}
                    type="button"
                    className={`${styles.timerOption} ${timerDuration === opt.minutes ? styles.selectedOption : ''}`}
                    onClick={() => handleSelectTimer(opt.minutes)}
                  >
                    <span>{opt.label}</span>
                    {timerDuration === opt.minutes && <span className={styles.checkMark}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Play / Pause with Fade Transition */}
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
