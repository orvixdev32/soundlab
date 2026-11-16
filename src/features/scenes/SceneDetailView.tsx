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
    <div className={styles.environment}>
      {/* Background Ambience Stage */}
      <div className={styles.backdropStage} aria-hidden="true">
        <img
          src={scene.coverImage}
          alt=""
          className={styles.backdropImage}
        />
        <div className={styles.backdropVignette} />
      </div>

      <div className={styles.workstation}>
        {/* Top Control Strip */}
        <div className={styles.controlStrip}>
          <button type="button" className={styles.returnBtn} onClick={handleBack}>
            ← All Scenes
          </button>

          <div className={styles.stripActions}>
            {/* Sleep / Focus Timer */}
            <div className={styles.timerWrapper} ref={timerDropdownRef}>
              <button
                type="button"
                className={`${styles.timerTrigger} ${timerDuration > 0 ? styles.timerActive : ''}`}
                onClick={() => setIsTimerDropdownOpen(!isTimerDropdownOpen)}
                aria-label="Set environment timer"
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
                <div className={styles.timerMenu} role="menu">
                  <div className={styles.timerMenuHeader}>Stop after</div>
                  {TIMER_OPTIONS.map((opt) => (
                    <button
                      key={opt.minutes}
                      type="button"
                      className={`${styles.timerOption} ${timerDuration === opt.minutes ? styles.selected : ''}`}
                      onClick={() => handleSelectTimer(opt.minutes)}
                    >
                      <span>{opt.label}</span>
                      {timerDuration === opt.minutes && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Master Play/Pause */}
            <button
              type="button"
              className={`${styles.masterPlayBtn} ${isPlaying ? styles.playing : ''}`}
              onClick={handleTogglePlayback}
              disabled={!hasAnyAudioFile}
            >
              <span>{isPlaying ? '⏸ Pause' : '▶ Play atmosphere'}</span>
            </button>
          </div>
        </div>

        {/* Workstation Core Layout */}
        <div className={styles.layoutGrid}>
          {/* Identity & Visual Focus */}
          <div className={styles.sceneIdentity}>
            <span className={styles.categoryStamp}>{scene.category}</span>
            <h1 className={styles.sceneTitle}>{scene.title}</h1>
            <div className={styles.sceneSubtitle}>{scene.subtitle}</div>
            <p className={styles.sceneDescription}>{scene.description}</p>
          </div>

          {/* Precision Audio Console */}
          <div className={styles.mixerConsole}>
            <div className={styles.consoleHeader}>
              <h2 className={styles.consoleHeading}>
                Sound Layers ({scene.layers.length})
              </h2>
              <button
                type="button"
                className={styles.consoleResetBtn}
                onClick={handleReset}
              >
                Reset
              </button>
            </div>

            {/* Master Fader */}
            <div className={styles.masterFaderBlock}>
              <div className={styles.masterFaderHeader}>
                <span className={styles.faderLabel}>Master Volume</span>
                <span className={styles.faderValue}>{Math.round(masterVolume * 100)}%</span>
              </div>
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVolume}
                  onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
                  className={styles.faderInput}
                  aria-label="Master Volume"
                />
              </div>
            </div>

            {/* Layer Channels */}
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
                    className={`${styles.channelRow} ${current.muted ? styles.muted : ''}`}
                  >
                    <div className={styles.channelTop}>
                      <div className={styles.channelIdentity}>
                        <span className={styles.channelName}>{layer.name}</span>
                        {layer.category && (
                          <span className={styles.channelTag}>{layer.category}</span>
                        )}
                      </div>

                      {current.hasAudio ? (
                        <button
                          type="button"
                          className={`${styles.muteSwitch} ${current.muted ? styles.isMuted : ''}`}
                          onClick={() => handleToggleMute(layer.soundId)}
                        >
                          {current.muted ? 'Muted' : 'Mute'}
                        </button>
                      ) : (
                        <span className={styles.channelTag}>No audio file</span>
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
                        className={styles.faderInput}
                        aria-label={`${layer.name} channel volume`}
                      />
                      <span className={styles.channelLevel}>
                        {!current.hasAudio
                          ? '—'
                          : current.muted
                          ? '0%'
                          : `${Math.round(current.volume * 100)}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneDetailView;
