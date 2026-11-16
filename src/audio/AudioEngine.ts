/**
 * Web Audio Engine for soundlab
 * Manages AudioContext, GainNodes for each layer, seamless looping,
 * and smooth fade in / fade out transitions.
 */

interface TrackNode {
  audio: HTMLAudioElement;
  sourceNode: MediaElementAudioSourceNode;
  gainNode: GainNode;
  isMuted: boolean;
  userVolume: number;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private tracks: Map<string, TrackNode> = new Map();
  private isPlaying: boolean = false;
  private masterVolume: number = 0.8;
  private fadeTimeoutId: number | null = null;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private clearFadeTimeout(): void {
    if (this.fadeTimeoutId !== null) {
      window.clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = null;
    }
  }

  public async setSceneLayers(
    layers: { soundId: string; src: string; defaultVolume: number }[],
    autoPlay: boolean = true
  ): Promise<void> {
    const ctx = this.initContext();
    this.stopAll();

    // Setup tracks
    layers.forEach((layer) => {
      const audio = new Audio(layer.src);
      audio.loop = true;
      audio.crossOrigin = 'anonymous';

      const sourceNode = ctx.createMediaElementSource(audio);
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(layer.defaultVolume, ctx.currentTime);

      sourceNode.connect(gainNode);
      if (this.masterGain) {
        gainNode.connect(this.masterGain);
      }

      this.tracks.set(layer.soundId, {
        audio,
        sourceNode,
        gainNode,
        isMuted: false,
        userVolume: layer.defaultVolume,
      });
    });

    if (autoPlay) {
      await this.play(1.5);
    }
  }

  /**
   * Play with optional smooth fade-in
   * @param fadeDuration Duration in seconds (e.g. 1.5)
   */
  public async play(fadeDuration: number = 1.5): Promise<void> {
    const ctx = this.initContext();
    this.clearFadeTimeout();

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (this.masterGain) {
      // Start from 0 and smoothly ramp up to masterVolume
      this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(
        this.masterVolume,
        ctx.currentTime + Math.max(0.05, fadeDuration)
      );
    }

    const promises: Promise<void>[] = [];
    this.tracks.forEach((track) => {
      promises.push(
        track.audio.play().catch((err) => {
          console.warn('Playback error / Autoplay prevented:', err);
        })
      );
    });

    await Promise.allSettled(promises);
    this.isPlaying = true;
  }

  /**
   * Pause with optional smooth fade-out
   * @param fadeDuration Duration in seconds (e.g. 1.0)
   */
  public async pause(fadeDuration: number = 1.0): Promise<void> {
    this.clearFadeTimeout();

    if (!this.ctx || !this.masterGain || fadeDuration <= 0) {
      this.pauseImmediately();
      return;
    }

    const ctx = this.ctx;
    const currentGain = this.masterGain.gain.value;

    this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
    this.masterGain.gain.setValueAtTime(currentGain, ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + fadeDuration);

    // Wait until fade out finishes, then pause audio elements
    await new Promise<void>((resolve) => {
      this.fadeTimeoutId = window.setTimeout(() => {
        this.pauseImmediately();
        if (this.masterGain && this.ctx) {
          // Restore gain setting for future play calls
          this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        }
        resolve();
      }, fadeDuration * 1000);
    });
  }

  private pauseImmediately(): void {
    this.tracks.forEach((track) => {
      track.audio.pause();
    });
    this.isPlaying = false;
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setLayerVolume(soundId: string, volume: number): void {
    const track = this.tracks.get(soundId);
    if (!track) return;
    track.userVolume = Math.max(0, Math.min(1, volume));

    if (!track.isMuted && this.ctx) {
      track.gainNode.gain.setTargetAtTime(track.userVolume, this.ctx.currentTime, 0.05);
    }
  }

  public toggleLayerMute(soundId: string): boolean {
    const track = this.tracks.get(soundId);
    if (!track) return false;

    track.isMuted = !track.isMuted;
    if (this.ctx) {
      const targetGain = track.isMuted ? 0 : track.userVolume;
      track.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return track.isMuted;
  }

  public stopAll(): void {
    this.clearFadeTimeout();
    this.pauseImmediately();
    this.tracks.forEach((track) => {
      track.audio.pause();
      track.audio.src = '';
      try {
        track.sourceNode.disconnect();
        track.gainNode.disconnect();
      } catch {
        // Already disconnected
      }
    });
    this.tracks.clear();
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const globalAudioEngine = new AudioEngine();
