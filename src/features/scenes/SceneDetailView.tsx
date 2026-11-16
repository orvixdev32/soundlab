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
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
];

export const SceneDetailView: React.FC<SceneDetailViewProps> = ({ scene, onBack }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.8);

  // Timer states
  const [timerDuration, setTimerDuration] = useState<number>(0);
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

  // Load soundscape channels
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

  // Click outside to close timer
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

  // Timer Countdown logic
  useEffect(() => {
    if (!isPlaying || secondsRemaining === null || secondsRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          globalAudioEngine.pause(2.0);
          setIsPlaying(false);
          setTimerDuration(0);
          return null;
        }

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
      await globalAudioEngine.pause(1.0);
      setIsPlaying(false);
    } else {
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
    <div className={styles.container}>
      {/* Top back navigation */}
      <div className={styles.navigationRow}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          ← Back to all scenes
        </button>
      </div>

      {/* Main Player Panel */}
      <div className={styles.playerPanel}>
        {/* Scene Header Deck */}
        <div className={styles.sceneHeader}>
          <div className={styles.coverWrapper}>
            <img
              src={scene.coverImage}
              alt={scene.title}
              className={styles.coverImage}
            />
          </div>

          <div className={styles.metaWrapper}>
            <div className={styles.badgeRow}>
              <span className={styles.categoryBadge}>{scene.category}</span>
              <span className={styles.layerSummary}>
                {scene.layers.length} sound {scene.layers.length === 1 ? 'layer' : 'layers'}
              </span>
            </div>

            <h1 className={styles.sceneTitle}>{scene.title}</h1>
            {scene.subtitle && <p className={styles.sceneSubtitle}>{scene.subtitle}</p>}
            {scene.description && <p className={styles.sceneDescription}>{scene.description}</p>}

            <div className={styles.primaryControls}>
              <button
                type="button"
                className={`${styles.playButton} ${isPlaying ? styles.playButtonActive : ''}`}
                onClick={handleTogglePlayback}
                disabled={!hasAnyAudioFile}
              >
                <span className={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</span>
                <span>{isPlaying ? 'Pause' : 'Play Atmosphere'}</span>
              </button>

              {/* Timer Dropdown */}
              <div className={styles.timerContainer} ref={timerDropdownRef}>
                <button
                  type="button"
                  className={`${styles.timerButton} ${timerDuration > 0 ? styles.timerButtonActive : ''}`}
                  onClick={() => setIsTimerDropdownOpen(!isTimerDropdownOpen)}
                >
                  <span>⏱</span>
                  <span>
                    {secondsRemaining !== null && isPlaying
                      ? `Timer: ${formatRemainingTime(secondsRemaining)}`
                      : timerDuration > 0
                      ? `Timer: ${timerDuration}m`
                      : 'Set Timer'}
                  </span>
                </button>

                {isTimerDropdownOpen && (
                  <div className={styles.timerMenu}>
                    <div className={styles.timerMenuTitle}>Sleep Timer</div>
                    {TIMER_OPTIONS.map((opt) => (
                      <button
                        key={opt.minutes}
                        type="button"
                        className={`${styles.timerOption} ${timerDuration === opt.minutes ? styles.timerOptionSelected : ''}`}
                        onClick={() => handleSelectTimer(opt.minutes)}
                      >
                        <span>{opt.label}</span>
                        {timerDuration === opt.minutes && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className={styles.resetButton}
                onClick={handleReset}
              >
                Reset Mix
              </button>
            </div>
          </div>
        </div>

        {/* Master Volume Bar */}
        <div className={styles.masterVolumeSection}>
          <div className={styles.masterVolumeInfo}>
            <span className={styles.masterVolumeLabel}>Master Volume</span>
            <span className={styles.masterVolumeValue}>{Math.round(masterVolume * 100)}%</span>
          </div>
          <div className={styles.masterVolumeSliderWrapper}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
              aria-label="Master Volume"
              className={styles.volumeRange}
            />
          </div>
        </div>

        {/* Channels Mixer Table */}
        <div className={styles.mixerSection}>
          <div className={styles.mixerHeader}>
            <h2 className={styles.mixerTitle}>Sound Mixer</h2>
            <span className={styles.mixerHelpText}>
              Adjust volumes individually to create your preferred atmosphere balance.
            </span>
          </div>

          <div className={styles.channelsList}>
            {scene.layers.map((layer) => {
              const current = layersState[layer.soundId] || {
                volume: layer.defaultVolume,
                muted: false,
                hasAudio: false,
              };

              return (
                <div
                  key={layer.soundId}
                  className={`${styles.channelRow} ${current.muted ? styles.channelMuted : ''}`}
                >
                  <div className={styles.channelInfo}>
                    <span className={styles.channelName}>{layer.name}</span>
                    {layer.category && (
                      <span className={styles.channelCategory}>{layer.category}</span>
                    )}
                  </div>

                  <div className={styles.channelSliderWrapper}>
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
                      className={styles.volumeRange}
                      aria-label={`${layer.name} channel volume`}
                    />
                  </div>

                  <div className={styles.channelActions}>
                    <span className={styles.channelPercentage}>
                      {!current.hasAudio
                        ? 'No file'
                        : current.muted
                        ? 'Muted'
                        : `${Math.round(current.volume * 100)}%`}
                    </span>

                    {current.hasAudio ? (
                      <button
                        type="button"
                        className={`${styles.muteButton} ${current.muted ? styles.muteButtonMuted : ''}`}
                        onClick={() => handleToggleMute(layer.soundId)}
                      >
                        {current.muted ? 'Unmute' : 'Mute'}
                      </button>
                    ) : (
                      <span className={styles.noAudioBadge}>Pending</span>
                    )}
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
